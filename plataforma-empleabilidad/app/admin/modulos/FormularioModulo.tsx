'use client';

import { useState, useEffect } from 'react';
import { ModuloInput } from '@/lib/types/modulo';
import { crearModulo, actualizarModulo, eliminarModulo } from './actions';

type Props = {
  moduloEditar?: any;
  modulosExistentes?: any[]; // Lista opcional de módulos para validar localmente
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function FormularioModulo({
  moduloEditar,
  modulosExistentes = [],
  onSuccess,
  onCancel,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ModuloInput>({
    titulo_modulo: '',
    descripcion_modulo: '',
    posicion_modulo: 1,
    esta_publicado: false,
    es_gratuito: false,
  });

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

  const handleCancel = () => {
    setIsOpen(false);
    setError('');
    setMostrarModalEliminar(false);
    onCancel?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Con esto se valida si el modulo a crear ocupa la misma posicion que oto antes de
    if (modulosExistentes && modulosExistentes.length > 0) {
      const posicionOcupada = modulosExistentes.some(
        (m) =>
          Number(m.posicion_modulo) === Number(formData.posicion_modulo) &&
          m.id_modulo !== moduloEditar?.id_modulo
      );

      if (posicionOcupada) {
        setError(
          `La posición #${formData.posicion_modulo} ya está ocupada por otro módulo. Por favor elige un número diferente.`
        );
        return;
      }
    }

    setCargando(true);

    let res;
    if (moduloEditar) {
      res = await actualizarModulo(moduloEditar.id_modulo, formData);
    } else {
      res = await crearModulo(formData);
    }

    setCargando(false);

    if (res.success) {
      setIsOpen(false);
      onSuccess?.();
    } else {
      setError(res.message);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!moduloEditar?.id_modulo) return;

    setEliminando(true);
    setError('');

    const res = await eliminarModulo(moduloEditar.id_modulo);

    setEliminando(false);

    if (res.success) {
      setMostrarModalEliminar(false);
      setIsOpen(false);
      onSuccess?.();
    } else {
      setError(res.message || 'No se pudo eliminar el módulo.');
      setMostrarModalEliminar(false);
    }
  };

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

  return (
    <>
      {/* Modal de Advertencia de Confirmación de Eliminación */}
      {mostrarModalEliminar && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#002547]">¿Eliminar módulo formativo?</h3>
                <p className="text-xs text-[#737780]">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-[#42474f] leading-relaxed">
              ¿Estás seguro de que deseas eliminar el módulo{' '}
              <strong className="text-[#002547]">&quot;{moduloEditar?.titulo_modulo}&quot;</strong>?
              Se eliminarán permanentemente todos sus contenidos y lecciones.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
              <button
                type="button"
                onClick={() => setMostrarModalEliminar(false)}
                disabled={eliminando}
                className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar módulo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Principal */}
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
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
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
                onChange={(e) =>
                  setFormData({ ...formData, posicion_modulo: parseInt(e.target.value) || 1 })
                }
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
              <label
                htmlFor="esta_publicado"
                className="text-xs font-bold text-[#002547] cursor-pointer"
              >
                Publicado
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-[#E6F2FB]">
            {moduloEditar ? (
              <button
                type="button"
                onClick={() => setMostrarModalEliminar(true)}
                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Eliminar Módulo
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
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
                {cargando ? 'Guardando...' : moduloEditar ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}