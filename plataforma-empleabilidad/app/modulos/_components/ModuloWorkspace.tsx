'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Contenido {
  id_contenido: number;
  titulo: string;
  descripcion?: string;
  orden: number;
  duracion?: number;
  estado?: string;
  bloqueado?: boolean;
}

interface Modulo {
  id_modulo: number;
  titulo: string;
  descripcion: string;
  posicion: number;
  contenidos: Contenido[];
  estado?: string;
  bloqueado?: boolean;
  totalContenidos?: number;
  contenidosCompletados?: number;
}

interface ResumenProgreso {
  totalLecciones: number;
  leccionesCompletadas: number;
  porcentajeGlobal: number;
}

export default function ModuloWorkspace() {
  const [nombreUsuario, setNombreUsuario] = useState<string>('Usuario');
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [resumen, setResumen] = useState<ResumenProgreso>({
    totalLecciones: 0,
    leccionesCompletadas: 0,
    porcentajeGlobal: 0,
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [modulosAbiertos, setModulosAbiertos] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function cargarModulosBD() {
      try {
        const res = await fetch('/api/modulos');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'No se pudieron cargar los módulos.');
          setCargando(false);
          return;
        }

        if (data.usuario?.nombre) {
          setNombreUsuario(data.usuario.nombre);
        }

        const modulosObtenidos: Modulo[] = data.modulos || [];
        setModulos(modulosObtenidos);

        if (data.resumenProgreso) {
          setResumen(data.resumenProgreso);
        }

        // Abre automáticamente el primer módulo disponible que no esté bloqueado
        const primerModuloDesbloqueado = modulosObtenidos.find((m) => !m.bloqueado);
        if (primerModuloDesbloqueado) {
          setModulosAbiertos({ [primerModuloDesbloqueado.id_modulo]: true });
        }
      } catch {
        setError('Error de conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    }

    cargarModulosBD();
  }, []);

  const toggleModulo = (id_modulo: number, estaBloqueado?: boolean) => {
    if (estaBloqueado) return; 
    setModulosAbiertos((prev) => ({
      ...prev,
      [id_modulo]: !prev[id_modulo],
    }));
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20 text-[#002547] font-semibold">
        Cargando tu ruta de aprendizaje...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border border-[#c3c6d0]/30">
        <div>
          <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight mb-1">
            ¡Hola, {nombreUsuario}!
          </h1>
          <p className="text-sm font-medium text-[#42474f]">
            Estás en un buen momento para impulsar tu carrera. Continúa con tu ruta de aprendizaje.
          </p>
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-2 min-w-[250px]">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-[#002547]">Progreso General</span>
            <span className="text-xs font-extrabold text-[#38BDF5]">
              {resumen.porcentajeGlobal}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#E6F2FB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#38BDF5] to-[#002547] rounded-full transition-all duration-500"
              style={{ width: `${resumen.porcentajeGlobal}%` }}
            />
          </div>
          {/* Muestra total de contenidos completados */}
          <span className="text-[11px] font-medium text-[#42474f] text-right">
            {resumen.leccionesCompletadas} de {resumen.totalLecciones} contenidos completados
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#002547] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38BDF5]">route</span>
            Mi Ruta de Aprendizaje
          </h2>

          <div className="flex flex-col gap-4">
            {modulos.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-dashed border-[#c3c6d0] text-center text-[#42474f]">
                No hay módulos disponibles por el momento.
              </div>
            ) : (
              modulos.map((modulo, index) => {
                const numeroModulo = index + 1;
                const estaDesplegado = Boolean(modulosAbiertos[modulo.id_modulo]);
                const tieneContenidos = modulo.contenidos && modulo.contenidos.length > 0;
                const esCompletado = modulo.estado === 'completado';
                const estaBloqueado = Boolean(modulo.bloqueado);

                return (
                  <article
                    key={modulo.id_modulo}
                    className={`bg-white rounded-xl shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border transition-all duration-200 overflow-hidden ${
                      estaBloqueado
                        ? 'opacity-65 bg-slate-50 border-slate-200'
                        : esCompletado
                        ? 'border-l-4 border-l-[#006689] border-t border-r border-b border-[#E6F2FB]'
                        : 'border-l-4 border-l-[#002547] border-t border-r border-b border-[#E6F2FB]'
                    }`}
                  >
                    <div
                      onClick={() => toggleModulo(modulo.id_modulo, estaBloqueado)}
                      className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none ${
                        estaBloqueado
                          ? 'cursor-not-allowed'
                          : 'cursor-pointer hover:bg-slate-50/50 transition-colors'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-grow">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            estaBloqueado
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-[#E6F2FB]'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined font-bold ${
                              estaBloqueado
                                ? 'text-slate-400'
                                : esCompletado
                                ? 'text-[#006689]'
                                : 'text-[#38BDF5]'
                            }`}
                          >
                            {estaBloqueado
                              ? 'lock'
                              : esCompletado
                              ? 'check_circle'
                              : 'play_circle'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                                estaBloqueado
                                  ? 'bg-slate-200 text-slate-600'
                                  : esCompletado
                                  ? 'bg-[#E6F2FB] text-[#006689]'
                                  : 'bg-[#38BDF5]/10 text-[#004f6b] border border-[#38BDF5]/20'
                              }`}
                            >
                              {estaBloqueado
                                ? 'Bloqueado'
                                : esCompletado
                                ? 'Completado'
                                : 'En curso'}
                            </span>
                            <span className="text-xs text-[#737780]">
                              {modulo.contenidosCompletados || 0} de {modulo.contenidos.length}{' '}
                              completados
                            </span>
                          </div>
                          <h3
                            className={`text-base font-bold ${
                              estaBloqueado ? 'text-slate-500' : 'text-[#002547]'
                            }`}
                          >
                            {numeroModulo}. {modulo.titulo}
                          </h3>
                          <p className="text-sm text-[#42474f] mt-0.5">{modulo.descripcion}</p>
                        </div>
                      </div>

                      {!estaBloqueado && (
                        <button
                          type="button"
                          aria-label="Desplegar contenido"
                          className="p-2 text-[#002547] hover:bg-[#E6F2FB] rounded-full transition-colors self-end sm:self-center"
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {estaDesplegado ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      )}
                    </div>

                    {estaDesplegado && !estaBloqueado && (
                      <div className="border-t border-[#E6F2FB] bg-[#F8FAFC] p-4 sm:p-6 flex flex-col gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#006689] mb-1">
                          Contenidos del Módulo
                        </h4>

                        {!tieneContenidos ? (
                          <p className="text-xs text-[#737780] italic">
                            No hay lecciones ni contenidos asignados a este módulo todavía.
                          </p>
                        ) : (
                          modulo.contenidos.map((contenido, idx) => {
                            const leccionCompletada = contenido.estado === 'completado';
                            const contenidoBloqueado = Boolean(contenido.bloqueado);

                            return (
                              <div
                                key={contenido.id_contenido}
                                className={`bg-white p-4 rounded-lg border flex items-center justify-between gap-4 transition-colors ${
                                  contenidoBloqueado
                                    ? 'border-slate-200 bg-slate-50/70'
                                    : 'border-[#E2E8F0] hover:border-[#38BDF5]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                                      contenidoBloqueado
                                        ? 'bg-slate-200 text-slate-400'
                                        : leccionCompletada
                                        ? 'bg-[#E6F2FB] text-[#006689]'
                                        : 'bg-[#E6F2FB] text-[#002547]'
                                    }`}
                                  >
                                    {contenidoBloqueado ? (
                                      <span className="material-symbols-outlined text-sm">
                                        lock
                                      </span>
                                    ) : leccionCompletada ? (
                                      <span className="material-symbols-outlined text-sm">
                                        check
                                      </span>
                                    ) : (
                                      idx + 1
                                    )}
                                  </span>
                                  <div>
                                    <h5
                                      className={`text-sm font-semibold ${
                                        contenidoBloqueado
                                          ? 'text-slate-400'
                                          : 'text-[#002547]'
                                      }`}
                                    >
                                      {contenido.titulo}
                                    </h5>
                                    {contenido.duracion && (
                                      <span className="text-xs text-[#737780]">
                                        Duración estimada: {contenido.duracion} min
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {contenidoBloqueado ? (
                                  <button
                                    disabled
                                    className="px-3 py-1.5 bg-slate-200 text-slate-400 font-semibold text-xs rounded-md cursor-not-allowed whitespace-nowrap"
                                  >
                                    Bloqueado
                                  </button>
                                ) : (
                                  <Link
                                    href={`/modulos/${modulo.id_modulo}/contenido/${contenido.id_contenido}`}
                                    className="px-3 py-1.5 bg-[#002547] text-white font-semibold text-xs rounded-md hover:bg-[#2566A8] transition-colors whitespace-nowrap"
                                  >
                                    Ver Contenido
                                  </Link>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Lateral */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <Link href="/perfil" className="block">
            <div className="bg-gradient-to-br from-[#002547] to-[#0d3b66] rounded-xl p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.05)] text-white relative overflow-hidden group cursor-pointer h-full">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white">
                      assignment_ind
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Perfil Profesional Digital</h3>
                  <p className="text-xs text-white/80 mb-6">
                    Muestra tu mejor versión. Actualiza tus datos y portafolio para las asesorías.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF5] group-hover:text-white transition-colors">
                  Ver y editar perfil
                  <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}