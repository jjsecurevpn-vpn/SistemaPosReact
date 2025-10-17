import React from 'react';
import { formatCurrency } from '../../utils/api';
import type { Cliente } from '../../hooks/useClientes';
import { useAuth } from '../../hooks/useAuth';

interface ClienteSidebarProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
  onAddCliente: () => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (cliente: Cliente) => void;
}

const ClienteSidebar: React.FC<ClienteSidebarProps> = ({
  clientes,
  selectedCliente,
  onSelectCliente,
  onAddCliente,
  onEditCliente,
  onDeleteCliente,
}) => {
  const { isAdmin } = useAuth();
  return (
    <div className="hidden md:flex md:w-80 md:border-r md:border-neutral-800 md:flex-col">
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-200">Clientes</h2>
          <p className="text-sm text-neutral-500">{clientes.length} clientes</p>
        </div>
        <button
          onClick={onAddCliente}
          className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-gray-200 hover:border-neutral-500 hover:bg-neutral-800 transition"
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

      <div className="flex-1 overflow-y-auto">
        {clientes.map((cliente) => {
          return (
            <div
              key={cliente.id}
              onClick={() => onSelectCliente(cliente)}
              className={`p-4 border-b border-neutral-800 hover:bg-neutral-800 transition-colors flex justify-between items-start cursor-pointer ${
                selectedCliente?.id === cliente.id ? 'text-neutral-200 bg-neutral-800 border-l-4 border-blue-500' : 'text-neutral-500'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-medium">{cliente.nombre}</h3>
                {cliente.telefono && (
                  <p className="text-sm text-neutral-400">{cliente.telefono}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {cliente.deuda && cliente.deuda > 0 && (
                  <div className="text-right mb-2">
                    <p className="text-sm font-medium text-red-400">{formatCurrency(cliente.deuda)}</p>
                    <p className="text-xs text-neutral-500">deuda</p>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditCliente(cliente); }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCliente(cliente); }}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClienteSidebar;