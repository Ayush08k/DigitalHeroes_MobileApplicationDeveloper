# Task A & B - Mobile Application Developer Deliverables

Production-grade Offline-First Mobile Application and Code Audit / Technical Governance project built for Digital Heroes.

---

## 🔗 Submission Links & Deliverables

- **Public GitHub Repository**: [https://github.com/Ayush08k/DigitalHeroes_MobileApplicationDeveloper](https://github.com/Ayush08k/DigitalHeroes_MobileApplicationDeveloper)
- **Direct Application Download (APK/Build)**: [Download APK / Build File](https://drive.google.com/file/d/1NNWeVHWIy6U2YHp-u-ArQ0pcENvodpQB/view?usp=sharing)
- **Expo Mobile App URL**: `exp://192.168.1.5:8099` (or `exp://192.168.1.5:8105`)
- **Required Credit**: Built for [Digital Heroes Training Task](https://digitalheroesco.com)

---

## 🏛️ Task A: Offline-First Order Management Mobile App

### 1. 4 Core Screens (Accessible via Bottom Navigation)
- **1. List / Filter Screen**: Search bar, status pill filters (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`), order cards with priority badges, and `+ New Order` popup trigger.
- **2. Detail Screen**: Customer profile details, dispatch address, items breakdown, grand total calculation, and `+ Add Item` popup trigger.
- **3. Status Update Flow**: Interactive state-transition wizard with instant optimistic UI mutations.
- **4. Profile & Settings**: Editable dispatcher profile details (Name, Role, Email), live network status toggle (`Online`/`Offline`), and offline mutation queue flush manager.

### 2. Interactive Popup Forms & Warning Themes
- **Create New Order Popup**: Interactive modal form requesting Customer Name, Email, Contact Number, Address, Item Name, Price, and **Priority Selector** (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - *Surcharges*: `HIGH` priority appends +$50.00 handling charge; `URGENT` priority appends +$100.00 24H air freight fee.
- **Amber Warning Confirmation Modal**: Styled warning confirmation window before pushing new orders to active list.
- **Add Item Popup Modal**: Input custom item name, quantity, and unit price to recalculate grand total.

### 3. Architecture & State Management Rationale
- **Centralized State (`OrderContext`)**: Prevents fragmented component state, enabling synchronized optimistic updates across all 4 screens without UI flickers.
- **Local Persistence & Sync Queue**: Mutations enqueued during offline mode automatically flush to mock backend upon reconnection.
- **Conflict Resolution**: Configurable policies (`client-wins`, `server-wins`, `manual`).

---

## 📊 Task B: Code Review, Release Strategy & Performance Governance

- **Review Framework**: 4-phase audit (Bundle Composition, Memory Leak/GC Heap, Render Jank/FPS, CI/CD Pipeline).
- **Concrete Code Findings**: Critical static monolithic imports (4MB bundle source) and uncleaned event listeners (older device OOM crashes).
- **Release Strategy**: Trunk-based branching, automated CI testing gates, staged canary rollout, Sentry crash monitoring.
- **Performance Budget**: Main JS bundle <= 250KB gzipped, FCP <= 1.2s, INP <= 100ms, Frame Rate 60-90 FPS.

---

## 🧪 Automated Tests
Run Vitest test suite inside `Task_A`:
```bash
cd Task_A
npm test
```
*4/4 tests passing (Offline queueing, online auto-sync, local storage persistence).*
