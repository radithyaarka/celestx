import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, ShieldAlert, Clock, 
  Activity, PieChart, Calendar, ArrowUpRight, Zap,
  Hash, Brain, Gauge, Info, Timer, LayoutGrid, ListChecks, BookOpen, AlertCircle, Sparkles, Target, ZapOff, ArrowDownRight, Share2, Activity as ActivityIcon, HelpCircle, Tag, Eye, MousePointer2
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
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const indicated = history.filter(h => h.label === 'INDICATED');
  const highRisks = history.filter(h => h.confidence > 0.75);
  const medRisks = history.filter(h => h.confidence > 0.5 && h.confidence <= 0.75);
  const lowRisks = history.filter(h => h.confidence > 0.15 && h.confidence <= 0.5);

  const getDSMTopics = () => {
    return [
        { label: 'suasana hati depresi', keywords: ['sedih', 'sad', 'nangis', 'hopeless', 'kosong', 'empty', 'berduka'], count: 0, color: '#f43f5e', desc: 'perasaan sedih, hampa, atau putus asa hampir sepanjang hari.' },
        { label: 'anhedonia', keywords: ['bosan', 'bosen', 'interest', 'minat', 'gak seru', 'mati rasa'], count: 0, color: '#f97316', desc: 'penurunan minat atau kesenangan yang nyata pada hampir semua aktivitas.' },
        { label: 'nafsu makan', keywords: ['makan', 'lapar', 'kurus', 'diet', 'appetite', 'berat badan'], count: 0, color: '#f59e0b', desc: 'penurunan atau peningkatan berat badan/nafsu makan yang signifikan.' },
        { label: 'gangguan tidur', keywords: ['tidur', 'insomnia', 'begadang', 'ngantuk', 'mimpi buruk', 'malam'], count: 0, color: '#6366f1', desc: 'kesulitan tidur (insomnia) atau tidur berlebihan (hipersomnia) setiap hari.' },
        { label: 'psikomotor', keywords: ['gelisah', 'resah', 'agitation', 'panik', 'gemetar', 'nervous'], count: 0, color: '#8b5cf6', desc: 'kegelisahan atau kelambatan gerakan yang dapat diamati oleh orang lain.' },
        { label: 'keletihan', keywords: ['lelah', 'capek', 'tired', 'lemas', 'energi', 'mager', 'malas'], count: 0, color: '#3b82f6', desc: 'kehilangan energi atau rasa lelah yang luar biasa hampir setiap hari.' },
        { label: 'tidak berharga', keywords: ['salah', 'guilt', 'sia-sia', 'beban', 'worthless', 'gagal', 'menyesal'], count: 0, color: '#a855f7', desc: 'rasa bersalah yang berlebihan atau merasa tidak berguna secara tidak wajar.' },
        { label: 'konsentrasi', keywords: ['fokus', 'bingung', 'pikiran', 'mikir', 'lupa', 'concentrate'], count: 0, color: '#0ea5e9', desc: 'kesulitan berpikir, berkonsentrasi, atau membuat keputusan sederhana.' },
        { label: 'suicidal ideation', keywords: ['mati', 'die', 'akhir', 'end', 'bunuh diri', 'nyawa', 'pergi'], count: 0, color: '#cbd5e1', desc: 'pikiran berulang tentang kematian, ide bunuh diri atau rencana percobaan.' }
    ];
  };

  const calculateTopics = () => {
      const topics = getDSMTopics();
      indicated.forEach(item => {
          const text = item.text.toLowerCase();
          topics.forEach(t => { if (t.keywords.some(kw => text.includes(kw))) t.count++; });
      });
      return topics;
  };
  const dsmTopics = calculateTopics();

  const avgIntensity = history.length > 0 
    ? (history.reduce((a, b) => a + b.confidence, 0) / history.length * 100).toFixed(1) 
    : 0;

  const calculateItemSeverity = (text) => {
      const lowerText = text.toLowerCase();
      const topics = getDSMTopics();
      const triggered = topics.filter(t => t.keywords.some(kw => lowerText.includes(kw))).length;
      return (triggered / 9);
  };
  
  const intensityTimeline = last7Days.map(date => {
      const dayHistory = history.filter(h => h.date && h.date.startsWith(date));
      if (dayHistory.length === 0) return 0;
      // Using confidence (intensity) instead of keyword density
      return dayHistory.reduce((a, b) => a + (b.confidence || 0), 0) / dayHistory.length;
  });

  const selfFocusKeywords = ['aku', 'saya', 'gue', 'gw', 'i', 'me', 'my', 'mine'];
  const otherFocusKeywords = ['kamu', 'anda', 'kalian', 'lo', 'lu', 'you', 'them', 'mereka'];
  
  let selfFocusCount = 0;
  let otherFocusCount = 0;
  indicated.forEach(item => {
      const text = item.text.toLowerCase();
      if (selfFocusKeywords.some(kw => text.includes(kw))) selfFocusCount++;
      if (otherFocusKeywords.some(kw => text.includes(kw))) otherFocusCount++;
  });

  const hourlyData = Array(24).fill(0);
  indicated.forEach(item => { if (item.date) hourlyData[new Date(item.date).getHours()]++; });
  const maxHour = Math.max(...hourlyData, 1);

  const generateRadarPath = (data, size, max) => {
      const angleStep = (Math.PI * 2) / data.length;
      const center = size / 2;
      return data.map((d, i) => {
          const r = (d.count / max) * (size / 2.5);
          const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ') + ' Z';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 lowercase relative px-4">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7]/5 blur-[100px] rounded-full -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="bg-[#6C5CE7]/10 p-2.5 rounded-xl text-[#6C5CE7]"><BarChart3 size={20} /></div>
             <h2 className="text-3xl font-black text-[#2D3436] tracking-tighter leading-none">insights hub.</h2>
          </div>
          <p className="text-slate-400 text-xs font-medium pl-1">data perilaku klinis dsm-5.</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
            { label: 'clinical intensity', val: `${avgIntensity}%`, color: 'text-rose-500', icon: ShieldAlert },
            { label: 'critical flags', val: highRisks.length, color: 'text-amber-500', icon: AlertCircle },
            { label: 'model confidence', val: `${avgIntensity}%`, color: 'text-blue-500', icon: Brain },
            { label: 'total arsip', val: totalScanned, color: 'text-emerald-500', icon: ActivityIcon }
        ].map((stat, i) => (
            <div key={i} className="space-y-1">
                <div className={`flex items-center gap-2 ${stat.color}`}>
                    <stat.icon size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className="text-3xl font-black text-[#2D3436] tracking-tighter">{stat.val}</p>
            </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: DSM-5 Card */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-10 border-none shadow-xl bg-[#6C5CE7] text-white rounded-[2.5rem] relative overflow-hidden flex-1 flex flex-col justify-center"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="grid md:grid-cols-12 gap-10 relative z-10 items-center h-full">
                    <div className="md:col-span-5 flex flex-col items-center gap-6">
                        <div className="space-y-1 text-center">
                            <h3 className="text-xl font-black text-white flex items-center justify-center gap-2.5 tracking-tighter uppercase">
                                <Target size={20} className="text-white/80" /> dsm-5 signature
                            </h3>
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">distribusi kriteria diagnosis</p>
                        </div>
                        <div className="relative flex justify-center py-2">
                            <div className="absolute inset-0 bg-white/5 blur-[30px] rounded-full" />
                            <svg width="220" height="220" viewBox="0 0 220 220" className="overflow-visible relative z-10">
                                {[0.25, 0.5, 0.75, 1].map(r => (
                                    <circle key={r} cx="110" cy="110" r={r * 90} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                ))}
                                <path d={generateRadarPath(dsmTopics, 220, Math.max(...dsmTopics.map(t => t.count), 1))} fill="rgba(255, 255, 255, 0.18)" stroke="white" strokeWidth="2.5" className="transition-all duration-1000" />
                            </svg>
                        </div>
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-center gap-3.5">
                        {dsmTopics.sort((a,b) => b.count - a.count).map((topic, i) => (
                            <div key={i} className="group relative">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">{topic.label}</p>
                                        <div className="group/info relative cursor-help">
                                            <Info size={10} className="text-white/40 hover:text-white transition-colors" />
                                            <div className="absolute bottom-full left-0 mb-2 w-44 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50">
                                                <p className="text-[8px] font-black text-white uppercase tracking-widest mb-1 opacity-50">definisi klinis</p>
                                                <p className="text-[10px] text-white leading-tight font-medium">{topic.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-black text-white">{topic.count}</p>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ width: `${(topic.count / (indicated.length || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-8 pt-5 border-t border-white/10 relative z-10">
                    <p className="text-[9px] text-white/50 leading-relaxed italic mb-4">catatan: visualisasi radar memetakan 9 kriteria diagnosis utama dsm-5 untuk mengidentifikasi dominansi gejala pada populasi secara linguistik.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem]">
                    <h3 className="text-base font-black text-[#2D3436] flex items-center gap-2.5 tracking-tighter uppercase">
                        <Users size={18} className="text-[#6C5CE7]" /> self-focus index
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-6">analisis kata ganti orang pertama</p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">orang pertama</span>
                                <span className="text-[#6C5CE7]">{selfFocusCount}</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-lg overflow-hidden border border-black/5">
                                <div className="h-full bg-[#6C5CE7] transition-all duration-1000" style={{ width: `${(selfFocusCount / (selfFocusCount + otherFocusCount || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">orang lain</span>
                                <span className="text-slate-300">{otherFocusCount}</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-lg overflow-hidden border border-black/5">
                                <div className="h-full bg-slate-200 transition-all duration-1000" style={{ width: `${(otherFocusCount / (selfFocusCount + otherFocusCount || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed italic mt-4 border-t border-black/5 pt-3">catatan: penderita depresi cenderung memiliki skor ruminasi tinggi pada kata 'aku'.</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem]">
                    <h3 className="text-base font-black text-[#2D3436] flex items-center gap-2.5 tracking-tighter uppercase">
                        <Share2 size={18} className="text-[#6C5CE7]" /> population pulse
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-6">densitas risiko pada populasi</p>
                    <div className="flex items-center justify-center py-2">
                        <svg width="140" height="85" viewBox="0 0 160 100">
                            <path d="M 20,80 A 60,60 0 0 1 140,80" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
                            <path d="M 20,80 A 60,60 0 0 1 140,80" fill="none" stroke="#6C5CE7" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(indicated.length / (totalScanned || 1)) * 188}, 188`} className="transition-all duration-1000" />
                            <text x="80" y="75" textAnchor="middle" className="text-2xl font-black fill-[#2D3436]">{((indicated.length / (totalScanned || 1)) * 100).toFixed(1)}%</text>
                        </svg>
                    </div>
                </GlassCard>
            </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex-1">
                <h3 className="text-base font-black text-[#2D3436] flex items-center gap-2.5 tracking-tighter uppercase">
                    <PieChart size={18} className="text-[#6C5CE7]" /> indication spread
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-8">distribusi intensitas deteksi</p>
                <div className="space-y-6">
                    {[
                        { label: 'intensitas tinggi', count: highRisks.length, color: 'text-rose-500', bg: 'bg-rose-500' },
                        { label: 'intensitas sedang', count: medRisks.length, color: 'text-amber-500', bg: 'bg-amber-500' },
                        { label: 'intensitas rendah', count: lowRisks.length, color: 'text-sky-500', bg: 'bg-sky-500' }
                    ].map((row, i) => (
                        <div key={i} className="space-y-2 border-b border-black/5 pb-4 last:border-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${row.bg}`} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                </div>
                                <span className={`text-base font-black ${row.color}`}>{row.count}</span>
                            </div>
                            <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                                <div className={`h-full ${row.bg} transition-all duration-1000`} style={{ width: `${(row.count / (indicated.length || 1)) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem]">
                <h3 className="text-base font-black text-[#2D3436] flex items-center gap-2.5 tracking-tighter uppercase">
                    <Tag size={18} className="text-[#6C5CE7]" /> trigger cloud
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-6">kata kunci pemicu utama</p>
                <div className="flex flex-wrap gap-2.5">
                    {['lelah', 'sedih', 'capek', 'tidur', 'sia-sia', 'bosan', 'gagal', 'salah'].map((word, i) => (
                        <span key={i} className="text-[10px] font-black text-[#6C5CE7] bg-[#6C5CE7]/5 px-3 py-1 rounded-xl border border-[#6C5CE7]/10">{word}</span>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem]">
                <h3 className="text-base font-black flex items-center gap-2.5 tracking-tighter text-[#2D3436] uppercase">
                    <Clock size={18} className="text-[#6C5CE7]" /> temporal heatmap
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-6">distribusi waktu aktivitas</p>
                <div className="grid grid-cols-6 gap-x-2 gap-y-3 mt-4">
                    {hourlyData.map((count, i) => {
                        const hourLabel = i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i-12}p` : `${i}a`;
                        return (
                            <div key={i} className="flex flex-col items-center gap-1 group/hour relative">
                                <div className="w-full aspect-square rounded-md border border-black/5 transition-all group-hover/hour:scale-105" style={{ backgroundColor: count > 0 ? `rgba(108, 92, 231, ${Math.max(0.2, (count / maxHour))})` : '#f8fafc' }} />
                                <span className="text-[6px] font-black text-slate-300 uppercase tracking-tighter">{hourLabel}</span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[8px] font-black rounded-md opacity-0 invisible group-hover/hour:opacity-100 group-hover/hour:visible transition-all whitespace-nowrap z-50">
                                    {count} tweet{count !== 1 ? 's' : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>

        {/* BOTTOM ROW: ADVANCED CLINICAL TREND */}
        <div className="lg:col-span-12">
            <GlassCard className="p-10 border-none shadow-sm bg-white rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={24} className="text-[#6C5CE7]" />
                            <h3 className="text-xl font-black text-[#2D3436] tracking-tighter uppercase">clinical intensity trend.</h3>
                            <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/10">
                                <Activity size={10} />
                                <span className="text-[8px] font-black uppercase tracking-widest">live tracking</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-9">analisis pola temporal intensitas klinis</p>
                    </div>
                    
                    <div className="flex items-center gap-10 bg-slate-50/50 p-4 rounded-2xl border border-black/5">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">peak intensity period</p>
                            <p className="text-xl font-black text-rose-500">{Math.max(...intensityTimeline.map(v => v * 100), 0).toFixed(0)}%</p>
                        </div>
                        <div className="w-px h-8 bg-black/10" />
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">avg intensity</p>
                            <p className="text-xl font-black text-[#6C5CE7]">{avgIntensity}%</p>
                        </div>
                        <div className="w-px h-8 bg-black/10" />
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">trend status</p>
                            <div className="flex items-center gap-1 text-emerald-500">
                                <ArrowUpRight size={12} className="rotate-90" />
                                <p className="text-xl font-black">stable</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative w-full px-20 pb-6">
                    {/* Y-Axis Labels */}
                    <div className="absolute left-6 h-[200px] flex flex-col justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>100% - high</span>
                        <span>50% - mod</span>
                        <span>0% - safe</span>
                    </div>

                    <svg viewBox="0 0 1000 200" className="w-full h-[220px] overflow-visible">
                        {/* SEVERITY ZONES */}
                        <rect x="80" y="0" width="840" height="60" fill="#fff1f2" fillOpacity="0.4" rx="4" /> {/* High Intensity Area */}
                        <rect x="80" y="60" width="840" height="80" fill="#fffbeb" fillOpacity="0.4" rx="4" /> {/* Med Intensity Area */}
                        <rect x="80" y="140" width="840" height="60" fill="#f0fdf4" fillOpacity="0.4" rx="4" /> {/* Safe Area */}

                        {/* Baseline Average Line */}
                        <line x1="80" y1={200 - (avgIntensity/100) * 180} x2="920" y2={200 - (avgIntensity/100) * 180} stroke="#6C5CE7" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
                        <text x="930" y={200 - (avgIntensity/100) * 180 + 3} className="text-[8px] font-black fill-[#6C5CE7]/60 uppercase tracking-widest">avg intensity</text>

                        {/* Chart Line */}
                        <path d={`M 80,200 L ${intensityTimeline.map((v, i) => `${80 + (i / 6) * 840},${200 - v * 180}`).join(' L ')} L 920,200 Z`} fill="rgba(108, 92, 231, 0.1)" />
                        <path d={`M ${intensityTimeline.map((v, i) => `${80 + (i / 6) * 840},${200 - v * 180}`).join(' L ')}`} fill="none" stroke="#6C5CE7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {intensityTimeline.map((v, i) => (
                            <g key={i} className="group/point cursor-pointer">
                                <circle cx={80 + (i / 6) * 840} cy={200 - v * 180} r="6" fill="white" stroke="#6C5CE7" strokeWidth="3" className="transition-all group-hover/point:r-8" />
                                
                                {/* POINT TOOLTIP */}
                                <g className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                                    <rect x={80 + (i / 6) * 840 - 40} y={200 - v * 180 - 45} width="80" height="30" rx="8" fill="#2D3436" />
                                    <text x={80 + (i / 6) * 840} y={200 - v * 180 - 25} textAnchor="middle" className="text-[10px] font-black fill-white">{(v * 100).toFixed(1)}%</text>
                                </g>

                                {/* Annotation for PEAK */}
                                {v === Math.max(...intensityTimeline) && v > 0 && (
                                    <g>
                                        <text x={80 + (i / 6) * 840} y={200 - v * 180 - 55} textAnchor="middle" className="text-[8px] font-black fill-rose-500 uppercase tracking-widest">peak intensity</text>
                                        <line x1={80 + (i / 6) * 840} y1={200 - v * 180 - 45} x2={80 + (i / 6) * 840} y2={200 - v * 180 - 15} stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                                    </g>
                                )}
                            </g>
                        ))}
                    </svg>

                    <div className="flex justify-between w-full mt-12 px-2">
                        {last7Days.map((date, i) => {
                            const d = new Date(date);
                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                    <span className="text-[7px] font-bold text-slate-300 uppercase">{d.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BOTTOM LEGEND */}
                <div className="mt-12 flex justify-center gap-8 border-t border-black/5 pt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500/10 border border-rose-500/20 rounded" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">high intensity (&gt;75%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500/10 border border-amber-500/20 rounded" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">moderate (50-75%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500/10 border border-emerald-500/20 rounded" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">safe area (&lt;50%)</span>
                    </div>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
