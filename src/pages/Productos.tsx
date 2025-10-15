import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../utils/api';

const Productos: React.FC = () => {
  const { products, loading, error, addProduct, editProduct, removeProduct } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
  });

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', stock: '' });
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(formData.precio);
    const stock = parseInt(formData.stock);

    if (isNaN(precio) || isNaN(stock)) {
      alert('Precio y stock deben ser números válidos');
      return;
    }

    try {
      if (isEditing && editingProduct) {
        await editProduct(editingProduct.id, {
          nombre: formData.nombre,
          precio,
          stock,
        });
        alert('Producto actualizado exitosamente');
      } else {
        await addProduct({
          nombre: formData.nombre,
          precio,
          stock,
        });
        alert('Producto creado exitosamente');
      }
      resetForm();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await removeProduct(id);
        alert('Producto eliminado exitosamente');
      } catch {
        // Error is handled in the hook
      }
    }
  };

  return (
    <div className="p-2 md:p-4 max-w-full mx-auto text-dark-text">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-dark-text">Gestión de Productos</h2>
      {error && <div className="text-red-400 mb-4 text-sm md:text-base bg-red-900/20 border border-red-800/50 p-3 rounded-lg backdrop-blur-glass">{error}</div>}

      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-dark-text">
          {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h3>
        <form onSubmit={handleSubmit} className="bg-glass border border-dark-border p-6 rounded-lg backdrop-blur-glass shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-dark-border bg-dark-container text-white p-3 rounded-lg backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full border border-dark-border bg-dark-container text-white p-3 rounded-lg backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-dark-border bg-dark-container text-white p-3 rounded-lg backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm font-semibold"
            >
              {isEditing ? 'Actualizar' : 'Agregar'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Lista de Productos</h3>
        {loading ? (
          <div className="bg-dark-gradient border border-dark-border p-8 rounded-lg backdrop-blur-md">
            <p className="text-center text-gray-400">Cargando...</p>
          </div>
        ) : (
          <div className="bg-dark-gradient border border-dark-border rounded-lg overflow-hidden backdrop-blur-md shadow-xl">
            <table className="w-full min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-container/50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-dark-container/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{product.nombre}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">${product.precio}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{product.stock}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-xs transition-colors backdrop-blur-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs transition-colors backdrop-blur-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;