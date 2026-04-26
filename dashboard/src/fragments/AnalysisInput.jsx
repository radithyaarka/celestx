import { Search, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalysisInput = ({ text, setText, onAnalyze, loading }) => {
    return (
        <div className="space-y-8">
            <div className="relative group">
                {/* Glowing Background Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-transparent to-blue-500/20 rounded-3xl blur-md transition-all duration-500 opacity-30 group-hover:opacity-60 group-focus-within:opacity-100 group-focus-within:from-orange-500/30 group-focus-within:to-blue-500/30" />
                
                {/* Textarea Container */}
                <div className="relative bg-[#020617]/60 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl transition-all duration-300 focus-within:border-orange-500/50 focus-within:bg-[#020617]/80">
                    <div className="flex items-center gap-2 mb-6 text-orange-500">
                        <Sparkles size={18} />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Teks Masukan</span>
                    </div>
                    
                    <textarea
                        className="w-full bg-transparent text-2xl md:text-3xl font-medium text-slate-200 placeholder-slate-700/80 focus:ring-0 border-none resize-none min-h-[180px] leading-relaxed outline-none"
                        placeholder="Ketikkan keluh kesah atau tweet Anda di sini..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                        <span className={`text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-md transition-colors ${
                            text.length > 0 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-white/5 text-slate-500 border border-white/5'
                        }`}>
                            {text.length} karakter
                        </span>
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: text ? 1.02 : 1 }}
                whileTap={{ scale: text ? 0.98 : 1 }}
                onClick={onAnalyze}
                disabled={loading || !text}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-[#FF8C00] to-orange-500 hover:from-orange-400 hover:to-orange-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-[#020617] font-black py-5 md:py-6 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(255,140,0,0.15)] hover:shadow-[0_0_60px_rgba(255,140,0,0.3)] disabled:shadow-none"
            >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out disabled:hidden" />
                
                <span className="relative z-10 flex items-center gap-3">
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin" size={24} />
                            <span className="text-lg tracking-wider uppercase">Menganalisis...</span>
                        </>
                    ) : (
                        <>
                            <Search size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-lg tracking-wider uppercase">Mulai Analisis Model</span>
                        </>
                    )}
                </span>
            </motion.button>
        </div>
    );
};