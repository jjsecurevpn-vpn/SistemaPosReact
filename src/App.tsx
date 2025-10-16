import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import POS from './pages/POS';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Caja from './pages/Caja';
import Reportes from './pages/Reportes';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Notification from './components/Notification';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';

// Screen configuration
const SCREENS = {
  dashboard: {
    component: Dashboard,
    title: 'Sistema POS - Dashboard'
  },
  pos: {
    component: POS,
    title: 'Sistema POS - Punto de Venta'
  },
  productos: {
    component: Productos,
    title: 'Sistema POS - Gestión de Productos'
  },
  clientes: {
    component: Clientes,
    title: 'Sistema POS - Gestión de Clientes'
  },
  caja: {
    component: Caja,
    title: 'Sistema POS - Control de Caja'
  },
  reportes: {
    component: Reportes,
    title: 'Sistema POS - Reportes de Ventas'
  }
} as const;

type ScreenKey = keyof typeof SCREENS;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { notification, hideNotification } = useNotification();
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const currentScreenConfig = SCREENS[currentScreen];
  const CurrentComponent = currentScreenConfig.component;

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={(screen: string) => setCurrentScreen(screen as ScreenKey)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col bg-[#181818] md:ml-14">
        <Header
          title={currentScreenConfig.title}
          onMenuClick={toggleSidebar}
        />

        <main className="pt-12 md:pt-12 flex-1">
          <CurrentComponent />
        </main>
      </div>
      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default App;
