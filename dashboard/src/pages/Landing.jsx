import React from 'react';
import { ArrowRight, ArrowUpRight, LayoutDashboard, Brain, Activity, ShieldCheck } from 'lucide-react';

export function Landing({ onNavigate }) {
  return (
    <div className="w-full h-screen bg-[#F7F9FC] flex flex-col items-center justify-center relative overflow-hidden selection:bg-[#6C5CE7]/20">

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#6C5CE7]/10 blur-[150px] rounded-full pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#74B9FF]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">

        {/* Logo Section */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-[#6C5CE7] blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-[#6C5CE7]/10 border border-black/5 relative z-10 transform group-hover:scale-105 transition-all duration-500 w-32 h-32 flex items-center justify-center">
            <img src="/logo.png" alt="CelestX" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* Text Section */}
        <h1 className="text-6xl font-black text-[#2D3436] tracking-tighter mb-2 font-serif italic">celestx.</h1>
        <p className="text-xl font-bold text-[#6C5CE7] mb-4 tracking-tight lowercase">
          spotting the clouds, before the storm.
        </p>
        <p className="text-sm text-slate-500 font-medium max-w-lg mb-12 leading-relaxed lowercase">
          sistem deteksi dini indikasi depresi klinis di media sosial.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => window.open('https://x.com', '_blank')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#1DA1F2]/25 flex items-center justify-center gap-3 hover:-translate-y-1"
          >
            <ArrowUpRight size={18} />
            Buka X (Twitter)
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#6C5CE7]/25 flex items-center justify-center gap-3 hover:-translate-y-1"
          >
            <LayoutDashboard size={18} />
            Masuk Dashboard
          </button>
        </div>

      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 CelestX.</p>
      </div>

    </div>
  );
}
