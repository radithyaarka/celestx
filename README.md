# celestx. 🌌
> **advanced twitter behavioral intelligence & risk monitoring platform**

celestx. is a high-performance intelligence suite designed to monitor, analyze, and identify risky behavioral patterns on twitter. built with a focus on mental health monitoring and linguistic pattern recognition, it transforms raw social data into actionable psychological insights.

## ✨ core features

### 🖥️ command center (dashboard)
*   **bento-style interface**: a high-density, zero-scroll dashboard providing a real-time overview of your monitoring activity.
*   **live monitor**: track total scanned tweets, flagged items, and calculate global risk density instantly.
*   **recent detections**: a compact, high-priority feed of the latest identified patterns.

### 🔍 intelligence archive (history)
*   **curated database**: a permanent record of all identified risks, organized by severity and timestamp.
*   **archive overview**: high-level stats including total alerts, critical risk counts, and average severity across your entire history.
*   **granular control**: prune your archive with individual item deletion or perform deep-scans directly from historical data.

### 📊 intelligence hub (insights)
*   **activity heatmap**: identify peak risky posting hours with a 24-hour behavioral distribution grid.
*   **pattern keywords**: automatically extract and rank the most common linguistic themes found in risky content.
*   **risk leaderboard**: track and rank high-risk profiles based on aggregate behavioral scores.
*   **risk spread**: visual distribution of detections across four severity tiers: critical, elevated, low, and stable.

### 🧬 deep scan analysis
*   **profile-level intelligence**: perform exhaustive analysis on specific user profiles.
*   **mental trend tracking**: visualize a user's emotional trajectory over time with dynamic line charts.
*   **content categorization**: automatically separates original content from retweets for cleaner data interpretation.

## 🎨 design philosophy
celestx. follows a **"premium intelligence"** aesthetic:
*   **glassmorphism**: sleek, semi-transparent interfaces with modern blur effects.
*   **color-coded risk**: intuitive 4-tier color system (emerald, sky, amber, and rose).
*   **high-density UX**: designed to provide maximum information without overwhelming the user.

## 🛠️ technology stack
*   **frontend**: react.js + tailwind css + lucide icons
*   **backend**: fastapi (python) + custom nlp models
*   **browser integration**: chrome extension manifest v3

## 🚀 getting started

### 1. backend setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. dashboard setup
```bash
cd dashboard
npm install
npm run dev
```

### 3. extension installation
1.  open `chrome://extensions/`
2.  enable **developer mode**
3.  click **load unpacked** and select the `dashboard` folder (after running `npm run build`)

---
developed with ❤️ for advanced behavioral research.
