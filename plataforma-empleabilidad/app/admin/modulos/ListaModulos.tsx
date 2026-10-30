'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import FormularioContenidoModal from './FormularioContenidoModal';
import FormularioModulo from './FormularioModulo';
import { eliminarContenidoAction } from './actions';

type Contenido = {
  id_contenido: number;
  titulo_contenido: string;
  descripcion_contenido?: string;
  orden_contenido: number;
  duracion_estimada: number;
  estado_contenido: string;
  modulo_id_modulo: number;
};

type ModuloConContenidos = {
  id_modulo: number;
  titulo_modulo: string;
  descripcion_modulo?: string;
  posicion_modulo: number;
  esta_publicado?: boolean;
  es_gratuito?: boolean;
  contenidos: Contenido[];
};

export default function ListaModulos({ modulos }: { modulos: ModuloConContenidos[] }) {
  const [openModuloId, setOpenModuloId] = useState<number | null>(null);
  const [moduloEditar, setModuloEditar] = useState<ModuloConContenidos | null>(null);
  const [contenidoAEliminar, setContenidoAEliminar] = useState<Contenido | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleModulo = (id: number) => {
    setOpenModuloId(openModuloId === id ? null : id);
  };

  const handleConfirmarEliminacion = () => {
    if (!contenidoAEliminar) return;

    startTransition(async () => {
      await eliminarContenidoAction(contenidoAEliminar.id_contenido);
      setContenidoAEliminar(null);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {moduloEditar && (
        <div className="mb-2">
          <FormularioModulo
            moduloEditar={moduloEditar}
            onSuccess={() => setModuloEditar(null)}
            onCancel={() => setModuloEditar(null)}
          />
        </div>
      )}

      {contenidoAEliminar && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#002547]">¿Eliminar contenido?</h3>
                <p className="text-xs text-[#737780]">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-[#42474f] leading-relaxed">
              ¿Estás seguro de que deseas eliminar <strong className="text-[#002547]">&quot;{contenidoAEliminar.titulo_contenido}&quot;</strong>? Se perderá el contenido y todo el progreso sensible asociado.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
              <button
                type="button"
                onClick={() => setContenidoAEliminar(null)}
                disabled={isPending}
                className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminacion}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modulos.map((modulo) => {
        const isOpen = openModuloId === modulo.id_modulo;

        return (
          <div
            key={modulo.id_modulo}
            className="bg-white rounded-xl border border-[#c3c6d0]/30 shadow-sm overflow-hidden"
          >
            <div
              onClick={() => toggleModulo(modulo.id_modulo)}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#f7fafc] transition-colors select-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#002547] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {modulo.posicion_modulo || modulo.id_modulo}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#002547]">
                    {modulo.titulo_modulo}
                  </h3>
                  {modulo.descripcion_modulo && (
                    <p className="text-xs text-[#42474f] mt-0.5 line-clamp-1">
                      {modulo.descripcion_modulo}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModuloEditar(modulo);
                  }}
                  className="p-1.5 text-[#006689] hover:bg-[#e6f2fb] rounded-lg transition-colors flex items-center justify-center"
                  title="Editar Módulo"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>

                <span className="text-xs font-bold text-[#006689] bg-[#e6f2fb] px-3 py-1 rounded-full">
                  {modulo.contenidos.length} contenidos
                </span>

                <span
                  className="material-symbols-outlined text-[#737780] transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </div>
            </div>


            {isOpen && (
              <div className="border-t border-[#c3c6d0]/30 bg-[#f8fafc] p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#002547] uppercase tracking-wider">
                    Contenidos
                  </h4>
                  <FormularioContenidoModal
                    idModulo={modulo.id_modulo}
                    siguienteOrden={modulo.contenidos.length + 1}
                  />
                </div>

                {modulo.contenidos.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-[#c3c6d0]/40 rounded-lg bg-white">
                    <p className="text-xs font-bold text-[#737780]">
                      No hay contenidos guardados en este módulo.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {modulo.contenidos.map((item) => (
                      <div
                        key={item.id_contenido}
                        className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-[#c3c6d0]/30 hover:border-[#006689]/40 transition-colors"
                      >
                        <Link
                          href={`/admin/modulos/${modulo.id_modulo}/contenidos/${item.id_contenido}`}
                          className="flex items-center gap-3 flex-1 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-md bg-[#e6f2fb] text-[#006689] flex items-center justify-center font-extrabold text-xs">
                            {item.orden_contenido}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-[#002547] group-hover:text-[#006689] transition-colors">
                              {item.titulo_contenido}
                            </h5>
                            <div className="flex items-center gap-2 text-xs text-[#737780] mt-0.5">
                              <span>{item.duracion_estimada} min</span>
                              <span>•</span>
                              <span className="capitalize font-semibold text-[#006689]">
                                {item.estado_contenido}
                              </span>
                            </div>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setContenidoAEliminar(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2"
                          title="Eliminar contenido"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}