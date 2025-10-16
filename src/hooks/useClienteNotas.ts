import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface ClienteNota {
  id: number;
  cliente_id: number;
  nota: string;
  fecha: string;
  usuario_id: string;
  created_at: string;
}

export const useClienteNotas = (clienteId: number | null) => {
  const [notas, setNotas] = useState<ClienteNota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      fetchNotas();
    }
  }, [clienteId]);

  const fetchNotas = async () => {
    if (!clienteId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cliente_notas")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (err) {
      console.error("Error fetching client notes:", err);
      setError(err instanceof Error ? err.message : "Error al cargar notas");
    } finally {
      setLoading(false);
    }
  };

  const addNota = async (nota: string) => {
    if (!clienteId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("cliente_notas")
        .insert({
          cliente_id: clienteId,
          nota,
          usuario_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setNotas((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Error adding note:", err);
      throw err;
    }
  };

  const updateNota = async (notaId: number, nuevaNota: string) => {
    try {
      const { data, error } = await supabase
        .from("cliente_notas")
        .update({ nota: nuevaNota })
        .eq("id", notaId)
        .select()
        .single();

      if (error) throw error;
      setNotas((prev) => prev.map((n) => (n.id === notaId ? data : n)));
      return data;
    } catch (err) {
      console.error("Error updating note:", err);
      throw err;
    }
  };

  const deleteNota = async (notaId: number) => {
    try {
      const { error } = await supabase
        .from("cliente_notas")
        .delete()
        .eq("id", notaId);

      if (error) throw error;
      setNotas((prev) => prev.filter((n) => n.id !== notaId));
    } catch (err) {
      console.error("Error deleting note:", err);
      throw err;
    }
  };

  return {
    notas,
    loading,
    error,
    addNota,
    updateNota,
    deleteNota,
    refetch: fetchNotas,
  };
};
