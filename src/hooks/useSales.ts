import { useState, useCallback } from "react";
import type { Product } from "../utils/api";
import {
  createSale,
  createSaleProducts,
  updateProductStock,
} from "../utils/api";

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

  const confirmSale = useCallback(async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Calculate total
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

      // Create sale
      const sale = await createSale(total);

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

      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al confirmar venta");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, clearCart]);

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
