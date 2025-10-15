import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import POS from './pages/POS';
import Productos from './pages/Productos';
import Reportes from './pages/Reportes';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('pos');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'pos':
        return <POS />;
      case 'productos':
        return <Productos />;
      case 'reportes':
        return <Reportes />;
      default:
        return <POS />;
    }
  };

  const getTitle = () => {
    switch (currentScreen) {
      case 'pos':
        return 'Sistema POS - Punto de Venta';
      case 'productos':
        return 'Sistema POS - Gestión de Productos';
      case 'reportes':
        return 'Sistema POS - Reportes de Ventas';
      default:
        return 'Sistema POS';
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header
          title={getTitle()}
        />
        <div className="pt-16">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default App;
