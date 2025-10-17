import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/api';
import type { Cliente, VentaFiada, PagoFiado } from '../../hooks/useClientes';

interface ClienteDetailsProps {
  selectedCliente: Cliente | null;
  deudas: VentaFiada[];
  pagos: PagoFiado[];
  loadingDetails: boolean;
  calcularDeudaTotal: (deudas: VentaFiada[]) => number;
  onRegisterPayment: (deuda: VentaFiada) => void;
  onPayAll: () => void;
}

const ClienteDetails: React.FC<ClienteDetailsProps> = ({
  selectedCliente,
  deudas,
  pagos,
  loadingDetails,
  calcularDeudaTotal,
  onRegisterPayment,
  onPayAll,
}) => {
  const [activeTab, setActiveTab] = useState<'deudas' | 'pagos' | 'info'>('deudas');

  if (!selectedCliente) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">Selecciona un cliente</div>
          <div className="text-gray-500">Haz clic en un cliente de la lista para ver sus detalles</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Cliente */}
      <div className="p-6 border-b border-neutral-700 bg-neutral-900/50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {selectedCliente.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedCliente.nombre}</h1>
                <p className="text-sm text-gray-400">
                  Cliente #{selectedCliente.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {selectedCliente.telefono && (
                <span className="flex items-center gap-1">
                  📞 {selectedCliente.telefono}
                </span>
              )}
              {selectedCliente.email && (
                <span className="flex items-center gap-1">
                  ✉️ {selectedCliente.email}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Deuda Total</p>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(calcularDeudaTotal(deudas))}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-700 bg-neutral-900/30">
        {/* Desktop Tabs */}
        <div className="hidden md:flex px-6 items-center justify-between">
          <div className="flex">
            <button
              onClick={() => setActiveTab('deudas')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'deudas'
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              Deudas
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === 'deudas' ? 'bg-blue-500/20 text-blue-300' : 'bg-neutral-700 text-gray-400'
              }`}>
                {deudas.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pagos')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'pagos'
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              Pagos
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === 'pagos' ? 'bg-blue-500/20 text-blue-300' : 'bg-neutral-700 text-gray-400'
              }`}>
                {pagos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              Información
            </button>
          </div>

          {/* Botón Pagar Todo en desktop a la derecha */}
          <div className="flex items-center">
            {calcularDeudaTotal(deudas) > 0 && (
              <button
                onClick={onPayAll}
                className="ml-4 flex items-center gap-2 rounded-md border border-green-700 bg-green-900 px-3 py-1 text-sm font-medium text-green-200 hover:border-green-500 hover:bg-green-800 transition"
              >
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Pagar Todo
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tabs - Ultra Minimalist Supabase Style */}
        <div className="md:hidden px-4 py-1">
          <div className="flex bg-neutral-800/20 rounded-md border border-neutral-700/30">
            <button
              onClick={() => setActiveTab('deudas')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'deudas'
                  ? 'bg-neutral-700/50 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Deudas
            </button>
            <button
              onClick={() => setActiveTab('pagos')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'pagos'
                  ? 'bg-neutral-700/50 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'info'
                  ? 'bg-neutral-700/50 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del Tab */}
      <div className="flex-1 overflow-y-auto p-6">
        {loadingDetails ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Cargando...</div>
          </div>
        ) : (
          <>
            {activeTab === 'deudas' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Productos Adeudados</h3>
                  {deudas.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {deudas.length} venta{deudas.length !== 1 ? 's' : ''} pendiente{deudas.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {deudas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-gray-400 text-lg">No hay deudas pendientes</p>
                    <p className="text-gray-500 text-sm">Este cliente está al día</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deudas.map((deuda) => (
                      <div key={deuda.id} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 md:p-6 hover:bg-neutral-800/70 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-white text-lg">Venta #{deuda.venta_id}</h4>
                            </div>
                            <div className="text-sm text-gray-400">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs mb-2">
                                <span className="flex items-center gap-1">
                                  📅 {formatDate(deuda.venta.fecha)}
                                </span>
                                {deuda.fecha_vencimiento && (
                                  <span className="flex items-center gap-1">
                                    ⏰ Vence: {formatDate(deuda.fecha_vencimiento)}
                                  </span>
                                )}
                              </div>
                              {deuda.notas && (
                                <p className="text-gray-300 italic text-sm">"{deuda.notas}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-red-400">
                              {formatCurrency(deuda.venta.total)}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          {/* Desktop table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm table-fixed border-collapse">
                              <thead>
                                <tr className="border-b border-neutral-600">
                                  <th className="text-left text-neutral-300 py-2 px-2 font-semibold w-1/2">Producto</th>
                                  <th className="text-center text-neutral-300 py-2 px-2 font-semibold w-16">Cant.</th>
                                  <th className="text-right text-neutral-300 py-2 px-2 font-semibold w-24">Precio</th>
                                  <th className="text-right text-neutral-300 py-2 px-2 font-semibold w-24">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {deuda.venta.venta_productos.map((vp, idx) => (
                                  <tr key={idx} className="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                                    <td className="py-2 px-2 text-white font-medium truncate" title={vp.productos.nombre}>{vp.productos.nombre}</td>
                                    <td className="py-2 px-2 text-center text-neutral-300">{vp.cantidad}</td>
                                    <td className="py-2 px-2 text-right text-neutral-300">{formatCurrency(vp.subtotal / vp.cantidad)}</td>
                                    <td className="py-2 px-2 text-right text-red-400 font-semibold">{formatCurrency(vp.subtotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Mobile list */}
                          <div className="md:hidden space-y-2">
                            {deuda.venta.venta_productos.map((vp, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-neutral-700/50 rounded-lg p-3">
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">{vp.productos.nombre}</p>
                                  <p className="text-xs text-gray-400">{vp.cantidad} × {formatCurrency(vp.subtotal / vp.cantidad)}</p>
                                </div>
                                <p className="text-red-400 font-semibold text-sm">{formatCurrency(vp.subtotal)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => onRegisterPayment(deuda)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                          Registrar Pago
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'pagos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Historial de Pagos</h3>
                  {pagos.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {pagos.length} pago{pagos.length !== 1 ? 's' : ''} registrado{pagos.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {pagos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💳</div>
                    <p className="text-gray-400 text-lg">No hay pagos registrados</p>
                    <p className="text-gray-500 text-sm">Los pagos aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pagos.map((pago) => (
                      <div key={pago.id} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-green-400 font-semibold">✓</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">Pago #{pago.id}</h4>
                                <p className="text-sm text-gray-400">Venta fiada #{pago.venta_fiada_id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                📅 {formatDate(pago.fecha_pago)}
                              </span>
                              {pago.metodo_pago && (
                                <span className="flex items-center gap-1">
                                  💳 {pago.metodo_pago}
                                </span>
                              )}
                            </div>
                            {pago.notas && (
                              <p className="text-sm text-gray-300 italic">"{pago.notas}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">
                              {formatCurrency(pago.monto)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Información del Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400">👤</span>
                        </div>
                        <h4 className="font-semibold text-white">Datos Personales</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Nombre Completo</label>
                          <p className="text-white font-medium">{selectedCliente.nombre} {selectedCliente.apellido || ''}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Fecha de Registro</label>
                          <p className="text-white">{formatDate(selectedCliente.fecha_registro)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400">📞</span>
                        </div>
                        <h4 className="font-semibold text-white">Contacto</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Teléfono</label>
                          <p className="text-white">{selectedCliente.telefono || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Email</label>
                          <p className="text-white">{selectedCliente.email || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Dirección</label>
                          <p className="text-white">{selectedCliente.direccion || 'No especificada'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCliente.notas && (
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400">📝</span>
                      </div>
                      <h4 className="font-semibold text-white">Notas y Comentarios</h4>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedCliente.notas}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClienteDetails;