import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useClientes } from '../hooks/useClientes';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import type { Cliente } from '../hooks/useClientes';
import { Search, ShoppingCart, CreditCard, Banknote, ChevronDown, Plus, X } from 'lucide-react';

const POS: React.FC = () => {
  const [search, setSearch] = useState('');
  const [ventaAlFiado, setVentaAlFiado] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [ventaNotas, setVentaNotas] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { cart, total, loading: saleLoading, error: saleError, addToCart, removeFromCart, confirmSale } = useSales();
  const { clientes, cargarClientes } = useClientes();
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClienteDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p =>
    search.trim() !== '' && p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSale = async () => {
    try {
      if (ventaAlFiado && !clienteSeleccionado) {
        showError('Debe seleccionar un cliente para la venta al fiado');
        return;
      }

      const notasVenta = ventaNotas || undefined;
      const notasFiado = ventaAlFiado && clienteSeleccionado
        ? `${ventaNotas ? ventaNotas + ' - ' : ''}Venta al fiado a ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ''}`
        : undefined;

      await confirmSale(
        ventaAlFiado ? clienteSeleccionado?.id : undefined,
        undefined,
        notasVenta,
        notasFiado
      );

      setVentaNotas('');
      setVentaAlFiado(false);
      setClienteSeleccionado(null);

      await fetchProducts();
      showSuccess(ventaAlFiado ? 'Venta al fiado confirmada exitosamente' : 'Venta confirmada exitosamente');
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="h-full bg-[#181818] flex flex-col">
      {/* Error Messages */}
      {(productsError || saleError) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-auto">
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 p-3 rounded-lg backdrop-blur-sm">
            {productsError || saleError}
          </div>
        </div>
      )}

      {/* Main Content - Products and Cart Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section - Left */}
        <div className="flex-1 flex flex-col border-r border-neutral-800 overflow-hidden">
          {/* Search */}
          <div className="border-b border-neutral-800 bg-neutral-900 relative">
            <Search className="absolute left-3 md:left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 z-10" size={18} />
            <input
              type="text"
              placeholder="Escribe para buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-4 text-sm border-0 bg-neutral-900 md:bg-[#181818] text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors z-10"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto">
            {productsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-sm text-neutral-500">Cargando...</p>
                </div>
              </div>
            ) : (
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0 || (cart.find(item => item.product.id === product.id)?.quantity ?? 0) >= product.stock}
                      className="group relative bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg p-3 md:p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full font-medium ${
                          product.stock === 0
                            ? 'bg-red-900/50 text-red-400'
                            : product.stock < 5
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {product.stock}
                        </span>
                      </div>

                      <div className="pr-8">
                        <h3 className="font-semibold text-neutral-200 text-sm md:text-base mb-1 line-clamp-2">
                          {product.nombre}
                        </h3>
                        <p className="text-green-400 font-bold text-base md:text-lg">
                          ${product.precio}
                        </p>
                      </div>

                      {/* Add Icon on Hover */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-blue-600 text-white p-2 rounded-full">
                          <Plus size={20} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    <ShoppingCart className="mx-auto mb-3 opacity-50" size={48} />
                    <p>{search.trim() === '' ? 'Escribe para buscar productos' : 'No se encontraron productos'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section - Right (Desktop) */}
        <div className="hidden md:flex md:w-80 lg:w-96 flex-col bg-neutral-900 h-full">
          {/* Cart Header */}
                    {/* Cart Header */}
          <div className="py-3.5 border-b border-neutral-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-200 flex items-center gap-2 pl-3">
                <ShoppingCart size={18} />
                Carrito
              </h3>
              <span className="text-xs text-neutral-400 pr-3">
                {cart.length}
              </span>
            </div>
          </div>

          {/* Cart Items - Scrollable with max height */}
          <div className="flex-1 overflow-auto min-h-0 max-h-[60vh] p-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <ShoppingCart className="mb-2 opacity-50" size={40} />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="bg-[#181818] border border-neutral-800 rounded-lg p-2.5">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-neutral-200 text-sm truncate">{item.product.nombre}</p>
                        <p className="text-green-400 font-semibold text-base">${item.subtotal.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Cantidad:</span>
                      <span className="text-neutral-400">×{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section - Fixed at bottom with minimum height */}
          <div className="border-t border-neutral-800 bg-neutral-900 flex-shrink-0 min-h-[120px] sticky bottom-0">
            {/* Payment Type */}
            <div className="px-3 py-2 border-b border-neutral-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setVentaAlFiado(false);
                    setClienteSeleccionado(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    !ventaAlFiado
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  <Banknote size={14} />
                  Contado
                </button>
                <button
                  onClick={() => setVentaAlFiado(true)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    ventaAlFiado
                      ? 'bg-yellow-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  <CreditCard size={14} />
                  Fiado
                </button>
              </div>
            </div>

            {/* Client Selection */}
            {ventaAlFiado && (
              <div className="px-3 py-2 border-b border-neutral-800">
                <label className="block text-xs font-medium text-neutral-400 mb-2">Cliente</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setClienteDropdownOpen(!clienteDropdownOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-xs hover:border-neutral-600 transition-all"
                  >
                    <span className={clienteSeleccionado ? 'text-neutral-200' : 'text-neutral-500'}>
                      {clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ''}` : 'Seleccionar...'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${clienteDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {clienteDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a1a] border border-neutral-700/50 rounded-xl shadow-2xl z-50 max-h-56 overflow-auto">
                      {clientes.length === 0 ? (
                        <div className="px-4 py-6 text-center text-neutral-400 text-sm">
                          <CreditCard className="mx-auto mb-2 opacity-50" size={24} />
                          No hay clientes registrados
                        </div>
                      ) : (
                        clientes.map(cliente => (
                          <button
                            key={cliente.id}
                            onClick={() => {
                              setClienteSeleccionado(cliente);
                              setClienteDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-4 hover:bg-neutral-800/50 transition-all duration-200 border-b border-neutral-800/30 last:border-b-0 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-white text-sm font-bold">
                                  {cliente.nombre.charAt(0)}{cliente.apellido?.charAt(0) || ''}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-100 text-sm mb-1 group-hover:text-emerald-400 transition-colors truncate">
                                  {cliente.nombre} {cliente.apellido || ''}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                  {cliente.telefono && (
                                    <span className="flex items-center gap-1">
                                      <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                                      {cliente.telefono}
                                    </span>
                                  )}
                                  {cliente.email && (
                                    <span className="flex items-center gap-1">
                                      <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                                      {cliente.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown size={16} className="rotate-[-90deg]" />
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="px-3 py-2 border-b border-neutral-800">
              <textarea
                value={ventaNotas}
                onChange={(e) => setVentaNotas(e.target.value)}
                placeholder="Comentarios..."
                rows={2}
                className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total and Confirm */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm font-medium">Total</span>
                <span className="text-xl font-bold text-green-400">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleConfirmSale}
                disabled={cart.length === 0 || saleLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed"
              >
                {saleLoading ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Fixed Bottom Cart Summary */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-20 max-h-[60vh] flex flex-col">
        {/* Cart Items - Scrollable */}
        {cart.length > 0 && (
          <div className="overflow-auto max-h-48 border-b border-neutral-800">
            <div className="p-3 space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="bg-[#181818] border border-neutral-800 rounded-lg p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-neutral-200 text-xs truncate">{item.product.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-neutral-400">×{item.quantity}</span>
                        <span className="text-xs text-green-400 font-semibold">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Section */}
        <div className="p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-neutral-400" />
              <span className="text-sm text-neutral-400">{cart.length} items</span>
            </div>
            <span className="text-xl font-bold text-green-400">${total.toFixed(2)}</span>
          </div>
          
          {/* Payment Type Compact */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => {
                setVentaAlFiado(false);
                setClienteSeleccionado(null);
              }}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                !ventaAlFiado
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <Banknote size={14} />
              Contado
            </button>
            <button
              onClick={() => setVentaAlFiado(true)}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                ventaAlFiado
                  ? 'bg-yellow-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <CreditCard size={14} />
              Fiado
            </button>
          </div>

          {/* Client Selection Mobile */}
          {ventaAlFiado && (
            <div className="mb-2" ref={dropdownRef}>
              <button
                onClick={() => setClienteDropdownOpen(!clienteDropdownOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded text-xs"
              >
                <span className={clienteSeleccionado ? 'text-neutral-200' : 'text-neutral-500'}>
                  {clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ''}` : 'Cliente...'}
                </span>
                <ChevronDown size={14} />
              </button>
              {clienteDropdownOpen && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1a1a] border border-neutral-700/50 rounded-xl shadow-2xl z-50 max-h-56 overflow-auto">
                  {clientes.length === 0 ? (
                    <div className="px-4 py-6 text-center text-neutral-400 text-sm">
                      <CreditCard className="mx-auto mb-2 opacity-50" size={24} />
                      No hay clientes registrados
                    </div>
                  ) : (
                    clientes.map(cliente => (
                      <button
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setClienteDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-4 hover:bg-neutral-800/50 transition-all duration-200 border-b border-neutral-800/30 last:border-b-0 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white text-sm font-bold">
                              {cliente.nombre.charAt(0)}{cliente.apellido?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-100 text-sm mb-1 group-hover:text-emerald-400 transition-colors truncate">
                              {cliente.nombre} {cliente.apellido || ''}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                              {cliente.telefono && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                                  {cliente.telefono}
                                </span>
                              )}
                              {cliente.email && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                                  {cliente.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronDown size={16} className="rotate-[-90deg]" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes Mobile */}
          <div className="mb-2">
            <textarea
              value={ventaNotas}
              onChange={(e) => setVentaNotas(e.target.value)}
              placeholder="Comentarios..."
              rows={2}
              className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0 || saleLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed"
          >
            {saleLoading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>

      {/* Mobile: Add padding to avoid overlap with fixed footer */}
      <div className="md:hidden h-32"></div>

      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

export default POS;