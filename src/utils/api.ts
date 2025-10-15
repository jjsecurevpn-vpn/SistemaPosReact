import { supabase } from "../lib/supabase";

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

export interface Sale {
  id: number;
  fecha: string;
  total: number;
}

export interface SaleProduct {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  subtotal: number;
}

// Productos
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("productos").select("*");
  if (error) throw error;
  return data || [];
};

export const createProduct = async (
  product: Omit<Product, "id">
): Promise<Product> => {
  const { data, error } = await supabase
    .from("productos")
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (
  id: number,
  updates: Partial<Product>
): Promise<Product> => {
  const { data, error } = await supabase
    .from("productos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw error;
};

// Ventas
export const createSale = async (total: number): Promise<Sale> => {
  const { data, error } = await supabase
    .from("ventas")
    .insert([{ total }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createSaleProducts = async (
  saleProducts: Omit<SaleProduct, "id">[]
): Promise<SaleProduct[]> => {
  const { data, error } = await supabase
    .from("venta_productos")
    .insert(saleProducts)
    .select();
  if (error) throw error;
  return data || [];
};

export const updateProductStock = async (
  id: number,
  newStock: number
): Promise<void> => {
  const { error } = await supabase
    .from("productos")
    .update({ stock: newStock })
    .eq("id", id);
  if (error) throw error;
};

// Reportes
export const getTodaySales = async (): Promise<
  (Sale & { productos: (SaleProduct & { producto: Product })[] })[]
> => {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      *,
      venta_productos (
        *,
        productos (*)
      )
    `
    )
    .gte("fecha", `${today}T00:00:00`)
    .lt("fecha", `${today}T23:59:59`);

  if (error) throw error;

  // Transformar los datos para que sean más fáciles de usar
  return (data || []).map((sale) => ({
    ...sale,
    productos: sale.venta_productos.map(
      (vp: SaleProduct & { productos: Product }) => ({
        ...vp,
        producto: vp.productos,
      })
    ),
  }));
};
