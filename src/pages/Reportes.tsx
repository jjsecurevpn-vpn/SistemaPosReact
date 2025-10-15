import React, { useEffect } from 'react';
import { useReports } from '../hooks/useReports';

const Reportes: React.FC = () => {
  const { sales, loading, error, totalSales, totalItems, loadTodaySales } = useReports();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-100 border border-danger-300 text-danger px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button
          onClick={loadTodaySales}
          className="btn btn-primary mt-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:pl-64 md:pr-8 pt-16">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-glass border border-dark-border rounded-card p-card">
          <h3 className="text-title-md text-dark-text mb-2">Ventas del Día</h3>
          <p className="text-value-lg text-primary">{sales.length}</p>
        </div>
        <div className="bg-glass border border-dark-border rounded-card p-card">
          <h3 className="text-title-md text-dark-text mb-2">Total Vendido</h3>
          <p className="text-value-lg text-success">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-glass border border-dark-border rounded-card p-card">
          <h3 className="text-title-md text-dark-text mb-2">Productos Vendidos</h3>
          <p className="text-value-lg text-warning">{totalItems}</p>
        </div>
      </div>

  {/* Lista de ventas */}
  <div className="bg-glass border border-dark-border rounded-card overflow-hidden">
        <div className="p-section-lg border-b border-dark-border">
          <h2 className="text-title-lg text-dark-text">Ventas de Hoy</h2>
          <p className="text-dark-text-secondary mt-1">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {sales.length === 0 ? (
          <div className="p-section-lg text-center text-dark-text-secondary">
            <p>No hay ventas registradas para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {sales.map((sale) => (
              <div key={sale.id} className="p-section-lg hover:bg-dark-container transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-title-md text-dark-text">
                      Venta #{sale.id}
                    </h3>
                    <p className="text-dark-text-secondary">
                      {formatTime(sale.fecha)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-value-md text-primary">
                      {formatCurrency(sale.total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-label-sm text-dark-text-muted uppercase font-semibold">
                    Productos vendidos:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sale.productos.map((item, index) => (
                      <div
                        key={index}
                        className="bg-dark-container border border-dark-border rounded-badge p-badge flex justify-between items-center"
                      >
                        <div>
                          <span className="text-dark-text font-medium">
                            {item.producto.nombre}
                          </span>
                          <span className="text-dark-text-secondary ml-2">
                            ×{item.cantidad}
                          </span>
                        </div>
                        <span className="text-dark-text-secondary">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de actualizar */}
      <div className="flex justify-center">
        <button
          onClick={loadTodaySales}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar Reportes'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default Reportes;