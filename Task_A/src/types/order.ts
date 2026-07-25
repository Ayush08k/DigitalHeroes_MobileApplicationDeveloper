export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

export interface OrderTimeline {
  timestamp: string;
  status: OrderStatus;
  note: string;
  actor: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  timeline: OrderTimeline[];
  isLocalOnly?: boolean;
  version: number;
}

export type MutationType = 'UPDATE_STATUS' | 'CREATE_ORDER' | 'UPDATE_ORDER' | 'DELETE_ORDER';

export interface SyncMutation {
  id: string;
  type: MutationType;
  orderId: string;
  payload: Partial<Order>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  error?: string;
}

export interface NetworkState {
  isOnline: boolean;
  simulatedLatencyMs: number;
  simulatedFailureRate: number; // 0 to 1
}

export type ConflictResolutionPolicy = 'client-wins' | 'server-wins' | 'manual';
