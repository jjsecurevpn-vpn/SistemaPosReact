import React from 'react';
import type { Cliente } from '../../hooks/useClientes';

interface ClienteHeaderProps {
  selectedCliente: Cliente | null;
  onOpenBottomSheet: () => void;
  onAddCliente: () => void;
  onPayAll: () => void;
}

const ClienteHeader: React.FC<ClienteHeaderProps> = ({
  selectedCliente,
  onOpenBottomSheet,
  onAddCliente,
  onPayAll,
}) => {
  return (
    <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onOpenBottomSheet}
        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        aria-label="Abrir lista de clientes"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12H20M4 8H20M4 16H12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Pagar Todo - estilo pequeño y minimal */}
        {selectedCliente && (selectedCliente as any).deuda > 0 && (
          <button
            onClick={onPayAll}
            className="flex items-center gap-2 rounded-md border border-green-700 bg-green-900 px-2 py-1 text-xs font-medium text-green-200 hover:border-green-500 hover:bg-green-800 transition"
            aria-label="Pagar todo"
          >
            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            Pagar
          </button>
        )}

        {/* Nuevo - estilo pequeño minimal al estilo Supabase */}
        <button
          onClick={onAddCliente}
          className="flex items-center gap-2 rounded-md border border-neutral-700 bg-transparent px-2 py-1 text-xs font-medium text-gray-200 hover:border-neutral-500 hover:bg-neutral-800 transition"
          aria-label="Nuevo cliente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>
    </div>
  );
};

export default ClienteHeader;