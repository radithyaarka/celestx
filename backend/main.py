import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import pipeline
import torch
import numpy as np
import shap
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SentimenTA Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD MODEL ---
MODEL_PATH = "./model_ta" # Pastikan folder model_ta ada di folder yang sama dengan main.py

try:
    print("⏳ Memuat model IndoBERTweet... (bisa memakan waktu 30-60 detik)")
    device = 0 if torch.cuda.is_available() else -1
    pipe = pipeline("text-classification", model=MODEL_PATH, tokenizer=MODEL_PATH, device=device)
    print("✅ Model berhasil dimuat!")
    
    # --- SHAP XAI INITIALIZATION ---
    print("⏳ Menginisialisasi SHAP Explainer...")
    def predict_proba(texts):
        if isinstance(texts, np.ndarray):
            texts = texts.tolist()
        elif isinstance(texts, str):
            texts = [texts]
            
        inputs = pipe.tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt").to(pipe.device)
        
        with torch.no_grad():
            outputs = pipe.model(**inputs)
            
        scores = torch.nn.functional.softmax(outputs.logits, dim=-1)
        return scores.cpu().numpy()

    explainer = shap.Explainer(predict_proba, pipe.tokenizer)
    print("✅ SHAP Explainer siap!")

except Exception as e:
    print(f"❌ Gagal memuat model/SHAP: {e}")
    pipe = None
    explainer = None

# --- SKEMA DATA ---
class SingleTweetInput(BaseModel):
    text: str

class BatchTweetInput(BaseModel):
    tweets: List[str]

# --- ENDPOINTS ---

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "online", "model": "IndoBERTweet-Depression"}

@app.post("/predict")
async def predict_single(input_data: SingleTweetInput):
    if pipe is None:
        raise HTTPException(status_code=500, detail="Model tidak tersedia di server")
    
    results = pipe(input_data.text, top_k=None)
    
    score_depresi = 0.0
    for res in results:
        if res['label'] == 'LABEL_1':
            score_depresi = res['score']
            break
    
    label = "INDICATED" if score_depresi > 0.15 else "NORMAL"
    
    return {
        "label": label,
        "confidence": round(float(score_depresi), 4),
        "text": input_data.text
    }

@app.post("/predict-user")
async def predict_batch(input_data: BatchTweetInput):
    """
    Endpoint khusus User-Level Analysis.
    Menerima list tweet dan menghitung rata-rata risiko.
    """
    if not input_data.tweets:
        return {"error": "List tweet kosong"}

    results = pipe(input_data.tweets, top_k=None)
    
    total_score = 0
    indicated_count = 0
    details = []

    for i, res_list in enumerate(results):
        score = 0.0
        for r in res_list:
            if r['label'] == 'LABEL_1':
                score = r['score']
                break
        is_depressed = score > 0.15
        if is_depressed:
            indicated_count += 1
        total_score += score
        
        details.append({
            "tweet_id": i + 1,
            "score": round(float(score), 4),
            "label": "INDICATED" if is_depressed else "NORMAL"
        })

    avg_score = total_score / len(input_data.tweets) if input_data.tweets else 0
    
    return {
        "total_tweets": len(input_data.tweets),
        "indicated_tweets": indicated_count,
        "average_risk_score": round(float(avg_score), 4),
        "status": "AT RISK" if avg_score > 0.15 else "STABLE",
        "details": details
    }

@app.post("/explain")
async def explain_tweet(input_data: SingleTweetInput):
    if explainer is None:
        raise HTTPException(status_code=500, detail="SHAP Explainer tidak tersedia")
        
    try:
        shap_values = explainer([input_data.text])
        
        contributions = shap_values[0].values[:, 1]
        tokens = shap_values[0].data
        
        explanation = []
        for token, score in zip(tokens, contributions):
            explanation.append({
                "word": str(token),
                "score": float(score)
            })
            
        return {
            "text": input_data.text,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)