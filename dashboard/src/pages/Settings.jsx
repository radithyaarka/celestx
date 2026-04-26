import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Save, Bell, Globe, Zap, ShieldCheck } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    scanInterval: 10,
    enableNotifications: true,
    backendUrl: 'http://localhost:8000',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_settings'], (storage) => {
      if (storage.sentimenta_settings) {
        setSettings(storage.sentimenta_settings);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ sentimenta_settings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 lowercase">
      <div>
        <h2 className="text-5xl font-black text-[#2D3436] mb-4 tracking-tighter">settings.</h2>
        <p className="text-slate-400 text-base font-medium">configure your detection engine and workspace preferences.</p>
      </div>

      <div className="grid gap-8">
        <GlassCard className="p-10 border-none shadow-xl shadow-black/5">
          <div className="space-y-10">
            {/* Auto-Scan Interval */}
            <div className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-5">
                <div className="bg-[#6C5CE7]/10 p-4 rounded-3xl text-[#6C5CE7]">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="font-black text-lg text-[#2D3436]">auto-scan interval</p>
                  <p className="text-xs text-slate-400 font-medium">how often the background script checks your twitter timeline.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.scanInterval}
                  onChange={(e) => setSettings({...settings, scanInterval: parseInt(e.target.value)})}
                  className="w-20 bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-center font-bold text-[#6C5CE7] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">seconds</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-5">
                <div className="bg-[#74B9FF]/10 p-4 rounded-3xl text-[#74B9FF]">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="font-black text-lg text-[#2D3436]">system notifications</p>
                  <p className="text-xs text-slate-400 font-medium">get desktop alerts immediately when risk is detected.</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, enableNotifications: !settings.enableNotifications})}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.enableNotifications ? 'bg-[#6C5CE7]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.enableNotifications ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Backend URL */}
            <div className="flex flex-col gap-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-5">
                <div className="bg-slate-100 p-4 rounded-3xl text-slate-500">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="font-black text-lg text-[#2D3436]">fastapi backend url</p>
                  <p className="text-xs text-slate-400 font-medium">the address where your indobertweet model is running.</p>
                </div>
              </div>
              <input 
                type="text" 
                value={settings.backendUrl}
                onChange={(e) => setSettings({...settings, backendUrl: e.target.value})}
                placeholder="http://localhost:8000"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 font-bold text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center justify-end gap-4">
            {saved && (
                <p className="text-emerald-500 font-bold text-sm flex items-center gap-2">
                    <ShieldCheck size={16} /> settings saved successfully
                </p>
            )}
            <button 
                onClick={handleSave}
                className="bg-[#6C5CE7] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-[#6C5CE7]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
                <Save size={20} />
                save changes
            </button>
        </div>
      </div>
    </div>
  );
}
