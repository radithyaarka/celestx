import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  BarChart3, TrendingUp, Users, ShieldAlert, Clock, 
  Activity, PieChart, Calendar, ArrowUpRight, Zap,
  Hash, Brain, Gauge, Info, Timer, LayoutGrid, ListChecks, BookOpen
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
  
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const activityTimeline = last7Days.map(date => history.filter(h => h.date && h.date.startsWith(date)).length);
  const maxActivity = Math.max(...activityTimeline, 1);

  const intensityTimeline = last7Days.map(date => {
      const dayHistory = history.filter(h => h.date && h.date.startsWith(date));
      if (dayHistory.length === 0) return 0;
      return dayHistory.reduce((a, b) => a + b.confidence, 0) / dayHistory.length;
  });

  const getDSMTopics = () => {
    const topics = [
        { label: 'Suasana Hati Depresi', keywords: ['sedih', 'sad', 'nangis', 'hopeless', 'kosong', 'empty', 'berduka'], count: 0, color: 'bg-rose-500' },
        { label: 'Anhedonia (Hilang Minat)', keywords: ['bosan', 'bosen', 'interest', 'minat', 'gak seru', 'mati rasa'], count: 0, color: 'bg-orange-500' },
        { label: 'Perubahan Nafsu Makan', keywords: ['makan', 'lapar', 'kurus', 'diet', 'appetite', 'berat badan'], count: 0, color: 'bg-amber-500' },
        { label: 'Gangguan Tidur', keywords: ['tidur', 'insomnia', 'begadang', 'ngantuk', 'mimpi buruk', 'malam'], count: 0, color: 'bg-indigo-500' },
        { label: 'Agitasi Psikomotor', keywords: ['gelisah', 'resah', 'agitation', 'panik', 'gemetar', 'nervous'], count: 0, color: 'bg-violet-500' },
        { label: 'Keletihan / Hilang Energi', keywords: ['lelah', 'capek', 'tired', 'lemas', 'energi', 'mager', 'malas'], count: 0, color: 'bg-blue-500' },
        { label: 'Perasaan Tidak Berharga', keywords: ['salah', 'guilt', 'sia-sia', 'beban', 'worthless', 'gagal', 'menyesal'], count: 0, color: 'bg-purple-500' },
        { label: 'Penurunan Konsentrasi', keywords: ['fokus', 'bingung', 'pikiran', 'mikir', 'lupa', 'concentrate'], count: 0, color: 'bg-sky-500' },
        { label: 'Pikiran tentang Kematian', keywords: ['mati', 'die', 'akhir', 'end', 'bunuh diri', 'nyawa', 'pergi'], count: 0, color: 'bg-slate-700' }
    ];
    indicated.forEach(item => {
        const text = item.text.toLowerCase();
        topics.forEach(t => { if (t.keywords.some(kw => text.includes(kw))) t.count++; });
    });
    return topics.sort((a, b) => b.count - a.count);
  };
  const dsmTopics = getDSMTopics();

  const hourlyData = Array(24).fill(0);
  indicated.forEach(item => { if (item.date) hourlyData[new Date(item.date).getHours()]++; });
  const maxHour = Math.max(...hourlyData, 1);

  const leaderboard = Object.values(scannedUsers)
    .map(scan => ({
        handle: scan.user.handle,
        displayName: scan.user.displayName,
        avatar: scan.user.avatarUrl,
        avgScore: scan.summary.average_severity,
        data: scan
    }))
    .sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase relative px-4">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><BarChart3 size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">insights intelijen.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">pemetaan perilaku klinis berdasarkan kriteria diagnosis dsm-5.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-black/5 shadow-sm">
            <BookOpen size={16} className="text-[#6C5CE7]" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">metodologi dsm-5</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-[#6C5CE7]/10 p-4 rounded-xl text-[#6C5CE7]"><Zap size={22} /></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">densitas risiko</p><p className="text-3xl font-black text-[#2D3436]">{riskRate}%</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-rose-500/10 p-4 rounded-xl text-rose-500"><ShieldAlert size={22} /></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">bendera kritis</p><p className="text-3xl font-black text-rose-500">{highRisks.length}</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-blue-500/10 p-4 rounded-xl text-blue-500"><Brain size={22} /></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">model klinis</p><p className="text-3xl font-black text-[#2D3436]">v3.0</p></div>
        </GlassCard>
        <GlassCard className="p-6 border-none shadow-sm bg-white flex items-center gap-5">
            <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-500"><Activity size={22} /></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">total arsip</p><p className="text-3xl font-black text-[#2D3436]">{totalScanned}</p></div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* DSM-5 Indicators */}
        <div className="lg:col-span-8">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3">
                        <LayoutGrid size={20} className="text-slate-400" /> indikator dsm-5
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-10">
                    {dsmTopics.map((topic, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{topic.label}</p>
                                <p className="text-xl font-black text-[#2D3436]">{topic.count}</p>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-black/5">
                                <div className={`h-full ${topic.color} rounded-full transition-all duration-1000`} style={{ width: `${(topic.count / (indicated.length || 1)) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>

        {/* Severity Spread */}
        <div className="lg:col-span-4">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full">
                <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 mb-8">
                    <PieChart size={20} className="text-slate-400" /> sebaran keparahan
                </h3>
                <div className="space-y-6">
                    {[
                        { label: 'risiko kritis', count: highRisks.length, color: 'text-rose-500', bg: 'bg-rose-500' },
                        { label: 'tingkat waspada', count: medRisks.length, color: 'text-amber-500', bg: 'bg-amber-500' },
                        { label: 'risiko rendah', count: lowRisks.length, color: 'text-sky-500', bg: 'bg-sky-500' },
                        { label: 'stabil / normal', count: normal.length, color: 'text-emerald-500', bg: 'bg-emerald-500' }
                    ].map((row, i) => (
                        <div key={i} className="flex items-center gap-5">
                            <div className={`w-3 h-3 rounded-full ${row.bg}`} />
                            <div className="flex-1 flex justify-between items-baseline border-b border-dashed border-slate-100 pb-2">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                <span className={`text-lg font-black ${row.color}`}>{row.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>

        {/* Severity Trend Archive */}
        <div className="lg:col-span-8">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3">
                        <TrendingUp size={20} className="text-slate-400" /> tren intensitas klinis
                    </h3>
                </div>
                <div className="flex-1 relative min-h-[220px]">
                    <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                        <path d={`M 0,200 L ${intensityTimeline.map((v, i) => `${(i / 6) * 700},${200 - v * 200}`).join(' L ')} L 700,200 Z`} fill="rgba(108, 92, 231, 0.05)" />
                        <path d={`M ${intensityTimeline.map((v, i) => `${(i / 6) * 700},${200 - v * 200}`).join(' L ')}`} fill="none" stroke="#6C5CE7" strokeWidth="4" />
                        {intensityTimeline.map((v, i) => (<circle key={i} cx={(i / 6) * 700} cy={200 - v * 200} r="5" fill="white" stroke="#6C5CE7" strokeWidth="3" />))}
                    </svg>
                </div>
            </GlassCard>
        </div>

        {/* Activity Heatmap */}
        <div className="lg:col-span-4">
            <GlassCard className="p-8 border-none shadow-sm bg-white h-full">
                <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 mb-8">
                    <Clock size={20} className="text-slate-400" /> heatmap aktivitas
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {hourlyData.map((count, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                            <div className="w-full aspect-square rounded-lg border border-black/5 relative transition-all" style={{ backgroundColor: count > 0 ? `rgba(108, 92, 231, ${Math.max(0.1, count / maxHour)})` : '#f8fafc' }} />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                {i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i-12} PM` : `${i} AM`}
                            </p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
