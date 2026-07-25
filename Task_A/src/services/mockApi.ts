import type { Order } from '../types/order';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-8801',
    customer: {
      id: 'cust-1',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@digitalheroes.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Sector 4, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    items: [
      { id: 'it-1', name: 'Quantum Cyber-Deck V2', quantity: 1, unitPrice: 1299.99, category: 'Hardware' },
      { id: 'it-2', name: 'Neural-Link Adapter Cable', quantity: 2, unitPrice: 49.50, category: 'Accessories' }
    ],
    totalAmount: 1398.99,
    status: 'pending',
    priority: 'urgent',
    createdAt: '2026-07-25T08:30:00Z',
    updatedAt: '2026-07-25T08:30:00Z',
    notes: 'Priority dispatch requested for product launch live demo.',
    version: 1,
    timeline: [
      { timestamp: '2026-07-25T08:30:00Z', status: 'pending', note: 'Order created via Client Portal', actor: 'Eleanor Vance' }
    ]
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-8802',
    customer: {
      id: 'cust-2',
      name: 'Marcus Sterling',
      email: 'marcus.s@nexuslabs.io',
      phone: '+1 (555) 987-6543',
      address: '100 Silicon Ave, Suite 900, San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    items: [
      { id: 'it-3', name: 'Ultra-Wide OLED Display 49"', quantity: 2, unitPrice: 1149.00, category: 'Displays' },
      { id: 'it-4', name: 'Ergonomic Mesh Task Chair', quantity: 1, unitPrice: 650.00, category: 'Furniture' }
    ],
    totalAmount: 2948.00,
    status: 'processing',
    priority: 'high',
    createdAt: '2026-07-24T14:15:00Z',
    updatedAt: '2026-07-25T09:10:00Z',
    notes: 'Requires signature upon delivery at receiving bay B.',
    version: 2,
    timeline: [
      { timestamp: '2026-07-24T14:15:00Z', status: 'pending', note: 'Order placed online', actor: 'System' },
      { timestamp: '2026-07-25T09:10:00Z', status: 'processing', note: 'Inventory reserved & payment confirmed', actor: 'Ops Team' }
    ]
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-8803',
    customer: {
      id: 'cust-3',
      name: 'Sophia Chen',
      email: 'sophia@apexdesign.co',
      phone: '+1 (555) 345-6789',
      address: '450 Innovation Parkway, Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    items: [
      { id: 'it-5', name: 'Precision Stylus Pen Max', quantity: 3, unitPrice: 129.00, category: 'Accessories' }
    ],
    totalAmount: 387.00,
    status: 'shipped',
    priority: 'medium',
    createdAt: '2026-07-23T11:00:00Z',
    updatedAt: '2026-07-24T16:45:00Z',
    notes: 'Tracking ID: DH-EXPRESS-99281X',
    version: 3,
    timeline: [
      { timestamp: '2026-07-23T11:00:00Z', status: 'pending', note: 'Order created', actor: 'Sophia Chen' },
      { timestamp: '2026-07-23T15:20:00Z', status: 'processing', note: 'Items packed in warehouse', actor: 'Robot Pack Station #4' },
      { timestamp: '2026-07-24T16:45:00Z', status: 'shipped', note: 'Handed to courier', actor: 'Courier Dispatch' }
    ]
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-2026-8804',
    customer: {
      id: 'cust-4',
      name: 'Alexander Wright',
      email: 'a.wright@quantumcloud.net',
      phone: '+1 (555) 765-4321',
      address: '12 Cyber Way, Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    items: [
      { id: 'it-6', name: 'Server Rack Mount Unit 4U', quantity: 1, unitPrice: 2450.00, category: 'Infrastructure' }
    ],
    totalAmount: 2450.00,
    status: 'delivered',
    priority: 'low',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-22T13:30:00Z',
    notes: 'Delivered directly to Data Center Room 302.',
    version: 4,
    timeline: [
      { timestamp: '2026-07-20T09:00:00Z', status: 'pending', note: 'Order created', actor: 'Alexander Wright' },
      { timestamp: '2026-07-21T10:00:00Z', status: 'processing', note: 'Processing hardware verification', actor: 'System' },
      { timestamp: '2026-07-21T18:00:00Z', status: 'shipped', note: 'In transit via Heavy Freight', actor: 'Freight Direct' },
      { timestamp: '2026-07-22T13:30:00Z', status: 'delivered', note: 'Signed & verified by Security Guard', actor: 'Freight Direct' }
    ]
  }
];

class MockApiService {
  private orders: Order[];
  private latencyMs = 300;
  private failureRate = 0.0; // 0% default failure rate for mock API

  constructor() {
    const stored = localStorage.getItem('dh_mock_server_orders');
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
      } catch {
        this.orders = [...INITIAL_ORDERS];
      }
    } else {
      this.orders = [...INITIAL_ORDERS];
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem('dh_mock_server_orders', JSON.stringify(this.orders));
  }

  private async delay() {
    if (this.latencyMs > 0) {
      await new Promise((res) => setTimeout(res, this.latencyMs));
    }
    if (Math.random() < this.failureRate) {
      throw new Error('SIMULATED_NETWORK_FAILURE: Server failed to process request');
    }
  }

  public setLatency(ms: number) {
    this.latencyMs = ms;
  }

  public setFailureRate(rate: number) {
    this.failureRate = rate;
  }

  public async fetchOrders(): Promise<Order[]> {
    await this.delay();
    return JSON.parse(JSON.stringify(this.orders));
  }

  public async fetchOrderById(id: string): Promise<Order | null> {
    await this.delay();
    const found = this.orders.find((o) => o.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async updateOrderStatus(id: string, newStatus: Order['status'], actor = 'System Agent'): Promise<Order> {
    await this.delay();
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order ${id} not found on server`);
    }

    const order = this.orders[index];
    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      version: order.version + 1,
      timeline: [
        ...order.timeline,
        {
          timestamp: new Date().toISOString(),
          status: newStatus,
          note: `Status updated to ${newStatus.toUpperCase()}`,
          actor
        }
      ]
    };

    this.orders[index] = updatedOrder;
    this.persist();
    return JSON.parse(JSON.stringify(updatedOrder));
  }

  public async updateOrder(id: string, payload: Partial<Order>): Promise<Order> {
    await this.delay();
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order ${id} not found on server`);
    }

    const current = this.orders[index];
    const updatedOrder: Order = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
      version: current.version + 1,
    };

    this.orders[index] = updatedOrder;
    this.persist();
    return JSON.parse(JSON.stringify(updatedOrder));
  }

  public async createOrder(newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Order> {
    await this.delay();
    const created: Order = {
      ...newOrder,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      timeline: newOrder.timeline || [
        {
          timestamp: new Date().toISOString(),
          status: newOrder.status,
          note: 'Order created',
          actor: 'Offline App User'
        }
      ]
    };

    this.orders.unshift(created);
    this.persist();
    return JSON.parse(JSON.stringify(created));
  }

  public async resetServerState() {
    this.orders = [...INITIAL_ORDERS];
    this.persist();
  }
}

export const mockApi = new MockApiService();
