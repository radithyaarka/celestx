import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from transformers import (
    BertTokenizer, BertModel, BertConfig,
    ViTModel, ViTConfig,
    pipeline
)
import torch
import torch.nn as nn
import numpy as np
import shap
import requests
import gc
from io import BytesIO
from PIL import Image
from torchvision import transforms
from sentence_transformers import SentenceTransformer, util
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CelestX Backend API - Dynamic Routing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MULTIMODAL MODEL ARCHITECTURE ──────────────────────────────────────────
class MultimodalDepressionModel(nn.Module):
    def __init__(self, text_config: BertConfig, img_config: ViTConfig):
        super().__init__()
        self.text_model = BertModel(text_config)
        self.img_model  = ViTModel(img_config)
        self.classifier = nn.Sequential(
            nn.Linear(768 + 768, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, 2)
        )

    def forward(self, input_ids, attention_mask, pixel_values):
        text_feat = self.text_model(
            input_ids=input_ids,
            attention_mask=attention_mask
        ).pooler_output
        img_feat = self.img_model(
            pixel_values=pixel_values
        ).pooler_output
        fused  = torch.cat([text_feat, img_feat], dim=-1)
        return self.classifier(fused)

# ─── CONFIG ─────────────────────────────────────────────────────────────────
MODEL_PTH_PATH  = "./best_multimodal_model.pth"
MODEL_TEXT_PATH = "./model_ta"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

text_cfg = BertConfig(
    vocab_size=31923, hidden_size=768, num_hidden_layers=12, num_attention_heads=12,
    intermediate_size=3072, hidden_act="gelu", hidden_dropout_prob=0.1,
    attention_probs_dropout_prob=0.1, max_position_embeddings=512, type_vocab_size=2,
    pad_token_id=0,
)
vit_cfg = ViTConfig(
    image_size=224, patch_size=16, num_channels=3, hidden_size=768,
    num_hidden_layers=12, num_attention_heads=12, intermediate_size=3072,
    hidden_act="gelu", qkv_bias=True,
)

image_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# ─── GLOBAL OBJECTS ─────────────────────────────────────────────────────────
pipe          = None   # HF pipeline (IndoBERTweet text-only)
mm_model      = None   # Multimodal .pth
mm_tokenizer  = None   
explainer     = None   
sbert_model   = None

# ─── LOAD MODELS ────────────────────────────────────────────────────────────
try:
    print("LOADING: Memuat pipeline IndoBERTweet (fallback text-only)...")
    hf_device = 0 if torch.cuda.is_available() else -1
    pipe = pipeline(
        "text-classification", 
        model=MODEL_TEXT_PATH, 
        tokenizer=MODEL_TEXT_PATH, 
        device=hf_device
    )
    print("SUCCESS: Pipeline IndoBERTweet siap!")

    def predict_proba(texts):
        if isinstance(texts, np.ndarray): texts = texts.tolist()
        elif isinstance(texts, str): texts = [texts]
        inputs = pipe.tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt").to(pipe.device)
        with torch.no_grad():
            outputs = pipe.model(**inputs)
        return torch.nn.functional.softmax(outputs.logits, dim=-1).cpu().numpy()
    explainer = shap.Explainer(predict_proba, pipe.tokenizer)
except Exception as e:
    print(f"ERROR: Gagal memuat pipeline IndoBERTweet: {e}")

try:
    print("LOADING: Memuat model fusion multimodal (.pth)...")
    mm_tokenizer = BertTokenizer.from_pretrained(MODEL_TEXT_PATH, local_files_only=True)
    
    # Alokasikan memori CPU biasa terlebih dahulu
    mm_model = MultimodalDepressionModel(text_cfg, vit_cfg)
        
    # Gunakan mmap=True agar file .pth tidak diload dua kali ke RAM
    state_dict = torch.load(MODEL_PTH_PATH, map_location=device, weights_only=False, mmap=True)
    
    # assign=True akan me-replace parameter CPU lama dengan mmap memory langsung
    # (Memory lama akan otomatis di-GC, sehingga peak RAM tetap 1x ukuran model!)
    mm_model.load_state_dict(state_dict, assign=True)
    
    # Cleanup memory
    del state_dict
    gc.collect()
    
    mm_model.to(device)
    mm_model.eval()
    print(f"SUCCESS: Multimodal model dimuat di {device}!")
except Exception as e:
    print(f"ERROR: Gagal memuat multimodal model: {e}")

try:
    print("LOADING: Memuat Indo-SBERT untuk pemetaan DSM-5...")
    sbert_model = SentenceTransformer("firqaaa/indo-sentence-bert-base")
    DSM_CRITERIA = {
        "depressed_mood": "Perasaan sedih, hampa, putus asa, ingin menangis, atau merasa sangat tertekan.",
        "anhedonia":       "Kehilangan minat, kesenangan, atau motivasi dalam melakukan hobi dan aktivitas sehari-hari.",
        "weight_loss":     "Perubahan nafsu makan yang drastis, penurunan atau kenaikan berat badan yang tidak disengaja.",
        "insomnia":        "Gangguan tidur, sulit memejamkan mata, sering terbangun malam hari, atau tidur berlebihan.",
        "psychomotor":     "Gerakan tubuh yang melambat, lesu, atau merasa sangat gelisah dan tidak bisa diam.",
        "fatigue":         "Merasa sangat lelah, kehilangan energi, dan tidak bertenaga untuk beraktivitas.",
        "worthlessness":   "Perasaan tidak berguna, rasa bersalah yang berlebihan, atau mengkritik diri sendiri dengan kejam.",
        "concentration":   "Sulit berkonsentrasi, pikiran kosong, tidak fokus, atau sulit mengambil keputusan.",
        "suicidal":        "Pikiran tentang kematian, keinginan untuk menyakiti diri sendiri, atau putus asa ingin mengakhiri hidup."
    }
    criteria_names      = list(DSM_CRITERIA.keys())
    criteria_texts      = list(DSM_CRITERIA.values())
    criteria_embeddings = sbert_model.encode(criteria_texts, convert_to_tensor=True)

    def get_symptom_label(text):
        if sbert_model is None: return None
        emb       = sbert_model.encode(text, convert_to_tensor=True)
        scores    = util.cos_sim(emb, criteria_embeddings)[0]
        top_idx   = torch.argmax(scores).item()
        top_score = scores[top_idx].item()
        return criteria_names[top_idx] if top_score > 0.35 else None
except Exception as e:
    print(f"ERROR: Gagal memuat Indo-SBERT: {e}")
    get_symptom_label = lambda x: None

# ─── INFERENCE HELPERS ───────────────────────────────────────────────────────

def load_and_preprocess_image(url: str):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        print(f"[FETCH] Mengunduh gambar dari tweet: {url[:60]}...")
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")
        print(f"[FETCH] Berhasil memproses gambar.")
        return image_transforms(img)
    except Exception as e:
        print(f"[WARNING] Gagal download gambar {url}. Fallback zero tensor. Error: {e}")
        return torch.zeros(3, 224, 224)

def run_text(texts: List[str], threshold: float = 0.30):
    """Gunakan pipeline IndoBERTweet murni"""
    if pipe is None: raise RuntimeError("Pipeline text tidak tersedia")
    results = pipe(texts, top_k=None)
    if texts and isinstance(results[0], dict): results = [results]
    out = []
    for res_list in results:
        score = next((r["score"] for r in res_list if r["label"] == "LABEL_1"), 0.0)
        out.append((float(score), "INDICATED" if score > threshold else "NORMAL"))
    return out

def run_multimodal(texts: List[str], image_urls: List[str], threshold: float = 0.30):
    """Gunakan fusion model .pth dengan input teks dan gambar asli"""
    if mm_model is None or mm_tokenizer is None: raise RuntimeError("Multimodal model tidak tersedia")
    enc = mm_tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt").to(device)
    
    pixels = []
    for url in image_urls:
        pixels.append(load_and_preprocess_image(url))
    pixel_values = torch.stack(pixels).to(device)

    with torch.no_grad():
        logits = mm_model(input_ids=enc["input_ids"], attention_mask=enc["attention_mask"], pixel_values=pixel_values)
        probs = torch.softmax(logits, dim=-1)
    scores = probs[:, 1].cpu().numpy()
    return [(float(s), "INDICATED" if s > threshold else "NORMAL") for s in scores]

# ─── SKEMA DATA ──────────────────────────────────────────────────────────────

class TweetItem(BaseModel):
    text: str
    imageUrl: Optional[str] = None

class SingleTweetInput(BaseModel):
    text: str
    imageUrl: Optional[str] = None
    threshold: float = 0.30

class BatchTweetInput(BaseModel):
    tweets: List[TweetItem]
    threshold: float = 0.30

# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "routing": "dynamic",
        "text_model": "IndoBERTweet" if pipe is not None else "unavailable",
        "multimodal_model": "Fusion IndoBERTweet+ViT" if mm_model is not None else "unavailable",
    }

@app.post("/predict")
async def predict_single(input_data: SingleTweetInput):
    try:
        # DYNAMIC ROUTING
        if input_data.imageUrl:
            score, label = run_multimodal([input_data.text], [input_data.imageUrl], input_data.threshold)[0]
            mode = "multimodal"
        else:
            score, label = run_text([input_data.text], input_data.threshold)[0]
            mode = "text"
            
        symptom = get_symptom_label(input_data.text) if label == "INDICATED" else None
        return {
            "label": label,
            "confidence": round(score, 4),
            "text": input_data.text,
            "symptom": symptom,
            "mode": mode,
        }
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-user")
async def predict_batch(input_data: BatchTweetInput):
    if not input_data.tweets: return {"error": "List tweet kosong"}

    text_items = []
    mm_items = []
    for i, t in enumerate(input_data.tweets):
        if t.imageUrl: mm_items.append((i, t))
        else: text_items.append((i, t))

    all_results = [None] * len(input_data.tweets)
    
    try:
        # Process text-only batch
        if text_items:
            texts = [t.text for i, t in text_items]
            res_text = run_text(texts, input_data.threshold)
            for idx, (orig_idx, _) in enumerate(text_items):
                all_results[orig_idx] = {"score": res_text[idx][0], "label": res_text[idx][1], "mode": "text"}
                
        # Process multimodal batch
        if mm_items:
            texts = [t.text for i, t in mm_items]
            urls = [t.imageUrl for i, t in mm_items]
            res_mm = run_multimodal(texts, urls, input_data.threshold)
            for idx, (orig_idx, _) in enumerate(mm_items):
                all_results[orig_idx] = {"score": res_mm[idx][0], "label": res_mm[idx][1], "mode": "multimodal"}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    details = []
    indicated_count = 0
    all_scores = []
    for i, res in enumerate(all_results):
        score, label = res["score"], res["label"]
        all_scores.append(score)
        
        symptom = None
        if label == "INDICATED":
            indicated_count += 1
            symptom = get_symptom_label(input_data.tweets[i].text)
            
        details.append({
            "tweet_id": i + 1,
            "score": round(score, 4),
            "label": label,
            "symptom": symptom,
            "mode": res["mode"]
        })

    K = 50
    top_k_scores = sorted(all_scores, reverse=True)[:K]
    avg_score = sum(top_k_scores) / len(top_k_scores) if top_k_scores else 0

    if avg_score > 0.30: status_label = "POTENSI TINGGI"
    elif avg_score > 0.15: status_label = "MODERAT"
    else: status_label = "STABIL"

    return {
        "total_tweets": len(input_data.tweets),
        "indicated_tweets": indicated_count,
        "average_risk_score": round(float(avg_score), 4),
        "status": status_label,
        "details": details,
        "routing": "dynamic"
    }

@app.post("/explain")
async def explain_tweet(input_data: SingleTweetInput):
    if explainer is None: raise HTTPException(status_code=500, detail="SHAP Explainer tidak tersedia")
    try:
        shap_values = explainer([input_data.text])
        contributions = shap_values[0].values[:, 1]
        tokens = shap_values[0].data
        explanation = [{"word": str(t), "score": float(s)} for t, s in zip(tokens, contributions)]
        return {"text": input_data.text, "explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)