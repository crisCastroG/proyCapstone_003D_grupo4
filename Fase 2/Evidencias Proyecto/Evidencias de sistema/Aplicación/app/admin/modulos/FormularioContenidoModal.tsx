'use client';

import { useState, useTransition } from 'react';
import { crearContenidoAction, actualizarContenidoAction } from './actions';

type Contenido = {
  id_contenido: number;
  titulo_contenido: string;
  descripcion_contenido?: string;
  orden_contenido: number;
  duracion_estimada: number;
  estado_contenido: string;
  modulo_id_modulo: number;
};

interface FormularioContenidoModalProps {
  idModulo: number;
  siguienteOrden?: number;
  contenidoEditar?: Contenido;
}

export default function FormularioContenidoModal({
  idModulo,
  siguienteOrden = 1,
  contenidoEditar,
}: FormularioContenidoModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [titulo, setTitulo] = useState(contenidoEditar?.titulo_contenido || '');
  const [descripcion, setDescripcion] = useState(contenidoEditar?.descripcion_contenido || '');
  const [orden, setOrden] = useState(contenidoEditar?.orden_contenido || siguienteOrden);
  const [duracion, setDuracion] = useState(contenidoEditar?.duracion_estimada || 10);
  const [estado, setEstado] = useState(
    contenidoEditar?.estado_contenido?.toLowerCase() || 'publicado'
  );
  const [error, setError] = useState('');

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitulo(contenidoEditar?.titulo_contenido || '');
    setDescripcion(contenidoEditar?.descripcion_contenido || '');
    setOrden(contenidoEditar?.orden_contenido || siguienteOrden);
    setDuracion(contenidoEditar?.duracion_estimada || 10);
    setEstado(contenidoEditar?.estado_contenido?.toLowerCase() || 'publicado');
    setError('');
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('modulo_id_modulo', String(idModulo));
      formData.append('titulo_contenido', titulo);
      formData.append('descripcion_contenido', descripcion);
      formData.append('orden_contenido', String(orden));
      formData.append('duracion_estimada', String(duracion));
      formData.append('estado_contenido', estado);

      if (contenidoEditar) {
        formData.append('id_contenido', String(contenidoEditar.id_contenido));
      }

      const res = contenidoEditar
        ? await actualizarContenidoAction(formData)
        : await crearContenidoAction(formData);

      if (res && !res.success) {
        setError(res.message || 'Error al procesar el contenido.');
        return;
      }

      setOpen(false);
    });
  };

  return (
    <>
      {contenidoEditar ? (
        <button
          type="button"
          onClick={handleOpen}
          className="p-1.5 text-[#006689] hover:bg-[#e6f2fb] rounded-md transition-colors flex items-center justify-center"
          title="Editar datos básicos del contenido"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="px-3 py-1.5 bg-[#38BDF5] text-white rounded-lg text-xs font-bold hover:bg-[#002547] transition-colors flex items-center gap-1 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          NUEVO CONTENIDO
        </button>
      )}

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 cursor-default"
        >
          <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-md p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-[#c3c6d0]/30 pb-3">
              <h3 className="text-base font-bold text-[#002547]">
                {contenidoEditar ? 'Editar datos del contenido' : 'Agregar nuevo contenido'}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#737780] hover:text-[#002547]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="px-3 py-2 border border-[#c3c6d0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#006689]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="px-3 py-2 border border-[#c3c6d0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#006689]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                    Orden
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={orden}
                    onChange={(e) => setOrden(Number(e.target.value))}
                    className="px-3 py-2 border border-[#c3c6d0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#006689]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="px-3 py-2 border border-[#c3c6d0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#006689]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                    Estado
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="px-2 py-2 border border-[#c3c6d0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#006689] bg-white capitalize"
                  >
                    <option value="publicado">Publicado</option>
                    <option value="borrador">Borrador</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-[#006689] hover:bg-[#002547] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}