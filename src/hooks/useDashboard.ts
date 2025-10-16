import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface DashboardStats {
  total_productos: number;
  total_clientes: number;
  ventas_hoy: number;
  ventas_mes: number;
  ingresos_mes: number;
  gastos_mes: number;
  dinero_fiado_pendiente: number;
}

export interface ProductoVendido {
  id: number;
  nombre: string;
  precio: number;
  total_vendido: number;
  total_ingresos: number;
}

export interface ClienteTop {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string | null;
  total_compras_fiadas: number;
  total_comprado: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>(
    []
  );
  const [clientesTop, setClientesTop] = useState<ClienteTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, productosResponse, clientesResponse] =
        await Promise.all([
          supabase.from("dashboard_stats").select("*").single(),
          supabase.from("productos_mas_vendidos").select("*").limit(10),
          supabase.from("clientes_top").select("*").limit(10),
        ]);

      if (statsResponse.error) throw statsResponse.error;
      if (productosResponse.error) throw productosResponse.error;
      if (clientesResponse.error) throw clientesResponse.error;

      setStats(statsResponse.data);
      setProductosVendidos(productosResponse.data || []);
      setClientesTop(clientesResponse.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar datos del dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    productosVendidos,
    clientesTop,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
