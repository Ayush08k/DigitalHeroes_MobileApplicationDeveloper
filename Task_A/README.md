# Task A - Offline-First Order Management Application

A production-grade, 4-screen Offline-First Order Management application with 90FPS GPU liquid animations, local state persistence, optimistic UI updates, background sync queue engine, and customizable conflict resolution rules.

---

## 🚀 Live Demo & Build Instructions

- **Direct Application Download (APK/Build)**: [Download APK / Build File](https://drive.google.com/file/d/1NNWeVHWIy6U2YHp-u-ArQ0pcENvodpQB/view?usp=sharing)

### 1. Installation
```bash
cd Task_A
npm install
```

### 2. Run Development App
```bash
npm run dev
```

### 3. Run Test Suite
```bash
npx vitest run
```

---

## 🏛️ Architecture & State Management Rationale

### State Management Strategy
We used **React Context + Custom Reactive Hooks (`OrderContext`)** paired with **Local Persistence Layer (`OfflineStorage`)**.
- **Why not ad-hoc `useState` scattered in components?** Scattering state makes keeping offline pending queues synchronized across multiple screens error-prone. Centralizing orders and mutations in a single provider ensures instant optimistic updates across the Order List, Details, and Status Wizard screens simultaneously.
- **Optimistic UI Updates**: When a user changes an order status, the local UI updates instantly (< 16ms, 90FPS smooth rate). If offline, the action is enqueued to `localStorage` sync queue and marked as `Sync Pending`. When network connectivity returns, the `SyncEngine` auto-flushes the queue.

### Offline-First Principles & Conflict Policies
1. **Local Persistence**: Full caching of orders in `localStorage` / `IndexedDB`.
2. **Background Sync Engine**: Detects online reconnection, iterates through mutations, applies exponential backoff / retries.
3. **Conflict Policies**: Supports `client-wins` (default), `server-wins`, and `manual` resolution.

---

## 🌐 Required Credit
Built for [Digital Heroes Training Task](https://digitalheroesco.com)
