import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import Modal from '../components/Modal';
import type { Product } from '../utils/api';
import { Plus, Search, Edit2, Trash2, FileText, StickyNote, Filter } from 'lucide-react';

const Productos: React.FC = () => {
  const { products, loading, error, addProduct, editProduct, removeProduct } = useProducts();
  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    notas: '',
  });
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterDropdownOpen && !(event.target as Element).closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterDropdownOpen]);

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', stock: '', descripcion: '', notas: '' });
    setIsEditing(false);
    setEditingProduct(null);
    setIsFormModalOpen(false);
  };

  const openFormModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        precio: product.precio.toString(),
        stock: product.stock.toString(),
        descripcion: product.descripcion || '',
        notas: product.notas || '',
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(formData.precio);
    const stock = parseInt(formData.stock);

    if (isNaN(precio) || isNaN(stock)) {
      showNotification('Precio y stock deben ser números válidos', 'error');
      return;
    }

    try {
      if (isEditing && editingProduct) {
        await editProduct(editingProduct.id, {
          nombre: formData.nombre,
          precio,
          stock,
          descripcion: formData.descripcion,
          notas: formData.notas,
        });
        showNotification('Producto actualizado exitosamente', 'success');
      } else {
        await addProduct({
          nombre: formData.nombre,
          precio,
          stock,
          descripcion: formData.descripcion,
          notas: formData.notas,
        });
        showNotification('Producto creado exitosamente', 'success');
      }
      resetForm();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: number) => {
    setProductToDelete(id);
    setIsConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await removeProduct(productToDelete);
        showNotification('Producto eliminado exitosamente', 'success');
      } catch {
        // Error is handled in the hook
      }
    }
    setIsConfirmDelete(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
    setProductToDelete(null);
  };

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  // Calcular estadísticas
  const totalStockValue = products.reduce((total, product) => total + (product.precio * product.stock), 0);
  const outOfStockCount = products.filter(product => product.stock === 0).length;
  const lowStockCount = products.filter(product => product.stock > 0 && product.stock < 5).length;
  const totalProducts = products.length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                         p.descripcion?.toLowerCase().includes(search.toLowerCase());
    
    let matchesStock = true;
    if (stockFilter === 'in-stock') {
      matchesStock = p.stock > 0;
    } else if (stockFilter === 'low-stock') {
      matchesStock = p.stock > 0 && p.stock < 5;
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = p.stock === 0;
    }
    
    return matchesSearch && matchesStock;
  });

  return (
    <div className="h-full bg-[#181818]">
      <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-200 mb-2">Gestión de Productos</h1>
            <p className="text-neutral-400">Administra tu inventario</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => openFormModal()}
              className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
            >
              <Plus size={16} />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Valor Total</div>
            <p className="text-xl md:text-2xl font-bold text-neutral-200">
              ${totalStockValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Total Productos</div>
            <p className="text-xl md:text-2xl font-bold text-blue-400">{totalProducts}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Sin Stock</div>
            <p className="text-xl md:text-2xl font-bold text-red-400">{outOfStockCount}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Stock Bajo</div>
            <p className="text-xl md:text-2xl font-bold text-yellow-400">{lowStockCount}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                stockFilter !== 'all' ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Filter size={18} />
            </button>
            
            {/* Filter Dropdown */}
            {isFilterDropdownOpen && (
              <div className="filter-dropdown absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 px-2">Filtrar por stock</div>
                  <button
                    onClick={() => {
                      setStockFilter('all');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      stockFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Todos ({totalProducts})
                  </button>
                  <button
                    onClick={() => {
                      setStockFilter('in-stock');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      stockFilter === 'in-stock'
                        ? 'bg-green-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Con Stock ({totalProducts - outOfStockCount - lowStockCount})
                  </button>
                  <button
                    onClick={() => {
                      setStockFilter('low-stock');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      stockFilter === 'low-stock'
                        ? 'bg-yellow-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Stock Bajo ({lowStockCount})
                  </button>
                  <button
                    onClick={() => {
                      setStockFilter('out-of-stock');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      stockFilter === 'out-of-stock'
                        ? 'bg-red-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Sin Stock ({outOfStockCount})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Table/Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-neutral-400">Cargando productos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-800/50 border-b border-neutral-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Info
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-200">{product.nombre}</div>
                          {product.descripcion && (
                            <div className="text-sm text-neutral-500 mt-1 truncate max-w-xs">
                              {product.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-semibold">${product.precio}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0
                              ? 'bg-red-900/50 text-red-400'
                              : product.stock < 5
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-green-900/50 text-green-400'
                          }`}>
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {product.descripcion && (
                              <button
                                onClick={() => openModal('Descripción', product.descripcion!)}
                                className="text-neutral-400 hover:text-blue-400 transition-colors"
                                title="Ver descripción"
                              >
                                <FileText size={18} />
                              </button>
                            )}
                            {product.notas && (
                              <button
                                onClick={() => openModal('Notas', product.notas!)}
                                className="text-neutral-400 hover:text-blue-400 transition-colors"
                                title="Ver notas"
                              >
                                <StickyNote size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openFormModal(product)}
                                  className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  No se encontraron productos
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-200 truncate">{product.nombre}</h3>
                      {product.descripcion && (
                        <p className="text-sm text-neutral-500 mt-1 truncate">{product.descripcion}</p>
                      )}
                    </div>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? 'bg-red-900/50 text-red-400'
                        : product.stock < 5
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-green-900/50 text-green-400'
                    }`}>
                      {product.stock}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-400">${product.precio}</span>
                    <div className="flex items-center gap-2">
                      {product.descripcion && (
                        <button
                          onClick={() => openModal('Descripción', product.descripcion!)}
                          className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      {product.notas && (
                        <button
                          onClick={() => openModal('Notas', product.notas!)}
                          className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <StickyNote size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openFormModal(product)}
                          className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  No se encontraron productos
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Precio *</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-neutral-300">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              rows={3}
              placeholder="Descripción del producto (opcional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              rows={3}
              placeholder="Notas adicionales (opcional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {isEditing ? 'Actualizar' : 'Crear Producto'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Content Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-200">{modalContent.title}</h3>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-neutral-300 whitespace-pre-wrap">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="text-center">
          <p className="text-neutral-300 mb-6">¿Estás seguro de que quieres eliminar este producto?</p>
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

export default Productos;