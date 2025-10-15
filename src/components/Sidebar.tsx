import React, { useState } from 'react';
import { MdShoppingCart, MdInventory2, MdBarChart } from 'react-icons/md';

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
    { id: 'pos', label: 'Punto de Venta', icon: MdShoppingCart },
    { id: 'productos', label: 'Productos', icon: MdInventory2 },
    { id: 'reportes', label: 'Reportes', icon: MdBarChart },
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
      <aside
        className={`fixed inset-y-0 left-0 z-[20] bg-[#202123] border-r border-gray-400 border-opacity-30 transform-gpu will-change-transform transition-transform duration-150 ease-in-out pt-14 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation */}
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => {
              onScreenChange(item.id);
              onClose(); // Close sidebar on mobile after selection
            }}
            className={`cursor-pointer mx-2 py-2 transition-all duration-150 hover:text-white flex items-center ${
              currentScreen === item.id
                ? 'text-white'
                : 'text-gray-300'
            } ${
              index === 0 ? 'mt-4' : ''
            } ${
              index === menuItems.length - 1 ? 'mb-4' : ''
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0"><item.icon /></span>
            <span className={`ml-3 transition-opacity duration-150 whitespace-nowrap ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              {item.label}
            </span>
          </div>
        ))}

        {/* Footer indicator */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-150 w-1 h-8 bg-gray-400 opacity-30 rounded-full ${
          isExpanded ? 'opacity-0' : 'opacity-100'
        }`}></div>
      </aside>
    </>
  );
};

export default Sidebar;