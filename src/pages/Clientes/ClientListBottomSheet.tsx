import React from 'react';
import { formatCurrency } from '../../utils/api';
import type { Cliente } from '../../hooks/useClientes';

interface ClientListBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
}

const ClientListBottomSheet: React.FC<ClientListBottomSheetProps> = ({
  isOpen,
  onClose,
  clientes,
  selectedCliente,
  onSelectCliente,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-neutral-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } max-h-[80vh] rounded-t-lg overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Seleccionar Cliente</h2>
            <p className="text-sm text-gray-400">{clientes.length} clientes</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              className={`p-4 border-b border-neutral-700 hover:bg-neutral-800 transition-colors flex justify-between items-start ${
                selectedCliente?.id === cliente.id ? 'bg-neutral-800 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => { onSelectCliente(cliente); onClose(); }}
            >
              <div className="flex-1">
                <h3 className="font-medium text-white">{cliente.nombre}</h3>
                {cliente.telefono && (
                  <p className="text-sm text-gray-400">{cliente.telefono}</p>
                )}
              </div>
              {cliente.deuda && cliente.deuda > 0 && (
                <div className="text-right mb-2">
                  <p className="text-sm font-medium text-red-400">{formatCurrency(cliente.deuda)}</p>
                  <p className="text-xs text-gray-500">deuda</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientListBottomSheet;
