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
              // Robust sorting: handle both average_score and average_severity
              setAnalyzedUsers(users.sort((a, b) => {
                  const scoreA = a.summary.average_score || a.summary.average_severity || 0;
                  const scoreB = b.summary.average_score || b.summary.average_severity || 0;
                  return scoreB - scoreA;
              }));
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
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7]/5 blur-[100px] rounded-full -z-10" />

       {/* Unified Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7] shadow-sm"><UsersIcon size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">analyzed users.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium pl-16">direktori profil dengan riwayat deep-scan yang telah selesai.</p>
        </div>
      </div>

      {analyzedUsers.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-32 text-center border-dashed border-2 border-slate-100 bg-white rounded-[2.5rem]">
          <div className="bg-slate-50 p-8 rounded-full mb-6">
            <UserCircle2 size={56} className="text-slate-200" />
          </div>
          <p className="text-[#2D3436] font-black text-lg uppercase tracking-widest opacity-40">belum ada pengguna.</p>
          <p className="text-slate-300 text-sm mt-2">lakukan deep-scan pada history untuk melihat direktori ini.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {analyzedUsers.map((scan, idx) => {
            const currentScore = scan.summary.average_score || scan.summary.average_severity || 0;
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
                              <div className={`w-4 h-4 rounded-full ${currentScore > 0.5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                          </div>
                      </div>
                      
                      <h3 className="text-lg font-black text-[#2D3436] leading-none mb-1.5 truncate w-full group-hover:text-[#6C5CE7] transition-colors">{scan.user.displayName || 'unknown'}</h3>
                      <p className="text-slate-400 text-xs font-medium mb-8 truncate w-full">{scan.user.handle || '@unknown'}</p>
                      
                      <div className="w-full pt-6 border-t border-dashed border-black/10 mt-auto">
                          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                              <span>risk severity</span>
                              <span className={getRiskColor(currentScore)}>{(currentScore * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-black/5">
                              <div 
                                  className={`h-full transition-all duration-[1500ms] ${
                                      currentScore <= 0.15 ? 'bg-emerald-500' : 
                                      currentScore <= 0.50 ? 'bg-sky-500' : 
                                      currentScore <= 0.75 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} 
                                  style={{ width: `${currentScore * 100}%` }} 
                              />
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
    </div>
  );
}
