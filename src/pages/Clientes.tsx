import React, { useState, useEffect } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import type { Cliente, VentaFiada, PagoFiado } from '../hooks/useClientes';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import { Plus, Search, Edit2, Trash2, Eye, CreditCard } from 'lucide-react';

const Clientes: React.FC = () => {
  const {
    clientes,
    loading,
    error,
    cargarClientes,
    agregarCliente,
    editarCliente,
    eliminarCliente,
    cargarDeudasCliente,
    cargarPagosCliente,
    registrarPago
  } = useClientes();

  const { isAdmin } = useAuth();

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteDeudas, setClienteDeudas] = useState<VentaFiada[]>([]);
  const [clientePagos, setClientePagos] = useState<PagoFiado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<VentaFiada | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  });

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showError('El nombre es obligatorio');
      return;
    }

    try {
      if (isEditing && editingCliente) {
        await editarCliente(editingCliente.id, formData);
        showSuccess('Cliente actualizado exitosamente');
      } else {
        await agregarCliente(formData);
        showSuccess('Cliente agregado exitosamente');
      }

      handleCloseModal();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      notas: cliente.notas || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clienteToDelete) {
      try {
        await eliminarCliente(clienteToDelete.id);
        showSuccess('Cliente eliminado exitosamente');
        setShowDeleteModal(false);
        setClienteToDelete(null);
      } catch (error) {
        showError('Error al eliminar el cliente');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClienteToDelete(null);
  };

  const abrirModalPago = (deuda: VentaFiada) => {
    setSelectedDebt(deuda);
    setPaymentAmount(deuda.venta.total.toString()); // Pre-llenar con el total de la deuda
    setPaymentMethod('');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const cerrarModalPago = () => {
    setShowPaymentModal(false);
    setSelectedDebt(null);
    setPaymentAmount('');
    setPaymentMethod('');
    setPaymentNotes('');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || !paymentAmount) return;

    try {
      await registrarPago(
        selectedDebt.id,
        parseFloat(paymentAmount),
        paymentMethod || undefined,
        paymentNotes || undefined
      );

      // Pequeño delay para asegurar que Supabase procese los cambios
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recargar deudas y pagos
      if (selectedCliente) {
        const deudas = await cargarDeudasCliente(selectedCliente.id);
        const pagos = await cargarPagosCliente(selectedCliente.id);
        setClienteDeudas(deudas);
        setClientePagos(pagos);
      }

      alert('Pago registrado exitosamente');
      cerrarModalPago();
    } catch {
      showError('Error al registrar el pago');
    }
  };

  const handleViewDetails = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDetailsModal(true);

    // Limpiar estado anterior antes de cargar nuevos datos
    setClienteDeudas([]);
    setClientePagos([]);

    // Pequeño delay para asegurar limpieza completa
    await new Promise(resolve => setTimeout(resolve, 100));

    // Cargar deudas y pagos del cliente
    const [deudas, pagos] = await Promise.all([
      cargarDeudasCliente(cliente.id),
      cargarPagosCliente(cliente.id)
    ]);

    setClienteDeudas(deudas);
    setClientePagos(pagos);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingCliente(null);
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      notas: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const calcularDeudaTotal = (deudas: VentaFiada[]) => {
    return deudas.reduce((total, deuda) => total + deuda.venta.total, 0);
  };

  const calcularPagosTotal = (pagos: PagoFiado[]) => {
    return pagos.reduce((total, pago) => total + pago.monto, 0);
  };

  return (
    <div className="h-full bg-[#181818] p-6 overflow-auto">
      {error && (
        <div className="mb-6 text-red-400 bg-red-900/20 border border-red-800/50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-neutral-200">Gestión de Clientes</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-700 bg-neutral-900 text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients List */}
      {loading && clientes.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-neutral-500">Cargando clientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map(cliente => (
            <div
              key={cliente.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-200">
                    {cliente.nombre} {cliente.apellido}
                  </h3>
                  {cliente.email && (
                    <p className="text-sm text-neutral-400">{cliente.email}</p>
                  )}
                  {cliente.telefono && (
                    <p className="text-sm text-neutral-400">{cliente.telefono}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(cliente)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
                >
                  <Eye size={14} />
                  Ver
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente)}
                      className="rounded-md border border-red-700 bg-red-900/20 px-3 py-2 text-sm font-medium text-red-200 hover:border-red-500 hover:bg-red-800/30 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredClientes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-neutral-500">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </p>
        </div>
      )}

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              className="w-full border border-neutral-700 bg-neutral-800 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md border border-blue-700 bg-blue-900/20 px-6 py-2 text-sm font-medium text-blue-200 hover:border-blue-500 hover:bg-blue-800/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Details Modal */}
      <Modal
        key={selectedCliente?.id || 'no-client'}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCliente(null);
          setClienteDeudas([]);
          setClientePagos([]);
        }}
        title={`Detalles de ${selectedCliente?.nombre} ${selectedCliente?.apellido}`}
        size="lg"
      >
        {selectedCliente && (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-neutral-200 mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Nombre:</span>
                  <p className="text-neutral-200">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                </div>
                {selectedCliente.telefono && (
                  <div>
                    <span className="text-neutral-400">Teléfono:</span>
                    <p className="text-neutral-200">{selectedCliente.telefono}</p>
                  </div>
                )}
                {selectedCliente.email && (
                  <div>
                    <span className="text-neutral-400">Email:</span>
                    <p className="text-neutral-200">{selectedCliente.email}</p>
                  </div>
                )}
                {selectedCliente.direccion && (
                  <div>
                    <span className="text-neutral-400">Dirección:</span>
                    <p className="text-neutral-200">{selectedCliente.direccion}</p>
                  </div>
                )}
                <div>
                  <span className="text-neutral-400">Fecha de registro:</span>
                  <p className="text-neutral-200">{formatDate(selectedCliente.fecha_registro)}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-2">Deuda Total</h4>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(calcularDeudaTotal(clienteDeudas))}
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Pagos Realizados</h4>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(calcularPagosTotal(clientePagos))}
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Saldo Pendiente</h4>
                <p className={`text-2xl font-bold ${calcularDeudaTotal(clienteDeudas) - calcularPagosTotal(clientePagos) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {formatCurrency(calcularDeudaTotal(clienteDeudas) - calcularPagosTotal(clientePagos))}
                </p>
              </div>
            </div>

            {/* Pending Debts */}
            {clienteDeudas.length > 0 && (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-neutral-200 mb-3">Deudas Pendientes</h3>
                <div className="space-y-3">
                  {clienteDeudas.map(deuda => (
                    <div key={deuda.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-neutral-200 font-medium">Venta #{deuda.venta.id}</span>
                        <span className="text-red-400 font-semibold">{formatCurrency(deuda.venta.total)}</span>
                      </div>
                      <p className="text-sm text-neutral-400 mb-2">Fecha: {formatDate(deuda.venta.fecha)}</p>
                      <div className="text-sm text-neutral-500">
                        <p>Productos:</p>
                        <ul className="ml-4 mt-1">
                          {deuda.venta.venta_productos?.map((prod: { cantidad: number; subtotal: number; productos: { nombre: string } }, idx: number) => (
                            <li key={idx}>
                              {prod.productos.nombre} ×{prod.cantidad} - {formatCurrency(prod.subtotal)}
                            </li>
                          )) || []}
                        </ul>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => abrirModalPago(deuda)}
                          className="rounded-md border border-green-700 bg-green-900/20 px-4 py-2 text-sm font-medium text-green-200 hover:border-green-500 hover:bg-green-800/30 transition-all"
                        >
                          Registrar Pago
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {clientePagos.length > 0 && (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-neutral-200 mb-3">Historial de Pagos</h3>
                <div className="space-y-2">
                  {clientePagos.map(pago => (
                    <div key={pago.id} className="flex justify-between items-center bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                      <div>
                        <p className="text-neutral-200 font-medium">{formatCurrency(pago.monto)}</p>
                        <p className="text-sm text-neutral-400">{formatDate(pago.fecha_pago)}</p>
                        {pago.metodo_pago && (
                          <p className="text-xs text-neutral-500">Método: {pago.metodo_pago}</p>
                        )}
                      </div>
                      <CreditCard className="text-green-500" size={20} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clienteDeudas.length === 0 && clientePagos.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                Este cliente no tiene deudas ni pagos registrados
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={cerrarModalPago}
        title="Registrar Pago"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {selectedDebt && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-4">
              <h4 className="text-neutral-200 font-medium mb-2">Deuda Seleccionada</h4>
              <p className="text-sm text-neutral-400">Venta #{selectedDebt.venta.id}</p>
              <p className="text-lg font-semibold text-red-400">{formatCurrency(selectedDebt.venta.total)}</p>
            </div>
          )}

          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-neutral-200 mb-2">
              Monto del Pago *
            </label>
            <input
              type="number"
              id="paymentAmount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
              className="w-full border border-neutral-700 bg-neutral-900 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-neutral-200 mb-2">
              Método de Pago
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-neutral-700 bg-neutral-900 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar método...</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentNotes" className="block text-sm font-medium text-neutral-200 mb-2">
              Notas
            </label>
            <textarea
              id="paymentNotes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
              className="w-full border border-neutral-700 bg-neutral-900 text-neutral-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Notas adicionales del pago..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={cerrarModalPago}
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md border border-green-700 bg-green-900/20 px-4 py-2 text-sm font-medium text-green-200 hover:border-green-500 hover:bg-green-800/30 transition-all"
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Eliminar Cliente"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-200 mb-2">
              ¿Eliminar cliente?
            </h3>
            <p className="text-sm text-neutral-400">
              ¿Estás seguro de que quieres eliminar a <span className="font-medium text-neutral-200">{clienteToDelete?.nombre} {clienteToDelete?.apellido}</span>?
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={cancelDelete}
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 rounded-md border border-red-700 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-200 hover:border-red-500 hover:bg-red-800/30 transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification */}
      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

export default Clientes;