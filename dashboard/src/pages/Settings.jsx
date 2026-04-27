import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Save, Bell, Globe, Zap, ShieldCheck, Settings as SettingsIcon, 
  Cpu, Activity, CheckCircle2, Info, Lock, Sliders, Download, FileJson
} from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    scanInterval: 2,
    enableNotifications: true,
    backendUrl: 'http://localhost:8000',
    confidenceThreshold: 15,
    scanDepth: 50
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['sentimenta_settings'], (storage) => {
      if (storage.sentimenta_settings) {
        setSettings(prev => ({ ...prev, ...storage.sentimenta_settings }));
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ sentimenta_settings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleExport = () => {
    chrome.storage.local.get(['sentimenta_history'], (storage) => {
      const data = JSON.stringify(storage.sentimenta_history || [], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celestx_intelligence_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 lowercase px-4 relative">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6C5CE7]/5 blur-[120px] rounded-full -z-10" />

      {/* Unified Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div className="space-y-2">
            <div className="flex items-center gap-4">
                <div className="bg-[#6C5CE7]/10 p-3 rounded-xl text-[#6C5CE7] shadow-sm"><SettingsIcon size={24} /></div>
                <h2 className="text-4xl font-black text-[#2D3436] tracking-tighter leading-none">settings.</h2>
            </div>
            <p className="text-slate-400 text-sm font-medium pl-16">konfigurasi mesin & preferensi intelijen.</p>
        </div>
        <div className="flex items-center gap-4 self-start md:self-end">
            {saved && (
                <div className="flex items-center gap-3 text-emerald-500 bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100 animate-pulse">
                    <CheckCircle2 size={16} />
                    <p className="font-black text-[10px] uppercase tracking-widest leading-none">settings saved</p>
                </div>
            )}
            <button 
                onClick={handleSave}
                className="bg-[#6C5CE7] text-white px-12 py-4 rounded-xl font-black shadow-xl shadow-[#6C5CE7]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 text-sm uppercase tracking-widest group"
            >
                <Save size={18} />
                save changes
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
            <GlassCard className="p-10 border-none shadow-sm bg-white rounded-[2.5rem]">
                <div className="space-y-12">
                    
                    {/* Confidence Threshold */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="bg-[#6C5CE7]/10 p-4 rounded-2xl text-[#6C5CE7]">
                                    <Sliders size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-xl text-[#2D3436]">ambang batas deteksi</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">sensitivitas minimal sistem untuk memicu alert deteksi.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-[#6C5CE7] leading-none">{settings.confidenceThreshold}%</p>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">sensitivity level</p>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max="95" 
                            step="5"
                            value={settings.confidenceThreshold}
                            onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6C5CE7] border border-black/5"
                        />
                    </div>

                    <div className="h-px bg-black/5" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-500">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-lg text-[#2D3436]">scan interval</p>
                                    <p className="text-xs text-slate-400 font-medium">cek timeline otomatis.</p>
                                </div>
                            </div>
                            <input 
                                type="number" 
                                value={settings.scanInterval}
                                onChange={(e) => setSettings({...settings, scanInterval: parseInt(e.target.value)})}
                                className="w-20 bg-slate-50 border border-black/5 rounded-2xl px-4 py-4 text-center font-black text-[#6C5CE7] focus:outline-none text-lg"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-lg text-[#2D3436]">notifications</p>
                                    <p className="text-xs text-slate-400 font-medium">alert desktop aktif.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setSettings({...settings, enableNotifications: !settings.enableNotifications})}
                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.enableNotifications ? 'bg-[#6C5CE7]' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.enableNotifications ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-black/5" />

                    {/* Scan Depth Selection */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="bg-rose-500/10 p-4 rounded-2xl text-rose-500">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-xl text-[#2D3436]">deep scan depth</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">jumlah tweet yang diambil saat melakukan intelligence scan.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[20, 50, 100, 200].map((depth) => (
                                <button 
                                    key={depth}
                                    onClick={() => setSettings({...settings, scanDepth: depth})}
                                    className={`p-4 rounded-2xl border font-black transition-all ${
                                        settings.scanDepth === depth 
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                                        : 'bg-white text-slate-400 border-black/5 hover:border-rose-500/30'
                                    }`}
                                >
                                    <span className="text-lg">{depth}</span>
                                    <p className="text-[8px] uppercase tracking-widest mt-1 opacity-60">tweets</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 pt-6 border-t border-dashed border-black/10">
                        <div className="flex items-center gap-6">
                            <div className="bg-slate-100 p-4 rounded-2xl text-slate-500">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="font-black text-lg text-[#2D3436]">fastapi backend url</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">endpoint server model indobertweet.</p>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={settings.backendUrl}
                            onChange={(e) => setSettings({...settings, backendUrl: e.target.value})}
                            className="w-full bg-slate-50 border border-black/5 rounded-2xl px-8 py-5 font-black text-[#2D3436] focus:outline-none text-base"
                        />
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] flex items-center justify-between border border-[#6C5CE7]/10">
                <div className="flex items-center gap-6">
                    <div className="bg-[#6C5CE7]/5 p-4 rounded-2xl text-[#6C5CE7]">
                        <FileJson size={28} />
                    </div>
                    <div>
                        <p className="font-black text-lg text-[#2D3436]">export intelligence data</p>
                        <p className="text-xs text-slate-400 font-medium">download history arsip ke format .json.</p>
                    </div>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-50 hover:bg-[#6C5CE7] hover:text-white text-[#6C5CE7] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-[#6C5CE7]/20"
                >
                    <Download size={16} />
                    export .json
                </button>
            </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-10">
            {/* Intelligence Engine Card - FIXED TO LIGHT THEME */}
            <GlassCard className="p-8 border-none shadow-sm bg-white border border-black/5 rounded-[2.5rem] relative overflow-hidden space-y-8">
                <div className="bg-[#6C5CE7]/10 p-5 rounded-2xl w-fit text-[#6C5CE7] shadow-sm">
                    <Cpu size={32} />
                </div>
                <div className="space-y-4">
                    <h4 className="text-2xl font-black tracking-tighter text-[#2D3436]">intelligence engine</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        sistem menggunakan model <span className="text-[#6C5CE7] font-black underline decoration-[#6C5CE7]/30 decoration-2">indobertweet</span> untuk deteksi linguistik bahasa indonesia yang akurat.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2.5 rounded-xl border border-black/5 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                            manifest v3 module
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2.5 rounded-xl border border-black/5 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                            pytorch inference
                        </div>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-8 border-none shadow-sm bg-slate-50 border border-black/5 rounded-[2.5rem] flex flex-col items-center text-center space-y-6">
                <div className="bg-white p-5 rounded-2xl text-slate-400 shadow-sm border border-black/5">
                    <Lock size={28} />
                </div>
                <div className="space-y-2">
                    <h5 className="font-black text-[#2D3436] text-base uppercase tracking-tighter">privacy protocol</h5>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                        data diproses secara lokal di browser anda. aman & rahasia.
                    </p>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
