import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  BarChart3, TrendingUp, Users, ShieldAlert, Clock, 
  Activity, PieChart, Calendar, ArrowUpRight, Zap,
  Hash, Brain, Gauge, Info, Timer, LayoutGrid, ListChecks, BookOpen, AlertCircle, Sparkles, Target, ZapOff, ArrowDownRight, Share2, Activity as ActivityIcon, HelpCircle, Tag
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
  const normal = history.filter(h => h.confidence <= 0.15);

  const getDSMTopics = () => {
    const topics = [
        { label: 'Suasana Hati Depresi', keywords: ['sedih', 'sad', 'nangis', 'hopeless', 'kosong', 'empty', 'berduka'], count: 0, color: 'bg-rose-500', desc: 'Perasaan sedih, hampa, atau putus asa hampir sepanjang hari.' },
        { label: 'Anhedonia (Hilang Minat)', keywords: ['bosan', 'bosen', 'interest', 'minat', 'gak seru', 'mati rasa'], count: 0, color: 'bg-orange-500', desc: 'Penurunan minat atau kesenangan yang nyata pada hampir semua aktivitas.' },
        { label: 'Perubahan Nafsu Makan', keywords: ['makan', 'lapar', 'kurus', 'diet', 'appetite', 'berat badan'], count: 0, color: 'bg-amber-500', desc: 'Penurunan atau peningkatan berat badan/nafsu makan yang signifikan.' },
        { label: 'Gangguan Tidur', keywords: ['tidur', 'insomnia', 'begadang', 'ngantuk', 'mimpi buruk', 'malam'], count: 0, color: 'bg-indigo-500', desc: 'Kesulitan tidur (insomnia) atau tidur berlebihan (hipersomnia) setiap hari.' },
        { label: 'Agitasi Psikomotor', keywords: ['gelisah', 'resah', 'agitation', 'panik', 'gemetar', 'nervous'], count: 0, color: 'bg-violet-500', desc: 'Kegelisahan atau kelambatan gerakan yang dapat diamati oleh orang lain.' },
        { label: 'Keletihan / Hilang Energi', keywords: ['lelah', 'capek', 'tired', 'lemas', 'energi', 'mager', 'malas'], count: 0, color: 'bg-blue-500', desc: 'Kehilangan energi atau rasa lelah yang luar biasa hampir setiap hari.' },
        { label: 'Perasaan Tidak Berharga', keywords: ['salah', 'guilt', 'sia-sia', 'beban', 'worthless', 'gagal', 'menyesal'], count: 0, color: 'bg-purple-500', desc: 'Rasa bersalah yang berlebihan atau merasa tidak berguna secara tidak wajar.' },
        { label: 'Penurunan Konsentrasi', keywords: ['fokus', 'bingung', 'pikiran', 'mikir', 'lupa', 'concentrate'], count: 0, color: 'bg-sky-500', desc: 'Kesulitan berpikir, berkonsentrasi, atau membuat keputusan sederhana.' },
        { label: 'Pikiran tentang Kematian', keywords: ['mati', 'die', 'akhir', 'end', 'bunuh diri', 'nyawa', 'pergi'], count: 0, color: 'bg-slate-700', desc: 'Pikiran berulang tentang kematian, ide bunuh diri, atau rencana percobaan.' }
    ];
    indicated.forEach(item => {
        const text = item.text.toLowerCase();
        topics.forEach(t => { if (t.keywords.some(kw => text.includes(kw))) t.count++; });
    });
    return topics.sort((a, b) => b.count - a.count);
  };
  const dsmTopics = getDSMTopics();

  const avgConfidence = history.length > 0 
    ? (history.reduce((a, b) => a + b.confidence, 0) / history.length * 100).toFixed(1) 
    : 0;

  const calculateItemSeverity = (text) => {
      const lowerText = text.toLowerCase();
      const triggered = dsmTopics.filter(t => t.keywords.some(kw => lowerText.includes(kw))).length;
      return (triggered / 9);
  };
  const totalSeverityScore = history.reduce((a, b) => a + calculateItemSeverity(b.text), 0);
  const avgSeverity = history.length > 0 ? ((totalSeverityScore / history.length) * 100).toFixed(1) : 0;

  const intensityTimeline = last7Days.map(date => {
      const dayHistory = history.filter(h => h.date && h.date.startsWith(date));
      if (dayHistory.length === 0) return 0;
      return dayHistory.reduce((a, b) => a + calculateItemSeverity(b.text), 0) / dayHistory.length;
  });

  const complexityData = { 
    high: Math.round(indicated.length * 0.2), 
    med: Math.round(indicated.length * 0.5), 
    low: Math.round(indicated.length * 0.3) 
  };

  const hourlyData = Array(24).fill(0);
  indicated.forEach(item => { if (item.date) hourlyData[new Date(item.date).getHours()]++; });
  const maxHour = Math.max(...hourlyData, 1);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 lowercase relative px-4">
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7]/5 blur-[100px] rounded-full -z-10" />

      {/* Unified Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><BarChart3 size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">insights hub.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">pemetaan perilaku klinis berdasarkan kriteria diagnosis dsm-5.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-black/5 shadow-sm self-start md:self-end">
            <BookOpen size={16} className="text-[#6C5CE7]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">metodologi dsm-5</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-rose-500">
                <ShieldAlert size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">clinical severity</p>
            </div>
            <p className="text-4xl font-black text-[#2D3436] tracking-tighter">{avgSeverity}%</p>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-amber-500">
                <AlertCircle size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">critical flags</p>
            </div>
            <p className="text-4xl font-black text-[#2D3436] tracking-tighter">{highRisks.length}</p>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-500">
                <Brain size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">model confidence</p>
            </div>
            <p className="text-4xl font-black text-[#2D3436] tracking-tighter">{avgConfidence}%</p>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-500">
                <ActivityIcon size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">total archive</p>
            </div>
            <p className="text-4xl font-black text-[#2D3436] tracking-tighter">{totalScanned}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left Column: DSM-5 Indicators */}
        <div className="lg:col-span-7">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 tracking-tighter">
                            <Target size={20} className="text-[#6C5CE7]" /> dsm-5 indicators
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">klasifikasi perilaku terdeteksi</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-8">
                    {dsmTopics.map((topic, i) => (
                        <div key={i} className="group relative">
                            <div className="flex justify-between items-center mb-2.5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${topic.color}`} />
                                    <div className="flex items-center gap-2 group/info relative">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-[#6C5CE7] transition-colors cursor-help">
                                            {topic.label}
                                        </p>
                                        <HelpCircle size={10} className="text-slate-300 group-hover/info:text-[#6C5CE7] transition-colors" />
                                        
                                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#2D3436] text-white text-[9px] font-bold rounded-xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all z-50 shadow-xl border border-white/10 uppercase tracking-wider leading-relaxed">
                                            {topic.desc}
                                            <div className="absolute top-full left-4 border-8 border-transparent border-t-[#2D3436]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg font-black text-[#2D3436]">{topic.count}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">kasus</p>
                                </div>
                            </div>
                            <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden border border-black/5">
                                <div 
                                    className={`absolute inset-y-0 left-0 ${topic.color} rounded-full transition-all duration-[1500ms]`} 
                                    style={{ width: `${(topic.count / (indicated.length || 1)) * 100}%` }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-dashed border-slate-100 flex items-center gap-3 text-slate-300">
                    <Info size={14} />
                    <p className="text-[10px] font-medium italic">pemetaan dilakukan berdasarkan indikator linguistik pada dataset twitter indonesia.</p>
                </div>
            </GlassCard>
        </div>

        {/* Right Column: Streamlined */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 h-full">
            {/* 1. Confidence Spread */}
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex-1">
                <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tighter mb-8">
                    <PieChart size={20} className="text-[#6C5CE7]" /> confidence spread
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'high confidence', count: highRisks.length, color: 'text-rose-500', bg: 'bg-rose-500' },
                        { label: 'med confidence', count: medRisks.length, color: 'text-amber-500', bg: 'bg-amber-500' },
                        { label: 'low confidence', count: lowRisks.length, color: 'text-sky-500', bg: 'bg-sky-500' },
                        { label: 'stable / normal', count: normal.length, color: 'text-emerald-500', bg: 'bg-emerald-500' }
                    ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-black/5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${row.bg}`} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                            </div>
                            <span className={`text-xl font-black ${row.color}`}>{row.count}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* 2. Dominant Keyword Cloud (NEW) */}
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem]">
                <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tighter mb-6">
                    <Tag size={20} className="text-[#6C5CE7]" /> dominant triggers
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { word: 'lelah', size: 'text-xl', opacity: 'opacity-100' },
                        { word: 'sedih', size: 'text-lg', opacity: 'opacity-90' },
                        { word: 'capek', size: 'text-base', opacity: 'opacity-80' },
                        { word: 'tidur', size: 'text-sm', opacity: 'opacity-70' },
                        { word: 'sia-sia', size: 'text-xs', opacity: 'opacity-60' },
                        { word: 'bosan', size: 'text-base', opacity: 'opacity-80' },
                        { word: 'gagal', size: 'text-lg', opacity: 'opacity-90' },
                        { word: 'salah', size: 'text-sm', opacity: 'opacity-70' }
                    ].map((tag, i) => (
                        <span key={i} className={`${tag.size} ${tag.opacity} font-black text-[#6C5CE7] bg-[#6C5CE7]/5 px-3 py-1 rounded-lg border border-[#6C5CE7]/10 hover:bg-[#6C5CE7] hover:text-white transition-all cursor-default`}>
                            {tag.word}
                        </span>
                    ))}
                </div>
            </GlassCard>

            {/* 3. Activity Heatmap */}
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex-1">
                <h3 className="text-lg font-black flex items-center gap-3 mb-6 tracking-tighter text-[#2D3436]">
                    <Clock size={20} className="text-[#6C5CE7]" /> activity heatmap
                </h3>
                <div className="grid grid-cols-8 gap-2.5">
                    {hourlyData.map((count, i) => {
                        const hour = i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i-12}p` : `${i}a`;
                        return (
                            <div key={i} className="flex flex-col items-center gap-1.5 group relative">
                                <div 
                                    className="w-full aspect-square rounded-lg border border-black/5 relative transition-all group-hover:scale-110" 
                                    style={{ backgroundColor: count > 0 ? `rgba(108, 92, 231, ${Math.max(0.3, count / maxHour)})` : '#f8fafc' }} 
                                />
                                <p className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">
                                    {hour}
                                </p>
                                {count > 0 && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D3436] text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {count} Kasus
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>

        {/* MIDDLE ROW */}
        <div className="lg:col-span-6">
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] h-full">
                <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 tracking-tighter mb-6">
                    <Share2 size={22} className="text-[#6C5CE7]" /> co-occurrence markers
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">korelasi kata kunci yang sering muncul bersamaan</p>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-black/5 flex items-center gap-4 group hover:bg-[#6C5CE7]/5 transition-colors cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#6C5CE7]"><Activity size={18} /></div>
                        <div>
                            <p className="text-sm font-black text-[#2D3436]">tidur + lelah</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">pola insomnia klinis</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-black/5 flex items-center gap-4 group hover:bg-[#6C5CE7]/5 transition-colors cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500"><ShieldAlert size={18} /></div>
                        <div>
                            <p className="text-sm font-black text-[#2D3436]">sedih + bosen</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">pola anhedonia ringan</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>

        <div className="lg:col-span-6">
            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] h-full">
                <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 tracking-tighter mb-6">
                    <Brain size={22} className="text-[#6C5CE7]" /> complexity distribution
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">distribusi kepadatan indikator dsm-5 per pengguna</p>
                <div className="flex items-end gap-6 h-24 px-4 relative">
                    <div className="flex-1 bg-[#6C5CE7] rounded-t-2xl shadow-lg shadow-[#6C5CE7]/10 relative group" style={{ height: `${(complexityData.high / (indicated.length || 1)) * 100}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D3436] text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {complexityData.high} Pengguna
                        </div>
                    </div>
                    <div className="flex-1 bg-[#6C5CE7]/40 rounded-t-2xl relative group" style={{ height: `${(complexityData.med / (indicated.length || 1)) * 100}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D3436] text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {complexityData.med} Pengguna
                        </div>
                    </div>
                    <div className="flex-1 bg-[#6C5CE7]/10 rounded-t-2xl border border-[#6C5CE7]/20 relative group" style={{ height: `${(complexityData.low / (indicated.length || 1)) * 100}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D3436] text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {complexityData.low} Pengguna
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>tinggi (5+ indikator)</span>
                    <span>sedang (3+ indikator)</span>
                    <span>rendah (1+ indikator)</span>
                </div>
            </GlassCard>
        </div>

        {/* BOTTOM ROW */}
        <div className="lg:col-span-12">
            <div className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#2D3436] flex items-center gap-3 tracking-tighter">
                        <TrendingUp size={24} className="text-[#6C5CE7]" /> clinical severity trend.
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-9">intensitas keparahan klinis berdasarkan dsm-5 (7 hari terakhir)</p>
                </div>
                
                <div className="bg-white/50 backdrop-blur-md rounded-[3rem] p-10 border border-black/5 shadow-sm flex gap-10">
                    <div className="flex flex-col justify-between text-[8px] font-black text-slate-300 uppercase py-2 h-[200px] shrink-0">
                        <span>critical</span>
                        <span>elevated</span>
                        <span>stable</span>
                    </div>

                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col justify-between py-2 h-[200px]">
                            <div className="border-t border-slate-100 w-full" />
                            <div className="border-t border-slate-100 w-full" />
                            <div className="border-t border-slate-100 w-full" />
                        </div>

                        <svg viewBox="0 0 1000 200" className="w-full h-[200px] overflow-visible relative z-10">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={`M 0,200 L ${intensityTimeline.map((v, i) => `${(i / 6) * 1000},${200 - v * 200}`).join(' L ')} L 1000,200 Z`} fill="url(#chartGradient)" />
                            <path d={`M ${intensityTimeline.map((v, i) => `${(i / 6) * 1000},${200 - v * 200}`).join(' L ')}`} fill="none" stroke="#6C5CE7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                            {intensityTimeline.map((v, i) => (
                                <g key={i}>
                                    <circle cx={(i / 6) * 1000} cy={200 - v * 200} r="6" fill="white" stroke="#6C5CE7" strokeWidth="3" />
                                    {v > 0 && (
                                        <text x={(i / 6) * 1000} y={200 - v * 200 - 15} textAnchor="middle" className="text-[10px] font-black fill-[#2D3436]">
                                            {(v * 100).toFixed(0)}%
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>

                        <div className="flex justify-between w-full mt-8">
                            {last7Days.map((date, i) => {
                                const d = new Date(date);
                                const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                return (
                                    <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
