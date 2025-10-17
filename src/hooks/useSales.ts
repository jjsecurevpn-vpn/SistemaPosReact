import { useState, useCallback } from "react";
import type { Product } from "../utils/api";
import {
  createSale,
  createSaleProducts,
  updateProductStock,
} from "../utils/api";
import { supabase } from "../lib/supabase";

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export const useSales = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.precio,
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          { product, quantity: 1, subtotal: product.precio },
        ];
      }
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const confirmSale = useCallback(
    async (
      clienteId?: number,
      fechaVencimiento?: string,
      notas?: string,
      notasFiado?: string
    ) => {
      if (cart.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        // Calculate total
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

        // Create sale with notes
        const sale = await createSale(total, notas);

        // Create sale products
        const saleProducts = cart.map((item) => ({
          venta_id: sale.id,
          producto_id: item.product.id,
          cantidad: item.quantity,
          subtotal: item.subtotal,
        }));
        await createSaleProducts(saleProducts);

        // Update stock
        for (const item of cart) {
          await updateProductStock(
            item.product.id,
            item.product.stock - item.quantity
          );
        }

        // If it's a credit sale, create credit sale record and register as fiado
        if (clienteId) {
          // Insertar venta fiada
          const { error: fiadoError } = await supabase
            .from("ventas_fiadas")
            .insert([
              {
                venta_id: sale.id,
                cliente_id: clienteId,
                fecha_vencimiento: fechaVencimiento,
                estado: "pendiente",
                notas: notasFiado,
              },
            ]);

          if (fiadoError) {
            console.error("Error al insertar venta fiada:", fiadoError);
            throw fiadoError;
          }

          // Register as fiado instead of ingreso
          const movimientoData = {
            tipo: "fiado",
            descripcion: `Venta al fiado #${sale.id}`,
            monto: total,
            categoria: "ventas_fiadas",
            notas: `Cliente ID: ${clienteId}. ${notasFiado || ""}`,
          };

          console.log(
            "Intentando insertar movimiento de caja con datos:",
            movimientoData
          );

          const { error: cajaError } = await supabase
            .from("movimientos_caja")
            .insert([movimientoData]);

          if (cajaError) {
            console.error("Error al insertar movimiento de caja:", cajaError);
            console.error("Datos enviados:", movimientoData);
            console.error("Detalles del error:", {
              message: cajaError.message,
              details: cajaError.details,
              hint: cajaError.hint,
              code: cajaError.code,
            });
            throw new Error(
              `Error al registrar movimiento de caja: ${
                cajaError.message || "Error desconocido"
              }`
            );
          }
        } else {
          // Register income in cash register for regular sales
          await supabase.from("movimientos_caja").insert([
            {
              tipo: "ingreso",
              descripcion: `Venta #${sale.id}`,
              monto: total,
              categoria: "ventas",
              notas: `Productos vendidos: ${cart
                .map((item) => `${item.product.nombre} x${item.quantity}`)
                .join(", ")}`,
            },
          ]);
        }

        clearCart();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al confirmar venta"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart, clearCart]
  );

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cart,
    total,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    confirmSale,
    clearError: () => setError(null),
  };
};
