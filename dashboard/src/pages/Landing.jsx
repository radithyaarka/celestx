import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, LayoutDashboard, Brain, Activity, ShieldCheck, HelpCircle, X, Scan, Eye, Sparkles, Shield, ChevronRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Scan,
    color: 'from-[#6C5CE7] to-[#a29bfe]',
    title: 'Scroll Timeline X',
    desc: 'Buka X (Twitter) dan scroll timeline seperti biasa. CelestX bekerja di latar belakang dan otomatis menganalisis setiap tweet yang muncul.',
  },
  {
    num: '02',
    icon: Eye,
    color: 'from-[#0984E3] to-[#74B9FF]',
    title: 'Notifikasi Terindikasi',
    desc: 'Jika AI mendeteksi indikasi emosi negatif pada tweet seseorang, notifikasi peringatan akan muncul secara otomatis di ekstensi.',
  },
  {
    num: '03',
    icon: Brain,
    color: 'from-[#6C5CE7] to-[#fd79a8]',
    title: 'Deep Scan User',
    desc: 'Lakukan Deep Scan pada profil pengguna yang terindikasi untuk mendapatkan laporan analisis klinis lengkap berbasis riwayat tweet mereka.',
  },
  {
    num: '04',
    icon: Sparkles,
    color: 'from-[#00B894] to-[#55efc4]',
    title: 'Gunakan xAI Explain',
    desc: 'Klik tombol "xAI Explain" pada tweet untuk melihat penjelasan transparan mengapa AI menilai tweet tersebut berisiko.',
  },
];

function TutorialModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] p-8 pb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
          >
            <X size={16} />
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
              <Shield size={10} /> panduan penggunaan
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">cara pakai<br />celestx.</h2>
            <p className="text-white/70 text-[11px] font-medium mt-2">4 langkah mudah untuk mulai menganalisis.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className={`bg-gradient-to-br ${step.color} p-2.5 rounded-xl shrink-0 shadow-sm`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{step.num}</span>
                    <p className="text-sm font-black text-[#2D3436]">{step.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-2xl">
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Shield size={10} /> catatan penting
          </p>
          <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
            CelestX adalah <strong>alat bantu klinis (CDSS)</strong>, bukan pengganti diagnosis medis. Selalu konsultasikan hasil dengan psikolog atau psikiater berlisensi.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Landing({ onNavigate }) {
  const [showModal, setShowModal] = useState(false);

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
          sistem deteksi dini indikasi emosi negatif di media sosial.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-5">
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

        {/* How to Use Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-[#6C5CE7] transition-all uppercase tracking-widest group"
        >
          <HelpCircle size={14} className="group-hover:scale-110 transition-transform" />
          cara penggunaan
        </button>

      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 CelestX.</p>
      </div>

      {/* Tutorial Modal */}
      {showModal && <TutorialModal onClose={() => setShowModal(false)} />}

    </div>
  );
}
