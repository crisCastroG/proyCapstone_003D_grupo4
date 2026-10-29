'use client';

import { useState } from 'react';
import FormularioContenidoModal from './FormularioContenidoModal';
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
  contenidos: Contenido[];
};

export default function ListaModulos({ modulos }: { modulos: ModuloConContenidos[] }) {
  // Guarda el ID del módulo que está abierto actualmente
  const [openModuloId, setOpenModuloId] = useState<number | null>(null);

  const toggleModulo = (id: number) => {
    setOpenModuloId(openModuloId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4">
      {modulos.map((modulo) => {
        const isOpen = openModuloId === modulo.id_modulo;

        return (
          <div
            key={modulo.id_modulo}
            className="bg-white rounded-xl border border-[#c3c6d0]/30 shadow-sm overflow-hidden"
          >
            {/* ENCABEZADO DE LA TARJETA (Clic para abrir/cerrar) */}
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

            {/* PANEL DESPLEGABLE (Solo visible si isOpen es true) */}
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
                      No hay contenidos en este módulo.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {modulo.contenidos.map((item) => (
                      <div
                        key={item.id_contenido}
                        className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-[#c3c6d0]/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-[#e6f2fb] text-[#006689] flex items-center justify-center font-extrabold text-xs">
                            {item.orden_contenido}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-[#002547]">
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
                        </div>

                        <form
                          action={eliminarContenidoAction.bind(null, item.id_contenido)}
                        >
                          <button
                            type="submit"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar contenido"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </form>
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