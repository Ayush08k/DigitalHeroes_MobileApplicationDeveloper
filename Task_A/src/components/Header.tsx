import React from 'react';
import { useOrders } from '../context/OrderContext';
import { Wifi, WifiOff, RefreshCw, Layers, Sliders, ShieldCheck, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const {
    isOnline,
    setIsOnline,
    syncQueue,
    isSyncing,
    triggerManualSync,
    activeScreen,
    setActiveScreen
  } = useOrders();

  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* App Brand Logo */}
        <div
          onClick={() => setActiveScreen('list')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PulseOrder
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Offline 1st
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Liquid 90FPS Sync Engine
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveScreen('list')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScreen === 'list' || activeScreen === 'detail'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveScreen('status-wizard')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScreen === 'status-wizard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Status Flow</span>
          </button>
          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScreen === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sync Hub</span>
          </button>
        </nav>

        {/* Network & Queue Controls */}
        <div className="flex items-center gap-3">
          {/* Offline/Online Toggle Button */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={isOnline ? 'Switch to Offline Mode' : 'Switch to Online Mode'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
            }`}
          >
            {isOnline ? (
              <>
                <span className="indicator-online" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <span className="indicator-offline" />
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Offline Mode</span>
              </>
            )}
          </button>

          {/* Sync Button & Queue Counter */}
          <button
            onClick={triggerManualSync}
            disabled={!isOnline || isSyncing}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              syncQueue.length > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            
            {syncQueue.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-amber-500 text-black shadow-sm shadow-amber-500/50"
              >
                {syncQueue.length}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
