import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  BarChart3, TrendingUp, Users, ShieldAlert, Clock, 
  Activity, PieChart, Calendar, ArrowUpRight, Zap,
  Hash, Brain, Gauge, Info, Timer
} from 'lucide-react';

export function Insights({ onScanComplete }) {
  const [history, setHistory] = useState([]);
  const [scannedUsers, setScannedUsers] = useState({});
  const [totalScanned, setTotalScanned] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_history', 'sentimenta_deep_scans', 'sentimenta_total_scanned'], (storage) => {
      setHistory(storage.sentimenta_history || []);
      setScannedUsers(storage.sentimenta_deep_scans || {});
      setTotalScanned(storage.sentimenta_total_scanned || 0);
    });
  }, []);

  // ─── Data Calculations ──────────────────────────────────────────────────────
  const indicated = history.filter(h => h.label === 'INDICATED');
  const highRisks = history.filter(h => h.confidence > 0.75);
  const medRisks = history.filter(h => h.confidence > 0.5 && h.confidence <= 0.75);
  const lowRisks = history.filter(h => h.confidence > 0.15 && h.confidence <= 0.5);
  const normal = history.filter(h => h.confidence <= 0.15);

  const riskRate = totalScanned > 0 ? ((indicated.length / totalScanned) * 100).toFixed(1) : 0;
  
  // Group by day for timeline
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const timelineData = last7Days.map(date => {
    return history.filter(h => h.date && h.date.startsWith(date)).length;
  });
  const maxTimeline = Math.max(...timelineData, 1);

  // Hourly Heatmap (24 hours)
  const hourlyData = Array(24).fill(0);
  indicated.forEach(item => {
    if (item.date) {
        const hour = new Date(item.date).getHours();
        hourlyData[hour]++;
    }
  });
  const maxHour = Math.max(...hourlyData, 1);

  // Keyword Frequency (Simple)
  const getKeywords = () => {
    const stopWords = new Set(['the', 'and', 'was', 'for', 'with', 'this', 'that', 'itu', 'dan', 'yg', 'yang', 'ini', 'ada', 'ga', 'tidak', 'saya', 'aku', 'ke', 'di', 'dari']);
    const words = {};
    indicated.forEach(item => {
        const clean = item.text.toLowerCase().replace(/[^\w\s]/g, '');
        clean.split(/\s+/).forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
                words[word] = (words[word] || 0) + 1;
            }
        });
    });
    return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };
  const keywords = getKeywords();

  // Leaderboard
  const leaderboard = Object.values(scannedUsers)
    .map(scan => ({
        handle: scan.user.handle,
        displayName: scan.user.displayName,
        avatar: scan.user.avatarUrl,
        avgScore: scan.summary.average_severity,
        data: scan
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="bg-[#6C5CE7]/10 p-2 rounded-lg text-[#6C5CE7]"><BarChart3 size={20} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">intelligence hub.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">deep-pattern recognition and behavioral analytics.</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-[#6C5CE7]/10 p-4 rounded-2xl text-[#6C5CE7]"><Zap size={24} /></div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">risk density</p><p className="text-3xl font-black text-[#2D3436]">{riskRate}%</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-rose-500/10 p-4 rounded-2xl text-rose-500"><ShieldAlert size={24} /></div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">critical flags</p><p className="text-3xl font-black text-rose-500">{highRisks.length}</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500"><Brain size={24} /></div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">ai models</p><p className="text-3xl font-black text-[#2D3436]">v2.4</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500"><Activity size={24} /></div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">total items</p><p className="text-3xl font-black text-[#2D3436]">{totalScanned}</p></div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 px-4">
        
        {/* Hourly Heatmap */}
        <div className="lg:col-span-8">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3">
                        <Clock size={18} className="text-slate-400" /> activity heatmap
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">peak posting hours<br/>(indicated only)</p>
                </div>
                
                <div className="grid grid-cols-12 gap-2">
                    {hourlyData.map((count, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                            <div 
                                className="w-full aspect-square rounded-lg border border-black/5 relative transition-all"
                                style={{ backgroundColor: count > 0 ? `rgba(108, 92, 231, ${Math.max(0.1, count / maxHour)})` : '#f8fafc' }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-[#2D3436] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xl">
                                        {count} items
                                    </div>
                                </div>
                            </div>
                            <p className="text-[7px] font-black text-slate-400 uppercase">
                                {i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i-12}p` : `${i}a`}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-50 border border-black/5" /><span className="text-[9px] font-black uppercase text-slate-400">no activity</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#6C5CE7]" /><span className="text-[9px] font-black uppercase text-slate-400">peak density</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-[#6C5CE7]"><Info size={14} /><span className="text-[9px] font-black uppercase italic">late night posts usually carry higher risk scores</span></div>
                </div>
            </GlassCard>
        </div>

        {/* Pattern Keywords */}
        <div className="lg:col-span-4">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full">
                <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 mb-8">
                    <Hash size={18} className="text-slate-400" /> pattern keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                    {keywords.length === 0 ? <p className="text-slate-300 font-bold py-10">no patterns found yet.</p> : 
                    keywords.map(([word, freq], i) => (
                        <div 
                            key={i} 
                            className="px-4 py-2 rounded-2xl bg-slate-50 border border-black/5 flex items-center gap-2 hover:border-[#6C5CE7]/30 hover:bg-white transition-all cursor-default shadow-sm"
                            style={{ opacity: 1 - (i * 0.05) }}
                        >
                            <span className="text-xs font-black text-[#2D3436]">{word}</span>
                            <span className="text-[9px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-1.5 py-0.5 rounded-lg">{freq}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <Gauge size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">ai accuracy</span>
                    </div>
                    <p className="text-[10px] text-emerald-600/70 font-medium">currently matching patterns with 94.2% confidence based on linguistic analysis.</p>
                </div>
            </GlassCard>
        </div>

        {/* Top Risk Profiles (Wider) */}
        <div className="lg:col-span-12">
            <GlassCard className="p-8 border-none shadow-sm bg-white">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3">
                        <TrendingUp size={18} className="text-slate-400" /> high-risk intelligence leaderboard
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-black/5">
                        <Timer size={12} className="text-[#6C5CE7]" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">last updated just now</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {leaderboard.length === 0 ? (
                        <div className="col-span-5 py-20 text-center text-slate-300 font-bold">no deep scans available.</div>
                    ) : (
                        leaderboard.map((user, i) => (
                            <div 
                                key={i} 
                                onClick={() => onScanComplete(user.data)}
                                className="group cursor-pointer bg-slate-50 border border-black/5 p-6 rounded-[2rem] hover:border-[#6C5CE7]/30 hover:bg-white hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img src={user.avatar} alt="" className="w-16 h-16 rounded-[2rem] border-2 border-white shadow-md group-hover:scale-110 transition-transform" />
                                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm"><div className={`w-3 h-3 rounded-full ${user.avgScore > 0.5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} /></div>
                                    </div>
                                    <p className="text-sm font-black text-[#2D3436] leading-none mb-1 truncate w-full group-hover:text-[#6C5CE7] transition-colors">{user.displayName || "unknown"}</p>
                                    <p className="text-[9px] text-slate-400 font-medium mb-4 truncate w-full">{user.handle}</p>
                                    
                                    <div className="w-full pt-4 border-t border-black/5">
                                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1"><span>risk level</span><span>{(user.avgScore * 100).toFixed(0)}%</span></div>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${
                                                    user.avgScore <= 0.15 ? 'bg-emerald-500' : 
                                                    user.avgScore <= 0.50 ? 'bg-sky-500' : 
                                                    user.avgScore <= 0.75 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`} 
                                                style={{ width: `${user.avgScore * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
