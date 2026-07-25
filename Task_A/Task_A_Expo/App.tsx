import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Linking,
  Modal,
  BackHandler,
  Animated
} from 'react-native';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  items: OrderItem[];
  createdAt: string;
  notes?: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2026-8801',
    customerName: 'Eleanor Vance',
    email: 'eleanor@digitalheroes.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Sector 4, CA',
    totalAmount: 1398.99,
    status: 'pending',
    priority: 'urgent',
    createdAt: '2026-07-25 08:30',
    notes: 'Urgent delivery for live keynote demo',
    items: [
      { name: 'Quantum Cyber-Deck V2', qty: 1, price: 1299.99 },
      { name: 'Neural-Link Cable', qty: 2, price: 49.50 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-8802',
    customerName: 'Marcus Sterling',
    email: 'marcus@nexuslabs.io',
    phone: '+1 (555) 987-6543',
    address: '100 Silicon Ave, Suite 900, SF, CA',
    totalAmount: 2948.00,
    status: 'processing',
    priority: 'high',
    createdAt: '2026-07-24 14:15',
    notes: 'Require signature at dock B',
    items: [
      { name: 'Ultra-Wide OLED Display 49"', qty: 2, price: 1149.00 },
      { name: 'Ergonomic Mesh Task Chair', qty: 1, price: 650.00 }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-8803',
    customerName: 'Sophia Chen',
    email: 'sophia@apexdesign.co',
    phone: '+1 (555) 345-6789',
    address: '450 Innovation Parkway, Austin, TX',
    totalAmount: 387.00,
    status: 'shipped',
    priority: 'medium',
    createdAt: '2026-07-23 11:00',
    items: [
      { name: 'Precision Stylus Pen Max', qty: 3, price: 129.00 }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-2026-8804',
    customerName: 'Alexander Wright',
    email: 'alex@quantumcloud.net',
    phone: '+1 (555) 765-4321',
    address: '12 Cyber Way, Seattle, WA',
    totalAmount: 2450.00,
    status: 'delivered',
    priority: 'low',
    createdAt: '2026-07-20 09:00',
    items: [
      { name: 'Server Rack Mount Unit 4U', qty: 1, price: 2450.00 }
    ]
  },
];

export default function App() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'flow' | 'profile'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order>(INITIAL_ORDERS[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<{ id: string; desc: string }[]>([]);

  // Cool Glass Modal Popup State
  const [coolModalVisible, setCoolModalVisible] = useState(false);
  // Screen Transition Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (nextTab: 'list' | 'detail' | 'flow' | 'profile') => {
    if (nextTab === activeTab) return;
    
    // Fade out & slide down slightly
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 120,
        useNativeDriver: true,
      })
    ]).start(() => {
      setActiveTab(nextTab);
      slideAnim.setValue(-10);
      // Fade in & slide up into place
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  // Handle Physical Android Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (coolModalVisible) {
        setCoolModalVisible(false);
        return true;
      }
      if (activeTab !== 'list') {
        setActiveTab('list');
        return true;
      }
      return false; // Allow exit only when on main list screen
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab, coolModalVisible]);

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Action 1: Status Mutation
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
    if (!isOnline) {
      setSyncQueue((q) => [
        ...q,
        { id: `${Date.now()}`, desc: `Update #${orderId} status to ${newStatus.toUpperCase()}` }
      ]);
    }
    triggerCoolPopup('Status Updated!', `Order #${orderId} state transitioned to ${newStatus.toUpperCase()} seamlessly.`, '⚡ OPTIMISTIC MUTATION');
  };

  // Action 2: Add New Order Item
  const addItemToSelectedOrder = () => {
    const newItem: OrderItem = { name: 'Express Freight Protection', qty: 1, price: 49.00 };
    const updatedItems = [...selectedOrder.items, newItem];
    const newTotal = selectedOrder.totalAmount + 49.00;
    const updatedOrder = { ...selectedOrder, items: updatedItems, totalAmount: newTotal };

    setSelectedOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));
    triggerCoolPopup('Item Appended', 'Express Freight Protection ($49.00) successfully added to line items.', '📦 ITEM ADDED');
  };

  // Action 3: Create New Fast Draft Order
  const createNewDraftOrder = () => {
    const newId = `${orders.length + 1}`;
    const newOrd: Order = {
      id: newId,
      orderNumber: `ORD-2026-990${newId}`,
      customerName: 'New Client Express',
      email: 'express@client.com',
      phone: '+1 (555) 000-1122',
      address: '77 Logistics Blvd, Suite 10',
      totalAmount: 599.00,
      status: 'pending',
      priority: 'high',
      createdAt: 'Just Now',
      items: [{ name: 'Standard Maintenance Package', qty: 1, price: 599.00 }]
    };
    setOrders([newOrd, ...orders]);
    setSelectedOrder(newOrd);
    setActiveTab('detail');
    if (!isOnline) {
      setSyncQueue((q) => [...q, { id: `${Date.now()}`, desc: `Create Order #${newOrd.orderNumber}` }]);
    }
    triggerCoolPopup('Order Draft Created', `New order ${newOrd.orderNumber} added to logistics pipeline.`, '🚀 DRAFT CREATED');
  };

  // Action 4: Flush Sync Queue
  const flushSyncQueue = () => {
    const count = syncQueue.length;
    setSyncQueue([]);
    triggerCoolPopup('Sync Completed', `Flushed and synchronized ${count} offline mutation payload(s) with remote server!`, '🔄 AUTO-SYNC');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>PulseOrder</Text>
            <Text style={styles.brandSubtitle}>Offline-First Mobile App</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.networkBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <View style={[styles.dot, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.networkText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN ANIMATED SCREEN VIEW */}
      <Animated.View
        style={[
          styles.mainBody,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* SCREEN 1: LIST WITH FILTERING */}
        {activeTab === 'list' && (
          <ScrollView style={styles.scrollContent}>
            <View style={styles.titleRow}>
              <Text style={styles.screenHeading}>Order Management</Text>
              <TouchableOpacity style={styles.addOrderBtn} onPress={createNewDraftOrder}>
                <Text style={styles.addOrderBtnText}>+ New Order</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order # or customer..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Status Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map((st) => (
                <TouchableOpacity
                  key={st}
                  activeOpacity={0.7}
                  style={[styles.filterPill, filterStatus === st && styles.activeFilterPill]}
                  onPress={() => setFilterStatus(st)}
                >
                  <Text style={[styles.filterPillText, filterStatus === st && styles.activeFilterPillText]}>
                    {st.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Order Cards */}
            {filteredOrders.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.card}
                onPress={() => {
                  setSelectedOrder(item);
                  handleTabChange('detail');
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{item.customerName}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.priorityText}>Priority: {item.priority.toUpperCase()}</Text>
                  <Text style={styles.amountText}>${item.totalAmount.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* SCREEN 2: DETAIL */}
        {activeTab === 'detail' && (
          <ScrollView style={styles.scrollContent}>
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.detailTitle}>{selectedOrder.orderNumber}</Text>
                <View style={[styles.statusBadge, getStatusStyle(selectedOrder.status)]}>
                  <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.detailDate}>Created: {selectedOrder.createdAt}</Text>

              <View style={styles.sectionDivider} />

              <Text style={styles.sectionHeading}>Customer Details</Text>
              <Text style={styles.detailText}>Name: {selectedOrder.customerName}</Text>
              <Text style={styles.detailText}>Email: {selectedOrder.email}</Text>
              <Text style={styles.detailText}>Phone: {selectedOrder.phone}</Text>
              <Text style={styles.detailText}>Dispatch Address: {selectedOrder.address}</Text>

              {selectedOrder.notes && (
                <Text style={styles.notesText}>Note: {selectedOrder.notes}</Text>
              )}

              <View style={styles.sectionDivider} />

              <View style={styles.titleRow}>
                <Text style={styles.sectionHeading}>Line Items</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={addItemToSelectedOrder}>
                  <Text style={styles.smallBtnText}>+ Add Item</Text>
                </TouchableOpacity>
              </View>

              {selectedOrder.items.map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{it.name} (x{it.qty})</Text>
                  <Text style={styles.itemPrice}>${(it.price * it.qty).toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.sectionDivider} />

              <View style={styles.cardFooter}>
                <Text style={styles.detailTotalLabel}>Grand Total:</Text>
                <Text style={styles.detailTotalVal}>${selectedOrder.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* SCREEN 3: STATUS UPDATE FLOW */}
        {activeTab === 'flow' && (
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.screenHeading}>Status Update Flow</Text>
            <Text style={styles.screenSub}>Tap any status state below to trigger instant optimistic update</Text>

            {orders.map((item) => (
              <View key={item.id} style={styles.flowCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                </View>

                <View style={styles.wizardRow}>
                  {['pending', 'processing', 'shipped', 'delivered'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.7}
                      style={[
                        styles.wizardBtn,
                        item.status === st && styles.wizardBtnActive
                      ]}
                      onPress={() => updateOrderStatus(item.id, st as any)}
                    >
                      <Text style={[styles.wizardBtnText, item.status === st && styles.wizardBtnTextActive]}>
                        {st.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SCREEN 4: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.screenHeading}>Profile & Sync Settings</Text>

            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>DH</Text>
                </View>
                <View>
                  <Text style={styles.profileName}>Digital Heroes Officer</Text>
                  <Text style={styles.profileRole}>Lead Logistics Manager</Text>
                  <Text style={styles.profileEmail}>officer@digitalheroes.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingsBox}>
              <Text style={styles.boxTitle}>Offline Sync Queue</Text>
              <Text style={styles.boxVal}>{syncQueue.length} pending mutations</Text>
              {syncQueue.map((q, idx) => (
                <Text key={idx} style={styles.queueItemText}>• {q.desc}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={flushSyncQueue}>
              <Text style={styles.primaryBtnText}>Flush Offline Sync Queue</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* FOOTER CREDIT */}
      <View style={styles.footerCredit}>
        <Text style={styles.creditText}>Built for </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://digitalheroesco.com')}>
          <Text style={styles.creditLink}>Digital Heroes Training Task</Text>
        </TouchableOpacity>
      </View>

      {/* DECENT SIZED BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.bottomTabItem, activeTab === 'list' && styles.bottomTabActive]}
          onPress={() => handleTabChange('list')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.bottomTabText, activeTab === 'list' && styles.bottomTabTextActive]}>
            List/Filter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.bottomTabItem, activeTab === 'detail' && styles.bottomTabActive]}
          onPress={() => handleTabChange('detail')}
        >
          <Text style={styles.tabIcon}>🔍</Text>
          <Text style={[styles.bottomTabText, activeTab === 'detail' && styles.bottomTabTextActive]}>
            Detail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.bottomTabItem, activeTab === 'flow' && styles.bottomTabActive]}
          onPress={() => handleTabChange('flow')}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.bottomTabText, activeTab === 'flow' && styles.bottomTabTextActive]}>
            Status Flow
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.bottomTabItem, activeTab === 'profile' && styles.bottomTabActive]}
          onPress={() => handleTabChange('profile')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.bottomTabText, activeTab === 'profile' && styles.bottomTabTextActive]}>
            Profile/Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* COOL GLASSMORPHISM POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={coolModalVisible}
        onRequestClose={() => setCoolModalVisible(false)}
      >
        <View style={styles.coolModalOverlay}>
          <View style={styles.coolModalCard}>
            <View style={styles.coolModalBadgeContainer}>
              <Text style={styles.coolModalBadgeText}>{coolModalBadge}</Text>
            </View>

            <Text style={styles.coolModalTitle}>{coolModalTitle}</Text>
            <Text style={styles.coolModalMessage}>{coolModalMessage}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.coolModalBtn}
              onPress={() => setCoolModalVisible(false)}
            >
              <Text style={styles.coolModalBtnText}>Awesome, Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending': return { backgroundColor: 'rgba(245, 158, 11, 0.25)', borderColor: 'rgba(245, 158, 11, 0.4)' };
    case 'processing': return { backgroundColor: 'rgba(99, 102, 241, 0.25)', borderColor: 'rgba(99, 102, 241, 0.4)' };
    case 'shipped': return { backgroundColor: 'rgba(6, 182, 212, 0.25)', borderColor: 'rgba(6, 182, 212, 0.4)' };
    case 'delivered': return { backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(16, 185, 129, 0.4)' };
    default: return { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
  },
  brandTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  brandSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  onlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#ef4444',
  },
  networkText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  mainBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  screenSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 14,
  },
  addOrderBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addOrderBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: '#6366f1',
  },
  filterPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  activeFilterPillText: {
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(18, 26, 43, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  customerName: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priorityText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900',
  },
  detailCard: {
    backgroundColor: 'rgba(18, 26, 43, 0.9)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 10,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  detailDate: {
    color: '#64748b',
    fontSize: 13,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  sectionHeading: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  notesText: {
    color: '#fbbf24',
    fontSize: 13,
    fontStyle: 'italic',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  smallBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemPrice: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '800',
  },
  detailTotalLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  detailTotalVal: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: '900',
  },
  flowCard: {
    backgroundColor: 'rgba(18, 26, 43, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  wizardRow: {
    flexDirection: 'row',
    gap: 6,
  },
  wizardBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  wizardBtnActive: {
    backgroundColor: '#6366f1',
  },
  wizardBtnText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
  },
  wizardBtnTextActive: {
    color: '#fff',
  },
  profileCard: {
    backgroundColor: 'rgba(18, 26, 43, 0.9)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  profileRole: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#64748b',
    fontSize: 12,
  },
  settingsBox: {
    backgroundColor: 'rgba(18, 26, 43, 0.9)',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  boxTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  boxVal: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  boxDesc: {
    color: '#64748b',
    fontSize: 12,
  },
  queueItemText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  footerCredit: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#090d16',
  },
  creditText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  creditLink: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },

  /* DECENT-SIZED BOTTOM TAB BAR */
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    height: 72,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  bottomTabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  bottomTabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomTabTextActive: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '900',
  },

  /* COOL POPUP MODAL STYLES */
  coolModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  coolModalCard: {
    width: '100%',
    backgroundColor: '#121a2b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  coolModalBadgeContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  coolModalBadgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coolModalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  coolModalMessage: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  coolModalBtn: {
    backgroundColor: '#6366f1',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  coolModalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
