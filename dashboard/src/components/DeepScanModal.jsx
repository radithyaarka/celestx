import React, { useState } from 'react';
import { ScanSearch, X, AlertTriangle, Loader2, User, Zap, ShieldAlert } from 'lucide-react';

/**
 * DeepScanModal - muncul saat user mengklik username di Dashboard.
 * 
 * Props:
 *   targetUser  - { handle, displayName, avatarUrl } dari item yang diklik
 *   onConfirm   - fn(targetUser) => void  → dipanggil setelah user setuju
 *   onClose     - fn() => void
 *   isScanning  - boolean (untuk menampilkan loading state)
 */
export function DeepScanModal({ targetUser, onConfirm, onClose, isScanning }) {
  if (!targetUser) return null;

  const handle = targetUser.handle
    ? targetUser.handle.replace('@', '')
    : targetUser.displayName || 'unknown';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget && !isScanning) onClose(); }}
    >
      <div
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/5 animate-[modalIn_0.2s_ease-out]"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#6C5CE7] to-[#5b4bc4] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ScanSearch size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                  deep intelligence scan
                </p>
                <h3 className="text-white text-2xl font-black tracking-tighter leading-none">
                  konfirmasi analisis
                </h3>
              </div>
            </div>
            {!isScanning && (
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* User Preview */}
        <div className="px-8 py-6 border-b border-black/5">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-black/5">
            {targetUser.avatarUrl ? (
              <img
                src={targetUser.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-[1rem] border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-[1rem] bg-slate-200 flex items-center justify-center text-slate-300">
                <User size={24} />
              </div>
            )}
            <div>
              <p className="font-black text-[#2D3436] leading-none">
                {targetUser.displayName || handle}
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                @{handle}
              </p>
            </div>
            <div className="ml-auto">
              <div className="bg-[#6C5CE7]/10 px-3 py-1.5 rounded-xl border border-[#6C5CE7]/20">
                <p className="text-[9px] font-black text-[#6C5CE7] uppercase tracking-widest flex items-center gap-1.5">
                  <Zap size={10} /> target
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Sistem akan membuka tab Twitter secara otomatis, mengambil{' '}
            <span className="font-black text-[#2D3436]">50 tweet terakhir</span> dari profil ini,
            lalu menjalankan analisis klinis mendalam menggunakan model{' '}
            <span className="font-black text-[#2D3436]">IndoBERTweet</span>.
          </p>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-[11px] leading-relaxed font-medium">
              Proses ini akan membuka tab baru Twitter sementara dan menutupnya otomatis setelah selesai. Estimasi waktu: <span className="font-black">30–60 detik</span>.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-[#6C5CE7]/5 border border-[#6C5CE7]/10 p-4 rounded-2xl">
            <ShieldAlert size={16} className="text-[#6C5CE7] shrink-0 mt-0.5" />
            <p className="text-[#6C5CE7]/70 text-[11px] leading-relaxed font-medium">
              Analisis ini hanya untuk keperluan riset akademis. Hasil tidak merupakan diagnosa medis formal.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={isScanning}
            className="flex-1 py-3.5 rounded-2xl border border-black/5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            batal
          </button>
          <button
            onClick={() => onConfirm(targetUser)}
            disabled={isScanning}
            className="flex-[2] py-3.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-[#6C5CE7]/25 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                sedang memindai...
              </>
            ) : (
              <>
                <ScanSearch size={14} />
                ya, mulai deep scan
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
