import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface Cliente {
  id: number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_registro: string;
  notas?: string;
  deuda?: number;
}

export interface VentaFiada {
  id: number;
  venta_id: number;
  cliente_id: number;
  fecha_vencimiento?: string;
  estado: "pendiente" | "pagada" | "vencida";
  notas?: string;
  venta: {
    id: number;
    fecha: string;
    total: number;
    venta_productos: Array<{
      cantidad: number;
      subtotal: number;
      productos: { nombre: string };
    }>;
  };
}

export interface PagoFiado {
  id: number;
  venta_fiada_id: number;
  monto: number;
  fecha_pago: string;
  metodo_pago?: string;
  notas?: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          `
          *,
          ventas_fiadas (
            estado,
            venta:ventas (
              total
            )
          )
        `
        )
        .order("nombre");

      if (error) throw error;

      // Calcular deuda total por cliente
      const clientesConDeuda = (data || []).map((cliente) => ({
        ...cliente,
        deuda:
          cliente.ventas_fiadas
            ?.filter((vf: any) => vf.estado === "pendiente")
            .reduce(
              (sum: number, vf: any) => sum + (vf.venta?.total || 0),
              0
            ) || 0,
      }));

      setClientes(clientesConDeuda);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarCliente = useCallback(
    async (cliente: Omit<Cliente, "id" | "fecha_registro">) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("clientes")
          .insert([cliente])
          .select()
          .single();

        if (error) throw error;

        setClientes((prev) => [...prev, data]);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al agregar cliente"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const editarCliente = useCallback(
    async (
      id: number,
      cliente: Partial<Omit<Cliente, "id" | "fecha_registro">>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("clientes")
          .update(cliente)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setClientes((prev) => prev.map((c) => (c.id === id ? data : c)));
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al editar cliente"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarCliente = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;

      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar cliente"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDeudasCliente = useCallback(async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from("ventas_fiadas")
        .select(
          `
          *,
          venta:ventas (
            id,
            fecha,
            total,
            venta_productos (
              cantidad,
              subtotal,
              productos (
                nombre
              )
            )
          )
        `
        )
        .eq("cliente_id", clienteId)
        .eq("estado", "pendiente");

      if (error) throw error;

      // Filtrar solo deudas donde el cliente aún existe (por si hay datos huérfanos)
      const validDeudas = (data || []).filter(
        (deuda) => deuda.cliente_id === clienteId
      );

      return validDeudas;
    } catch (err) {
      console.error("Error al cargar deudas:", err);
      return [];
    }
  }, []);

  const cargarPagosCliente = useCallback(async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from("pagos_fiados")
        .select(
          `
          *,
          ventas_fiadas!inner (
            cliente_id,
            venta:ventas (
              id,
              fecha,
              total
            )
          )
        `
        )
        .eq("ventas_fiadas.cliente_id", clienteId)
        .order("fecha_pago", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      return [];
    }
  }, []);

  const registrarPago = useCallback(
    async (
      ventaFiadaId: number,
      monto: number,
      metodoPago?: string,
      notas?: string
    ) => {
      try {
        const { data, error } = await supabase
          .from("pagos_fiados")
          .insert([
            {
              venta_fiada_id: ventaFiadaId,
              monto,
              metodo_pago: metodoPago,
              notas,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Registrar el pago como ingreso en caja (convierte dinero fiado en disponible)
        await supabase.from("movimientos_caja").insert([
          {
            tipo: "pago_fiado",
            descripcion: `Pago de deuda #${ventaFiadaId}`,
            monto,
            categoria: "pagos_fiados",
            notas: `Método: ${metodoPago || "No especificado"}. ${notas || ""}`,
          },
        ]);

        // Marcar la deuda como pagada cuando se registra un pago
        await supabase
          .from("ventas_fiadas")
          .update({ estado: "pagada" })
          .eq("id", ventaFiadaId);

        return data;
      } catch (err) {
        console.error("Error al registrar pago:", err);
        throw err;
      }
    },
    []
  );

  const crearVentaFiada = useCallback(
    async (
      ventaId: number,
      clienteId: number,
      fechaVencimiento?: string,
      notas?: string
    ) => {
      try {
        const { data, error } = await supabase
          .from("ventas_fiadas")
          .insert([
            {
              venta_id: ventaId,
              cliente_id: clienteId,
              fecha_vencimiento: fechaVencimiento,
              estado: "pendiente",
              notas,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (err) {
        console.error("Error al crear venta al fiado:", err);
        throw err;
      }
    },
    []
  );

  return {
    clientes,
    loading,
    error,
    cargarClientes,
    agregarCliente,
    editarCliente,
    eliminarCliente,
    cargarDeudasCliente,
    cargarPagosCliente,
    registrarPago,
    crearVentaFiada,
  };
};
