# celestx. 🌌
> **spotting the clouds, before the storm.**

celestx. is a high-performance analytical suite specifically engineered to identify risky behavioral patterns in **bahasa indonesia**. built on the **fine-tuned indobertweet** transformer model, it provides state-of-the-art nlp accuracy for indonesian social media context, mapping raw data to **dsm-5** clinical standards.

## 🔭 philosophy & vision
derived from the latin *caelestis* (**celeste**) meaning **"sky"**, this platform acts as a digital observatory for the human mind. 

in mental health, depression is often visualized as a gathering of dark clouds that obscure one's internal sky. **celestx**—a fusion of this metaphor and the **x** (twitter) platform—is designed to detect ini these subtle "linguistic clouds" in real-time. by identifying early indicators, we aim to provide clarity and a chance for intervention before the emotional storm hits.

## 📂 project structure

```text
celestx/
├── backend/                # python fastapi server
│   ├── main.py             # api entry point & routing
│   ├── model_ta/           # fine-tuned indobertweet model weights
│   ├── requirements.txt    # backend dependencies
│   └── ...                 # utility scripts
├── dashboard/              # react (vite) frontend & extension
│   ├── src/                # react source code
│   │   ├── pages/          # dashboard, history, analysis pages
│   │   ├── components/     # reusable ui components
│   │   └── constants/      # clinical lexicon (dsm-5)
│   ├── manifest.json       # chrome extension manifest v3
│   ├── background.js       # extension background logic
│   └── ...                 # build configurations
└── push.bat                # deployment utility script
```

## ✨ core features

### 🖥️ command center (dashboard)
*   **live monitor**: real-time tracking of indonesian twitter/x timelines with instant risk flagging.
*   **hybrid scoring**: advanced risk assessment using a balanced mean of global activity and peak intensity (top-10).
*   **system health**: integrated monitoring for fastapi backend and indobertweet model status.

### 🔍 archive vault (history)
*   **intelligence database**: a secured record of all identified risks, organized by confidence and timestamp.
*   **drill-down analysis**: click on any clinical category to view specific tweet evidence in a dedicated modal.

### 📊 insights hub (clinical analytics)
*   **dsm-5 mapping**: dynamic keyword matching validated by ai for 9 clinical categories.
*   **personal intensity trend**: chronological visualization of emotional fluctuation with severity zones.
*   **frontend matching**: real-time lexicon updates that reflect immediately on analyzed data without re-scanning.

## 🛠️ technology stack
*   **intelligence engine**: **fine-tuned indobertweet** (transformer-based nlp optimized for indonesian social media text).
*   **backend**: fastapi (python) + pytorch
*   **frontend**: react.js + tailwind css + lucide icons + framer motion
*   **integration**: chrome extension manifest v3

## 🔬 clinical methodology (dsm-5)
the platform maps **bahasa indonesia** linguistic patterns to:
1. suasana hati depresi
2. anhedonia (hilang minat)
3. perubahan nafsu makan
4. gangguan tidur
5. agitasi psikomotor
6. keletihan (hilang energi)
7. perasaan tidak berharga
8. penurunan konsentrasi
9. pikiran tentang kematian

---

## 🚀 getting started

### 1. backend setup
```bash
cd backend
# create virtual environment (recommended)
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on windows

# install dependencies
pip install -r requirements.txt

# run the server
python main.py
```
*server will be available at `http://localhost:8000`*

### 2. frontend setup
```bash
cd dashboard
npm install
npm run dev
```
*dashboard will be available at `http://localhost:5173`*

### 3. chrome extension installation
1.  run `npm run build` in the `dashboard` folder.
2.  open chrome and go to `chrome://extensions/`.
3.  enable **developer mode**.
4.  click **load unpacked** and select the `dashboard/dist` folder.

---

<div align="center">

**celestx.** was built with 🤍 and deep empathy for mental health awareness.
  
*developed for advanced behavioral research and clinical early-intervention in the indonesian social media landscape.*

</div>