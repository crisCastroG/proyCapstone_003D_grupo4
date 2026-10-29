'use client';

import { useState } from 'react';
import { crearContenidoAction } from './[id_modulo]/actions';

type Props = {
  idModulo: number;
  siguienteOrden: number;
};

export default function FormularioContenidoModal({ idModulo, siguienteOrden }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await crearContenidoAction(formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el contenido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-[#44c5fd] hover:bg-[#38bdf5] text-[#001e2c] font-extrabold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Nuevo Contenido
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-lg p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-[#c3c6d0]/30 pb-3">
          <h3 className="text-lg font-bold text-[#002547]">Agregar Contenido al Módulo</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#737780] hover:text-[#002547] p-1 rounded-md"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="modulo_id_modulo" value={idModulo} />

          <div>
            <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
              Título del Contenido
            </label>
            <input
              type="text"
              name="titulo_contenido"
              required
              placeholder="Ej. Lección 1: Estrategias de Empleabilidad"
              className="w-full px-3 py-2 border border-[#c3c6d0] rounded-lg text-sm focus:outline-none focus:border-[#006689]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion_contenido"
              rows={2}
              placeholder="Resumen o propósito de este contenido..."
              className="w-full px-3 py-2 border border-[#c3c6d0] rounded-lg text-sm focus:outline-none focus:border-[#006689]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
                Orden
              </label>
              <input
                type="number"
                name="orden_contenido"
                defaultValue={siguienteOrden}
                min={1}
                className="w-full px-3 py-2 border border-[#c3c6d0] rounded-lg text-sm focus:outline-none focus:border-[#006689]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                name="duracion_estimada"
                defaultValue={10}
                min={1}
                className="w-full px-3 py-2 border border-[#c3c6d0] rounded-lg text-sm focus:outline-none focus:border-[#006689]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002547] uppercase tracking-wider mb-1">
                Estado
              </label>
              <select
                name="estado_contenido"
                defaultValue="publicado"
                className="w-full px-3 py-2 border border-[#c3c6d0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#006689]"
              >
                <option value="publicado">Publicado</option>
                <option value="borrador">Borrador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#c3c6d0]/30">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-[#f1f4f6]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#006689] text-white rounded-lg text-xs font-bold hover:bg-[#002547] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Contenido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}