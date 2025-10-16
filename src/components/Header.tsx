import React from 'react';
import { MdMenu, MdPerson } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-neutral-900 text-white text-sm py-3 w-full border-b border-neutral-800 z-[9999] flex items-center justify-between px-4">
      {/* Left side: Menu button, logo, and title */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
          >
            <MdMenu size={24} />
          </button>
        )}
        {/* Logo Image - Using Secure.svg */}
        <img src="/Secure.svg" alt="Logo" className="h-8 w-8 flex-shrink-0" />
        <h1 className="hidden md:inline font-semibold">{title}</h1>
      </div>

      {/* Right side: User info */}
      {user && (
        <div className="flex items-center gap-3 text-neutral-300">
          {/* Desktop: show email */}
          <span className="hidden md:inline text-sm">{user.email}</span>
          {/* Mobile: show user icon */}
          <MdPerson className="hidden" size={20} />
          <button
            onClick={signOut}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;