import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { UserSearch, ChevronRight, UserCircle2, ArrowUpRight, Users as UsersIcon } from 'lucide-react';

export function Users({ onSelectUser }) {
  const [analyzedUsers, setAnalyzedUsers] = useState([]);

  useEffect(() => {
    const loadUsers = () => {
        chrome.storage.local.get(['sentimenta_deep_scans'], (storage) => {
            if (storage.sentimenta_deep_scans) {
              const users = Object.values(storage.sentimenta_deep_scans);
              setAnalyzedUsers(users.sort((a, b) => b.summary.average_severity - a.summary.average_severity));
            }
          });
    };
    loadUsers();
    chrome.storage.onChanged.addListener(loadUsers);
    return () => chrome.storage.onChanged.removeListener(loadUsers);
  }, []);

  const getRiskColor = (score) => {
    const s = score * 100;
    if (s <= 15) return 'text-emerald-500';
    if (s <= 50) return 'text-sky-500';
    if (s <= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase px-4 relative">
       {/* Unified Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><UsersIcon size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">analyzed users.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">direktori profil dengan riwayat deep-scan yang telah selesai.</p>
        </div>
      </div>

      {analyzedUsers.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-slate-100 bg-white">
          <UserCircle2 size={56} className="text-slate-200 mb-6" />
          <p className="text-[#2D3436] font-bold text-base uppercase tracking-widest opacity-40">belum ada pengguna.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {analyzedUsers.map((scan, idx) => (
            <div 
                key={idx} 
                onClick={() => onSelectUser(scan)}
                className="group cursor-pointer"
            >
                <GlassCard className="p-8 hover:border-[#6C5CE7]/30 transition-all border-none shadow-sm bg-white h-full flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <img 
                            src={scan.user.avatarUrl} 
                            alt="" 
                            className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl group-hover:scale-110 transition-transform" 
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg">
                            <div className={`w-4 h-4 rounded-full ${scan.summary.average_severity > 0.5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-[#2D3436] leading-none mb-1.5 truncate w-full group-hover:text-[#6C5CE7] transition-colors">{scan.user.displayName || 'unknown'}</h3>
                    <p className="text-slate-400 text-xs font-medium mb-6 truncate w-full">{scan.user.handle}</p>
                    
                    <div className="w-full pt-6 border-t border-black/5">
                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase mb-2">
                            <span>risk severity</span>
                            <span className={getRiskColor(scan.summary.average_severity)}>{(scan.summary.average_severity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-[1500ms] ${
                                    scan.summary.average_severity <= 0.15 ? 'bg-emerald-500' : 
                                    scan.summary.average_severity <= 0.50 ? 'bg-sky-500' : 
                                    scan.summary.average_severity <= 0.75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${scan.summary.average_severity * 100}%` }} 
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-[#6C5CE7] font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                        <span>view report</span>
                        <ChevronRight size={14} />
                    </div>
                </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
