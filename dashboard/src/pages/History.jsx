import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Trash2, Clock, UserSearch, Loader2, BarChart3, History as HistoryIcon, ShieldAlert, CheckCircle2, AlertCircle, TrendingUp, X } from 'lucide-react';

export function History({ onScanComplete, onNavigate }) {
  const [history, setHistory] = useState([]);
  const [cachedScans, setCachedScans] = useState({});
  const [scanningHandle, setScanningHandle] = useState(null);

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_history', 'sentimenta_deep_scans'], (storage) => {
      setHistory(storage.sentimenta_history || []);
      setCachedScans(storage.sentimenta_deep_scans || {});
    });
  }, []);

  const getRiskColor = (score) => {
    const s = score * 100;
    if (s <= 15) return 'text-emerald-500';
    if (s <= 50) return 'text-sky-500';
    if (s <= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  const clearHistory = () => {
    if(window.confirm('apakah anda yakin ingin menghapus seluruh riwayat?')) {
      chrome.storage.local.remove(['sentimenta_history', 'sentimenta_deep_scans']);
      setHistory([]);
      setCachedScans({});
    }
  };

  const deleteItem = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    chrome.storage.local.set({ sentimenta_history: newHistory });
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
                                summary: result.user_summary,
                                tweetCount: response.tweets.length,
                                details: result.details.map(d => {
                                    const originalTweet = response.tweets[d.tweet_id - 1];
                                    return { ...originalTweet, score: d.score, label: d.label };
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
    } catch(err) {
        setScanningHandle(null);
    }
  };

  const highRisks = history.filter(h => h.confidence > 0.75).length;
  const avgScore = history.length > 0 ? (history.reduce((a, b) => a + b.confidence, 0) / history.length * 100).toFixed(0) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase relative px-4">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none -z-10 transform translate-x-1/4 -translate-y-1/4">
        <HistoryIcon size={400} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><HistoryIcon size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">riwayat arsip.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">arsip intelijen untuk pola perilaku yang teridentifikasi.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-xs text-rose-500 hover:text-white hover:bg-rose-500 font-black transition-all px-5 py-3 rounded-xl border border-rose-100 uppercase tracking-widest shadow-sm bg-white"
          >
            <Trash2 size={14} />
            hapus arsip
          </button>
        )}
      </div>

      {/* Archive Overview Stats */}
      {history.length > 0 && (
          <div className="grid grid-cols-3 gap-6 shrink-0">
              <div className="bg-white border border-black/5 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
                  <div className="bg-slate-100 p-3 rounded-xl text-slate-500"><AlertCircle size={18} /></div>
                  <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">total alert</p><p className="text-2xl font-black text-[#2D3436]">{history.length}</p></div>
              </div>
              <div className="bg-rose-500/10 border border-rose-100 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
                  <div className="bg-rose-500 p-3 rounded-xl text-white"><ShieldAlert size={18} /></div>
                  <div><p className="text-xs text-rose-500 font-bold uppercase tracking-widest mb-1">risiko kritis</p><p className="text-2xl font-black text-rose-500">{highRisks}</p></div>
              </div>
              <div className="bg-white border border-black/5 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
                  <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><TrendingUp size={18} /></div>
                  <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">rata-rata</p><p className="text-2xl font-black text-[#6C5CE7]">{avgScore}%</p></div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {history.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-slate-100 bg-white">
            <HistoryIcon size={56} className="text-slate-200 mb-6" />
            <p className="text-[#2D3436] font-bold text-base uppercase tracking-widest opacity-40">arsip anda kosong.</p>
          </GlassCard>
        ) : (
          history.map((item, idx) => (
            <GlassCard key={idx} className="p-8 border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col lg:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                            {item.avatarUrl ? (
                                <img src={item.avatarUrl} alt="" className="w-12 h-12 rounded-full border border-black/5 shadow-sm" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-100 border border-black/5 flex items-center justify-center text-slate-400 text-xs font-bold">?</div>
                            )}
                            <div>
                                <p className="text-[#2D3436] font-black text-lg leading-none group-hover:text-[#6C5CE7] transition-colors">{item.displayName || "unknown"}</p>
                                <p className="text-slate-400 text-sm font-medium mt-2">{item.handle || ""}</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#74B9FF]/30 rounded-full" />
                            <p className="text-slate-500 text-lg pl-8 py-0.5 leading-relaxed italic line-clamp-3">
                                "{item.text}"
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest pt-2">
                            <div className="flex items-center gap-2"><Clock size={14} /><span>{item.date ? new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'waktu tidak diketahui'}</span></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-black/5">pola terdeteksi</span>
                        </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center justify-center gap-6 shrink-0 lg:border-l lg:pl-10 lg:min-w-[200px] bg-slate-50/50 -m-8 lg:m-0 p-8 lg:p-0">
                        <div className="text-center flex-1 lg:flex-none">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">skor risiko</p>
                            <p className={`font-black text-5xl ${getRiskColor(item.confidence)}`}>{(item.confidence * 100).toFixed(0)}<span className="text-2xl">%</span></p>
                        </div>

                        <div className="w-full space-y-3 max-w-[160px] lg:max-w-none">
                            {cachedScans[item.handle] ? (
                                <button 
                                    onClick={() => onNavigate('user-analysis', cachedScans[item.handle])}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#6C5CE7]/20 hover:scale-[1.02] transition-all"
                                >
                                    <BarChart3 size={16} /> lihat laporan
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleDeepScan(item)}
                                    disabled={scanningHandle !== null}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white border border-[#6C5CE7]/30 text-[#6C5CE7] text-xs font-black uppercase tracking-widest hover:bg-[#6C5CE7]/5 transition-all"
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
    </div>
  );
}
