import { mockApi } from './mockApi';
import { OfflineStorage } from './offlineStorage';
import type { SyncMutation, Order, ConflictResolutionPolicy } from '../types/order';

export interface SyncEngineResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  conflicts: { mutation: SyncMutation; serverOrder: Order }[];
}

export class SyncEngine {
  private isSyncing = false;
  private conflictPolicy: ConflictResolutionPolicy = 'client-wins';

  public setConflictPolicy(policy: ConflictResolutionPolicy) {
    this.conflictPolicy = policy;
  }

  public getConflictPolicy(): ConflictResolutionPolicy {
    return this.conflictPolicy;
  }

  public async processQueue(isOnline: boolean): Promise<SyncEngineResult> {
    const result: SyncEngineResult = {
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      conflicts: []
    };

    if (!isOnline || this.isSyncing) {
      return result;
    }

    this.isSyncing = true;
    const queue = OfflineStorage.getSyncQueue();

    if (queue.length === 0) {
      this.isSyncing = false;
      return result;
    }

    const remainingQueue: SyncMutation[] = [];

    for (const mutation of queue) {
      result.processedCount++;
      try {
        if (mutation.type === 'UPDATE_STATUS') {
          const serverOrder = await mockApi.fetchOrderById(mutation.orderId);

          if (!serverOrder) {
            // Server deleted or order doesn't exist
            mutation.status = 'failed';
            mutation.error = 'Order not found on server';
            result.failedCount++;
            remainingQueue.push(mutation);
            continue;
          }

          // Check version for conflict
          const localCached = OfflineStorage.getCachedOrders().find((o) => o.id === mutation.orderId);
          if (localCached && serverOrder.version > localCached.version) {
            if (this.conflictPolicy === 'server-wins') {
              // Server wins: discard local mutation and accept server state
              OfflineStorage.saveSingleOrderLocally(serverOrder);
              result.successCount++;
              continue;
            } else if (this.conflictPolicy === 'manual') {
              result.conflicts.push({ mutation, serverOrder });
              mutation.status = 'conflict';
              remainingQueue.push(mutation);
              continue;
            }
          }

          // Client-wins or resolved: push status update to server
          const updatedServerOrder = await mockApi.updateOrderStatus(
            mutation.orderId,
            mutation.payload.status || 'pending',
            'Offline Sync Engine'
          );

          // Update local cache with authoritative server order
          OfflineStorage.saveSingleOrderLocally(updatedServerOrder);
          result.successCount++;

        } else if (mutation.type === 'CREATE_ORDER') {
          const newOrderPayload = mutation.payload as Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
          const createdServerOrder = await mockApi.createOrder(newOrderPayload);
          
          // Replace temporary optimistic order with server-confirmed order
          const localOrders = OfflineStorage.getCachedOrders().filter((o) => o.id !== mutation.orderId);
          localOrders.unshift(createdServerOrder);
          OfflineStorage.setCachedOrders(localOrders);

          result.successCount++;
        } else if (mutation.type === 'UPDATE_ORDER') {
          const updated = await mockApi.updateOrder(mutation.orderId, mutation.payload);
          OfflineStorage.saveSingleOrderLocally(updated);
          result.successCount++;
        }
      } catch (err: any) {
        mutation.retryCount++;
        mutation.status = 'failed';
        mutation.error = err.message || 'Sync error occurred';
        result.failedCount++;
        remainingQueue.push(mutation);
      }
    }

    OfflineStorage.setSyncQueue(remainingQueue);
    OfflineStorage.setLastSyncTime(new Date().toISOString());
    this.isSyncing = false;
    return result;
  }
}

export const syncEngine = new SyncEngine();
