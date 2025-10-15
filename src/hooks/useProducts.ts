import { useState, useEffect, useCallback } from "react";
import type { Product } from "../utils/api";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../utils/api";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear producto");
      throw err;
    }
  }, []);

  const editProduct = useCallback(
    async (id: number, updates: Partial<Product>) => {
      try {
        const updatedProduct = await updateProduct(id, updates);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al actualizar producto"
        );
        throw err;
      }
    },
    []
  );

  const removeProduct = useCallback(async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar producto"
      );
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    clearError: () => setError(null),
  };
};
