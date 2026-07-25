import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { OrderStatus } from '../types/order';
import { Sliders, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ORDER_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const StatusUpdateScreen: React.FC = () => {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatusOptimistic,
    isOnline,
    setActiveScreen
  } = useOrders();

  const [activeOrderId, setActiveOrderId] = useState<string>(selectedOrder?.id || orders[0]?.id || '');
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<OrderStatus>('processing');
  const [isUpdating, setIsUpdating] = useState(false);

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const handleApplyStatus = async () => {
    if (!currentOrder) return;
    setIsUpdating(true);
    await updateOrderStatusOptimistic(currentOrder.id, selectedTargetStatus);
    setTimeout(() => {
      setIsUpdating(false);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-16"
    >
      <div className="glass-panel p-6 space-y-6">
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Status Transition Flow
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive wizard supporting instant optimistic offline execution.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isOnline ? 'Online Sync Mode' : 'Offline Deferred Queue'}
          </span>
        </div>

        {/* Order Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Order to Mutate
          </label>
          <select
            value={activeOrderId}
            onChange={(e) => {
              setActiveOrderId(e.target.value);
              const found = orders.find((o) => o.id === e.target.value);
              if (found) setSelectedOrder(found);
            }}
            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-indigo-500 transition-all"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.customer.name} (Current: {o.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {currentOrder && (
          <>
            {/* Step Wizard Visualization */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workflow Step Pipeline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ORDER_STEPS.map((step) => {
                  const isCurrent = currentOrder.status === step;
                  const isSelected = selectedTargetStatus === step;

                  return (
                    <button
                      key={step}
                      onClick={() => setSelectedTargetStatus(step)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {isCurrent ? (
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Current
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Step
                        </span>
                      )}
                      <span className="text-xs font-bold capitalize">{step}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transition Preview & Execute Action */}
            <div className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">From:</span>
                  <span className="px-3 py-1 rounded-xl bg-white/10 text-white capitalize">
                    {currentOrder.status}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-400" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">To:</span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white capitalize shadow-md shadow-indigo-500/30">
                    {selectedTargetStatus}
                  </span>
                </div>
              </div>

              {!isOnline && (
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    You are offline. Updating status will mutate local state immediately and push to offline sync queue.
                  </span>
                </div>
              )}

              <button
                onClick={handleApplyStatus}
                disabled={isUpdating || currentOrder.status === selectedTargetStatus}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Transition...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Apply State Transition Now</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
