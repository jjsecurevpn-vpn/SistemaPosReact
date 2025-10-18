import { useState, useCallback } from "react";
import { getTodaySales, getTodayCreditSales } from "../utils/api";

export interface SaleWithProducts {
  id: number;
  fecha: string;
  total: number;
  notas?: string;
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

export interface CreditSaleWithProducts extends SaleWithProducts {
  cliente_nombre?: string;
  estado?: string;
}

export const useReports = () => {
  const [sales, setSales] = useState<SaleWithProducts[]>([]);
  const [creditSales, setCreditSales] = useState<CreditSaleWithProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodaySales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [todaySales, todayCreditSales] = await Promise.all([
        getTodaySales(),
        getTodayCreditSales(),
      ]);
      setSales(todaySales);
      setCreditSales(todayCreditSales);
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
  const totalCreditSales = creditSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );
  const totalAllSales = totalSales + totalCreditSales;
  const totalItems = sales.reduce(
    (sum, sale) =>
      sum +
      (sale.productos || []).reduce(
        (itemSum, product) => itemSum + (product?.cantidad || 0),
        0
      ),
    0
  );
  const totalCreditItems = creditSales.reduce(
    (sum, sale) =>
      sum +
      (sale.productos || []).reduce(
        (itemSum, product) => itemSum + (product?.cantidad || 0),
        0
      ),
    0
  );
  const totalAllItems = totalItems + totalCreditItems;

  return {
    sales,
    creditSales,
    loading,
    error,
    totalSales,
    totalCreditSales,
    totalAllSales,
    totalItems,
    totalCreditItems,
    totalAllItems,
    loadTodaySales,
    clearError,
  };
};
