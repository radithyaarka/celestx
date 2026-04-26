import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Save, Bell, Globe, Zap, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lowercase px-4 relative">
       {/* Unified Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7]"><SettingsIcon size={24} /></div>
             <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">settings.</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">konfigurasi mesin deteksi dan preferensi ruang kerja anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
            <GlassCard className="p-8 border-none shadow-sm bg-white">
                <div className="space-y-10">
                    {/* Auto-Scan Interval */}
                    <div className="flex items-center justify-between gap-10">
                        <div className="flex items-center gap-5">
                            <div className="bg-[#6C5CE7]/10 p-4 rounded-2xl text-[#6C5CE7]">
                                <Zap size={22} />
                            </div>
                            <div>
                                <p className="font-black text-lg text-[#2D3436]">auto-scan interval</p>
                                <p className="text-xs text-slate-400 font-medium">seberapa sering skrip latar belakang memeriksa timeline anda.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                value={settings.scanInterval}
                                onChange={(e) => setSettings({...settings, scanInterval: parseInt(e.target.value)})}
                                className="w-20 bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-center font-bold text-[#6C5CE7] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 text-sm"
                            />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">sec</span>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between gap-10">
                        <div className="flex items-center gap-5">
                            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500">
                                <Bell size={22} />
                            </div>
                            <div>
                                <p className="font-black text-lg text-[#2D3436]">system notifications</p>
                                <p className="text-xs text-slate-400 font-medium">dapatkan peringatan desktop saat risiko terdeteksi.</p>
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
                    <div className="flex flex-col gap-5 pt-8 border-t border-black/5">
                        <div className="flex items-center gap-5">
                            <div className="bg-slate-100 p-4 rounded-2xl text-slate-500">
                                <Globe size={22} />
                            </div>
                            <div>
                                <p className="font-black text-lg text-[#2D3436]">fastapi backend url</p>
                                <p className="text-xs text-slate-400 font-medium">alamat server tempat model indobertweet anda berjalan.</p>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={settings.backendUrl}
                            onChange={(e) => setSettings({...settings, backendUrl: e.target.value})}
                            placeholder="http://localhost:8000"
                            className="w-full bg-slate-50 border border-black/5 rounded-xl px-6 py-4 font-bold text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 text-sm"
                        />
                    </div>
                </div>
            </GlassCard>

            <div className="flex items-center justify-end gap-6">
                {saved && (
                    <p className="text-emerald-500 font-bold text-xs flex items-center gap-2 uppercase tracking-widest">
                        <ShieldCheck size={18} /> settings saved successfully
                    </p>
                )}
                <button 
                    onClick={handleSave}
                    className="bg-[#6C5CE7] text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-[#6C5CE7]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 text-sm uppercase tracking-widest"
                >
                    <Save size={20} />
                    save changes
                </button>
            </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-4">
            <GlassCard className="p-8 border-none shadow-xl bg-[#2D3436] text-white space-y-6">
                <div className="bg-white/10 p-4 rounded-xl w-fit text-[#6C5CE7]">
                    <ShieldCheck size={28} />
                </div>
                <h4 className="text-xl font-black tracking-tight">security & privacy</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                    semua data klinis yang diproses oleh celestx. dikelola secara lokal. arsip deteksi dan hasil deep-scan anda tidak akan pernah meninggalkan penyimpanan browser anda.
                </p>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
