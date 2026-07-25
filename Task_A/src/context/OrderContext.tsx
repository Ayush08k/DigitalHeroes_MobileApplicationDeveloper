import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus, SyncMutation, ConflictResolutionPolicy } from '../types/order';
import { mockApi } from '../services/mockApi';
import { OfflineStorage } from '../services/offlineStorage';
import { syncEngine } from '../services/syncEngine';
import confetti from 'canvas-confetti';

interface OrderContextType {
  orders: Order[];
  selectedOrder: Order | null;
  activeScreen: 'list' | 'detail' | 'status-wizard' | 'settings';
  isOnline: boolean;
  isSyncing: boolean;
  syncQueue: SyncMutation[];
  lastSyncTime: string | null;
  conflictPolicy: ConflictResolutionPolicy;
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
  sortBy: 'date-desc' | 'date-asc' | 'priority' | 'amount';
  // Actions
  setIsOnline: (online: boolean) => void;
  setActiveScreen: (screen: 'list' | 'detail' | 'status-wizard' | 'settings') => void;
  setSelectedOrder: (order: Order | null) => void;
  setStatusFilter: (filter: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'date-desc' | 'date-asc' | 'priority' | 'amount') => void;
  setConflictPolicy: (policy: ConflictResolutionPolicy) => void;
  updateOrderStatusOptimistic: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  createOrderOptimistic: (orderData: Partial<Order>) => Promise<void>;
  triggerManualSync: () => Promise<void>;
  clearLocalDataAndReset: () => Promise<void>;
  simulateNetworkLatency: (ms: number) => void;
  simulateNetworkFailure: (rate: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeScreen, setActiveScreen] = useState<'list' | 'detail' | 'status-wizard' | 'settings'>('list');
  const [isOnline, setIsOnlineState] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncMutation[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [conflictPolicy, setConflictPolicyState] = useState<ConflictResolutionPolicy>('client-wins');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'priority' | 'amount'>('date-desc');

  // Sync state from storage on mount
  const refreshLocalState = useCallback(() => {
    const cached = OfflineStorage.getCachedOrders();
    setOrders(cached);
    setSyncQueue(OfflineStorage.getSyncQueue());
    setLastSyncTime(OfflineStorage.getLastSyncTime());
  }, []);

  // Initial Data Load & Initial Sync
  useEffect(() => {
    const init = async () => {
      const cached = OfflineStorage.getCachedOrders();
      if (cached.length === 0) {
        try {
          const fresh = await mockApi.fetchOrders();
          OfflineStorage.setCachedOrders(fresh);
          setOrders(fresh);
        } catch (e) {
          console.error('Failed initial fetch from mock API:', e);
        }
      } else {
        setOrders(cached);
      }
      setSyncQueue(OfflineStorage.getSyncQueue());
      setLastSyncTime(OfflineStorage.getLastSyncTime());
    };
    init();
  }, []);

  // Auto-Sync when returning Online
  const triggerManualSync = useCallback(async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    await syncEngine.processQueue(isOnline);
    refreshLocalState();
    setIsSyncing(false);
  }, [isOnline, refreshLocalState]);

  const setIsOnline = useCallback((online: boolean) => {
    setIsOnlineState(online);
    if (online) {
      triggerManualSync();
    }
  }, [triggerManualSync]);

  const setConflictPolicy = useCallback((policy: ConflictResolutionPolicy) => {
    setConflictPolicyState(policy);
    syncEngine.setConflictPolicy(policy);
  }, []);

  // Optimistic Status Update Logic
  const updateOrderStatusOptimistic = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const currentOrders = [...orders];
    const targetIndex = currentOrders.findIndex((o) => o.id === orderId);
    if (targetIndex === -1) return;

    const currentOrder = currentOrders[targetIndex];
    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...currentOrder.timeline,
        {
          timestamp: new Date().toISOString(),
          status: newStatus,
          note: `Status updated to ${newStatus.toUpperCase()} (${isOnline ? 'Online Direct' : 'Queued Offline'})`,
          actor: 'Current User'
        }
      ]
    };

    // 1. Immediately update UI state (Optimistic UI)
    currentOrders[targetIndex] = updatedOrder;
    setOrders(currentOrders);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder);
    }
    OfflineStorage.saveSingleOrderLocally(updatedOrder);

    // Confetti effect for completed/delivered status!
    if (newStatus === 'delivered') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    if (isOnline) {
      // Direct Online execution
      setIsSyncing(true);
      try {
        const serverConfirmed = await mockApi.updateOrderStatus(orderId, newStatus, 'Online User Action');
        OfflineStorage.saveSingleOrderLocally(serverConfirmed);
        refreshLocalState();
      } catch (err) {
        console.warn('Online status update failed, enqueueing to offline sync queue:', err);
        OfflineStorage.enqueueMutation({
          type: 'UPDATE_STATUS',
          orderId,
          payload: { status: newStatus }
        });
        setSyncQueue(OfflineStorage.getSyncQueue());
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Offline mode: Enqueue mutation for later sync
      OfflineStorage.enqueueMutation({
        type: 'UPDATE_STATUS',
        orderId,
        payload: { status: newStatus }
      });
      setSyncQueue(OfflineStorage.getSyncQueue());
    }
  }, [orders, selectedOrder, isOnline, refreshLocalState]);

  const createOrderOptimistic = useCallback(async (orderData: Partial<Order>) => {
    const tempId = `temp-${Date.now()}`;
    const newOrder: Order = {
      id: tempId,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: orderData.customer || {
        id: 'c-new',
        name: 'New Client',
        email: 'client@example.com',
        phone: '+1 555-0199',
        address: 'Downtown Hub, Office 4B',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      },
      items: orderData.items || [{ id: 'item-1', name: 'Standard Service Package', quantity: 1, unitPrice: 499.00, category: 'Services' }],
      totalAmount: orderData.totalAmount || 499.00,
      status: 'pending',
      priority: orderData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isLocalOnly: true,
      timeline: [
        { timestamp: new Date().toISOString(), status: 'pending', note: 'Created offline draft', actor: 'Local User' }
      ]
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    OfflineStorage.setCachedOrders(updated);

    if (isOnline) {
      setIsSyncing(true);
      try {
        const confirmed = await mockApi.createOrder(newOrder);
        const currentLocal = OfflineStorage.getCachedOrders().filter((o) => o.id !== tempId);
        currentLocal.unshift(confirmed);
        OfflineStorage.setCachedOrders(currentLocal);
        setOrders(currentLocal);
      } catch (err) {
        OfflineStorage.enqueueMutation({
          type: 'CREATE_ORDER',
          orderId: tempId,
          payload: newOrder
        });
        setSyncQueue(OfflineStorage.getSyncQueue());
      } finally {
        setIsSyncing(false);
      }
    } else {
      OfflineStorage.enqueueMutation({
        type: 'CREATE_ORDER',
        orderId: tempId,
        payload: newOrder
      });
      setSyncQueue(OfflineStorage.getSyncQueue());
    }
  }, [orders, isOnline]);

  const clearLocalDataAndReset = useCallback(async () => {
    OfflineStorage.clearAllData();
    await mockApi.resetServerState();
    const fresh = await mockApi.fetchOrders();
    OfflineStorage.setCachedOrders(fresh);
    setOrders(fresh);
    setSyncQueue([]);
    setSelectedOrder(null);
    setActiveScreen('list');
  }, []);

  const simulateNetworkLatency = useCallback((ms: number) => {
    mockApi.setLatency(ms);
  }, []);

  const simulateNetworkFailure = useCallback((rate: number) => {
    mockApi.setFailureRate(rate);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        selectedOrder,
        activeScreen,
        isOnline,
        isSyncing,
        syncQueue,
        lastSyncTime,
        conflictPolicy,
        statusFilter,
        searchQuery,
        sortBy,
        setIsOnline,
        setActiveScreen,
        setSelectedOrder,
        setStatusFilter,
        setSearchQuery,
        setSortBy,
        setConflictPolicy,
        updateOrderStatusOptimistic,
        createOrderOptimistic,
        triggerManualSync,
        clearLocalDataAndReset,
        simulateNetworkLatency,
        simulateNetworkFailure
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return ctx;
};
