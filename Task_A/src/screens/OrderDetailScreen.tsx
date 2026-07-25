import React from 'react';
import { useOrders } from '../context/OrderContext';
import type { OrderStatus } from '../types/order';
import { ArrowLeft, User, Phone, Mail, MapPin, Package, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderDetailScreen: React.FC = () => {
  const { selectedOrder, setActiveScreen } = useOrders();

  if (!selectedOrder) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-slate-400">No order selected.</p>
        <button
          onClick={() => setActiveScreen('list')}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white"
        >
          Back to Order List
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'badge-status badge-pending';
      case 'processing': return 'badge-status badge-processing';
      case 'shipped': return 'badge-status badge-shipped';
      case 'delivered': return 'badge-status badge-delivered';
      case 'cancelled': return 'badge-status badge-cancelled';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-16"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveScreen('list')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <button
          onClick={() => setActiveScreen('status-wizard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Update Status Flow</span>
        </button>
      </div>

      {/* Main Order Details Card */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {selectedOrder.orderNumber}
              </h2>
              <span className={getStatusBadge(selectedOrder.status)}>
                {selectedOrder.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Created on {new Date(selectedOrder.createdAt).toLocaleString()} • Version v{selectedOrder.version}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400 font-medium">Total Order Value</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
              ${selectedOrder.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Customer & Shipping Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Profile
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={selectedOrder.customer.avatar}
                alt={selectedOrder.customer.name}
                className="w-12 h-12 rounded-full object-cover border border-indigo-500/30"
              />
              <div>
                <p className="font-bold text-white text-sm">{selectedOrder.customer.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" /> {selectedOrder.customer.email}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {selectedOrder.customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Dispatch Location
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {selectedOrder.customer.address}
            </p>
            {selectedOrder.notes && (
              <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 italic">
                Note: {selectedOrder.notes}
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" /> Line Items
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 font-semibold">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {selectedOrder.items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-white">{item.name}</td>
                    <td className="p-3 text-slate-400">{item.category}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-300">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Audit Timeline & History
          </h4>
          <div className="space-y-2">
            {selectedOrder.timeline.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <div>
                    <p className="font-semibold text-slate-200">{entry.note}</p>
                    <p className="text-[10px] text-slate-400">Actor: {entry.actor}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
