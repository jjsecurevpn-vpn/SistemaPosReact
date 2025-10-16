import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useClientes } from '../hooks/useClientes';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import type { Cliente } from '../hooks/useClientes';

const POS: React.FC = () => {
  const [search, setSearch] = useState('');
  const [ventaAlFiado, setVentaAlFiado] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { cart, total, loading: saleLoading, error: saleError, addToCart, removeFromCart, confirmSale } = useSales();
  const { clientes, cargarClientes } = useClientes();
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Close dropdown when clicking outside
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
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSale = async () => {
    try {
      if (ventaAlFiado && !clienteSeleccionado) {
        showError('Debe seleccionar un cliente para la venta al fiado');
        return;
      }

      await confirmSale(
        ventaAlFiado ? clienteSeleccionado?.id : undefined,
        undefined, // fechaVencimiento - podría agregarse después
        ventaAlFiado ? `Venta al fiado a ${clienteSeleccionado?.nombre} ${clienteSeleccionado?.apellido}` : undefined
      );

      await fetchProducts();
      showSuccess(ventaAlFiado ? 'Venta al fiado confirmada exitosamente' : 'Venta confirmada exitosamente');
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="h-full bg-[#181818] flex flex-col md:flex-row overflow-hidden">
      {/* Error Messages */}
      {(productsError || saleError) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-auto">
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 p-3 rounded-lg backdrop-blur-sm">
            {productsError || saleError}
          </div>
        </div>
      )}

      {/* Products Section - Left Side */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-2/3 h-1/2 md:h-full border-r border-neutral-800">
        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-neutral-700 bg-neutral-900 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Products List - Scrollable */}
        <div className="flex-1 overflow-auto min-h-0">
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-3 text-neutral-200">Productos</h3>

            {productsLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-neutral-500">Cargando...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-200 truncate">{product.nombre}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-green-400 font-semibold">ARS ${product.precio}</span>
                        <span className={`text-xs ${product.stock > 10 ? 'text-neutral-500' : product.stock > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="ml-3 flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-gray-200 hover:border-neutral-500 hover:bg-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={product.stock === 0 || (cart.find(item => item.product.id === product.id)?.quantity ?? 0) >= product.stock}
                    >
                      Agregar
                    </button>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Section - Right Side */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-1/3 h-1/2 md:h-full bg-neutral-900/30 relative">
        {/* Cart Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0 md:block hidden">
          <h3 className="text-lg font-semibold text-neutral-200">
            Carrito <span className="text-sm font-normal text-neutral-500">({cart.length})</span>
          </h3>
        </div>

        {/* Mobile Cart Header - Fixed */}
        <div className="md:hidden p-4 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-neutral-200">
            Carrito <span className="text-sm font-normal text-neutral-500">({cart.length})</span>
          </h3>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-auto min-h-0 md:pb-0 md:mb-0">
          <div className="p-4 md:p-6">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500 text-center">El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-neutral-200 truncate">{item.product.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-neutral-400">x{item.quantity}</span>
                        <span className="text-sm text-neutral-500">•</span>
                        <span className="text-sm text-green-400 font-semibold">ARS ${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="flex items-center gap-2 rounded-md border border-red-700 bg-red-900/20 px-3 py-2 text-sm font-medium text-red-200 hover:border-red-500 hover:bg-red-800/30 transition flex-shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Total and Confirm Button - Fixed at bottom */}
        <div className="hidden md:block border-t border-neutral-800 bg-neutral-900 absolute bottom-0 left-0 right-0">
          {/* Credit Sale Options */}
          <div className="p-4 border-b border-neutral-800">
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-400 mb-3">
                Tipo de venta
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setVentaAlFiado(false);
                    setClienteSeleccionado(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition ${
                    !ventaAlFiado
                      ? 'border-blue-500 bg-blue-900/20 text-blue-200'
                      : 'border-neutral-700 bg-neutral-900 text-gray-200 hover:border-neutral-500 hover:bg-neutral-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Contado
                </button>
                <button
                  onClick={() => setVentaAlFiado(true)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition ${
                    ventaAlFiado
                      ? 'border-yellow-500 bg-yellow-900/20 text-yellow-200'
                      : 'border-neutral-700 bg-neutral-900 text-gray-200 hover:border-neutral-500 hover:bg-neutral-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Al fiado
                </button>
              </div>
            </div>

            {ventaAlFiado && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Seleccionar cliente:
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setClienteDropdownOpen(!clienteDropdownOpen)}
                    className="w-full flex items-center justify-between border border-neutral-700 bg-neutral-900 text-neutral-200 p-3 rounded-lg hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <span className={clienteSeleccionado ? 'text-neutral-200' : 'text-neutral-500'}>
                      {clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : 'Seleccionar cliente...'}
                    </span>
                    <svg className={`w-4 h-4 text-neutral-400 transition-transform ${clienteDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {clienteDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-48 overflow-auto">
                      <button
                        onClick={() => {
                          setClienteSeleccionado(null);
                          setClienteDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors first:rounded-t-lg"
                      >
                        Seleccionar cliente...
                      </button>
                      {clientes.map(cliente => (
                        <button
                          key={cliente.id}
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setClienteDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
                        >
                          {cliente.nombre} {cliente.apellido}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Total:</span>
              <span className="text-2xl font-bold text-green-400">ARS ${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={handleConfirmSale}
              disabled={cart.length === 0 || saleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-green-700 bg-green-900/20 px-6 py-4 text-sm font-medium text-green-200 hover:border-green-500 hover:bg-green-800/30 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saleLoading ? 'Confirmando...' : 'Confirmar Venta'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Total and Confirm Button - Fixed Footer */}
      <div className="md:hidden border-t border-neutral-800 bg-neutral-900 fixed bottom-0 left-0 right-0 z-10">
        {/* Mobile Total Display */}
        <div className="p-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Total:</span>
            <span className="text-xl font-bold text-green-400">ARS ${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Mobile Credit Sale Options */}
        <div className="p-3 border-b border-neutral-800">
          <div className="mb-2">
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              Tipo de venta
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setVentaAlFiado(false);
                  setClienteSeleccionado(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs font-medium transition ${
                  !ventaAlFiado
                    ? 'border-blue-500 bg-blue-900/20 text-blue-200'
                    : 'border-neutral-700 bg-neutral-900 text-gray-200 hover:border-neutral-500 hover:bg-neutral-800'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Contado
              </button>
              <button
                onClick={() => setVentaAlFiado(true)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs font-medium transition ${
                  ventaAlFiado
                    ? 'border-yellow-500 bg-yellow-900/20 text-yellow-200'
                    : 'border-neutral-700 bg-neutral-900 text-gray-200 hover:border-neutral-500 hover:bg-neutral-800'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Al fiado
              </button>
            </div>
          </div>

          {ventaAlFiado && (
            <div className="mb-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setClienteDropdownOpen(!clienteDropdownOpen)}
                  className="w-full flex items-center justify-between border border-neutral-700 bg-neutral-900 text-neutral-200 p-2 rounded-lg text-sm hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <span className={clienteSeleccionado ? 'text-neutral-200' : 'text-neutral-500'}>
                    {clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : 'Cliente...'}
                  </span>
                  <svg className={`w-3 h-3 text-neutral-400 transition-transform ${clienteDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {clienteDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-32 overflow-auto">
                    <button
                      onClick={() => {
                        setClienteSeleccionado(null);
                        setClienteDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors first:rounded-t-lg"
                    >
                      Cliente...
                    </button>
                    {clientes.map(cliente => (
                      <button
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setClienteDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors"
                      >
                        {cliente.nombre} {cliente.apellido}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0 || saleLoading}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-green-700 bg-green-900/20 px-6 py-4 text-sm font-medium text-green-200 hover:border-green-500 hover:bg-green-800/30 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saleLoading ? 'Confirmando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>

      {/* Notification */}
      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

export default POS;