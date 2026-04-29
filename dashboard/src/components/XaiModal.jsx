import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, MessageSquare, TrendingUp, Shield } from 'lucide-react';

export function XaiModal({ xaiData, setXaiData }) {
    if (!xaiData) return null;

    const getHighlightStyle = (score) => {
        if (score > 0.01) {
            const intensity = Math.min(1, score / 0.3);
            return {
                backgroundColor: `rgba(108, 92, 231, ${0.1 + intensity * 0.3})`,
                borderBottom: `${Math.max(2, intensity * 4)}px solid rgba(108, 92, 231, ${0.5 + intensity * 0.5})`,
                fontWeight: intensity > 0.3 ? '900' : '700',
                color: '#2D3436'
            };
        } else if (score < -0.01) {
            const intensity = Math.min(1, Math.abs(score) / 0.3);
            return {
                backgroundColor: `rgba(45, 204, 113, ${intensity * 0.2})`,
                borderBottom: `${Math.max(1, intensity * 2)}px solid rgba(45, 204, 113, ${0.3 + intensity * 0.5})`,
                fontWeight: intensity > 0.1 ? '800' : '600',
                color: '#2D3436'
            };
        }
        return { 
            backgroundColor: 'transparent',
            color: '#94a3b8' 
        }; 
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setXaiData(null)} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-3xl bg-[#F8FAFC] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-black/5 bg-white flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-[#2D3436] tracking-tighter flex items-center gap-3">
                            <Sparkles size={24} className="text-[#6C5CE7]" />
                            xAI Lexical Analysis
                        </h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">SHAP-based Occlusion Sensitivity for IndoBERTweet</p>
                    </div>
                    <button 
                        onClick={() => setXaiData(null)}
                        className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white to-[#F8FAFC]">
                    
                    <div className="mb-8 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7]">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyzed Tweet</p>
                                <p className="text-sm font-bold text-[#2D3436] mt-0.5">{xaiData.originalTweet?.handle || xaiData.originalTweet?.displayName || "User"}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Confidence</p>
                                <p className="text-xl font-black text-[#6C5CE7]">
                                    {((xaiData.originalTweet?.score || xaiData.originalTweet?.confidence || 0) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        {/* The Text Analysis */}
                        <div className="text-2xl leading-relaxed text-[#2D3436] flex flex-wrap gap-x-2 gap-y-3 font-medium">
                            {xaiData.explanation.map((item, idx) => {
                                const cleanWord = item.word.replace(/##/g, '');
                                const isSubword = item.word.startsWith('##');
                                const style = getHighlightStyle(item.score);
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`group relative flex items-center justify-center ${isSubword ? '-ml-2' : ''}`}
                                    >
                                        <span 
                                            className="px-1.5 py-1 rounded-md transition-all duration-300 relative z-10"
                                            style={style}
                                        >
                                            {cleanWord}
                                        </span>
                                        
                                        {/* Tooltip (Now visible for all words) */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            <div className="bg-[#2D3436] text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-xl flex flex-col items-center gap-1 min-w-[80px]">
                                                <span className="uppercase tracking-widest text-white/50">
                                                    {item.score > 0.01 ? 'Depression' : item.score < -0.01 ? 'Stabilizer' : 'Neutral'}
                                                </span>
                                                <span className={item.score > 0.01 ? 'text-[#6C5CE7]' : item.score < -0.01 ? 'text-[#2ecc71]' : 'text-slate-300'}>
                                                    {item.score > 0 ? '+' : ''}{(item.score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-2 h-2 bg-[#2D3436] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Interpretation */}
                    <div className="mb-8 p-6 bg-[#6C5CE7]/5 rounded-3xl border border-[#6C5CE7]/10 flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] shrink-0 mt-1">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] mb-2">AI Interpretation</h4>
                            <p className="text-sm leading-relaxed text-[#2D3436] font-medium">
                                {(() => {
                                    const drivers = [...xaiData.explanation].filter(item => item.score > 0.05).sort((a, b) => b.score - a.score);
                                    const stabilizers = [...xaiData.explanation].filter(item => item.score < -0.05).sort((a, b) => a.score - b.score);
                                    const risk = xaiData.originalTweet?.score || xaiData.originalTweet?.confidence || 0;
                                    
                                    const textLen = (xaiData.originalTweet?.text || "").length;
                                    const variation = textLen % 3;

                                    if (risk > 0.5 && drivers.length > 0) {
                                        const topWords = drivers.slice(0, 2).map(d => `"${d.word.replace(/##/g, '')}"`).join(' dan ');
                                        if (variation === 0) return `Model IndoBERTweet sangat yakin teks ini mengindikasikan depresi berat. Kemunculan kata ${topWords} menjadi pemicu utama yang melambungkan skor risiko secara drastis.`;
                                        if (variation === 1) return `Berdasarkan analisis bobot kata (SHAP), kalimat ini masuk kategori krisis. Model mendeteksi bahwa kata ${topWords} memiliki pengaruh emosional terburuk di dalam teks.`;
                                        return `Tingkat keparahan klinis pada teks ini dinilai sangat tinggi oleh AI. Kata ${topWords} menjadi kontributor dominan yang merusak sentimen keseluruhan kalimat.`;
                                    } else if (risk > 0.15 && drivers.length > 0) {
                                        const topWords = drivers.slice(0, 1).map(d => `"${d.word.replace(/##/g, '')}"`).join('');
                                        if (variation === 0) return `Terdapat indikasi depresi ringan hingga sedang pada kalimat ini. Kata ${topWords} memberikan sinyal negatif yang cukup menonjol hingga melewati ambang batas indikasi klinis model.`;
                                        if (variation === 1) return `Model menangkap adanya nuansa depresif pada teks ini, dengan kata ${topWords} sebagai faktor utama yang membuat sentimen bergeser ke arah negatif.`;
                                        return `Analisis menunjukkan bahwa kalimat ini tidak sepenuhnya stabil. Penggunaan kata ${topWords} menjadi alasan utama mengapa model memunculkan peringatan klinis (alert).`;
                                    } else if (risk <= 0.15 && stabilizers.length > 0) {
                                        const topWords = stabilizers.slice(0, 1).map(d => `"${d.word.replace(/##/g, '')}"`).join('');
                                        if (variation === 0) return `Teks diklasifikasikan sebagai stabil. Penggunaan kata bernuansa netral/penstabil seperti ${topWords} berhasil menekan persentase risiko hingga berada di zona aman.`;
                                        if (variation === 1) return `Tidak ada indikasi depresi serius yang terdeteksi. Malahan, kata ${topWords} menetralkan emosi dalam kalimat ini sehingga model menganggapnya sebagai cuitan biasa.`;
                                        return `Skor risiko klinis sangat rendah. Model menilai bahwa kata ${topWords} berperan besar dalam menjaga stabilitas emosional teks ini.`;
                                    } else if (risk <= 0.15) {
                                        if (variation === 0) return `Model tidak mendeteksi adanya pola leksikal depresif yang spesifik pada teks ini, sehingga dianggap sebagai interaksi wajar.`;
                                        if (variation === 1) return `Analisis SHAP menunjukkan bahwa teks ini sangat datar/netral secara emosional. Tidak ada kata yang memicu indikator depresi.`;
                                        return `Kalimat ini tergolong normal dan aman. Model tidak menemukan adanya kata-kata yang mengarah pada gejala klinis depresi.`;
                                    }
                                    return `Teks memiliki sinyal emosi yang bercampur, namun secara keseluruhan model menyimpulkan tingkat risiko sebesar ${(risk*100).toFixed(0)}%.`;
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100">
                            <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2"><TrendingUp size={14} /> Top Depression Drivers</h4>
                            <div className="space-y-3">
                                {[...xaiData.explanation]
                                    .filter(item => item.score > 0.05)
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 3)
                                    .map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-rose-50">
                                            <span className="font-bold text-[#2D3436]">{item.word.replace(/##/g, '')}</span>
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">+{((item.score)*100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                {xaiData.explanation.filter(item => item.score > 0.05).length === 0 && (
                                    <p className="text-sm text-rose-300 italic font-medium">No strong clinical drivers identified.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-[#2ecc71]/5 rounded-3xl border border-[#2ecc71]/20">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#2ecc71]/80 mb-4 flex items-center gap-2"><Shield size={14} /> Normalization Factors</h4>
                            <div className="space-y-3">
                                {[...xaiData.explanation]
                                    .filter(item => item.score < -0.05)
                                    .sort((a, b) => a.score - b.score)
                                    .slice(0, 3)
                                    .map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#2ecc71]/10">
                                            <span className="font-bold text-[#2D3436]">{item.word.replace(/##/g, '')}</span>
                                            <span className="text-[10px] font-black text-[#2ecc71] bg-[#2ecc71]/10 px-2 py-1 rounded-lg">-{((Math.abs(item.score))*100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                {xaiData.explanation.filter(item => item.score < -0.05).length === 0 && (
                                    <p className="text-sm text-[#2ecc71]/60 italic font-medium">No significant stabilizing words found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
