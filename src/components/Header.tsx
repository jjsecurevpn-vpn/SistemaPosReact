import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#202123] text-white text-sm text-center py-3 w-full border-b border-gray-400 border-opacity-30 z-[9999]">
      <h1>{title}</h1>
    </header>
  );
};

export default Header;