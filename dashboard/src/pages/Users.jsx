import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { UserSearch, ChevronRight, UserCircle2, ArrowUpRight } from 'lucide-react';

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
    // Refresh when storage changes
    chrome.storage.onChanged.addListener(loadUsers);
    return () => chrome.storage.onChanged.removeListener(loadUsers);
  }, []);

  const handleCardClick = (scan) => {
    console.log("Opening report for:", scan.user?.handle);
    if (onSelectUser) {
        onSelectUser(scan);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 lowercase">
      <div>
        <h2 className="text-5xl font-black text-[#2D3436] mb-4 tracking-tighter">analyzed users.</h2>
        <p className="text-slate-400 text-base font-medium">directory of profiles with completed deep-scan history.</p>
      </div>

      {analyzedUsers.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-slate-100 bg-white">
          <UserCircle2 size={56} className="text-slate-200 mb-6" />
          <p className="text-[#2D3436] font-bold text-lg">no analyzed users yet.</p>
          <p className="text-slate-400 text-sm mt-2">start a deep scan from the history page to see profiles here.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyzedUsers.map((scan, idx) => (
            <div 
                key={idx} 
                onClick={() => handleCardClick(scan)}
                className="group cursor-pointer"
            >
                <GlassCard className="p-8 hover:border-[#6C5CE7]/30 transition-all border-none shadow-md shadow-black/5 h-full flex flex-col">
                <div className="flex flex-col items-center text-center flex-1">
                    <div className="relative mb-6">
                        <img 
                            src={scan.user.avatarUrl} 
                            alt="avatar" 
                            className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-xl group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg border border-black/5">
                            <SeverityBadge label={scan.summary.status} />
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-[#2D3436] mb-1 truncate w-full">{scan.user.displayName || 'unknown'}</h3>
                    <p className="text-slate-400 text-sm font-medium mb-6">{scan.user.handle}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-black/5">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">risk score</p>
                            <p className="text-xl font-black text-[#6C5CE7]">{(scan.summary.average_severity * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">tweets</p>
                            <p className="text-xl font-black text-[#2D3436]">{scan.tweetCount}</p>
                        </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-[#6C5CE7] font-black text-xs group-hover:gap-4 transition-all">
                        <span>view report</span>
                        <ChevronRight size={16} />
                    </div>
                </div>
                </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
