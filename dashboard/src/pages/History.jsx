import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { XaiModal } from '../components/XaiModal';
import { 
  History as HistoryIcon, 
  Trash2, 
  X, 
  UserSearch, 
  Clock, 
  ShieldAlert, 
  BarChart3, 
  Loader2, 
  AlertCircle, 
  TrendingUp,
  Database,
  Brain,
  Zap,
  Layout,
  User,
  Share2,
  Sparkles
} from 'lucide-react';

export function History({ onNavigate, onScanComplete }) {
  const [history, setHistory] = useState([]);
  
  // xAI State
  const [xaiData, setXaiData] = useState(null);
  const [isXaiLoading, setIsXaiLoading] = useState(null);

  const handleXaiExplain = async (item) => {
    setIsXaiLoading(item.id || item.text);
    try {
        const response = await fetch('http://127.0.0.1:8000/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: item.text })
        });
        const data = await response.json();
        setXaiData({ ...data, originalTweet: item });
    } catch (error) {
        console.error("XAI Error:", error);
        alert("Gagal memanggil xAI. Pastikan server Python menyala dan menginstall module 'shap'.");
    } finally {
        setIsXaiLoading(null);
    }
  };
  const [cachedScans, setCachedScans] = useState({});
  const [scanningHandle, setScanningHandle] = useState(null);

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_history', 'sentimenta_deep_scans'], (storage) => {
      setHistory(storage.sentimenta_history || []);
      setCachedScans(storage.sentimenta_deep_scans || {});
    });
  }, []);

  const deleteItem = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    chrome.storage.local.set({ sentimenta_history: updated });
  };

  const clearHistory = () => {
    if (window.confirm('apakah anda yakin ingin menghapus seluruh history archive?')) {
      chrome.storage.local.remove(['sentimenta_history', 'sentimenta_deep_scans']);
      setHistory([]);
      setCachedScans({});
    }
  };

  const getRiskColor = (score) => {
    if (score > 0.75) return 'text-rose-500';
    if (score > 0.5) return 'text-amber-500';
    return 'text-[#6C5CE7]';
  };

  const handleDeepScan = async (item, forceNew = true) => {
    if (!forceNew && cachedScans[item.handle]) {
      onScanComplete(cachedScans[item.handle]);
      return;
    }
    const rawHandle = item.handle.replace('@', '');
    setScanningHandle(rawHandle);
    try {
      chrome.tabs.create({ url: `https://x.com/${rawHandle}`, active: true }, (tab) => {
        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'deep_scrape_profile' }, async (response) => {
                chrome.tabs.remove(tab.id);
                if (!response || !response.tweets) {
                  setScanningHandle(null);
                  return;
                }
                const tweetTexts = response.tweets.map(t => t.text);
                const res = await fetch("http://localhost:8000/predict-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tweets: tweetTexts }),
                });
                const result = await res.json();
                const scanData = {
                  user: item,
                  summary: result,
                  tweetCount: response.tweets.length,
                  details: result.details.map(d => {
                    const originalTweet = response.tweets[d.tweet_id - 1];
                    return { ...originalTweet, score: d.score, label: d.label, symptom: d.symptom };
                  })
                };
                chrome.storage.local.get(['sentimenta_deep_scans'], (s) => {
                  const newScans = { ...(s.sentimenta_deep_scans || {}), [item.handle]: scanData };
                  chrome.storage.local.set({ sentimenta_deep_scans: newScans });
                  setCachedScans(newScans);
                });
                onScanComplete(scanData);
                setScanningHandle(null);
              });
            }, 4000);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    } catch (err) {
      setScanningHandle(null);
    }
  };

  const highRisks = history.filter(h => h.confidence > 0.75).length;
  const avgScore = history.length > 0 
    ? (history.reduce((a, b) => a + b.confidence, 0) / history.length * 100).toFixed(0) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 lowercase relative px-4">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6C5CE7]/5 blur-[120px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7] shadow-sm"><HistoryIcon size={24} /></div>
            <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">archive vault.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium pl-16">manajemen data intelijen untuk pola perilaku terdeteksi.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-end">
             {history.length > 0 && (
                <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 text-[10px] text-rose-500 hover:text-white hover:bg-rose-500 font-black transition-all px-5 py-3 rounded-xl border border-rose-100 uppercase tracking-widest shadow-sm bg-white"
                >
                    <Trash2 size={14} />
                    clear
                </button>
             )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white border border-black/5 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm group hover:border-[#6C5CE7]/30 transition-all">
            <div className="bg-slate-50 p-2.5 rounded-lg text-slate-400 group-hover:bg-[#6C5CE7]/10 group-hover:text-[#6C5CE7] transition-colors"><Database size={18} /></div>
            <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">scanned</p><p className="text-2xl font-black text-[#2D3436] leading-none">{history.length}</p></div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm group hover:border-rose-500/30 transition-all">
            <div className="bg-rose-50 p-2.5 rounded-lg text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all"><ShieldAlert size={18} /></div>
            <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">critical</p><p className="text-2xl font-black text-rose-500 leading-none">{highRisks}</p></div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm group hover:border-[#6C5CE7]/30 transition-all">
            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-all"><TrendingUp size={18} /></div>
            <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">avg intensity</p><p className="text-2xl font-black text-[#6C5CE7] leading-none">{avgScore}%</p></div>
          </div>
          <div className="bg-[#6C5CE7] p-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-[#6C5CE7]/20 border border-[#6C5CE7]">
            <div className="bg-white/20 p-2.5 rounded-lg text-white"><Zap size={18} /></div>
            <div><p className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-none mb-1.5">status</p><p className="text-2xl font-black text-white leading-none">active</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {history.length === 0 ? (
          <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Layout size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-lg tracking-tight uppercase tracking-widest">archive is empty.</p>
            <p className="text-slate-300 text-sm mt-2">lakukan scan untuk mulai mengisi database.</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <GlassCard key={idx} className="p-8 border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden relative rounded-[2.5rem]">
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                        {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-black/5 shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={20} /></div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#2D3436] leading-none">{item.displayName || "unknown"}</span>
                            <span className="text-[10px] font-medium text-slate-400">{item.handle || ""}</span>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6C5CE7]/20 rounded-full" />
                            <p className="text-slate-600 text-sm pl-6 py-0.5 leading-relaxed italic">
                                "{item.text}"
                            </p>
                        </div>

                        {/* Media Image Preview */}
                        {(item.imageUrl || item.mediaUrl) && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-slate-100 max-w-md">
                                <img src={item.imageUrl || item.mediaUrl} alt="" className="w-full h-auto max-h-48 object-cover" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-[9px] text-slate-300 font-black uppercase tracking-widest pt-1">
                            <div className="flex items-center gap-1.5"><Clock size={12} className="text-[#6C5CE7]/60" /><span>{item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'unknown'}</span></div>
                        </div>

                        {/* xAI Button */}
                        <div className="mt-2 pt-2 border-t border-black/5 flex justify-start">
                            <button 
                                onClick={() => handleXaiExplain(item)}
                                disabled={isXaiLoading === (item.id || item.text)}
                                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-[#6C5CE7]/10 text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-all border border-[#6C5CE7]/20 shadow-sm"
                            >
                                {isXaiLoading === (item.id || item.text) ? (
                                    <span className="animate-spin">⌛</span>
                                ) : (
                                    <Sparkles size={10} />
                                )}
                                {isXaiLoading === (item.id || item.text) ? 'analyzing...' : 'xAI Explain'}
                            </button>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center justify-center gap-6 shrink-0 lg:border-l lg:pl-10 lg:min-w-[200px] bg-slate-50/50 -m-8 lg:m-0 p-8 lg:p-0">
                  <div className="text-center flex-1 lg:flex-none">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">intensity</p>
                    <p className={`font-black text-5xl ${getRiskColor(item.confidence)}`}>{(item.confidence * 100).toFixed(0)}<span className="text-2xl">%</span></p>
                  </div>

                  <div className="w-full max-w-[160px] lg:max-w-none">
                    {cachedScans[item.handle] ? (
                      <button
                        onClick={() => onScanComplete(cachedScans[item.handle])}
                        className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#6C5CE7] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6C5CE7]/20 hover:scale-[1.02] transition-all"
                      >
                        <BarChart3 size={16} /> view report
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeepScan(item)}
                        disabled={scanningHandle !== null}
                        className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white border border-[#6C5CE7]/30 text-[#6C5CE7] text-[10px] font-black uppercase tracking-widest hover:bg-[#6C5CE7]/5 transition-all"
                      >
                        {scanningHandle === item.handle.replace('@', '') ? <Loader2 size={16} className="animate-spin" /> : <UserSearch size={16} />}
                        {scanningHandle === item.handle.replace('@', '') ? '...' : 'deep scan'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* xAI Modal */}
      <XaiModal xaiData={xaiData} setXaiData={setXaiData} />
    </div>
  );
}
