import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineStorage } from '../services/offlineStorage';
import { syncEngine } from '../services/syncEngine';
import { mockApi, INITIAL_ORDERS } from '../services/mockApi';

describe('Task A - Offline Sync Engine & Persistence Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    await mockApi.resetServerState();
  });

  it('should store and retrieve cached orders locally', () => {
    OfflineStorage.setCachedOrders(INITIAL_ORDERS);
    const cached = OfflineStorage.getCachedOrders();
    expect(cached.length).toBe(INITIAL_ORDERS.length);
    expect(cached[0].id).toBe(INITIAL_ORDERS[0].id);
  });

  it('should enqueue mutations into the sync queue when offline', () => {
    const mutation = OfflineStorage.enqueueMutation({
      type: 'UPDATE_STATUS',
      orderId: 'ord-101',
      payload: { status: 'delivered' }
    });

    const queue = OfflineStorage.getSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(mutation.id);
    expect(queue[0].status).toBe('pending');
  });

  it('should process queue and update server state when online', async () => {
    OfflineStorage.setCachedOrders(INITIAL_ORDERS);
    OfflineStorage.enqueueMutation({
      type: 'UPDATE_STATUS',
      orderId: 'ord-101',
      payload: { status: 'shipped' }
    });

    const syncResult = await syncEngine.processQueue(true);
    expect(syncResult.successCount).toBe(1);
    expect(syncResult.failedCount).toBe(0);

    const remainingQueue = OfflineStorage.getSyncQueue();
    expect(remainingQueue.length).toBe(0);

    const updatedServerOrder = await mockApi.fetchOrderById('ord-101');
    expect(updatedServerOrder?.status).toBe('shipped');
  });

  it('should not process queue when offline', async () => {
    OfflineStorage.enqueueMutation({
      type: 'UPDATE_STATUS',
      orderId: 'ord-101',
      payload: { status: 'delivered' }
    });

    const syncResult = await syncEngine.processQueue(false);
    expect(syncResult.processedCount).toBe(0);
    expect(OfflineStorage.getSyncQueue().length).toBe(1);
  });
});
