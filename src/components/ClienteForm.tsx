import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';

interface Cliente {
  id?: string | number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente;
  onSave: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, cliente, onSave }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Cliente>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        notas: ''
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (cliente?.id) {
        // Actualizar cliente existente
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', cliente.id);
        
        if (error) throw error;
        showNotification('Cliente actualizado exitosamente', 'success');
      } else {
        // Crear nuevo cliente
        const { error } = await supabase
          .from('clientes')
          .insert(formData);
        
        if (error) throw error;
        showNotification('Cliente creado exitosamente', 'success');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar el cliente', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono || ''}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion || ''}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Notas
          </label>
          <textarea
            name="notas"
            value={formData.notas || ''}
            onChange={handleChange}
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {cliente ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClienteForm;