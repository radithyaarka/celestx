import React, { useState, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { CircularMeter } from '../components/CircularMeter';
import { SeverityBadge } from '../components/SeverityBadge';
import { ArrowLeft, Minus, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export function UserAnalysis({ data, onBack }) {
  const [activeTab, setActiveTab] = useState('tweets');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const scrollContainerRef = useRef(null);

  if (!data) return null;

  const originalTweets = data.details.filter(t => !t.isRetweet);
  const retweets = data.details.filter(t => t.isRetweet);
  const displayedTweets = activeTab === 'tweets' ? originalTweets : retweets;

  // Calculate trend data
  const sortedByTime = [...originalTweets].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const trendPoints = sortedByTime.map(t => t.score);

  let trendLabel = "stable";
  let TrendIcon = Minus;
  let trendColor = "text-slate-400";

  if (trendPoints.length >= 10) {
      const mid = Math.floor(trendPoints.length / 2);
      const avgFirst = trendPoints.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const avgSecond = trendPoints.slice(mid).reduce((a, b) => a + b, 0) / (trendPoints.length - mid);
      const diff = avgSecond - avgFirst;
      if (diff > 0.05) { trendLabel = "worsening"; TrendIcon = TrendingUp; trendColor = "text-rose-500"; }
      else if (diff < -0.05) { trendLabel = "improving"; TrendIcon = TrendingDown; trendColor = "text-emerald-500"; }
  }

  const getRiskColor = (score) => {
    const s = score * 100;
    if (s <= 15) return 'text-emerald-500';
    if (s <= 50) return 'text-sky-500';
    if (s <= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  const handlePointClick = (index) => {
    const tweet = sortedByTime[index];
    const displayIndex = displayedTweets.findIndex(t => t.text === tweet.text);
    if (displayIndex !== -1) {
        setActiveTab('tweets');
        const element = document.getElementById(`tweet-card-${displayIndex}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-[#6C5CE7]/30', 'rounded-[3rem]');
            setTimeout(() => element.classList.remove('ring-4', 'ring-[#6C5CE7]/30', 'rounded-[3rem]'), 2000);
        }
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col lowercase overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-[#6C5CE7] transition-all group font-bold text-sm">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>back to previous page</span>
        </button>
        <div className="text-right">
            <h3 className="text-xl font-black text-[#2D3436] tracking-tighter">deep scan analysis.</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">latest {data.tweetCount} contents</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-4 h-full flex flex-col min-h-0">
          <GlassCard className="p-6 text-center border-none shadow-xl shadow-black/5 flex flex-col h-full items-center justify-between bg-white overflow-hidden">
            <div className="w-full">
                <div className="flex justify-center mb-4"><img src={data.user.avatarUrl} alt="" className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-lg" /></div>
                <h3 className="text-2xl font-black text-[#2D3436] mb-0.5 tracking-tighter">{data.user.displayName || 'unknown'}</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">{data.user.handle}</p>

                {trendPoints.length > 2 && (
                <div className="mb-6 p-4 bg-slate-50 rounded-[1.5rem] border border-black/5 relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-start">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">mental trend</p>
                            <div className={`flex items-center gap-1.5 ${trendColor} font-black text-xs`}><TrendIcon size={14} /><span>{trendLabel}</span></div>
                        </div>
                    </div>
                    <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                        <path d={`M ${trendPoints.map((s, i) => `${(i / (trendPoints.length - 1)) * 200},${60 - s * 60}`).join(' L ')}`} fill="none" stroke="url(#trendGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <defs><linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#74B9FF" /><stop offset="100%" stopColor="#6C5CE7" /></linearGradient></defs>
                        {trendPoints.map((s, i) => (<rect key={i} x={(i / (trendPoints.length - 1)) * 200 - 4} y={0} width="8" height="60" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} onClick={() => handlePointClick(i)} />))}
                    </svg>
                </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-[1.2rem] p-4 text-center border border-black/5">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">analyzed</p>
                        <p className="text-2xl font-black text-[#2D3436]">{data.tweetCount}</p>
                    </div>
                    <div className="bg-slate-50 rounded-[1.2rem] p-4 text-center border border-black/5">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">indicated</p>
                        <p className="text-2xl font-black text-rose-500">{data.summary.indicated_tweets}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 pt-6 border-t border-black/5 w-full">
                <p className="text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase">accumulation risk score</p>
                <div className="transform scale-90 origin-center">
                    <CircularMeter 
                        score={data.summary.average_severity} 
                        label={data.summary.status} 
                        customColor={
                            data.summary.average_severity <= 0.15 ? '#10B981' : 
                            data.summary.average_severity <= 0.50 ? '#0EA5E9' : 
                            data.summary.average_severity <= 0.75 ? '#F59E0B' : '#F43F5E'
                        }
                    />
                </div>
                <SeverityBadge label={data.summary.status} />
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
            <div className="flex gap-6 border-b border-black/5 mb-6 shrink-0">
                <button onClick={() => setActiveTab('tweets')} className={`pb-4 px-4 text-sm font-black relative ${activeTab === 'tweets' ? 'text-[#6C5CE7]' : 'text-slate-400'}`}>tweets ({originalTweets.length}){activeTab === 'tweets' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6C5CE7] rounded-full" />}</button>
                <button onClick={() => setActiveTab('retweets')} className={`pb-4 px-4 text-sm font-black relative ${activeTab === 'retweets' ? 'text-[#6C5CE7]' : 'text-slate-400'}`}>retweets ({retweets.length}){activeTab === 'retweets' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6C5CE7] rounded-full" />}</button>
            </div>
            
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-12">
                {displayedTweets.length === 0 ? <div className="py-32 text-center bg-white rounded-[3rem] border border-black/5"><p className="text-slate-400 font-bold text-lg">no {activeTab} available.</p></div> : 
                displayedTweets.sort((a,b) => b.score - a.score).map((t, i) => (
                    <div key={i} id={`tweet-card-${i}`}>
                        <GlassCard className="p-10 border-none shadow-md shadow-black/5 bg-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        {t.avatarUrl ? <img src={t.avatarUrl} alt="" className="w-12 h-12 rounded-full border border-black/5" /> : <div className="w-12 h-12 rounded-full bg-slate-100 border border-black/5 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">?</div>}
                                        <div><p className="text-[#2D3436] font-black text-base leading-none">{t.displayName || "unknown"}</p><p className="text-slate-400 text-xs font-medium mt-1">{t.handle || ""}</p></div>
                                    </div>
                                    <p className="text-slate-500 text-base border-l-4 border-[#74B9FF]/30 pl-6 py-2 leading-relaxed italic">"{t.text}"</p>
                                    
                                    {t.images && t.images.length > 0 && (
                                        <div className={`grid gap-4 pt-4 ${t.images.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-2'}`}>
                                            {t.images.slice(0, 4).map((img, idx) => (
                                                <div key={idx} className="overflow-hidden rounded-2xl border border-black/5 shadow-sm"><img src={img} alt="" className="w-full h-auto" /></div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest"><Clock size={12} /><span>{new Date(t.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                                </div>
                                <div className="text-center min-w-[80px] border-t border-black/5 md:border-t-0 md:border-l md:pl-10 pt-6 md:pt-0">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-1">score</p>
                                    <p className={`font-black text-4xl ${getRiskColor(t.score)}`}>{(t.score * 100).toFixed(0)}<span className="text-xl">%</span></p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
