import React, { useState } from 'react';
import { useCaja } from '../hooks/useCaja';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatCurrency } from '../utils/api';
import Modal from '../components/Modal';
import { MdAdd, MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdDelete } from 'react-icons/md';
import type { MovimientoCaja } from '../hooks/useCaja';

const Caja: React.FC = () => {
  const {
    movimientos,
    loading,
    error,
    ingresos,
    gastos,
    dineroFiado,
    pagosFiado,
    dineroDisponible,
    dineroPendienteFiado,
    agregarMovimiento,
    eliminarMovimiento
  } = useCaja();

  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ingreso' as 'ingreso' | 'gasto' | 'fiado' | 'pago_fiado',
    descripcion: '',
    monto: '',
    categoria: '',
    notas: ''
  });
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<MovimientoCaja | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      showNotification('El monto debe ser un número válido mayor a 0', 'error');
      return;
    }

    if (!formData.descripcion.trim()) {
      showNotification('La descripción es obligatoria', 'error');
      return;
    }

    try {
      await agregarMovimiento({
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
        monto,
        categoria: formData.categoria.trim() || undefined,
        notas: formData.notas.trim() || undefined
      });

      setFormData({
        tipo: 'ingreso',
        descripcion: '',
        monto: '',
        categoria: '',
        notas: ''
      });
      setShowModal(false);
      showNotification('Movimiento agregado exitosamente', 'success');
    } catch {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: number) => {
    const movimiento = movimientos.find(m => m.id === id);
    if (movimiento) {
      setMovementToDelete(movimiento);
      setIsConfirmDelete(true);
    }
  };

  const confirmDelete = async () => {
    if (movementToDelete) {
      try {
        await eliminarMovimiento(movementToDelete.id);
        showNotification('Movimiento eliminado exitosamente', 'success');
      } catch {
        // Error is handled in the hook
      }
    }
    setIsConfirmDelete(false);
    setMovementToDelete(null);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
    setMovementToDelete(null);
  };

  if (loading && movimientos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#181818]">
        <p className="text-neutral-500">Cargando movimientos de caja...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] p-4 md:p-6">
      {error && (
        <div className="mb-6 text-red-400 bg-red-900/20 border border-red-800/50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-neutral-200">Control de Caja</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
          >
            <MdAdd size={16} />
            Nuevo Movimiento
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MdTrendingUp className="text-green-500 flex-shrink-0" size={20} />
            <h3 className="text-sm md:text-lg font-semibold text-neutral-200">Ingresos</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-400">{formatCurrency(ingresos)}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MdTrendingDown className="text-red-500 flex-shrink-0" size={20} />
            <h3 className="text-sm md:text-lg font-semibold text-neutral-200">Gastos</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-red-400">{formatCurrency(gastos)}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MdAccountBalanceWallet className="text-blue-500 flex-shrink-0" size={20} />
            <h3 className="text-sm md:text-lg font-semibold text-neutral-200">Dinero Fiado</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-blue-400">{formatCurrency(dineroFiado)}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MdTrendingUp className="text-green-500 flex-shrink-0" size={20} />
            <h3 className="text-sm md:text-lg font-semibold text-neutral-200">Pagos Fiado</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-400">{formatCurrency(pagosFiado)}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 sm:col-span-2 lg:col-span-1 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MdAccountBalanceWallet className={`flex-shrink-0 ${dineroDisponible >= 0 ? 'text-green-500' : 'text-red-500'}`} size={20} />
            <h3 className="text-sm md:text-lg font-semibold text-neutral-200">Dinero Disponible</h3>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${dineroDisponible >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(dineroDisponible)}
          </p>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Fiado pendiente: {formatCurrency(dineroPendienteFiado)}
          </p>
        </div>
      </div>

      {/* Movements Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-200">Movimientos</h2>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden">
          {movimientos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {movimientos.map((movimiento) => (
                <div key={movimiento.id} className="p-4 hover:bg-neutral-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          movimiento.tipo === 'ingreso'
                            ? 'bg-green-900/50 text-green-400'
                            : movimiento.tipo === 'gasto'
                            ? 'bg-red-900/50 text-red-400'
                            : movimiento.tipo === 'fiado'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-green-900/50 text-green-400'
                        }`}>
                          {movimiento.tipo === 'ingreso' ? 'Ingreso' :
                           movimiento.tipo === 'gasto' ? 'Gasto' :
                           movimiento.tipo === 'fiado' ? 'Fiado' : 'Pago Fiado'}
                        </span>
                        <span className="text-xs text-neutral-500">{formatDate(movimiento.fecha)}</span>
                      </div>
                      <h3 className="text-sm font-medium text-neutral-200 mb-1">{movimiento.descripcion}</h3>
                      {movimiento.categoria && (
                        <p className="text-xs text-neutral-400">Categoría: {movimiento.categoria}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-lg font-bold ${
                        movimiento.tipo === 'ingreso' || movimiento.tipo === 'pago_fiado'
                          ? 'text-green-400'
                          : movimiento.tipo === 'gasto'
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }`}>
                        {movimiento.tipo === 'ingreso' || movimiento.tipo === 'pago_fiado' ? '+' :
                         movimiento.tipo === 'gasto' ? '-' : '~'}{formatCurrency(movimiento.monto)}
                      </span>
                        {isAdmin ? (
                          <button
                            onClick={() => handleDelete(movimiento.id)}
                            className="rounded-md border border-red-700 bg-red-900/20 p-1.5 text-red-400 hover:border-red-500 hover:bg-red-800/30 hover:text-red-300 transition-all"
                            title="Eliminar movimiento"
                          >
                            <MdDelete size={14} />
                          </button>
                        ) : (
                          <div className="text-neutral-500 p-1.5" title="Sin permisos">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-neutral-800 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  {movimiento.notas && (
                    <p className="text-xs text-neutral-500 mt-2 italic">"{movimiento.notas}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id} className="hover:bg-neutral-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                    {formatDate(movimiento.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      movimiento.tipo === 'ingreso'
                        ? 'bg-green-900/50 text-green-400'
                        : movimiento.tipo === 'gasto'
                        ? 'bg-red-900/50 text-red-400'
                        : movimiento.tipo === 'fiado'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-green-900/50 text-green-400'
                    }`}>
                      {movimiento.tipo === 'ingreso' ? 'Ingreso' :
                       movimiento.tipo === 'gasto' ? 'Gasto' :
                       movimiento.tipo === 'fiado' ? 'Fiado' : 'Pago Fiado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    {movimiento.descripcion}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {movimiento.categoria || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    movimiento.tipo === 'ingreso' || movimiento.tipo === 'pago_fiado'
                      ? 'text-green-400'
                      : movimiento.tipo === 'gasto'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}>
                    {movimiento.tipo === 'ingreso' || movimiento.tipo === 'pago_fiado' ? '+' :
                     movimiento.tipo === 'gasto' ? '-' : '~'}{formatCurrency(movimiento.monto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isAdmin ? (
                      <button
                        onClick={() => handleDelete(movimiento.id)}
                        className="rounded-md border border-red-700 bg-red-900/20 p-1.5 text-red-400 hover:border-red-500 hover:bg-red-800/30 hover:text-red-300 transition-all"
                        title="Eliminar movimiento"
                      >
                        <MdDelete size={16} />
                      </button>
                    ) : (
                      <div className="text-neutral-500 p-1.5" title="Sin permisos">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-neutral-800 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                            <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movimientos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for new movement */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Movimiento de Caja"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'ingreso' | 'gasto' | 'fiado' | 'pago_fiado' }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
              <option value="fiado">Dinero Fiado</option>
              <option value="pago_fiado">Pago de Fiado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Descripción</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del movimiento"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Monto (ARS)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Categoría (opcional)</label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: insumos, servicios, ventas, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Notas (opcional)</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Notas adicionales"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md border border-blue-700 bg-blue-900/20 px-6 py-2 text-sm font-medium text-blue-200 hover:border-blue-500 hover:bg-blue-800/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="text-center">
          <p className="text-neutral-300 mb-6">
            {movementToDelete?.tipo === 'ingreso' && (movementToDelete.categoria?.toLowerCase().includes('venta') || movementToDelete.categoria?.toLowerCase().includes('fiado'))
              ? '¿Estás seguro de que quieres eliminar esta venta? Esto también eliminará la venta de los reportes.'
              : '¿Estás seguro de que quieres eliminar este movimiento?'
            }
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Caja;