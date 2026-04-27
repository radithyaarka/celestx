// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'open_dashboard') {
        let urlPath = 'index.html';
        if (request.highlightText) {
            urlPath += `?highlight=${encodeURIComponent(request.highlightText)}`;
        }
        const targetUrl = chrome.runtime.getURL(urlPath);
        const dashboardBaseUrl = chrome.runtime.getURL('index.html');

        chrome.tabs.query({}, (tabs) => {
            const existingTab = tabs.find(t => t.url && t.url.startsWith(dashboardBaseUrl));
            if (existingTab) {
                // Focus existing tab and update its URL to trigger the highlight
                chrome.tabs.update(existingTab.id, { active: true, url: targetUrl });
                chrome.windows.update(existingTab.windowId, { focused: true });
            } else {
                // Create new tab
                chrome.tabs.create({ url: targetUrl });
            }
        });
        return;
    }
    
    if (request.action === 'manual_scan' || request.action === 'auto_scan_result') {
        chrome.storage.local.get(['backendUrl', 'sentimenta_settings'], async (storage) => {
            const backendUrl = storage.backendUrl || 'http://localhost:8000';
            const settings = storage.sentimenta_settings || {};
            
            let tweets = [];
            if (request.action === 'manual_scan') {
                const tabs = await chrome.tabs.query({ url: "*://*.x.com/*" });
                if (tabs.length === 0) return;
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => { return window.extractTweets(); }
                });
                tweets = results[0].result;
            } else {
                tweets = request.tweets;
            }

            if (tweets.length === 0) return;

            const seenStorage = await chrome.storage.local.get('global_seen_tweets');
            const seenSet = new Set(seenStorage.global_seen_tweets || []);
            const novelTweets = tweets.filter(t => t.text && !seenSet.has(t.text));
            
            if (novelTweets.length === 0) return;

            // Update the global seen cache (keep last 1000)
            novelTweets.forEach(t => seenSet.add(t.text));
            chrome.storage.local.set({ global_seen_tweets: Array.from(seenSet).slice(-1000) });

            try {
                const tweetTexts = novelTweets.map(t => t.text);
                const res = await fetch(`${backendUrl}/predict-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tweets: tweetTexts })
                });
                const result = await res.json();

                const detectLanguage = (text) => {
                    if (!text) return 'id';
                    const enWords = /\b(the|is|are|in|to|of|for|with|and|on|at|i|me|my|you|your|he|she|it)\b/gi;
                    const idWords = /\b(yang|di|ke|dari|ini|itu|dan|ada|saya|aku|kamu|lo|gw|ga|tidak|untuk)\b/gi;
                    const enMatches = (text.match(enWords) || []).length;
                    const idMatches = (text.match(idWords) || []).length;
                    return enMatches > idMatches ? 'en' : 'id';
                };

                const allTweets = result.details.map(item => {
                    const originalTweet = novelTweets[item.tweet_id - 1];
                    return {
                        text: originalTweet?.text || '',
                        confidence: item.score,
                        label: item.label,
                        displayName: originalTweet?.displayName,
                        handle: originalTweet?.handle,
                        avatarUrl: originalTweet?.avatarUrl,
                        images: originalTweet?.images || [],
                        date: originalTweet?.timestamp || new Date().toISOString()
                    };
                }); // Removed the filter here so it represents ALL languages

                const idOnlyTweets = allTweets.filter(t => detectLanguage(t.text) === 'id');
                const indicatedTweets = idOnlyTweets.filter(t => t.label === "INDICATED");

                chrome.storage.local.get(['sentimenta_history', 'sentimenta_total_scanned', 'sentimenta_id_scanned'], (storage) => {
                    const history = storage.sentimenta_history || [];
                    const newHistory = [...indicatedTweets, ...history].slice(0, 100);
                    const currentTotal = storage.sentimenta_total_scanned || 0;
                    const currentIdTotal = storage.sentimenta_id_scanned || 0;

                    chrome.storage.local.set({ 
                        sentimenta_history: newHistory,
                        sentimenta_total_scanned: currentTotal + allTweets.length, // All languages for throughput
                        sentimenta_id_scanned: currentIdTotal + idOnlyTweets.length // ID only for clinical rate
                    });

                    if (indicatedTweets.length > 0 && settings.notifications !== false) {
                        // Send message to the tab to show a floating toast with tweet identifiers
                        if (sender.tab?.id) {
                            chrome.tabs.sendMessage(sender.tab.id, { 
                                action: 'show_toast', 
                                count: indicatedTweets.length,
                                detectedTexts: indicatedTweets.map(t => t.text)
                            });
                        }
                    }
                });

                chrome.storage.local.set({ 
                    lastScan: { 
                        time: new Date().toISOString(), 
                        status: indicatedTweets.length > 0 ? 'alert' : 'ok',
                        found: indicatedTweets.length
                    }
                });
            } catch (err) {
                console.error("Backend error:", err);
            }
        });
    }
});
