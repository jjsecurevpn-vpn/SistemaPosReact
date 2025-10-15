import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';

const POS: React.FC = () => {
  const [search, setSearch] = useState('');
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { cart, total, loading: saleLoading, error: saleError, addToCart, removeFromCart, confirmSale } = useSales();

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSale = async () => {
    try {
      await confirmSale();
      // Refrescar la lista de productos para mostrar el stock actualizado
      await fetchProducts();
      alert('Venta confirmada exitosamente');
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="p-2 md:p-4 w-full text-dark-text h-full">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-dark-text">Punto de Venta</h2>
      {(productsError || saleError) && (
        <div className="text-red-400 mb-4 text-sm md:text-base bg-red-900/20 border border-red-800/50 p-3 rounded-lg backdrop-blur-glass">{productsError || saleError}</div>
      )}

      <div className="fixed top-10 left-16 w-[600px] h-[calc(100vh-2.5rem)] bg-[#1a1a1c] p-4 border-r border-gray-400 border-opacity-30 z-10 flex flex-col">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96 border border-dark-border bg-dark-container text-dark-text p-3 rounded-lg backdrop-blur-glass placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <div className="border-b border-gray-400 border-opacity-30"></div>
        <div className="flex-1 overflow-auto" style={{ scrollbarColor: '#1a1a1c #202123' }}>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-dark-text">Productos</h3>
          {productsLoading ? (
            <div className="bg-glass border border-dark-border p-8 rounded-lg backdrop-blur-glass">
              <p className="text-center text-dark-text-muted">Cargando...</p>
            </div>
          ) : (
            <div className="bg-glass border border-dark-border rounded-lg overflow-hidden backdrop-blur-glass shadow-xl h-full">
              <table className="w-full min-w-full divide-y divide-dark-border">
                <thead className="bg-dark-container/50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-glass-hover transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{product.nombre}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-secondary">${product.precio}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{product.stock}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-glass"
                          disabled={product.stock === 0 || (cart.find(item => item.product.id === product.id)?.quantity ?? 0) >= product.stock}
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-10 left-[616px] w-[calc(100vw-616px)] h-[calc(100vh-2.5rem)] bg-[#1a1a1c] p-4 border-l border-gray-400 border-opacity-30 flex z-10">
        <div className="flex-1 pr-4">
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-dark-text">Carrito</h3>
          <div className="bg-glass border border-dark-border rounded-lg overflow-hidden backdrop-blur-glass shadow-xl h-full overflow-auto" style={{ scrollbarColor: '#1a1a1c #202123' }}>
            <table className="w-full min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-container/50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Cant.</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Subtotal</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {cart.map((item, index) => (
                  <tr key={index} className="hover:bg-glass-hover transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{item.product.nombre}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{item.quantity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-secondary">${item.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => removeFromCart(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs transition-colors backdrop-blur-glass"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-80 pl-4">
          <div className="bg-glass border border-dark-border p-6 rounded-lg backdrop-blur-glass shadow-xl h-full flex flex-col justify-center">
            <div className="text-right mb-4">
              <strong className="text-2xl text-dark-text">Total: ${total.toFixed(2)}</strong>
            </div>
            <button
              onClick={handleConfirmSale}
              disabled={cart.length === 0 || saleLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-glass font-semibold"
            >
              {saleLoading ? 'Confirmando...' : 'Confirmar Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;