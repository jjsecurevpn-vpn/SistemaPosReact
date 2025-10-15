import { useState, useCallback } from "react";
import { getTodaySales } from "../utils/api";

interface SaleWithProducts {
  id: number;
  fecha: string;
  total: number;
  productos: {
    id: number;
    venta_id: number;
    producto_id: number;
    cantidad: number;
    subtotal: number;
    producto: {
      id: number;
      nombre: string;
      precio: number;
      stock: number;
    };
  }[];
}

export const useReports = () => {
  const [sales, setSales] = useState<SaleWithProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodaySales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const todaySales = await getTodaySales();
      setSales(todaySales);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las ventas"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cálculos útiles
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce(
    (sum, sale) =>
      sum +
      sale.productos.reduce(
        (itemSum, product) => itemSum + product.cantidad,
        0
      ),
    0
  );

  return {
    sales,
    loading,
    error,
    totalSales,
    totalItems,
    loadTodaySales,
    clearError,
  };
};
