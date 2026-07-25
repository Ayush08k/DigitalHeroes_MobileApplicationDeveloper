import React from 'react';
import { OrderProvider, useOrders } from './context/OrderContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OrderListScreen } from './screens/OrderListScreen';
import { OrderDetailScreen } from './screens/OrderDetailScreen';
import { StatusUpdateScreen } from './screens/StatusUpdateScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AnimatePresence } from 'framer-motion';

const MainContent: React.FC = () => {
  const { activeScreen } = useOrders();

  return (
    <main className="max-w-6xl mx-auto px-4 pt-6 flex-grow">
      <AnimatePresence mode="wait">
        {activeScreen === 'list' && <OrderListScreen key="list" />}
        {activeScreen === 'detail' && <OrderDetailScreen key="detail" />}
        {activeScreen === 'status-wizard' && <StatusUpdateScreen key="status-wizard" />}
        {activeScreen === 'settings' && <SettingsScreen key="settings" />}
      </AnimatePresence>
    </main>
  );
};

export function App() {
  return (
    <OrderProvider>
      <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </OrderProvider>
  );
}

export default App;
