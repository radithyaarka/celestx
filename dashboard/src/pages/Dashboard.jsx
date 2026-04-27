import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import {
  ShieldCheck, ShieldAlert, WifiOff, ScanSearch, Loader2,
  Activity, AlertTriangle, CheckCircle2, Server, Zap, TrendingDown, Clock, Users, ArrowRight, Cloud, User, Info, Repeat
} from 'lucide-react';

export function Dashboard({ onNavigate }) {
  const [lastScan, setLastScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [idScanned, setIdScanned] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  const refreshData = useCallback(() => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(['sentimenta_history', 'lastScan', 'sentimenta_total_scanned', 'sentimenta_id_scanned'], (storage) => {
        setHistory(storage.sentimenta_history || []);
        setTotalScanned(storage.sentimenta_total_scanned || 0);
        setIdScanned(storage.sentimenta_id_scanned || 0);
        if (storage.lastScan) setLastScan(storage.lastScan);
      });
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const [highlightText, setHighlightText] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      setHighlightText(highlight);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightText(null);
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        try {
          await fetch('http://localhost:8000/', { signal: AbortSignal.timeout(3000) });
          setBackendStatus('online');
        } catch { setBackendStatus('offline'); }
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualScan = async () => {
    setScanning(true);
    try {
      chrome.runtime.sendMessage({ action: 'manual_scan' }, () => {
        setTimeout(refreshData, 2000);
        setScanning(false);
      });
    } catch { setScanning(false); }
  };

  const getRiskColor = (score) => {
    const s = score * 100;
    if (s <= 15) return 'text-emerald-500';
    if (s <= 50) return 'text-sky-500';
    if (s <= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  const detectLanguage = (text) => {
    if (!text) return 'id';
    const enWords = /\b(the|is|are|in|to|of|for|with|and|on|at|i|me|my|you|your|he|she|it)\b/gi;
    const idWords = /\b(yang|di|ke|dari|ini|itu|dan|ada|saya|aku|kamu|lo|gw|ga|tidak|untuk)\b/gi;
    const enMatches = (text.match(enWords) || []).length;
    const idMatches = (text.match(idWords) || []).length;
    return enMatches > idMatches ? 'en' : 'id';
  };

  const idHistory = history.filter(h => detectLanguage(h.text) === 'id');
  const indicated = idHistory.filter(h => h.label === 'INDICATED');
  const uniqueUsers = [...new Set(idHistory.map(h => h.handle).filter(Boolean))].length;
  const recentAlerts = indicated.slice(0, 10);

  // Rate calculation using Indonesian-only base
  const alertRate = idScanned > 0 ? ((indicated.length / idScanned) * 100).toFixed(0) : 0;

  const totalIndicatedConfidence = idHistory.reduce((a, b) => a + (b.confidence || 0), 0);
  const estimatedNormalCount = Math.max(0, idScanned - idHistory.length);
  const avgConfidence = idScanned > 0
    ? (((totalIndicatedConfidence + (estimatedNormalCount * 0.03)) / idScanned) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 lowercase px-4 mt-8">

      {/* Left Column: Control Panel */}
      <div className="w-full md:w-[400px] flex flex-col justify-between shrink-0 h-full overflow-y-auto custom-scrollbar pb-2 pr-2">

        <div className="shrink-0 space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center">
              <img src="/logo.png" alt="CelestX" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#2D3436] tracking-tight leading-none font-serif italic">celestx.</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">monitor live v1.0</p>
            </div>
          </div>
          <div className="h-px bg-black/5 w-full" />
        </div>

        {/* Stats Section Revamp */}
        <div className="flex flex-col gap-4 shrink-0">
          
          {/* Main Throughput Card */}
          <div className="bg-white border border-black/5 p-5 rounded-3xl shadow-sm relative overflow-visible">
            <div className="flex justify-between items-start border-b border-black/5 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">total throughput</p>
                  <div className="relative group/info">
                    <Info size={12} className="text-slate-300" />
                    <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 lowercase">
                      semua tweet yang ditangkap dari layar (termasuk bahasa asing).
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-5xl font-black text-[#2D3436] leading-none">{totalScanned}</p>
                </div>
              </div>
              <div className="p-3 bg-[#6C5CE7]/10 rounded-2xl text-[#6C5CE7]"><Activity size={24} /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                  <div className="flex items-center gap-1">
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">indicated</p>
                    <div className="relative group/info">
                      <Info size={10} className="text-slate-300" />
                      <div className="absolute bottom-full left-0 mb-2 w-40 p-2.5 bg-[#2D3436] text-white text-[9px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 lowercase">
                        tweet indonesia dengan indikasi depresi.
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-black text-rose-500 leading-none">{indicated.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                  <div className="flex items-center gap-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">normal (id)</p>
                    <div className="relative group/info">
                      <Info size={12} className="text-slate-300" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 text-center lowercase">
                        tweet indonesia normal tanpa indikasi.
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-400 leading-none">{Math.max(0, idScanned - indicated.length)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
                  <div className="flex items-center gap-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">foreign</p>
                    <div className="relative group/info">
                      <Info size={12} className="text-slate-300" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 text-right lowercase">
                        tweet bahasa asing yang diabaikan.
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-400 leading-none">{Math.max(0, totalScanned - idScanned)}</p>
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Risk Rate */}
            <div className="col-span-1 bg-white border border-black/5 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center relative group/tip overflow-visible">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 mb-2.5"><TrendingDown size={20} /></div>
              <p className={`text-2xl font-black leading-none ${getRiskColor(Number(alertRate) / 100)}`}>{alertRate}%</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">risk rate</p>
                <div className="relative group/info">
                  <Info size={12} className="text-slate-300" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 lowercase text-left">
                    persentase indikasi depresi dari total populasi.
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="col-span-1 bg-white border border-black/5 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center relative group/tip overflow-visible">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 mb-2.5"><Users size={20} /></div>
              <p className="text-2xl font-black leading-none text-[#2D3436]">{uniqueUsers}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">subjects</p>
                <div className="relative group/info">
                  <Info size={12} className="text-slate-300" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 lowercase text-center">
                    jumlah pengguna unik yang datanya pernah dianalisis.
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Intensity */}
            <div className="col-span-1 bg-white border border-black/5 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center relative group/tip overflow-visible">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 mb-2.5"><Activity size={20} /></div>
              <p className="text-2xl font-black leading-none text-[#2D3436]">{avgConfidence}%</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">intensity</p>
                <div className="relative group/info">
                  <Info size={12} className="text-slate-300" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[#2D3436] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 lowercase text-right">
                    rata-rata kekuatan indikasi depresi dari seluruh data.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Docked Section */}
        <div className="flex flex-col gap-3 shrink-0 pt-2">
          {/* Manual Scan Action - Slimmer Version */}
          <div
            onClick={handleManualScan}
            className="bg-[#6C5CE7] rounded-3xl p-4 flex items-center justify-center gap-4 text-white cursor-pointer hover:bg-[#5A4AD1] transition-all shadow-lg shadow-[#6C5CE7]/20 relative overflow-hidden group w-full"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
              {scanning ? <Loader2 className="animate-spin" size={24} /> : <ScanSearch size={24} />}
            </div>
            <div className="text-left">
              <p className="text-xl font-black leading-none">
                {scanning ? 'sedang memindai...' : 'scan manual'}
              </p>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1.5">perbarui data timeline</p>
            </div>
          </div>

          {/* System Status Tiles */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className={`px-4 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest flex flex-col items-center justify-center text-center gap-1.5 ${backendStatus === 'online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
              <span className="opacity-70">api server</span>
              <span className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} /> {backendStatus}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl border bg-blue-50 border-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest flex flex-col items-center justify-center text-center gap-1.5">
              <span className="opacity-70">auto-monitor</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Recent Detections */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/40 backdrop-blur-md rounded-[3rem] border border-black/5 overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-black/5 flex items-center justify-between shrink-0 bg-white/50">
          <div>
            <h3 className="text-2xl font-black text-[#2D3436] tracking-tighter">recent alerts.</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-black/5 text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            history <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
          {recentAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <ShieldCheck size={56} className="opacity-10" />
              <p className="font-bold text-sm uppercase tracking-widest">aman terkendali</p>
            </div>
          ) : (
            recentAlerts.map((item, idx) => {
              const isHighlighted = highlightText && item.text.includes(highlightText);
              return (
              <div 
                key={idx} 
                className={`p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${isHighlighted ? 'bg-[#6C5CE7]/5 border-[#6C5CE7]/40 shadow-[0_0_40px_rgba(108,92,231,0.3)] scale-[1.02] z-10' : 'border-black/[0.03] bg-white shadow-sm hover:border-[#6C5CE7]/20'}`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-black/5 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={20} /></div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-[#2D3436] leading-none">{item.displayName || "unknown"}</span>
                          <span className="text-[10px] font-medium text-slate-400">{item.handle || ""}</span>
                          {item.isRetweet && (
                            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-[#6C5CE7]/10">
                              <Repeat size={8} /> retweet
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">
                          <Clock size={10} />
                          <span>{item.date ? new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'baru saja'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">intensity</p>
                        <p className={`text-2xl font-black leading-none ${getRiskColor(item.confidence)}`}>{(item.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed italic">
                      "{item.text}"
                    </p>

                    {/* Media Image */}
                    {(item.imageUrl || item.mediaUrl) && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-slate-100">
                        <img src={item.imageUrl || item.mediaUrl} alt="" className="w-full h-auto max-h-60 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
