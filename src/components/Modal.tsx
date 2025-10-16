import React from 'react';
import { MdClose } from 'react-icons/md';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`bg-neutral-900 border border-neutral-700 rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-200">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-all"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6" style={{ scrollbarColor: '#404040 #262626' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;