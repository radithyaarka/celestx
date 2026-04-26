import React from 'react';
import { CircularMeter } from '../components/CircularMeter';
import { GlassCard } from '../components/GlassCard';
import { 
    User, Calendar, MessageSquare, ShieldAlert, 
    ArrowLeft, TrendingUp, Filter, AlertCircle, BarChart3, Clock, LayoutGrid
} from 'lucide-react';

export function UserAnalysis({ data, onBack }) {
    if (!data) return null;

    const { user, summary, details } = data;

    const getRiskColor = (score) => {
        const s = score * 100;
        if (s <= 15) return 'text-emerald-500';
        if (s <= 50) return 'text-sky-500';
        if (s <= 75) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase px-4">
            {/* Unified Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">analisis pengguna.</h2>
                    </div>
                    <p className="text-slate-400 text-sm font-medium pl-16">hasil deep-scan perilaku komprehensif.</p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-black/5 px-4 py-2 rounded-xl shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">laporan final</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Overview Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <GlassCard className="p-8 border-none shadow-sm bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C5CE7]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-8">
                                <img 
                                    src={user.avatarUrl} 
                                    alt="" 
                                    className="w-28 h-28 rounded-[2.5rem] border-4 border-white shadow-xl"
                                />
                                <div className={`absolute -bottom-2 -right-2 p-3 rounded-2xl bg-white shadow-lg border border-black/5 ${getRiskColor(summary.average_severity)}`}>
                                    <ShieldAlert size={24} />
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-[#2D3436] leading-tight mb-2">{user.displayName}</h3>
                            <p className="text-slate-400 text-base font-medium mb-8">{user.handle}</p>

                            <div className="w-full grid grid-cols-2 gap-5">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-black/5">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">total tweet</p>
                                    <p className="text-2xl font-black text-[#2D3436]">{summary.total_tweets}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-black/5">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">indikasi</p>
                                    <p className="text-2xl font-black text-rose-500">{summary.indicated_tweets}</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-10 border-none shadow-xl bg-[#2D3436] text-white flex flex-col items-center text-center">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mb-8">indeks keparahan</p>
                        <CircularMeter 
                            value={summary.average_severity * 100} 
                            size={200} 
                            strokeWidth={18}
                            customColor={
                                summary.average_severity <= 0.15 ? '#10B981' : 
                                summary.average_severity <= 0.50 ? '#0EA5E9' : 
                                summary.average_severity <= 0.75 ? '#F59E0B' : '#F43F5E'
                            }
                        />
                        <div className="mt-10 space-y-3">
                            <p className="text-4xl font-black tracking-tighter">{(summary.average_severity * 100).toFixed(1)}%</p>
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/10">
                                <span className="text-xs font-black uppercase tracking-widest">{summary.status === 'NORMAL' ? 'STABIL' : summary.status}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Scanned Tweets Feed */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 uppercase tracking-tighter">
                            <MessageSquare size={22} className="text-slate-400" /> feed analisis
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {details.map((item, idx) => (
                            <div key={idx} className="p-8 rounded-[2.5rem] border border-black/5 bg-white shadow-sm hover:border-[#6C5CE7]/20 transition-all group relative overflow-hidden">
                                <div className="flex justify-between gap-10">
                                    <div className="flex-1 space-y-6">
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

                                    <div className="text-center shrink-0 min-w-[100px] flex flex-col justify-center border-l border-black/5 pl-8">
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">risiko</p>
                                        <p className={`font-black text-3xl ${getRiskColor(item.score)}`}>{(item.score * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
