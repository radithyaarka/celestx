export const SeverityBadge = ({ label }) => {
    const isIndicated = label === 'INDICATED' || label === 'HIGH RISK';
    const isStable = label === 'NORMAL' || label === 'STABLE';
    
    return (
        <div className={`inline-flex items-center px-6 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] lowercase border ${
            isIndicated 
            ? 'bg-rose-50 text-rose-500 border-rose-100 shadow-sm' 
            : isStable 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
            : 'bg-slate-50 text-slate-400 border-black/5 shadow-sm'
        }`}>
            {label}
        </div>
    );
};