import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import {
  ShieldCheck, ShieldAlert, WifiOff, ScanSearch, Loader2,
  Activity, AlertTriangle, CheckCircle2, Server, Zap, TrendingDown, Clock, Users, ArrowRight, Cloud
} from 'lucide-react';

export function Dashboard({ onNavigate }) {
  const [lastScan, setLastScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); 

  const refreshData = useCallback(() => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(['sentimenta_history', 'lastScan', 'sentimenta_total_scanned'], (storage) => {
        setHistory(storage.sentimenta_history || []);
        setTotalScanned(storage.sentimenta_total_scanned || 0);
        if (storage.lastScan) setLastScan(storage.lastScan);
      });
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

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

  const indicated = history.filter(h => h.label === 'INDICATED');
  const uniqueUsers = [...new Set(history.map(h => h.handle).filter(Boolean))].length;
  const recentAlerts = indicated.slice(0, 10);
  const alertRate = totalScanned > 0 ? ((indicated.length / totalScanned) * 100).toFixed(0) : 0;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 lowercase overflow-hidden px-4">
      
      {/* Left Column: Control Panel */}
      <div className="w-full md:w-[350px] flex flex-col shrink-0 h-full overflow-hidden pb-4 space-y-6">
        
        {/* Unified Header */}
        <div className="shrink-0 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]">
              <Cloud size={24} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">celestx.</h1>
                <p className="text-slate-400 text-sm font-medium mt-1">monitor live v1.0</p>
            </div>
          </div>
          <div className="h-px bg-black/5 w-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-white border border-black/5 p-4 rounded-xl shadow-sm flex items-center gap-3">
            <div className="p-2 bg-[#6C5CE7]/10 rounded-lg text-[#6C5CE7]"><Activity size={14} /></div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">dipindai</p>
                <p className="text-xl font-black text-[#2D3436]">{totalScanned}</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-4 rounded-xl shadow-sm flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><AlertTriangle size={14} /></div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">terindikasi</p>
                <p className="text-xl font-black text-rose-500">{indicated.length}</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-4 rounded-xl shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingDown size={14} /></div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">rasio risiko</p>
                <p className={`text-xl font-black ${getRiskColor(alertRate/100)}`}>{alertRate}%</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-4 rounded-xl shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Users size={14} /></div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">pengguna</p>
                <p className="text-xl font-black text-[#2D3436]">{uniqueUsers}</p>
            </div>
          </div>
        </div>

        {/* Manual Scan Action */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
            <div 
              onClick={handleManualScan}
              className="bg-[#6C5CE7] rounded-[2.5rem] p-8 aspect-square flex flex-col items-center justify-center text-center text-white cursor-pointer hover:bg-[#5A4AD1] transition-all shadow-xl shadow-[#6C5CE7]/20 relative overflow-hidden group w-full"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {scanning ? <Loader2 className="animate-spin" size={28} /> : <ScanSearch size={28} />}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black leading-tight">
                  {scanning ? 'memindai...' : 'pindai manual'}
                </p>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">ambil data timeline</p>
              </div>
            </div>
        </div>

        {/* System Status Tiles */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className={`px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${backendStatus === 'online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            <span>server api</span>
            <span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} /> {backendStatus}</span>
          </div>
          <div className="px-5 py-3 rounded-xl border bg-blue-50 border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
            <span>auto-monitor</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> aktif</span>
          </div>
        </div>
      </div>

      {/* Right Column: Recent Detections */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/40 backdrop-blur-md rounded-[3rem] border border-black/5 overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-black/5 flex items-center justify-between shrink-0 bg-white/50">
          <div>
            <h3 className="text-2xl font-black text-[#2D3436] tracking-tighter">peringatan terbaru.</h3>
          </div>
          <button 
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-black/5 text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            riwayat <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
          {recentAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <ShieldCheck size={56} className="opacity-10" />
                <p className="font-bold text-sm uppercase tracking-widest">aman terkendali</p>
              </div>
          ) : (
              recentAlerts.map((item, idx) => (
                <div key={idx} className="p-6 rounded-[2rem] border border-black/5 bg-white shadow-sm hover:border-[#6C5CE7]/20 transition-all group">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {item.avatarUrl ? <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-black/5 shadow-sm" /> : <div className="w-10 h-10 rounded-full bg-slate-100" />}
                                <div>
                                    <p className="text-[#2D3436] font-black text-base leading-none group-hover:text-[#6C5CE7] transition-colors">{item.displayName || "unknown"}</p>
                                    <p className="text-slate-400 text-xs font-medium mt-1.5">{item.handle || ""}</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <p className={`font-black text-3xl ${getRiskColor(item.confidence)}`}>{(item.confidence * 100).toFixed(0)}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">%</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#74B9FF]/20 rounded-full" />
                            <p className="text-slate-500 text-base pl-6 py-0.5 leading-relaxed italic line-clamp-2">
                                "{item.text}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                            <div className="flex items-center gap-2"><Clock size={12} /><span>{item.date ? new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'baru saja'}</span></div>
                            <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-black/5">pola terdeteksi</span>
                        </div>
                    </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
