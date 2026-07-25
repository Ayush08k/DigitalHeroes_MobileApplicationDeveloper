import React from 'react';
import { useOrders } from '../context/OrderContext';
import { Order, OrderStatus } from '../types/order';
import { Search, Filter, ArrowUpDown, ChevronRight, AlertCircle, Clock, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' }
];

export const OrderListScreen: React.FC = () => {
  const {
    orders,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    setSelectedOrder,
    setActiveScreen,
    syncQueue
  } = useOrders();

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
    if (sortBy === 'priority') {
      const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    return 0;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'badge-status badge-pending';
      case 'processing': return 'badge-status badge-processing';
      case 'shipped': return 'badge-status badge-shipped';
      case 'delivered': return 'badge-status badge-delivered';
      case 'cancelled': return 'badge-status badge-cancelled';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    };
    return `px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors[priority] || colors.low}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Control Bar */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="amount">Largest Amount</option>
            </select>
          </div>
        </div>

        {/* Liquid Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white bg-indigo-600 shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <AnimatePresence mode="popLayout">
        {sortedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-12 text-center space-y-3"
          >
            <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Orders Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              No matching orders found for current filter or search criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedOrders.map((order) => {
              const isQueuedMutation = syncQueue.some((m) => m.orderId === order.id);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setActiveScreen('detail');
                  }}
                  className="glass-panel glass-panel-interactive p-5 cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden"
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.customer.avatar}
                        alt={order.customer.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                            {order.orderNumber}
                          </h4>
                          {isQueuedMutation && (
                            <span
                              title="Offline Pending Mutation"
                              className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30"
                            >
                              <Clock className="w-3 h-3 animate-spin" /> Sync Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {order.customer.name}
                        </p>
                      </div>
                    </div>

                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Line Summary */}
                  <div className="bg-black/30 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300 border border-white/5">
                    <div>
                      <span className="text-slate-400 font-normal">Items: </span>
                      <span className="font-semibold text-white">
                        {order.items.map((i) => i.name).join(', ')}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-slate-400 font-normal">Total: </span>
                      <span className="font-extrabold text-indigo-300 text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer info */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className={getPriorityBadge(order.priority)}>
                        {order.priority.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
