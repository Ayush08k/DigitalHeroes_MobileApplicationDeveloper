import { Order, SyncMutation } from '../types/order';

const STORAGE_KEYS = {
  ORDERS_CACHE: 'dh_task_a_orders_cache',
  SYNC_QUEUE: 'dh_task_a_sync_queue',
  LAST_SYNC_TIME: 'dh_task_a_last_sync',
  NETWORK_SIMULATION: 'dh_task_a_network_sim',
  CONFLICT_POLICY: 'dh_task_a_conflict_policy'
};

export class OfflineStorage {
  // --- Cached Orders Persistence ---
  public static getCachedOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS_CACHE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse cached orders:', e);
      return [];
    }
  }

  public static setCachedOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS_CACHE, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to store cached orders:', e);
    }
  }

  public static saveSingleOrderLocally(updatedOrder: Order): Order[] {
    const orders = this.getCachedOrders();
    const index = orders.findIndex((o) => o.id === updatedOrder.id);
    if (index >= 0) {
      orders[index] = updatedOrder;
    } else {
      orders.unshift(updatedOrder);
    }
    this.setCachedOrders(orders);
    return orders;
  }

  // --- Mutation Sync Queue ---
  public static getSyncQueue(): SyncMutation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse sync queue:', e);
      return [];
    }
  }

  public static setSyncQueue(queue: SyncMutation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save sync queue:', e);
    }
  }

  public static enqueueMutation(mutation: Omit<SyncMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>): SyncMutation {
    const queue = this.getSyncQueue();
    const newMutation: SyncMutation = {
      ...mutation,
      id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };
    queue.push(newMutation);
    this.setSyncQueue(queue);
    return newMutation;
  }

  public static removeMutation(mutationId: string): void {
    const queue = this.getSyncQueue();
    const filtered = queue.filter((m) => m.id !== mutationId);
    this.setSyncQueue(filtered);
  }

  public static clearSyncQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  }

  // --- Sync Metadata ---
  public static getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  }

  public static setLastSyncTime(timestamp: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
  }

  public static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
}
