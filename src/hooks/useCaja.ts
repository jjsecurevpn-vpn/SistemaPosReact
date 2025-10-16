import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface MovimientoCaja {
  id: number;
  fecha: string;
  tipo: "ingreso" | "gasto" | "fiado" | "pago_fiado";
  descripcion: string;
  monto: number;
  categoria?: string;
  notas?: string;
}

export interface DeudaPendiente {
  id: number;
  venta_id: number;
  cliente_id: number;
  estado: string;
  venta: {
    id: number;
    fecha: string;
    total: number;
  };
}

export const useCaja = () => {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [deudasPendientes, setDeudasPendientes] = useState<DeudaPendiente[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular estadísticas
  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((total, m) => total + m.monto, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((total, m) => total + m.monto, 0);

  // Calcular dinero fiado basado en deudas pendientes REALES, no en movimientos históricos
  const dineroFiado = deudasPendientes.reduce(
    (total, deuda) => total + deuda.venta.total,
    0
  );

  const pagosFiado = movimientos
    .filter((m) => m.tipo === "pago_fiado")
    .reduce((total, m) => total + m.monto, 0);

  const dineroDisponible = ingresos - gastos + pagosFiado;
  const dineroPendienteFiado = dineroFiado;

  const cargarMovimientos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar movimientos de caja
      const { data: movimientosData, error: movimientosError } = await supabase
        .from("movimientos_caja")
        .select("*")
        .order("fecha", { ascending: false });

      if (movimientosError) throw movimientosError;

      // Cargar deudas pendientes reales
      const { data: deudasData, error: deudasError } = await supabase
        .from("ventas_fiadas")
        .select(
          `
          *,
          venta:ventas (
            id,
            fecha,
            total
          )
        `
        )
        .eq("estado", "pendiente");

      if (deudasError) throw deudasError;

      setMovimientos(movimientosData || []);
      setDeudasPendientes(deudasData || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar datos de caja"
      );
    } finally {
      setLoading(false);
    }
  };

  const agregarMovimiento = async (
    movimiento: Omit<MovimientoCaja, "id" | "fecha">
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("movimientos_caja")
        .insert([movimiento])
        .select()
        .single();

      if (error) throw error;

      // Recargar datos para actualizar cálculos de deudas pendientes
      await cargarMovimientos();
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al agregar movimiento"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarMovimiento = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // Primero obtener el movimiento para ver si es una venta
      const { data: movimiento, error: fetchError } = await supabase
        .from("movimientos_caja")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Si es un movimiento de venta (ingreso con descripción que contiene "Venta #"), eliminar también la venta
      if (
        movimiento.tipo === "ingreso" &&
        movimiento.descripcion.includes("Venta #")
      ) {
        // Extraer el ID de la venta de la descripción (formato: "Venta #123")
        const ventaIdMatch = movimiento.descripcion.match(/Venta #(\d+)/);
        if (ventaIdMatch) {
          const ventaId = parseInt(ventaIdMatch[1]);

          // Eliminar la venta y sus productos asociados
          await supabase
            .from("venta_productos")
            .delete()
            .eq("venta_id", ventaId);
          await supabase.from("ventas").delete().eq("id", ventaId);

          // Si era una venta al fiado, eliminar también el registro de ventas_fiadas
          await supabase.from("ventas_fiadas").delete().eq("venta_id", ventaId);
        }
      }

      // Si es un movimiento de venta al fiado (tipo "fiado" con descripción que contiene "Venta al fiado #"), eliminar también la venta
      if (
        movimiento.tipo === "fiado" &&
        movimiento.descripcion.includes("Venta al fiado #")
      ) {
        // Extraer el ID de la venta de la descripción (formato: "Venta al fiado #123")
        const ventaIdMatch = movimiento.descripcion.match(
          /Venta al fiado #(\d+)/
        );
        if (ventaIdMatch) {
          const ventaId = parseInt(ventaIdMatch[1]);

          // Eliminar la venta y sus productos asociados
          await supabase
            .from("venta_productos")
            .delete()
            .eq("venta_id", ventaId);
          await supabase.from("ventas").delete().eq("id", ventaId);

          // Eliminar también el registro de ventas_fiadas
          await supabase.from("ventas_fiadas").delete().eq("venta_id", ventaId);
        }
      }

      // Si es un movimiento de pago fiado, también podríamos eliminar el pago, pero por ahora solo eliminamos el movimiento
      // Los pagos fiados se mantienen en la tabla pagos_fiados para historial

      // Eliminar el movimiento de caja
      const { error } = await supabase
        .from("movimientos_caja")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Recargar datos para actualizar cálculos
      await cargarMovimientos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar movimiento"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return {
    movimientos,
    loading,
    error,
    ingresos,
    gastos,
    dineroFiado,
    pagosFiado,
    dineroDisponible,
    dineroPendienteFiado,
    cargarMovimientos,
    agregarMovimiento,
    eliminarMovimiento,
  };
};
