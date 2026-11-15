'use client';

import Link from 'next/link';

export type ItemSidebar = {
  id: number;
  id_modulo: number;
  titulo: string;
  tipo: 'contenido' | 'evaluacion';
  orden: number;
  estado?: 'completado' | 'no_completado';
  bloqueado?: boolean;
};

export type ModuloSidebar = {
  id_modulo: number;
  titulo: string;
  posicion: number;
  es_gratuito?: boolean;
  bloqueado?: boolean;
  items: ItemSidebar[];
};

type Props = {
  modulos: ModuloSidebar[];
  progresoGlobal: number;
  totalItems: number;
  completadosItems: number;
  idActivo?: number;
  tipoActivo?: 'contenido' | 'evaluacion';
};

export default function SidebarNavegacion({
  modulos,
  progresoGlobal,
  totalItems,
  completadosItems,
  idActivo,
  tipoActivo,
}: Props) {
  return (
    <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">account_circle</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#002547]">Progreso</h3>
            <span className="text-xs font-extrabold text-indigo-600">{progresoGlobal}% completado</span>
          </div>
        </div>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progresoGlobal))}%` }}
          />
        </div>

        <span className="text-[11px] font-medium text-[#737780] text-right">
          {completadosItems} de {totalItems} completados
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {modulos.map((modulo) => (
          <div key={modulo.id_modulo} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-extrabold text-[#737780] uppercase tracking-wider">
                MÓDULO {modulo.posicion}: {modulo.titulo}
              </h4>
              {modulo.es_gratuito === false && (
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                  Premium
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {modulo.items.map((item) => {
                const esActivo = item.id === idActivo && item.tipo === tipoActivo;
                const esCompletado = item.estado === 'completado';
                const esBloqueado = item.bloqueado ?? false;

                const href =
                  item.tipo === 'evaluacion'
                    ? `/modulos/evaluaciones/${item.id}`
                    : `/modulos/${item.id_modulo}/contenido/${item.id}`;

                if (esBloqueado) {
                  return (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-between opacity-70 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                        <span className="text-xs font-semibold truncate">
                          {item.orden}. {item.titulo}
                        </span>
                      </div>
                      {item.tipo === 'evaluacion' && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 shrink-0">
                          TEST
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${item.tipo}-${item.id}`}
                    href={href}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                      esActivo
                        ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 shadow-sm font-bold'
                        : esCompletado
                        ? 'bg-white border-emerald-200 text-emerald-900 hover:border-emerald-400'
                        : 'bg-white border-[#E2E8F0] text-[#002547] hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {esCompletado ? (
                        <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="truncate">
                        {item.orden}. {item.titulo}
                      </span>
                    </div>

                    {item.tipo === 'evaluacion' && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 shrink-0">
                        TEST
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}