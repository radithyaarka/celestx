import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { DeepScanModal } from '../components/DeepScanModal';
import { UserSearch, ChevronRight, UserCircle2, ArrowUpRight, Users as UsersIcon, Search, Zap, Loader2, Sparkles } from 'lucide-react';

export function Users({ onSelectUser }) {
  const [analyzedUsers, setAnalyzedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanningHandle, setScanningHandle] = useState(null);
  const [pendingScanTarget, setPendingScanTarget] = useState(null);
  const [settings, setSettings] = useState({ scanDepth: 50 });

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_settings'], (storage) => {
      if (storage.sentimenta_settings) {
        setSettings(prev => ({ ...prev, ...storage.sentimenta_settings }));
      }
    });
  }, []);

  useEffect(() => {
    const loadUsers = () => {
        chrome.storage.local.get(['sentimenta_deep_scans'], (storage) => {
            if (storage.sentimenta_deep_scans) {
              const users = Object.values(storage.sentimenta_deep_scans);
              setAnalyzedUsers(users.sort((a, b) => {
                  const scoreA = a.summary?.average_risk_score || a.summary?.average_score || a.summary?.average_severity || 0;
                  const scoreB = b.summary?.average_risk_score || b.summary?.average_score || b.summary?.average_severity || 0;
                  return scoreB - scoreA;
              }));
            }
          });
    };
    loadUsers();
    chrome.storage.onChanged.addListener(loadUsers);
    return () => chrome.storage.onChanged.removeListener(loadUsers);
  }, []);

  const handleInitiateScanClick = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const handle = searchQuery.replace('@', '').trim();
    if (!handle) return;

    setPendingScanTarget({ handle: `@${handle}`, displayName: handle });
  };

  const performScan = async (targetUser) => {
    const handle = targetUser.handle.replace('@', '').trim();
    setScanningHandle(handle);
    
    chrome.tabs.create({ url: `https://x.com/${handle}`, active: true }, (tab) => {
        const listener = (tabId, info) => {
            if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { 
                        action: 'deep_scrape_profile',
                        targetDepth: settings?.scanDepth || 50 
                    }, async (response) => {
                        chrome.tabs.remove(tab.id);
                        
                        if (!response || !response.tweets || response.tweets.length === 0) {
                            alert("gagal mengambil data tweet. pastikan profil publik.");
                            setScanningHandle(null);
                            return;
                        }

                        try {
                            const tweetData = response.tweets.map(t => ({
                                text: t.text,
                                imageUrl: t.imageUrl || t.mediaUrl || null
                            }));
                            const threshold = (settings.confidenceThreshold || 25) / 100;
                            const res = await fetch("http://localhost:8000/predict-user", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                    tweets: tweetData,
                                    threshold: threshold
                                }),
                            });
                            const result = await res.json();

                            const originalTweet = response.tweets.find(t => !t.isRetweet) || response.tweets[0];
                            
                            const scanData = {
                                user: {
                                    handle: `@${handle}`,
                                    displayName: response.profile?.displayName || originalTweet?.displayName || handle,
                                    avatarUrl: response.profile?.avatarUrl || originalTweet?.avatarUrl || "",
                                    bio: response.profile?.bio || ""
                                },
                                summary: result,
                                tweetCount: response.tweets.length,
                                details: result.details.map(d => {
                                    const originalTweet = response.tweets[d.tweet_id - 1];
                                    return { ...originalTweet, score: d.score, label: d.label, symptom: d.symptom };
                                })
                            };

                            chrome.storage.local.get(['sentimenta_deep_scans'], (s) => {
                                const newScans = { ...(s.sentimenta_deep_scans || {}), [`@${handle}`]: scanData };
                                chrome.storage.local.set({ sentimenta_deep_scans: newScans }, () => {
                                    setScanningHandle(null);
                                    setPendingScanTarget(null);
                                    setSearchQuery('');
                                    onSelectUser(scanData);
                                });
                            });
                        } catch (err) {
                            console.error(err);
                            alert("error saat melakukan analisis mesin.");
                            setScanningHandle(null);
                            setPendingScanTarget(null);
                        }
                    });
                }, 4000); // 4s buffer for X's heavy JS
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
  };

  const getRiskColor = (score) => {
    const s = score * 100;
    if (s <= 25) return 'text-emerald-500';
    if (s <= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 lowercase px-4 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7]/5 blur-[100px] rounded-full -z-10" />

        {/* Unified Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                    <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7] shadow-sm"><UsersIcon size={24} /></div>
                    <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">analyzed users.</h2>
                </div>
                <p className="text-slate-400 text-sm font-medium pl-16">daftar pengguna yang sudah dianalisis mendalam.</p>
            </div>
        </div>

        {/* Intelligence Search Bar */}
        <GlassCard className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C5CE7]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={18} className="text-[#6C5CE7]" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">initiate direct intelligence scan</h3>
                </div>
                
                <form onSubmit={handleInitiateScanClick} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-slate-300 group-focus-within:text-[#6C5CE7] transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="masukkan twitter username (contoh: @elonmusk)"
                            className="w-full bg-slate-50 border border-black/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-[#6C5CE7]/10 focus:border-[#6C5CE7]/20 transition-all outline-none"
                            disabled={!!scanningHandle}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!!scanningHandle || !searchQuery}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
                            !searchQuery 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white hover:shadow-[#6C5CE7]/30'
                        }`}
                    >
                        <Zap size={16} />
                        mulai analisis
                    </button>
                </form>
                <p className="mt-4 text-[9px] text-slate-400 font-medium italic">*sistem akan otomatis membuka tab twitter dan melakukan analisis klinis mendalam pada {settings?.scanDepth || 50} tweet terakhir.</p>
            </div>
        </GlassCard>

        <div className="w-full h-px bg-black/5" />

        {analyzedUsers.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-32 text-center border-dashed border-2 border-slate-100 bg-white rounded-[2.5rem]">
                <div className="bg-slate-50 p-8 rounded-full mb-6">
                    <UserCircle2 size={56} className="text-slate-200" />
                </div>
                <p className="text-[#2D3436] font-black text-lg uppercase tracking-widest opacity-40">belum ada pengguna.</p>
                <p className="text-slate-300 text-sm mt-2">gunakan fitur pencarian di atas untuk memulai analisis pertama.</p>
            </GlassCard>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {analyzedUsers.map((scan, idx) => {
            const detectLanguage = (text) => {
                if (!text) return 'id';
                const enWords = /\b(the|is|are|in|to|of|for|with|and|on|at|i|me|my|you|your|he|she|it|this|that|these|those|what|when|where|why|how|do|does|did|but|or|so|because|as|until|while|about|against|between|into|through|during|before|after|above|below|from|up|down|out|off|over|under|again|further|then|once|here|there|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|than|too|very|can|will|just|don|should|now|lol|lmao|stfu|idk|imo|omg|wtf|bro|dude|shit|fuck|damn|rn|fr|tbh)\b/gi;
                const idWords = /\b(yang|di|ke|dari|ini|itu|dan|ada|saya|aku|kamu|lo|lu|gw|gue|gwa|bgt|banget|ga|gk|gak|ngga|nggak|tidak|aja|saja|udah|sdh|sudah|kalo|kalau|kl|klo|sih|dong|nih|tuh|kok|wkwk|haha|wk|anjir|njir|anjing|bgst|bangsat|tolol|bego|goblok|gimana|gmn|gitu|gtu|gt|gini|kenapa|knp|siapa|sapa|apa|apaan|tapi|tpi|karena|krn|pas|waktu|lg|lagi|sama|sm|buat|bwt|dgn|dengan|kyk|kayak|kek|bisa|bsa|jg|juga|mah|teh|atuh|euy|nya|ya|iya|y|g|blm|belum|coba|cb|terus|trs|abis|habis|deh|untuk|utk)\b/gi;
                
                const enAffixes = /\b\w{3,}(tion|ing|ed|ly|ment|ness|ity|ous|ive|able|ible|less|ful)\b/gi;
                const idAffixes = /\b(meng|meny|peng|peny|diper|keber|keter)\w{3,}|\w{3,}(nya|lah|kah|pun)\b/gi;

                const enScore = (text.match(enWords) || []).length + (text.match(enAffixes) || []).length;
                const idScore = (text.match(idWords) || []).length + (text.match(idAffixes) || []).length;
                
                return enScore > idScore ? 'en' : 'id';
            };

            const idTweets = scan.details?.filter(d => {
                const text = d.text || "";
                const enWords = /\b(the|is|are|in|to|of|for|with|and|on|at|i|me|my|you|your|he|she|it)\b/gi;
                const idWords = /\b(yang|di|ke|dari|ini|itu|dan|ada|saya|aku|kamu|lo|gw|ga|tidak|untuk)\b/gi;
                const enMatches = (text.match(enWords) || []).length;
                const idMatches = (text.match(idWords) || []).length;
                return enMatches <= idMatches; // Treat as ID if not predominantly EN
            }) || [];

            const totalTweets = idTweets.length || 1; // Prevent div by 0
            const indicatedCount = idTweets.filter(d => (Number(d.score) || 0) >= 0.25).length || 0;
            const status = scan.summary?.status || 'STABIL';
            
            const getStatusColor = (stat) => {
                if (stat === 'POTENSI TINGGI') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                if (stat === 'MODERAT') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            };

            const statusStyles = getStatusColor(status);

            return (
                <div 
                    key={idx} 
                    onClick={() => onSelectUser(scan)}
                    className="group cursor-pointer"
                >
                    <GlassCard className="p-8 hover:border-[#6C5CE7]/30 transition-all border-none shadow-sm bg-white h-full flex flex-col items-center text-center rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C5CE7]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="relative mb-6">
                            {scan.user.avatarUrl ? (
                                <img 
                                    src={scan.user.avatarUrl} 
                                    alt="" 
                                    className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl group-hover:scale-110 transition-transform relative z-10" 
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300 relative z-10"><UserCircle2 size={32} /></div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg z-20 border border-black/5">
                                <div className={`w-4 h-4 rounded-full ${status === 'POTENSI TINGGI' ? 'bg-rose-500 animate-pulse' : status === 'MODERAT' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-black text-[#2D3436] leading-none mb-1.5 truncate w-full group-hover:text-[#6C5CE7] transition-colors">{scan.user.displayName || 'unknown'}</h3>
                        <p className="text-slate-400 text-xs font-medium mb-6 truncate w-full">{scan.user.handle || '@unknown'}</p>
                        
                        <div className="w-full pt-6 border-t border-dashed border-black/10 mt-auto">
                            <div className={`px-4 py-2 rounded-xl border ${statusStyles} mb-4 inline-block`}>
                                <span className="font-black text-[10px] uppercase tracking-widest">{status}</span>
                            </div>
                            <div className="flex justify-between items-center text-left">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">total aktivitas</p>
                                    <p className="text-lg font-black text-[#2D3436] leading-none">{totalTweets}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">terindikasi</p>
                                    <p className="text-lg font-black text-rose-500 leading-none">{indicatedCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-[#6C5CE7] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <span>view report</span>
                            <ChevronRight size={14} />
                        </div>
                    </GlassCard>
                </div>
                );
            })}
            </div>
        )}

        <DeepScanModal
          targetUser={pendingScanTarget}
          onConfirm={performScan}
          onClose={() => setPendingScanTarget(null)}
          isScanning={!!scanningHandle}
        />
    </div>
  );
}
