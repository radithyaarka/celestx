import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircularMeter } from '../components/CircularMeter';
import { GlassCard } from '../components/GlassCard';
import { dsmLexicon } from '../constants/lexicon';
import { 
    User, Calendar, MessageSquare, ShieldAlert, X,
    ArrowLeft, TrendingUp, Filter, AlertCircle, BarChart3, Clock, LayoutGrid, Share2,
    Activity, Brain, Shield, Info, ExternalLink, Sparkles, FileText, Download, Zap, Trash2, Image as ImageIcon, Globe, Repeat
} from 'lucide-react';

export function UserAnalysis({ data, onBack }) {
    const [filter, setFilter] = useState('all'); // 'all', 'original', 'retweets'
    const [langFilter, setLangFilter] = useState('id'); // 'id' or 'all'
    const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'intensity'
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    
    useEffect(() => {
        const scrollContainer = document.querySelector('main')?.parentElement;
        if (scrollContainer) scrollContainer.scrollTo(0, 0);
    }, []);

    // Helper to detect language heuristically
    const detectLanguage = (text) => {
        if (!text) return 'id';
        const enWords = /\b(the|is|are|in|to|of|for|with|and|on|at|i|me|my|you|your|he|she|it)\b/gi;
        const idWords = /\b(yang|di|ke|dari|ini|itu|dan|ada|saya|aku|kamu|lo|gw|ga|tidak|untuk)\b/gi;
        
        const enMatches = (text.match(enWords) || []).length;
        const idMatches = (text.match(idWords) || []).length;
        
        return enMatches > idMatches ? 'en' : 'id';
    };

    const handleDeleteScan = () => {
        if (!window.confirm(`Hapus seluruh data deep scan untuk ${data?.user?.handle}? Tindakan ini tidak dapat dibatalkan.`)) return;
        
        chrome.storage.local.get(['sentimenta_deep_scans'], (result) => {
            const scans = result.sentimenta_deep_scans || {};
            const handle = data?.user?.handle;
            if (handle && scans[handle]) {
                delete scans[handle];
                chrome.storage.local.set({ sentimenta_deep_scans: scans }, () => {
                    onBack(); // Return to history/dashboard after deletion
                });
            }
        });
    };

    if (!data || typeof data !== 'object') {
        return (
            <div className="max-w-7xl mx-auto p-20 text-center">
                <GlassCard className="p-12">
                    <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                    <h2 className="text-2xl font-black mb-2">data analysis tidak ditemukan</h2>
                    <p className="text-slate-400 mb-8 font-medium">mohon lakukan scan ulang pada profil ini.</p>
                    <button onClick={onBack} className="bg-[#6C5CE7] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest">kembali</button>
                </GlassCard>
            </div>
        );
    }

    const userData = data.user || {};
    const summaryData = data.summary || {};
    const detailsData = Array.isArray(data.details) ? data.details : [];
    
    // Dynamic Risk Score calculation based on language filter (Denominator = Total Scanned Tweets)
    const dynamicSeverityScore = useMemo(() => {
        const idTweets = detailsData.filter(t => detectLanguage(t.text) === 'id');
        if (idTweets.length === 0) return 0;
        
        // 1. Global Average (Total ID Score / Total Scanned Tweets)
        const totalIdScore = idTweets.reduce((acc, curr) => acc + (Number(curr.score || curr.confidence) || 0), 0);
        const globalAvg = totalIdScore / (idTweets.length || 1);

        // 2. Peak Average (Average of Top 10 ID tweets)
        const sortedScores = idTweets
            .map(d => Number(d.score || d.confidence || 0))
            .sort((a, b) => b - a);
        const topScores = sortedScores.slice(0, 10);
        const peakAvg = topScores.reduce((a, b) => a + b, 0) / (topScores.length || 1);
        
        // 3. Hybrid Result
        return (globalAvg + peakAvg) / 2;
    }, [detailsData]); // Hybrid Risk Model (Global + Peak)

    const severityScore = dynamicSeverityScore;
    const userAvatar = userData.avatarUrl || userData.profile_image_url || userData.profileImageUrl;

    const clinicalProfile = useMemo(() => {
        const counts = {};
        
        detailsData.forEach(tweet => {
            if (detectLanguage(tweet.text) === 'en') return;

            const text = (tweet.text || "").toLowerCase();
            const isIndicated = tweet.label === 'INDICATED' || (Number(tweet.score || tweet.confidence) > 0.5);
            
            // Only search for symptoms if the AI actually indicates risk
            if (isIndicated) {
                let matchedId = null;
                for (const category of dsmLexicon) {
                    if (category.keywords.some(kw => text.includes(kw.toLowerCase()))) {
                        matchedId = category.id;
                        break;
                    }
                }

                const finalLabel = matchedId || (tweet.label !== 'normal' ? tweet.label : null);

                if (finalLabel) {
                    counts[finalLabel] = (counts[finalLabel] || 0) + 1;
                    tweet.matchedLabel = finalLabel;
                }
            } else {
                // If not indicated by AI, ensure it doesn't show a symptom label
                tweet.matchedLabel = null;
            }
        });

        return dsmLexicon.map(item => ({
            ...item,
            count: counts[item.id] || 0
        })).sort((a, b) => b.count - a.count);
    }, [detailsData, langFilter]);

    const topIndicator = clinicalProfile[0]?.count > 0 ? clinicalProfile[0] : null;

    const formatDate = (item) => {
        const dateStr = item?.date || item?.timestamp || item?.created_at || item?.time;
        if (!dateStr) return 'waktu tidak diketahui';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) { return 'waktu tidak diketahui'; }
    };

    const getRiskColor = (score) => {
        const s = score * 100;
        if (s <= 15) return 'text-emerald-500';
        if (s <= 50) return 'text-sky-500';
        if (s <= 75) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getTsForFeed = (item) => {
        const d = item?.date || item?.timestamp || item?.created_at || item?.time || 0;
        return new Date(d).getTime();
    };

    const enTweetsCount = detailsData.filter(t => detectLanguage(t.text) === 'en').length;

    const filteredDetails = detailsData
        .filter(item => {
            const text = item?.text || "";
            const isRetweet = text.startsWith('RT ') || item?.isRetweet;
            
            // Language Filter
            const lang = detectLanguage(text);
            if (langFilter === 'id' && lang === 'en') return false;

            if (filter === 'original') return !isRetweet;
            if (filter === 'retweets') return isRetweet;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'intensity') return (b.score || 0) - (a.score || 0);
            return getTsForFeed(b) - getTsForFeed(a); // Default: Latest first
        });

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 lowercase px-4 relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#6C5CE7]/5 to-transparent -z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-4 bg-white hover:bg-[#6C5CE7] hover:text-white rounded-2xl shadow-sm border border-black/5 transition-all group">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-[#6C5CE7] font-black uppercase tracking-[0.2em] text-[10px]">
                            <Shield size={14} /> clinical profile finalized
                        </div>
                        <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">intelligence report.</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDeleteScan}
                        className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-5 py-3 rounded-xl border border-rose-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <Trash2 size={16} /> delete scan
                    </button>
                    <div className="flex items-center gap-3 bg-white border border-black/5 px-5 py-3 rounded-xl shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">verifikasi klinis aktif</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
                    <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C5CE7]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative mb-6">
                            {userAvatar ? (
                                <img src={userAvatar} alt="" className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-xl" />
                            ) : (
                                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300"><User size={40} /></div>
                            )}
                        </div>
                        <h3 className="text-2xl font-black text-[#2D3436] leading-none mb-1.5">{userData.displayName || "unknown"}</h3>
                        <p className="text-slate-400 text-sm font-medium mb-6">{userData.handle || "@unknown"}</p>
                        <a href={`https://twitter.com/${(userData.handle || "").replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#6C5CE7]/10 text-slate-500 hover:text-[#6C5CE7] py-3 rounded-xl border border-black/5 transition-all mb-8 font-black text-[10px] uppercase tracking-widest">
                            <ExternalLink size={14} /> view profile
                        </a>
                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-black/5">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 leading-none">total tweets</p>
                                <p className="text-xl font-black text-[#2D3436]">{detailsData.length}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-black/5">
                                <p className="text-[9px] font-black text-[#6C5CE7] uppercase tracking-widest mb-1.5 leading-none">terindikasi</p>
                                <p className="text-xl font-black text-rose-500">
                                    {detailsData.filter(d => d.label === 'INDICATED').length}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-none shadow-xl bg-[#2D3436] text-white flex flex-col items-center justify-center rounded-[2.5rem]">
                        <CircularMeter score={severityScore} size={180} strokeWidth={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-8">avg intensity level</p>
                    </GlassCard>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="p-0 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-[750px]">
                        <div className="p-8 border-b border-black/5 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tighter uppercase shrink-0">
                                    <MessageSquare size={22} className="text-[#6C5CE7]" /> feed bukti klinis
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* View Filter */}
                                    <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
                                        {['all', 'original', 'retweets'].map(type => (
                                            <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === type ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>{type}</button>
                                        ))}
                                    </div>

                                    <div className="w-px h-4 bg-slate-200 hidden md:block" />

                                    {/* Language Filter */}
                                    <div className="flex bg-blue-500/5 p-1 rounded-xl gap-0.5 border border-blue-500/10">
                                        <button 
                                            onClick={() => setLangFilter('id')} 
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${langFilter === 'id' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-500/40 hover:text-blue-500'}`}
                                        >
                                            ID
                                        </button>
                                        <button 
                                            onClick={() => setLangFilter('all')} 
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${langFilter === 'all' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-500/40 hover:text-blue-500'}`}
                                        >
                                            ALL ({enTweetsCount})
                                        </button>
                                    </div>

                                    <div className="w-px h-4 bg-slate-200 hidden md:block" />

                                    {/* Sort Filter */}
                                    <div className="flex bg-[#6C5CE7]/5 p-1 rounded-xl gap-0.5 border border-[#6C5CE7]/10">
                                        {[
                                            { id: 'latest', icon: Clock },
                                            { id: 'intensity', icon: Zap }
                                        ].map(option => (
                                            <button key={option.id} onClick={() => setSortBy(option.id)} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${sortBy === option.id ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#6C5CE7]/40 hover:text-[#6C5CE7]'}`}>
                                                <option.icon size={14} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {filteredDetails.length === 0 ? (
                                <div className="py-20 text-center"><p className="text-slate-400 font-black text-xs uppercase tracking-widest">tidak ada data ditemukan.</p></div>
                            ) : (
                                filteredDetails.map((item, idx) => {
                                    const text = item?.text || "";
                                    const tweetImg = item?.imageUrl || item?.mediaUrl || (item?.images && item?.images[0]) || (item?.extended_entities?.media?.[0]?.media_url_https);
                                    const tweetAvatar = item?.avatarUrl || item?.profile_image_url || userAvatar;
                                    const tweetName = item?.displayName || item?.name || userData.displayName;
                                    const tweetHandle = item?.handle || item?.screen_name || userData.handle;
                                    const isRetweet = text.startsWith('RT ') || item?.isRetweet;
                                    const isEnglish = detectLanguage(text) === 'en';
                                    return (
                                        <div key={idx} className={`p-6 rounded-[2rem] border transition-all group relative overflow-hidden ${
                                            isEnglish 
                                            ? 'bg-[#F3F0FF] border-[#6C5CE7]/30 shadow-md scale-[0.98]' 
                                            : 'bg-white border-black/5 hover:border-[#6C5CE7]/20 shadow-sm'
                                        }`}>
                                            <div className="flex gap-4">
                                                <div className="shrink-0">
                                                    {tweetAvatar ? <img src={tweetAvatar} alt="" className="w-10 h-10 rounded-full border border-black/5 shadow-sm" /> : <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={20} /></div>}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-1.5"><span className="text-sm font-black text-[#2D3436]">{tweetName}</span><span className="text-[10px] font-medium text-slate-400">{tweetHandle}</span></div>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-black uppercase tracking-widest"><Clock size={10} /><span>{formatDate(item)}</span></div>
                                                                {item?.handle && (
                                                                    <a 
                                                                        href={`https://x.com/${item.handle.replace('@', '')}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-slate-300 hover:text-[#6C5CE7] transition-colors"
                                                                        title="view original tweet"
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">
                                                                {isEnglish ? 'language' : 'intensity'}
                                                            </p>
                                                            <p className={`text-[9px] font-black px-3 py-1 rounded-lg transition-all ${
                                                                isEnglish 
                                                                ? 'text-[#5849D4] bg-[#6C5CE7]/10 border border-[#6C5CE7]/20' 
                                                                : getRiskColor(item?.score || 0)
                                                            }`}>
                                                                {isEnglish ? 'EXTERNAL LANGUAGE - NO SCORE' : `${((item?.score || 0) * 100).toFixed(0)}%`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-[14px] leading-relaxed italic">"{text}"</p>
                                                    
                                                    {/* DSM Symptom Badge (Only show if match found or is English) */}
                                                    {(item.matchedLabel || isEnglish) && (
                                                        <div className="flex items-center gap-2 pt-2">
                                                            {(() => {
                                                                const symptom = dsmLexicon.find(l => l.id === item.matchedLabel);
                                                                
                                                                if (isEnglish) {
                                                                    return (
                                                                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200">
                                                                            <Sparkles size={10} /> external language context
                                                                        </div>
                                                                    );
                                                                }

                                                                if (symptom) {
                                                                    return (
                                                                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-amber-100 text-amber-600 border border-amber-200">
                                                                            <Sparkles size={10} /> {symptom.label}
                                                                        </div>
                                                                    );
                                                                }

                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}

                                                    {tweetImg && <div className="mt-3 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-slate-100"><img src={tweetImg} alt="" className="w-full h-auto max-h-80 object-cover" /></div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <GlassCard className="p-10 border-none shadow-sm bg-white rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-[#2D3436] flex items-center gap-3 tracking-tighter uppercase"><Brain size={24} className="text-[#6C5CE7]" /> clinical indicator breakdown (dsm-5)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                    {clinicalProfile.map((topic) => {
                        const total = detailsData.length || 1;
                        const percentage = (topic.count / total) * 100;
                        return (
                            <div 
                                key={topic.id} 
                                className={`p-4 rounded-2xl transition-all duration-300 ${
                                    topic.count > 0 
                                    ? 'cursor-pointer hover:bg-[#6C5CE7]/5 hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-[#6C5CE7]/20' 
                                    : 'opacity-40'
                                }`}
                                onClick={() => topic.count > 0 && setSelectedSymptom(topic)}
                            >
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">{topic.label}</span>
                                    <span className={topic.count > 0 ? 'text-[#6C5CE7]' : 'text-slate-300'}>{topic.count} matches</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-black/5">
                                    <div className={`h-full transition-all duration-1000 ${topic.count > 0 ? 'bg-[#6C5CE7]' : 'bg-slate-200'}`} style={{ width: `${Math.min(percentage * 10, 100)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Personal Intensity Trend (RESTORATION) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 bg-[#6C5CE7] text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={24} className="text-white/80" />
                                <h3 className="text-xl font-black text-white tracking-tighter uppercase">personal intensity trend.</h3>
                            </div>
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest ml-9">analisis fluktuasi intensitas emosional kronologis</p>
                        </div>
                        <div className="flex items-center gap-10 bg-white/10 p-4 rounded-2xl border border-white/10">
                            <div className="text-center">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">peak intensity</p>
                                <p className="text-xl font-black text-white">{(Math.max(...detailsData.map(d => d.score || 0), 0) * 100).toFixed(0)}%</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">trend focus</p>
                                <p className="text-xl font-black text-white/80 uppercase">
                                    {topIndicator ? topIndicator.label : (severityScore > 0.05 ? "UNSPECIFIED DISTRESS" : "STABLE / NORMAL")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full px-20 pb-12">
                        {/* Background Severity Zones */}
                        <div className="absolute inset-x-20 top-0 h-[180px] pointer-events-none opacity-10">
                            <div className="h-1/3 bg-rose-500 rounded-t-xl" title="High Risk Zone" />
                            <div className="h-1/3 bg-amber-500" title="Caution Zone" />
                            <div className="h-1/3 bg-emerald-500 rounded-b-xl" title="Safe Zone" />
                        </div>

                        {/* Y-Axis Labels */}
                        <div className="absolute left-6 h-[180px] flex flex-col justify-between text-[8px] font-black text-white/60 uppercase tracking-widest">
                            <span className="text-rose-200">100% - high intensity</span>
                            <span className="text-amber-200">50% - mod</span>
                            <span className="text-emerald-200">0% - safe</span>
                        </div>

                        {(() => {
                            // Robust sorting helper
                            const getTs = (item) => {
                                const d = item?.date || item?.timestamp || item?.created_at || item?.time || 0;
                                return new Date(d).getTime();
                            };

                            const sortedPosts = [...detailsData]
                                .filter(d => getTs(d) > 0)
                                .sort((a, b) => getTs(a) - getTs(b));

                            const samplingCount = 12;
                            const sampled = sortedPosts.length > samplingCount 
                                ? sortedPosts.filter((_, i) => i % Math.ceil(sortedPosts.length / samplingCount) === 0).slice(0, samplingCount)
                                : sortedPosts;
                            
                            const points = sampled.map(d => d.score || 0);
                            const avgY = 200 - (severityScore * 180);

                            return (
                                <>
                                    <svg viewBox="0 0 1000 200" className="w-full h-[200px] overflow-visible relative z-10">
                                        <defs>
                                            <linearGradient id="userTrendGradUp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Average Baseline */}
                                        <line x1="80" y1={avgY} x2="920" y2={avgY} stroke="white" strokeWidth="1" strokeDasharray="8 4" opacity="0.4" />
                                        <text x="930" y={avgY + 3} className="text-[7px] font-black fill-white/60 uppercase">avg intensity</text>

                                        {/* Mid-line separator */}
                                        <line x1="80" y1="100" x2="920" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.1" />
                                        
                                        {/* Area Fill */}
                                        <path d={`M 80,200 L ${points.map((v, i) => `${80 + (i / (points.length - 1 || 1)) * 840},${200 - v * 180}`).join(' L ')} L 920,200 Z`} fill="url(#userTrendGradUp)" />
                                        
                                        {/* Main Line */}
                                        <path d={`M ${points.map((v, i) => `${80 + (i / (points.length - 1 || 1)) * 840},${200 - v * 180}`).join(' L ')}`} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        
                                        {sampled.map((post, i) => {
                                            const v = post.score || 0;
                                            return (
                                                <g key={i} className="group/u-point cursor-pointer">
                                                    <circle cx={80 + (i / (points.length - 1 || 1)) * 840} cy={200 - v * 180} r="6" fill="#6C5CE7" stroke="white" strokeWidth="3" className="transition-all group-hover/u-point:r-8" />
                                                    
                                                    {/* ENHANCED HOVER TOOLTIP (WITH TIME) */}
                                                    <g className="opacity-0 group-hover/u-point:opacity-100 transition-opacity pointer-events-none">
                                                        <rect x={80 + (i / (points.length - 1 || 1)) * 840 - 60} y={200 - v * 180 - 60} width="120" height="45" rx="10" fill="white" className="shadow-2xl" />
                                                        <text x={80 + (i / (points.length - 1 || 1)) * 840} y={200 - v * 180 - 42} textAnchor="middle" className="text-[7px] font-black fill-slate-400 uppercase tracking-widest">{formatDate(post)}</text>
                                                        <text x={80 + (i / (points.length - 1 || 1)) * 840} y={200 - v * 180 - 25} textAnchor="middle" className="text-[10px] font-black fill-[#6C5CE7]">{(v * 100).toFixed(1)}% intensity</text>
                                                    </g>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    <div className="flex justify-between w-full mt-10 px-2 border-t border-white/10 pt-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">aktivitas awal</span>
                                            <span className="text-[7px] text-white/40 font-bold uppercase">{formatDate(sampled[0])}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">aktivitas terbaru</span>
                                            <span className="text-[7px] text-white/40 font-bold uppercase">{formatDate(sampled[sampled.length - 1])}</span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Clinical Interpretation Guide */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="space-y-2 border-r border-white/10 pr-6">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Brain size={14} className="text-rose-300" /> intensitas linguistik kronologis
                            </h4>
                            <p className="text-[11px] text-white/70 leading-relaxed">
                                Grafik ini memetakan <b className="text-white font-black">Intensitas Indikator Klinis</b> dari setiap postingan. Semakin tinggi titiknya, semakin kuat pola bahasa yang terdeteksi oleh AI sebagai tanda risiko emosional.
                            </p>
                        </div>
                        <div className="space-y-2 pl-2">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-emerald-300" /> cara membaca data
                            </h4>
                            <p className="text-[11px] text-white/70 leading-relaxed">
                                Garis putus-putus adalah <b className="text-white font-black">Average Intensity</b>. Jika banyak titik berada di atas garis tersebut, artinya pola perilaku user menunjukkan intensitas risiko yang lebih tinggi dari biasanya.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <GlassCard className="lg:col-span-8 p-10 border-none shadow-xl bg-gradient-to-br from-[#2D3436] to-[#1e2324] text-white rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={120} /></div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 text-[#74B9FF] font-black uppercase tracking-[0.2em] text-[10px]"><Sparkles size={16} /> ai clinical interpretation</div>
                        <h3 className="text-3xl font-black tracking-tighter leading-tight">
                            {(() => {
                                if (severityScore > 0.5) {
                                    return topIndicator 
                                        ? `analisis menunjukkan prevalensi ${topIndicator.label} yang sangat signifikan.` 
                                        : "terdeteksi pola emosional yang sangat intens namun tidak spesifik secara klinis.";
                                } else if (severityScore > 0.15) {
                                    return topIndicator 
                                        ? `terdeteksi indikasi ${topIndicator.label} dalam intensitas sedang.` 
                                        : "terdeteksi fluktuasi emosional ringan yang bersifat umum.";
                                } else {
                                    return "analisis menunjukkan kondisi linguistik yang stabil dan rendah risiko.";
                                }
                            })()}
                        </h3>
                        <p className="text-slate-400 text-base leading-relaxed max-w-3xl font-medium">
                            {(() => {
                                const tweetCount = detailsData.length;
                                if (severityScore > 0.5) {
                                    return topIndicator 
                                        ? `berdasarkan ${tweetCount} aktivitas terakhir, sistem mendeteksi tekanan psikologis yang tinggi. pola bahasa sangat kuat merujuk pada "${topIndicator.label}" dengan penggunaan kata kunci seperti "${topIndicator.keywords.slice(0, 2).join(', ')}". diperlukan perhatian profesional segera.`
                                        : `sistem mendeteksi luapan emosional yang sangat intens dalam bahasa user. meskipun tidak merujuk pada gejala klinis spesifik, frekuensi nada negatif yang tinggi menunjukkan adanya distress berat yang memerlukan observasi lebih lanjut.`;
                                } else if (severityScore > 0.15) {
                                    return topIndicator 
                                        ? `dalam ${tweetCount} aktivitas terakhir, terdapat indikasi gejala "${topIndicator.label}" yang muncul secara sporadis. intensitas risiko berada pada level moderat, menunjukkan adanya tekanan psikologis awal yang perlu dipantau.`
                                        : `terdapat pola bahasa yang menunjukkan keresahan emosional umum dalam intensitas sedang. tidak ditemukan bukti klinis yang spesifik, namun fluktuasi ini mencerminkan kondisi psikologis yang sedang kurang stabil.`;
                                } else {
                                    return `berdasarkan pola linguistik dalam ${tweetCount} aktivitas terakhir, sistem tidak mendeteksi adanya indikator klinis yang menonjol. penggunaan bahasa cenderung netral, positif, dan tidak menunjukkan tekanan psikologis yang signifikan menurut kriteria DSM-5.`;
                                }
                            })()}
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4">
                            <button onClick={() => {}} className="bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"><Download size={16} /> download technical report</button>
                            <a href="https://www.psychiatry.org/psychiatrists/practice/dsm" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"><FileText size={16} /> medical citation refs</a>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="lg:col-span-4 p-8 border-none shadow-sm bg-white rounded-[2.5rem] flex flex-col justify-center space-y-6">
                    <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[8px]"><ShieldAlert size={14} /> safety disclaimer</div>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">laporan ini dihasilkan secara otomatis oleh sistem kecerdasan buatan. celestx. tidak memberikan diagnosa medis formal. hasil ini harus diverifikasi oleh profesional kesehatan mental berlisensi.</p>
                </GlassCard>
            </div>

            {/* SYMPTOM DRILL-DOWN MODAL */}
            {selectedSymptom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Modal Header */}
                        <div className="p-10 border-b border-black/5 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#6C5CE7] p-3 rounded-2xl text-white shadow-lg shadow-[#6C5CE7]/20">
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-[#2D3436] tracking-tighter leading-none mb-2">{selectedSymptom.label}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest bg-[#6C5CE7]/10 px-3 py-1 rounded-full">{selectedSymptom.count} matched activity</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedSymptom.name}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedSymptom(null)}
                                className="p-3 bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-400 rounded-2xl transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content - List of Tweets */}
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 space-y-6">
                            {detailsData
                                .filter(t => t.matchedLabel === selectedSymptom.id)
                                .map((item, idx) => {
                                    const text = item.text || "";
                                    const tweetImg = item.imageUrl || item.mediaUrl;
                                    const isEnglish = detectLanguage(text) === 'en';
                                    
                                    const isRetweet = text.startsWith('RT ') || item?.isRetweet;
                                    const authorName = item?.displayName || item?.name || userData.displayName;
                                    const authorHandle = item?.handle || item?.screen_name || userData.handle;
                                    const authorAvatar = item?.avatarUrl || item?.profile_image_url || userAvatar;

                                    return (
                                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex gap-4 mb-4">
                                                <div className="shrink-0">
                                                    {authorAvatar ? (
                                                        <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full border border-black/5 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-[#2D3436] leading-none">{authorName}</span>
                                                                <span className="text-[10px] font-medium text-slate-400">{authorHandle}</span>
                                                                {isRetweet && (
                                                                    <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#6C5CE7]/10 tracking-widest">
                                                                        <Repeat size={8} /> retweet
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-300 font-black uppercase tracking-widest">
                                                                <Clock size={10} /> {formatDate(item)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">intensity</p>
                                                            <p className={`text-[12px] font-black ${getRiskColor(item.score || 0)}`}>{((item.score || 0) * 100).toFixed(0)}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pl-14">
                                                <p className="text-slate-600 text-[15px] leading-relaxed italic mb-4">"{text}"</p>
                                                {tweetImg && (
                                                    <div className="rounded-2xl overflow-hidden border border-black/5 max-w-sm mb-2 shadow-sm">
                                                        <img src={tweetImg} alt="" className="w-full h-auto" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-black/5 bg-white text-center">
                            <p className="text-[10px] font-medium text-slate-400 italic">Data ini divalidasi silang menggunakan lexicon DSM-5 dan model IndoBERTweet.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
