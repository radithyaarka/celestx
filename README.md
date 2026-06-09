# celestx. 🌌
> **spotting the clouds, before the storm.**

celestx. is a high-performance analytical suite specifically engineered to identify risky behavioral patterns in **bahasa indonesia**. built on a **Dynamic Multimodal Architecture** incorporating **fine-tuned IndoBERTweet** and **ViT (Vision Transformer)**, it provides state-of-the-art accuracy for indonesian social media context by analyzing both textual language and visual images, mapping raw data to **dsm-5** clinical standards.

## 🔭 philosophy & vision
derived from the latin *caelestis* (**celeste**) meaning **"sky"**, this platform acts as a digital observatory for the human mind. 

in mental health, depression is often visualized as a gathering of dark clouds that obscure one's internal sky. **celestx**—a fusion of this metaphor and the **x** (twitter) platform—is designed to detect these subtle "linguistic clouds" in real-time. by identifying early indicators, we aim to provide clarity and a chance for intervention before the emotional storm hits.

## 🎭 dual-persona application
celestx is uniquely designed to serve two distinct user demographics with different psychological goals:
*   **for general users (students)**: functions as a **digital exposure meter** (social listening) to measure the "toxicity" or negative emotional pollution in their daily timeline, promoting digital mindfulness and curation.
*   **for clinical experts (psychologists)**: functions as a **digital phenotyping tool** (clinical safety net). it enables rapid, chronological deep-scans of a patient's digital footprint to uncover hidden depressive indicators that might not surface during traditional consultations.

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
*   **🧠 dynamic multimodal routing**: automatically detects if a tweet contains an image and routes the data to the **fusion (text + image)** model, otherwise falling back to the text-only engine.
*   **hybrid scoring**: advanced risk assessment using a balanced mean of global activity and peak intensity (top-10).
*   **system health**: integrated monitoring for fastapi backend, indobertweet, and vit model status.

### 🔍 archive vault (history)
*   **intelligence database**: a secured record of all identified risks, organized by confidence and timestamp.
*   **explainable ai (xai) integration**: dedicated transparency modules allowing clinical experts to see exactly *which* words or linguistic patterns triggered the neural network's decision, ensuring clinical trust and avoiding "black-box" diagnosis.
*   **drill-down analysis**: click on any clinical category to view specific tweet evidence in a dedicated modal.

### 📊 insights hub (clinical analytics)
*   **dsm-5 mapping**: dynamic keyword matching validated by ai for 9 clinical categories.
*   **personal intensity trend**: chronological visualization of emotional fluctuation with severity zones.
*   **frontend matching**: real-time lexicon updates that reflect immediately on analyzed data without re-scanning.

## 🛠️ technology stack
*   **intelligence engines**: 
    *   **Text Processing**: **fine-tuned IndoBERTweet** (optimized for indonesian social media slang and linguistics).
    *   **Image Processing**: **ViT (Vision Transformer)** for extracting visual sentiment.
    *   **Fusion Mechanism**: Early-fusion multi-modal classification layer.
*   **backend**: fastapi (python) + pytorch
*   **frontend**: react.js + tailwind css + lucide icons + framer motion
*   **integration**: chrome extension manifest v3

## 🔬 clinical methodology (dsm-5)
the platform maps **bahasa indonesia** linguistic patterns to:
1. suasana hati depresi (depressed mood)
2. anhedonia (kehilangan minat)
3. perubahan nafsu makan (appetite changes)
4. gangguan tidur (sleep disturbance)
5. agitasi psikomotor (psychomotor agitation)
6. keletihan (fatigue)
7. perasaan tidak berharga (worthlessness)
8. penurunan konsentrasi (concentration loss)
9. pikiran tentang kematian (suicidal ideation)

### 📊 threshold & risk classification
the system utilizes a strict 3-tier mathematical threshold for clinical classification:
*   **0% - 14% (stabil)**: normal emotional fluctuation.
*   **15% - 30% (moderat)**: early onset of psychological distress. requires monitoring.
*   **> 30% (potensi tinggi)**: critical depressive prevalence requiring immediate professional attention.

### ⚖️ precision-recall tradeoff (clinical safety first)
by design, the machine learning architecture is optimized for **high recall (sensitivity)** rather than high precision. in a clinical context, a *false negative* (missing a genuine cry for help) is fatal. the model acts as an overly-cautious safety net. while it may flag sarcastic or joking tweets containing depressive keywords (*false positives*), these are easily filtered out by human experts in the final verification loop (human-in-the-loop).

### 💡 rule-based interventions & comorbidity
the analysis engine doesn't just stop at detection; it provides **dynamic, rule-based psychological recommendations**. if multiple symptoms trigger simultaneously, the ai recognizes it as **symptom comorbidity** and automatically shifts the recommendation from targeted advice to a holistic intervention alert.

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

## ⚖️ ethical considerations & data privacy
this platform is built strictly for **academic research and clinical assistance**. 
* **no automated diagnosis**: celestx is a *decision support system*, not a replacement for professional clinical judgment.
* **privacy by design**: all scraping and inference pipelines process public data. it is the responsibility of the clinical user to maintain patient confidentiality and adhere to local data protection regulations when utilizing this tool for real-world monitoring.

---

<div align="center">

**celestx.** was built with 🤍 and deep empathy for mental health awareness.
  
*developed for advanced behavioral research and clinical early-intervention in the indonesian social media landscape.*

</div>