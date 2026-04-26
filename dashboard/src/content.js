// src/content.js

// ─── Manual scrape on demand ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape_tweets') {
    sendResponse({ tweets: extractTweets() });
  } 
  else if (request.action === 'deep_scrape_profile') {
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
        
        if (scrollCount >= 40 || scrapedTweetsMap.size >= 50) {
            clearInterval(scrollInterval);
            sendResponse({ tweets: Array.from(scrapedTweetsMap.values()).slice(0, 50) });
        }
    }, 1500);
    
    return true;
  }
  return true;
});

// ─── Core Extraction Logic ──────────────────────────────────────────────────
function extractTweets() {
  const textContainers = document.querySelectorAll('div[data-testid="tweetText"]');
  const tweets = [];

  textContainers.forEach((textEl, index) => {
    const article = textEl.closest('article[data-testid="tweet"]');
    
    let tweetData = {
      id: index,
      text: textEl.innerText,
      displayName: "Unknown User",
      handle: "",
      avatarUrl: "",
      isRetweet: false,
      timestamp: new Date().toISOString()
    };

    if (article) {
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
        const text = socialContext.innerText.toLowerCase();
        tweetData.isRetweet = text.includes('retweet') || text.includes('me-retweet') || text.length > 0;
      }

      const timeEl = article.querySelector('time');
      if (timeEl) {
        const dt = timeEl.getAttribute('datetime');
        if (dt) tweetData.timestamp = dt;
      }

      const imageEls = article.querySelectorAll('div[data-testid="tweetPhoto"] img');
      if (imageEls.length > 0) {
        tweetData.images = Array.from(imageEls).map(img => img.src);
      }
    }

    tweets.push(tweetData);
  });

  return tweets;
}

const seenTweets = new Set();
let autoScanTimer = null;

function startAutoScan() {
    chrome.storage.local.get(['sentimenta_settings'], (s) => {
        const interval = (s.sentimenta_settings?.scanInterval || 10) * 1000;
        if (autoScanTimer) clearInterval(autoScanTimer);
        autoScanTimer = setInterval(() => {
            const tweets = extractTweets();
            const newTweets = tweets.filter(t => !seenTweets.has(t.text));
            if (newTweets.length > 0) {
                newTweets.forEach(t => seenTweets.add(t.text));
                chrome.runtime.sendMessage({ action: 'auto_scan_result', tweets: newTweets });
            }
        }, interval);
    });
}

startAutoScan();
chrome.storage.onChanged.addListener((changes) => {
    if (changes.sentimenta_settings) startAutoScan();
});
