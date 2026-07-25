import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import type { ConflictResolutionPolicy } from '../types/order';
import { ShieldCheck, RefreshCw, Trash2, Database, Wifi, Sliders, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsScreen: React.FC = () => {
  const {
    syncQueue,
    lastSyncTime,
    conflictPolicy,
    setConflictPolicy,
    triggerManualSync,
    clearLocalDataAndReset,
    simulateNetworkLatency,
    simulateNetworkFailure,
    isOnline
  } = useOrders();

  const [latencyInput, setLatencyInput] = useState<number>(300);
  const [failureRateInput, setFailureRateInput] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to clear local offline storage and reset mock server to default demo dataset?')) {
      setIsResetting(true);
      await clearLocalDataAndReset();
      setIsResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Title Header */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Offline Sync Engine & Settings
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Inspect pending mutation queue, conflict rules, and simulate network behavior.
            </p>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={!isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-40"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Flush Queue</span>
          </button>
        </div>

        {/* Sync Queue Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Active Offline Mutation Queue
            </h3>
            <span className="text-xs text-slate-400">
              Last Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
            </span>
          </div>

          {syncQueue.length === 0 ? (
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Queue is empty. All local state is fully synchronized with mock API.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {syncQueue.map((m) => (
                <div
                  key={m.id}
                  className="bg-black/40 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{m.type}</span>
                      <span className="text-slate-400">Order #{m.orderId}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Queued: {new Date(m.timestamp).toLocaleTimeString()} • Retries: {m.retryCount}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conflict Resolution Strategy */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> Conflict Resolution Policy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'client-wins',
                title: 'Client Wins (Default)',
                desc: 'Local offline updates override server timestamp.'
              },
              {
                id: 'server-wins',
                title: 'Server Wins',
                desc: 'Server state overwrites local optimistic state.'
              },
              {
                id: 'manual',
                title: 'Manual Resolution',
                desc: 'Flag conflicts in queue for human intervention.'
              }
            ].map((policy) => (
              <div
                key={policy.id}
                onClick={() => setConflictPolicy(policy.id as ConflictResolutionPolicy)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  conflictPolicy === policy.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <p className="font-bold text-xs text-white">{policy.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{policy.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Network Fault Simulator */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-indigo-400" /> Network Simulation Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-4 rounded-2xl border border-white/5 text-xs">
            <div>
              <label className="font-semibold text-slate-300">API Latency: {latencyInput} ms</label>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={latencyInput}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLatencyInput(val);
                  simulateNetworkLatency(val);
                }}
                className="w-full mt-2 accent-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Failure Rate: {(failureRateInput * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={failureRateInput}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFailureRateInput(val);
                  simulateNetworkFailure(val);
                }}
                className="w-full mt-2 accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Reset Storage */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Reset Local Database & Server</p>
            <p className="text-[11px] text-slate-400">Purges all local storage keys and restores seed dataset.</p>
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
