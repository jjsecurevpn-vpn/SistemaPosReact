import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  DollarSign,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const {
    stats,
    productosVendidos,
    clientesTop,
    loading,
    error
  } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="p-6 md:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-200 mb-2">Dashboard</h1>
          <p className="text-neutral-400">Resumen general de tu negocio</p>
        </div>

        {/* Estadísticas Principales - Destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Package className="text-blue-400" size={24} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Total Productos</p>
              <p className="text-3xl font-bold text-neutral-200">{stats?.total_productos || 0}</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="text-green-400" size={24} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-neutral-200">{stats?.total_clientes || 0}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShoppingCart className="text-blue-400" size={24} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-400/80 mb-1">Ventas Hoy</p>
              <p className="text-3xl font-bold text-blue-400">{formatCurrency(stats?.ventas_hoy || 0)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/20 rounded-lg p-6 hover:border-green-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="text-green-400" size={24} strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-sm text-green-400/80 mb-1">Ventas Mes</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(stats?.ventas_mes || 0)}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas Financieras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="text-emerald-400" size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                Ingresos
              </span>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Total Mes</p>
              <p className="text-2xl font-bold text-neutral-200">{formatCurrency(stats?.ingresos_mes || 0)}</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="text-red-400" size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                Gastos
              </span>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Total Mes</p>
              <p className="text-2xl font-bold text-neutral-200">{formatCurrency(stats?.gastos_mes || 0)}</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <CreditCard className="text-orange-400" size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                Pendiente
              </span>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Dinero Fiado</p>
              <p className="text-2xl font-bold text-neutral-200">{formatCurrency(stats?.dinero_fiado_pendiente || 0)}</p>
            </div>
          </div>
        </div>

        {/* Listas de Top 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos Más Vendidos */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Award className="text-blue-400" size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-200">Productos Más Vendidos</h2>
              </div>
            </div>
            <div className="divide-y divide-neutral-800">
              {productosVendidos.length === 0 ? (
                <div className="px-6 py-8 text-center text-neutral-500">
                  No hay datos disponibles
                </div>
              ) : (
                productosVendidos.slice(0, 5).map((producto, index) => (
                  <div key={producto.id} className="px-6 py-4 hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-200 font-medium truncate">{producto.nombre}</p>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {producto.total_vendido} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-green-400 font-semibold">{formatCurrency(producto.total_ingresos)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clientes Top */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="text-green-400" size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-200">Clientes Top</h2>
              </div>
            </div>
            <div className="divide-y divide-neutral-800">
              {clientesTop.length === 0 ? (
                <div className="px-6 py-8 text-center text-neutral-500">
                  No hay datos disponibles
                </div>
              ) : (
                clientesTop.slice(0, 5).map((cliente, index) => (
                  <div key={cliente.id} className="px-6 py-4 hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-200 font-medium truncate">
                            {cliente.nombre} {cliente.apellido || ''}
                          </p>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {cliente.total_compras_fiadas} compras fiadas
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-blue-400 font-semibold">{formatCurrency(cliente.total_comprado)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;