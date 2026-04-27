console.log("CELESTX: Content Script Loaded");

// ─── Floating Toast Notification ─────────────────────────────────────────────
function showToast(count) {
    // Remove existing toast if any
    const existing = document.getElementById('celestx-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'celestx-toast';
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(108, 92, 231, 0.2);
        border-left: 5px solid #6C5CE7;
        padding: 16px 24px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: celestx-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        max-width: 350px;
    `;

    toast.innerHTML = `
        <div style="width: 40px; height: 40px; flex-shrink: 0; background: white; padding: 4px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${chrome.runtime.getURL('logo.png')}" style="width: 100%; height: 100%; object-fit: contain; mix-blend-multiply;" />
        </div>
        <div style="flex-grow: 1;">
            <p style="margin: 0; font-family: Georgia, serif; font-style: italic; font-weight: 900; color: #2D3436; font-size: 16px; letter-spacing: -0.02em;">celestx.</p>
            <p style="margin: 2px 0 0 0; color: #636E72; font-size: 10px; font-weight: 600; line-height: 1.4; text-transform: lowercase;">terdeteksi <span style="color: #6C5CE7; font-weight: 800;">${count} tweet</span> terindikasi depresi.</p>
        </div>
        <button id="celestx-see-btn" style="background: #6C5CE7; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);">
            see
        </button>
    `;

    toast.querySelector('#celestx-see-btn').onclick = () => {
        chrome.runtime.sendMessage({ action: 'open_dashboard' });
    };

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes celestx-slide-in {
            from { transform: translateX(100%) scale(0.9); opacity: 0; }
            to { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes celestx-fade-out {
            from { transform: translateX(0) scale(1); opacity: 1; }
            to { transform: translateX(10px) scale(0.95); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'celestx-fade-out 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ─── Manual scrape on demand ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("CELESTX: Message received:", request.action);
  if (request.action === 'scrape_tweets') {
    sendResponse({ tweets: extractTweets() });
  } 
  else if (request.action === 'show_toast') {
    console.log("CELESTX: Showing toast for count:", request.count);
    showToast(request.count);
  }
  else if (request.action === 'deep_scrape_profile') {
    const extractProfileInfo = () => {
        const findAvatar = () => {
            const mainPhoto = document.querySelector('a[href$="/photo"] img');
            if (mainPhoto?.src) return mainPhoto.src;
            const altPhoto = document.querySelector('[data-testid="UserProfileHeader-base"] img[src*="profile_images"]');
            if (altPhoto?.src) return altPhoto.src;
            const ariaPhoto = document.querySelector('div[aria-label*="Profile photo"] img') || document.querySelector('div[aria-label*="Foto profil"] img');
            if (ariaPhoto?.src) return ariaPhoto.src;
            return "";
        };

        let info = {
            displayName: document.querySelector('[data-testid="UserName"]')?.innerText?.split('\n')[0] || "Unknown",
            handle: window.location.pathname.replace('/', '@'),
            avatarUrl: findAvatar(),
            bio: document.querySelector('[data-testid="UserDescription"]')?.innerText || ""
        };

        if (!info.avatarUrl) {
            const originalArticle = Array.from(document.querySelectorAll('article[data-testid="tweet"]'))
                .find(art => !art.querySelector('[data-testid="socialContext"]'));
            const tweetAvatar = originalArticle?.querySelector('[data-testid="Tweet-User-Avatar"] img');
            if (tweetAvatar) info.avatarUrl = tweetAvatar.src;
        }
        return info;
    };

    chrome.storage.local.get(['sentimenta_settings'], (result) => {
        const settings = result.sentimenta_settings || {};
        const targetDepth = request.targetDepth || settings.scanDepth || 50;
        const maxScrolls = Math.max(60, targetDepth); // More generous scrolling

        let profileInfo = extractProfileInfo();
        let scrapedTweetsMap = new Map();
        let scrollCount = 0;
        
        const extract = () => {
            const tweets = extractTweets();
            tweets.forEach(t => {
                if (!scrapedTweetsMap.has(t.text)) {
                    scrapedTweetsMap.set(t.text, t);
                }
            });
        };
        
        extract();
        
        const scrollInterval = setInterval(() => {
            const articles = document.querySelectorAll('article[data-testid="tweet"]');
            if (articles.length > 0) {
                articles[articles.length - 1].scrollIntoView(true); 
            } else {
                window.scrollBy(0, 1000);
            }
            setTimeout(extract, 500);
            scrollCount++;
            
            if (scrollCount >= maxScrolls || scrapedTweetsMap.size >= targetDepth) {
                clearInterval(scrollInterval);
                sendResponse({ 
                    profile: profileInfo,
                    tweets: Array.from(scrapedTweetsMap.values()).slice(0, targetDepth) 
                });
            }
        }, 1500);
    });
    
    return true;
  }
  return true;
});

// ─── Core Extraction Logic ──────────────────────────────────────────────────
function extractTweets() {
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  const tweets = [];

  articles.forEach((article, index) => {
    // Find all tweet texts within this article
    const allTextEls = article.querySelectorAll('div[data-testid="tweetText"]');
    if (allTextEls.length === 0) return;

    // Filter to find the main tweet text (not the one inside a quote box)
    // Quoted tweets are usually wrapped in a div with role="link" that contains its own User-Name
    const mainTextEl = Array.from(allTextEls).find(el => {
        let parent = el.parentElement;
        while (parent && parent !== article) {
            // If we find a parent that looks like a quote container, skip this text
            if (parent.getAttribute('role') === 'link' && parent.querySelector('[data-testid="User-Name"]')) {
                return false;
            }
            parent = parent.parentElement;
        }
        return true;
    });

    if (!mainTextEl) return;

    let tweetData = {
      id: index,
      text: mainTextEl.innerText,
      displayName: "Unknown User",
      handle: "",
      avatarUrl: "",
      isRetweet: false,
      timestamp: new Date().toISOString()
    };

    const userNameContainer = article.querySelector('[data-testid="User-Name"]');
    if (userNameContainer) {
      const textParts = userNameContainer.innerText.split('\n');
      tweetData.displayName = textParts[0] || "Unknown User";
      tweetData.handle = textParts.find(t => t && t.startsWith('@')) || "";
    }

    const avatarImg = article.querySelector('[data-testid="Tweet-User-Avatar"] img');
    if (avatarImg) tweetData.avatarUrl = avatarImg.src;

    const socialContext = article.querySelector('[data-testid="socialContext"]');
    if (socialContext) {
      // If there is social context (Retweeted, Liked, Promoted), it's not a pure original tweet
      tweetData.isRetweet = true;
    }

    // NEW: If it contains a quote box, classify as Retweet for filtering purposes
    const hasQuote = Array.from(allTextEls).some(el => {
        let parent = el.parentElement;
        while (parent && parent !== article) {
            if (parent.getAttribute('role') === 'link' && parent.querySelector('[data-testid="User-Name"]')) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    });
    if (hasQuote) tweetData.isRetweet = true;

    const timeEl = article.querySelector('time');
    if (timeEl) {
      const dt = timeEl.getAttribute('datetime');
      if (dt) tweetData.timestamp = dt;
    }

    const imageEls = article.querySelectorAll('div[data-testid="tweetPhoto"] img');
    if (imageEls.length > 0) {
      const urls = Array.from(imageEls).map(img => img.src);
      tweetData.images = urls;
      tweetData.imageUrl = urls[0]; // Set this for dashboard compatibility
      tweetData.mediaUrl = urls[0]; // Backup field
    }

    tweets.push(tweetData);
  });

  return tweets;
}

const seenTweets = new Set();
let autoScanTimer = null;

function startAutoScan() {
    chrome.storage.local.get(['sentimenta_settings'], (s) => {
        const settings = s.sentimenta_settings || {};
        // Default to 2 seconds if not set, much better than 10s
        const interval = (settings.scanInterval || 2) * 1000;
        
        if (autoScanTimer) clearInterval(autoScanTimer);
        autoScanTimer = setInterval(() => {
            const tweets = extractTweets();
            const newTweets = tweets.filter(t => t.text && !seenTweets.has(t.text));
            if (newTweets.length > 0) {
                newTweets.forEach(t => seenTweets.add(t.text));
                chrome.runtime.sendMessage({ action: 'auto_scan_result', tweets: newTweets });
            }
        }, Math.max(1000, interval)); // Safety minimum of 1s
    });
}

startAutoScan();
chrome.storage.onChanged.addListener((changes) => {
    if (changes.sentimenta_settings) startAutoScan();
});
