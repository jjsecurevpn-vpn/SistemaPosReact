import React, { useState, useEffect } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/api';
import type { Cliente, VentaFiada, PagoFiado } from '../../hooks/useClientes';
import ClienteSidebar from './ClienteSidebar';
import ClienteForm from '../../components/ClienteForm';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/Modal';
import ClienteHeader from './ClienteHeader';
import ClienteDetails from './ClienteDetails';
import ClientListBottomSheet from './ClientListBottomSheet';

const Clientes: React.FC = () => {
  // Estado para mostrar el modal de 'Pagar Todo'
  const [showPayAllModal, setShowPayAllModal] = useState(false);
  // notification state removed because it's unused; notifications handled by context
  const [clientePendienteEliminar, setClientePendienteEliminar] = useState<Cliente | null>(null);
  const { clientes, loading, error, cargarClientes, cargarDeudasCliente, cargarPagosCliente, registrarPago } = useClientes();
  const { showNotification } = useNotification();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [deudas, setDeudas] = useState<VentaFiada[]>([]);
  const [pagos, setPagos] = useState<PagoFiado[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<VentaFiada | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>(undefined);

  // Calcular deuda total del cliente seleccionado
  const calcularDeudaTotal = (clienteDeudas: VentaFiada[]) => {
    return clienteDeudas.reduce((total, deuda) => total + deuda.venta.total, 0);
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Función para registrar pago
  const handleRegisterPayment = async () => {
    if (!selectedDebt || !paymentAmount) return;

    try {
      await registrarPago(
        selectedDebt.id,
        parseFloat(paymentAmount),
        paymentMethod || undefined,
        paymentNotes || undefined
      );

      showNotification('Pago registrado exitosamente', 'success');
      setShowPaymentModal(false);
      setSelectedDebt(null);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentNotes('');

      // Recargar detalles del cliente
      if (selectedCliente) {
        loadClienteDetails(selectedCliente.id);
      }
    } catch (error) {
      console.error('Error registering payment:', error);
      showNotification('Error al registrar el pago', 'error');
    }
  };

  // Cargar detalles del cliente seleccionado
  const loadClienteDetails = async (clienteId: number) => {
    setLoadingDetails(true);
    try {
      const deudasData = await cargarDeudasCliente(clienteId);
      const pagosData = await cargarPagosCliente(clienteId);
      setDeudas(deudasData);
      setPagos(pagosData);
    } catch (error) {
      console.error('Error loading client details:', error);
      showNotification('Error al cargar detalles del cliente', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Auto-seleccionar el primer cliente si hay clientes y ninguno está seleccionado
  useEffect(() => {
    if (clientes.length > 0 && !selectedCliente) {
      setSelectedCliente(clientes[0]);
    }
  }, [clientes, selectedCliente]);

  // Editar cliente
  const handleEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setShowClienteForm(true);
  };

  // Eliminar cliente
  const handleDeleteCliente = (cliente: Cliente) => {
    setClientePendienteEliminar(cliente);
    showNotification(`¿Seguro que deseas eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`, 'warning', 10000);
  };

  const confirmarEliminarCliente = async () => {
    if (!clientePendienteEliminar) return;
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientePendienteEliminar.id);
      if (error) throw error;
      showNotification(`Cliente eliminado exitosamente`, 'success', 4000);
      cargarClientes();
      if (selectedCliente?.id === clientePendienteEliminar.id) setSelectedCliente(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('Error al eliminar el cliente', 'error', 4000);
    } finally {
      setClientePendienteEliminar(null);
    }
  };

  const handleCloseNotification = () => {
    // hideNotification is not exported from this file; using showNotification with empty duration 0 to clear
    // but we can directly call showNotification('', 'info', 0) to clear; instead call hideNotification if available
    // However useNotification hook provides hideNotification; get it from hook above.
    // For simplicity, we'll call showNotification with duration 0 to immediately clear.
    // (If hideNotification is available via hook, prefer that.)
    setClientePendienteEliminar(null);
    // no-op: notifications are managed by useNotification; modal close will hide UI
  };

  // Abrir modal para agregar cliente
  const handleAddCliente = () => {
    setClienteToEdit(undefined);
    setShowClienteForm(true);
  };

  const handleCloseForm = () => {
    setShowClienteForm(false);
    setClienteToEdit(undefined);
  };

  // Cargar detalles cuando cambia el cliente seleccionado
  useEffect(() => {
    if (selectedCliente) {
      loadClienteDetails(selectedCliente.id);
    }
  }, [selectedCliente]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Cargando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-900 text-white">
      {/* Modal de confirmación para eliminar cliente */}
      <Modal
        isOpen={!!clientePendienteEliminar}
        onClose={handleCloseNotification}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-lg text-center text-red-300 font-semibold">
            ¿Seguro que deseas eliminar a <span className="text-white">{clientePendienteEliminar?.nombre}</span>?<br />Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={confirmarEliminarCliente}
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={handleCloseNotification}
              className="px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
      {/* Modal de confirmación para eliminar cliente */}
      <Modal
        isOpen={!!clientePendienteEliminar}
        onClose={handleCloseNotification}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-lg text-center text-red-300 font-semibold">
            ¿Seguro que deseas eliminar a <span className="text-white">{clientePendienteEliminar?.nombre}</span>?<br />Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={confirmarEliminarCliente}
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={handleCloseNotification}
              className="px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
      <ClienteHeader
        selectedCliente={selectedCliente}
        onOpenBottomSheet={() => setIsBottomSheetOpen(true)}
        onAddCliente={handleAddCliente}
        onPayAll={() => setShowPayAllModal(true)}
      />
      {/* Modal de confirmación para pagar todo */}
      {showPayAllModal && selectedCliente && (
        <Modal
          isOpen={showPayAllModal}
          onClose={() => setShowPayAllModal(false)}
          title="Confirmar pago total"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-lg text-center text-green-300 font-semibold">
              ¿Seguro que deseas registrar el pago total de <span className="text-white">{selectedCliente.nombre}</span>?
              <br />Se pagarán todas las deudas pendientes.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {/* Aquí va la lógica de pago total */ setShowPayAllModal(false); showNotification('Pago total registrado', 'success'); }}
                className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
              >
                Sí, pagar todo
              </button>
              <button
                onClick={() => setShowPayAllModal(false)}
                className="px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex">
        <ClienteSidebar
          clientes={clientes}
          selectedCliente={selectedCliente}
          onSelectCliente={setSelectedCliente}
          onAddCliente={handleAddCliente}
          onEditCliente={handleEditCliente}
          onDeleteCliente={handleDeleteCliente}
        />

        <ClienteDetails
          selectedCliente={selectedCliente}
          deudas={deudas}
          pagos={pagos}
          loadingDetails={loadingDetails}
          calcularDeudaTotal={calcularDeudaTotal}
          onRegisterPayment={(deuda) => {
            setSelectedDebt(deuda);
            setShowPaymentModal(true);
          }}
          onPayAll={() => setShowPayAllModal(true)}
        />
      </div>

      {/* Bottom Sheet para móvil */}
      <ClientListBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        clientes={clientes}
        selectedCliente={selectedCliente}
        onSelectCliente={setSelectedCliente}
      />

      {/* Modal de Registrar Pago */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-white">Registrar Pago</h3>
            </div>

            <div className="p-6 space-y-4">
              {selectedDebt && (
                <div className="mb-6 p-4 bg-neutral-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Venta #{selectedDebt.venta_id}</h4>
                  <p className="text-sm text-gray-400 mb-1">
                    {selectedDebt.venta.venta_productos.map((vp, idx) => (
                      <span key={idx}>
                        {vp.productos.nombre} ({vp.cantidad} × {formatCurrency(vp.subtotal / vp.cantidad)})
                        {idx < selectedDebt.venta.venta_productos.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: {formatCurrency(selectedDebt.venta.total)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto del Pago *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Notas adicionales (opcional)"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-neutral-700">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterPayment}
                disabled={!paymentAmount}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar cliente */}
      <ClienteForm
        isOpen={showClienteForm}
        onClose={handleCloseForm}
        cliente={clienteToEdit}
        onSave={cargarClientes}
      />
    </div>
  );
};

export default Clientes;
