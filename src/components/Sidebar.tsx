import React, { useState } from 'react';
import { MdShoppingCart, MdInventory2, MdBarChart, MdAccountBalance, MdPeople, MdAnalytics } from 'react-icons/md';

interface SidebarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange, isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: MdBarChart },
    { id: 'pos', label: 'Punto de Venta', icon: MdShoppingCart },
    { id: 'productos', label: 'Productos', icon: MdInventory2 },
    { id: 'clientes', label: 'Clientes', icon: MdPeople },
    { id: 'caja', label: 'Caja', icon: MdAccountBalance },
    { id: 'reportes', label: 'Reportes', icon: MdAnalytics },
  ];

  // Determinar si el sidebar debe estar expandido
  const isExpanded = isOpen || isHovered;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-neutral-900 border-r border-neutral-800 transition-all duration-200 ease-out pt-14 ${
          isOpen ? 'block' : 'hidden md:block'
        }`}
        style={{ width: isExpanded ? '208px' : '56px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <button
                key={index}
                onClick={() => {
                  onScreenChange(item.id);
                  onClose(); // Close sidebar on mobile after selection
                }}
                className={`
                  flex items-center h-9 mx-2 mb-1 px-3 rounded
                  text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800
                  transition-colors duration-150
                  ${currentScreen === item.id ? 'text-neutral-200 bg-neutral-800' : ''}
                `}
              >
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <Icon />
                </div>
                <span
                  className={`
                    ml-3 text-sm whitespace-nowrap transition-opacity duration-200
                    ${isExpanded ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    display: isExpanded ? 'block' : 'none'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* Toggle button at bottom */}
          <div className="mt-auto mb-2 mx-2">
            <button
              className="flex items-center justify-center w-full h-9 px-3 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150"
            >
              <div className="flex items-center justify-center w-5 h-5">
                <div className="w-3 h-3 border border-current rounded" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;