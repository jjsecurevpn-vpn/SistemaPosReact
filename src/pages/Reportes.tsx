import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import type { SaleWithProducts, CreditSaleWithProducts } from '../hooks/useReports';

const Reportes: React.FC = () => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const {
    sales,
    creditSales,
    loading,
    error,
    totalSales,
    totalCreditSales,
    totalAllSales,
    totalAllItems,
    loadTodaySales
  } = useReports();

  useEffect(() => {
    loadTodaySales();
  }, [loadTodaySales]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateKey = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const toggleDayExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const groupSalesByDate = (salesList: SaleWithProducts[]) => {
    const grouped: { [key: string]: SaleWithProducts[] } = {};
    salesList.forEach(sale => {
      const dateKey = formatDateKey(sale.fecha);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(sale);
    });
    return grouped;
  };

  const calculateDayStats = (daySales: SaleWithProducts[], dayCreditSales: CreditSaleWithProducts[]) => {
    const totalNormal = daySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCredit = dayCreditSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItemsNormal = daySales.reduce((sum, sale) =>
      sum + sale.productos.reduce((itemSum: number, item: { cantidad: number }) => itemSum + item.cantidad, 0), 0);
    const totalItemsCredit = dayCreditSales.reduce((sum, sale) =>
      sum + sale.productos.reduce((itemSum: number, item: { cantidad: number }) => itemSum + item.cantidad, 0), 0);

    return {
      normalCount: daySales.length,
      creditCount: dayCreditSales.length,
      totalCount: daySales.length + dayCreditSales.length,
      totalNormal,
      totalCredit,
      totalAll: totalNormal + totalCredit,
      totalItemsNormal,
      totalItemsCredit,
      totalItemsAll: totalItemsNormal + totalItemsCredit
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#181818]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#181818] p-8">
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-6 py-4 rounded-lg max-w-2xl">
          <p className="mb-4">{error}</p>
          <button
            onClick={loadTodaySales}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const groupedNormalSales = groupSalesByDate(sales);
  const groupedCreditSales = groupSalesByDate(creditSales);

  // Get all unique dates from both sales types
  const allDates = Array.from(new Set([
    ...Object.keys(groupedNormalSales),
    ...Object.keys(groupedCreditSales)
  ])).sort().reverse(); // Most recent first

  return (
    <div className="h-full bg-[#181818]">
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header con título */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-200 mb-2">Reportes de Ventas</h1>
          <p className="text-sm md:text-base text-neutral-400">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400 uppercase tracking-wide">Ventas Normales</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold text-neutral-200">{sales.length}</p>
            <p className="text-xs md:text-sm text-green-400">{formatCurrency(totalSales)}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400 uppercase tracking-wide">Ventas al Fiado</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold text-blue-400">{creditSales.length}</p>
            <p className="text-xs md:text-sm text-blue-400">{formatCurrency(totalCreditSales)}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400 uppercase tracking-wide">Total Ventas</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-400">{sales.length + creditSales.length}</p>
            <p className="text-xs md:text-sm text-green-400">{formatCurrency(totalAllSales)}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 md:p-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400 uppercase tracking-wide">Productos Vendidos</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">{totalAllItems}</p>
          </div>
        </div>

        {/* Reportes por Día */}
        <div className="space-y-6">
          {allDates.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
              <p className="text-neutral-400">No hay ventas registradas</p>
            </div>
          ) : (
            allDates.map(dateKey => {
              const dayNormalSales = groupedNormalSales[dateKey] || [];
              const dayCreditSales = groupedCreditSales[dateKey] || [];
              const dayStats = calculateDayStats(dayNormalSales, dayCreditSales);
              const isExpanded = expandedDays.has(dateKey);

              return (
                <div key={dateKey} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                  {/* Day Header */}
                  <div
                    className="px-4 md:px-6 py-4 md:py-5 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                    onClick={() => toggleDayExpansion(dateKey)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <button className="text-neutral-400 hover:text-neutral-200 transition-colors flex-shrink-0">
                          {isExpanded ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg md:text-xl font-semibold text-neutral-200 truncate">
                            {formatDate(dayNormalSales[0]?.fecha || dayCreditSales[0]?.fecha)}
                          </h2>
                          <p className="text-xs md:text-sm text-neutral-400">
                            {dayStats.totalCount} venta{dayStats.totalCount !== 1 ? 's' : ''} • {dayStats.totalItemsAll} producto{dayStats.totalItemsAll !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xl md:text-2xl font-bold text-green-400">
                          {formatCurrency(dayStats.totalAll)}
                        </p>
                        <p className="text-xs md:text-sm text-neutral-400">
                          {dayStats.normalCount > 0 && `${dayStats.normalCount} normal${dayStats.normalCount !== 1 ? 'es' : ''}`}
                          {dayStats.normalCount > 0 && dayStats.creditCount > 0 && ' • '}
                          {dayStats.creditCount > 0 && `${dayStats.creditCount} al fiado`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="divide-y divide-neutral-800">
                      {/* Ventas Normales del Día */}
                      {dayNormalSales.length > 0 && (
                        <div className="p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-semibold text-neutral-200 mb-3 md:mb-4">
                            Ventas Normales ({dayNormalSales.length})
                          </h3>
                          <div className="space-y-3 md:space-y-4">
                            {dayNormalSales.map((sale) => (
                              <div key={sale.id} className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-800 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-4 mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-neutral-300">Venta Normal</span>
                                      </div>
                                      <span className="text-xs md:text-sm text-neutral-400">
                                        {formatTime(sale.fecha)}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      <h5 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                        Productos
                                      </h5>
                                      {sale.productos.map((item: SaleWithProducts['productos'][0], index: number) => (
                                        <div
                                          key={index}
                                          className="bg-neutral-700/50 border border-neutral-600 rounded px-3 py-2 flex justify-between items-center text-sm"
                                        >
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-neutral-200 truncate">
                                              {item.producto.nombre}
                                            </span>
                                            <span className="text-neutral-500 flex-shrink-0">
                                              ×{item.cantidad}
                                            </span>
                                          </div>
                                          <span className="text-neutral-400 flex-shrink-0 ml-2">
                                            {formatCurrency(item.subtotal)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-lg md:text-xl font-bold text-green-400">
                                      {formatCurrency(sale.total)}
                                    </p>
                                    <p className="text-xs md:text-sm text-neutral-400">
                                      {sale.productos.reduce((sum: number, item: SaleWithProducts['productos'][0]) => sum + item.cantidad, 0)} producto{sale.productos.reduce((sum: number, item: SaleWithProducts['productos'][0]) => sum + item.cantidad, 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ventas al Fiado del Día */}
                      {dayCreditSales.length > 0 && (
                        <div className="p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-semibold text-blue-400 mb-3 md:mb-4">
                            Ventas al Fiado ({dayCreditSales.length})
                          </h3>
                          <div className="space-y-3 md:space-y-4">
                            {dayCreditSales.map((sale: CreditSaleWithProducts) => (
                              <div key={sale.id} className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-800 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-4 mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-neutral-300">Venta al Fiado</span>
                                      </div>
                                      <span className="text-xs md:text-sm text-neutral-400">
                                        {formatTime(sale.fecha)}
                                      </span>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                      <h5 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                        Productos
                                      </h5>
                                      {sale.productos.map((item: SaleWithProducts['productos'][0], index: number) => (
                                        <div
                                          key={index}
                                          className="bg-neutral-700/50 border border-neutral-600 rounded px-3 py-2 flex justify-between items-center text-sm"
                                        >
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-neutral-200 truncate">
                                              {item.producto.nombre}
                                            </span>
                                            <span className="text-neutral-500 flex-shrink-0">
                                              ×{item.cantidad}
                                            </span>
                                          </div>
                                          <span className="text-neutral-400 flex-shrink-0 ml-2">
                                            {formatCurrency(item.subtotal)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                      <p>Cliente: <span className="text-neutral-300">{sale.cliente_nombre}</span></p>
                                      {sale.estado === 'pagado' ? (
                                        <p className="text-green-400">✓ Pagado</p>
                                      ) : (
                                        <p className="text-yellow-400">Pendiente: {formatCurrency(sale.total)}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-lg md:text-xl font-bold text-blue-400">
                                      {formatCurrency(sale.total)}
                                    </p>
                                    <p className="text-xs md:text-sm text-neutral-400">
                                      {sale.productos.reduce((sum: number, item: SaleWithProducts['productos'][0]) => sum + item.cantidad, 0)} producto{sale.productos.reduce((sum: number, item: SaleWithProducts['productos'][0]) => sum + item.cantidad, 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;