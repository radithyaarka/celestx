import React from 'react';
import { LayoutDashboard, History, Cloud, BarChart3, Settings, Users } from 'lucide-react';

export function Sidebar({ currentPage, setCurrentPage, previousPage }) {
  const navItems = [
    { id: 'dashboard', label: 'dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'history', icon: History },
    { id: 'users', label: 'users', icon: Users },
    { id: 'insights', label: 'insights', icon: BarChart3 },
    { id: 'settings', label: 'pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white border-r border-black/5 h-screen sticky top-0 flex-col p-8 hidden md:flex shrink-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="p-1 w-12 h-12 flex items-center justify-center">
          <img src="/logo.png" alt="CelestX" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#2D3436] tracking-tighter leading-none font-serif italic">celestx.</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight lowercase">spotting the clouds, before the storm.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (currentPage === 'user-analysis' && previousPage === item.id);
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold lowercase ${isActive
                ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-black/5">
        <p className="text-[10px] text-slate-400 text-center font-medium lowercase">celestx v1.0.0</p>
      </div>
    </aside>
  );
}
