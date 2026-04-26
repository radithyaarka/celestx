// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

            try {
                const tweetTexts = tweets.map(t => t.text);
                const res = await fetch(`${backendUrl}/predict-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tweets: tweetTexts })
                });
                const result = await res.json();

                const allTweets = result.details.map(item => {
                    const originalTweet = tweets[item.tweet_id - 1];
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
                });

                const indicatedTweets = allTweets.filter(t => t.label === "INDICATED");

                chrome.storage.local.get(['sentimenta_history', 'sentimenta_total_scanned'], (storage) => {
                    const history = storage.sentimenta_history || [];
                    const newHistory = [...indicatedTweets, ...history].slice(0, 100);
                    const currentTotal = storage.sentimenta_total_scanned || 0;

                    chrome.storage.local.set({ 
                        sentimenta_history: newHistory,
                        sentimenta_total_scanned: currentTotal + allTweets.length
                    });

                    if (indicatedTweets.length > 0 && settings.notifications !== false) {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icon48.png',
                            title: 'celestx. detection',
                            message: `spotted ${indicatedTweets.length} risky items on your timeline.`
                        });
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
