'use client';

import { useState, useEffect } from 'react';
import { Modulo, ModuloInput } from '@/lib/types/modulo';
import { crearModulo, actualizarModulo } from './actions';

type Props = {
  moduloEditar?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function FormularioModulo({ moduloEditar, onSuccess, onCancel }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ModuloInput>({
    titulo_modulo: '',
    descripcion_modulo: '',
    posicion_modulo: 1,
    esta_publicado: false,
    es_gratuito: false,
  });

  // Si se selecciona un módulo para editar, abre el formulario y carga sus datos
  useEffect(() => {
    if (moduloEditar) {
      setIsOpen(true);
      setFormData({
        titulo_modulo: moduloEditar.titulo_modulo || '',
        descripcion_modulo: moduloEditar.descripcion_modulo || '',
        posicion_modulo: moduloEditar.posicion_modulo || 1,
        esta_publicado: moduloEditar.esta_publicado || false,
        es_gratuito: moduloEditar.es_gratuito || false,
      });
    }
  }, [moduloEditar]);

  // Cierra la ventana y notifica al componente padre
  const handleCancel = () => {
    setIsOpen(false);
    setError('');
    onCancel?.();
  };

  // Botón inicial de apertura cuando la ventana está cerrada
  if (!isOpen && !moduloEditar) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-[#006689] hover:bg-[#002547] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Nuevo Módulo
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    let res;
    if (moduloEditar) {
      res = await actualizarModulo(moduloEditar.id_modulo, formData);
    } else {
      res = await crearModulo(formData);
    }

    setCargando(false);

    if (res.success) {
      setIsOpen(false); // Oculta el formulario tras guardar correctamente
      onSuccess?.();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border border-[#E6F2FB]">
      <div className="flex justify-between items-center pb-3 border-b border-[#E6F2FB] mb-5">
        <h2 className="text-xl font-bold text-[#002547]">
          {moduloEditar ? 'Editar Módulo' : 'Nuevo Módulo Formativo'}
        </h2>
        <button
          type="button"
          onClick={handleCancel}
          className="text-[#737780] hover:text-[#002547]"
          title="Cerrar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[#181c1e]">
        <div>
          <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
            Título del Módulo
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Currículum de Alto Impacto"
            value={formData.titulo_modulo}
            onChange={(e) => setFormData({ ...formData, titulo_modulo: e.target.value })}
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:ring-2 focus:ring-[#44c5fd] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
            Descripción y Objetivos
          </label>
          <textarea
            rows={3}
            placeholder="Aprende a estructurar un CV que capte la atención..."
            value={formData.descripcion_modulo || ''}
            onChange={(e) => setFormData({ ...formData, descripcion_modulo: e.target.value })}
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:ring-2 focus:ring-[#44c5fd] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
              Posición / Orden
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.posicion_modulo}
              onChange={(e) => setFormData({ ...formData, posicion_modulo: parseInt(e.target.value) || 1 })}
              className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:ring-2 focus:ring-[#44c5fd] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="es_gratuito"
              checked={formData.es_gratuito}
              onChange={(e) => setFormData({ ...formData, es_gratuito: e.target.checked })}
              className="w-4 h-4 accent-[#002547] rounded cursor-pointer"
            />
            <label htmlFor="es_gratuito" className="text-xs font-bold text-[#002547] cursor-pointer">
              ¿Es Gratuito?
            </label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="esta_publicado"
              checked={formData.esta_publicado}
              onChange={(e) => setFormData({ ...formData, esta_publicado: e.target.checked })}
              className="w-4 h-4 accent-[#002547] rounded cursor-pointer"
            />
            <label htmlFor="esta_publicado" className="text-xs font-bold text-[#002547] cursor-pointer">
              Publicado
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#E6F2FB]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-bold text-[#42474f] bg-white border border-[#c3c6d0] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="px-5 py-2 text-xs font-bold text-[#001e2c] bg-[#44c5fd] hover:bg-[#38bdf5] rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : moduloEditar ? 'Guardar Cambios' : 'Guardar y Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}