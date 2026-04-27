import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { UserAnalysis } from './pages/UserAnalysis';
import { Settings } from './pages/Settings';
import { Insights } from './pages/Insights';
import { Users } from './pages/Users';
import { Cloud, Menu } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('history'); // Track where we came from
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const migrated = localStorage.getItem('sentimenta_migrated');
    if (!migrated) {
      const oldData = localStorage.getItem('sentimenta_history');
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          chrome.storage.local.get(['sentimenta_history'], (storage) => {
            const existing = storage.sentimenta_history || [];
            if (existing.length === 0) {
              chrome.storage.local.set({ sentimenta_history: parsed });
            }
          });
        } catch(e) {}
      }
      localStorage.setItem('sentimenta_migrated', 'true');
    }
  }, []);

  const handleOpenAnalysis = (data, fromPage = 'history') => {
    setAnalysisData(data);
    setPreviousPage(fromPage);
    setCurrentPage('user-analysis');
  };

  const navigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#2D3436] selection:bg-[#6C5CE7]/20 flex lowercase">
      {/* Background Decorative Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C5CE7]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#74B9FF]/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={navigate} 
        previousPage={previousPage}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center p-6 border-b border-black/5 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-lg shadow-[#6C5CE7]/10 border border-black/5 overflow-hidden w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="CelestX" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-[#2D3436] tracking-tighter">celestx.</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#2D3436]">
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-black/5 p-4 flex flex-col gap-2 absolute top-[80px] w-full z-40">
             <button onClick={() => navigate('dashboard')} className={`px-4 py-3 rounded-xl font-medium text-left ${currentPage === 'dashboard' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-slate-500'}`}>dashboard</button>
             <button onClick={() => navigate('history')} className={`px-4 py-3 rounded-xl font-medium text-left ${currentPage === 'history' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-slate-500'}`}>history</button>
             <button onClick={() => navigate('users')} className={`px-4 py-3 rounded-xl font-medium text-left ${currentPage === 'users' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-slate-500'}`}>analyzed users</button>
             <button onClick={() => navigate('insights')} className={`px-4 py-3 rounded-xl font-medium text-left ${currentPage === 'insights' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-slate-500'}`}>insights</button>
             <button onClick={() => navigate('settings')} className={`px-4 py-3 rounded-xl font-medium text-left ${currentPage === 'settings' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-slate-500'}`}>settings</button>
          </div>
        )}

        <main className="flex-1 p-6">
          {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {currentPage === 'history' && <History onScanComplete={(data) => handleOpenAnalysis(data, 'history')} />}
          {currentPage === 'insights' && <Insights onScanComplete={(data) => handleOpenAnalysis(data, 'insights')} />}
          {currentPage === 'users' && <Users onSelectUser={(data) => handleOpenAnalysis(data, 'users')} />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'user-analysis' && (
            <UserAnalysis 
              data={analysisData} 
              onBack={() => setCurrentPage(previousPage)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;