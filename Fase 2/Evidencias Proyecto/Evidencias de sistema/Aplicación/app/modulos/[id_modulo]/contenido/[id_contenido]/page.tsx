'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SidebarNavegacion, { ModuloSidebar } from '../../../_components/SidebarNavegacion';
import ConsultaContenido from '../../../_components/ConsultaContenido';

interface ItemNav {
  id: number;
  id_modulo: number;
  titulo: string;
  orden: number;
  tipo: 'contenido' | 'evaluacion';
  bloqueado?: boolean;
}

interface Bloque {
  id_bloque: number;
  tipo_bloque: string;
  titulo_bloque?: string;
  contenido_texto?: string;
  url_recurso?: string;
  orden_bloque: number;
}

interface Recurso {
  id_recurso: number;
  titulo_recurso: string;
  url_recurso?: string;
  nombre_archivo?: string;
  tamano_bytes?: number;
  es_descargable: boolean;
}

interface FormularioLeccion {
  id_formulario: number;
  titulo_formulario?: string;
  descripcion_formulario?: string;
  usuario_id_admin: number;
}

interface DetalleContenido {
  id_contenido: number;
  titulo: string;
  descripcion: string;
  orden: number;
  duracion: number;
  id_modulo: number;
  modulo_titulo: string;
  modulo_posicion: number;
}

function obtenerUrlEmbedVideo(url?: string): { esArchivoDirecto: boolean; src: string } {
  if (!url) return { esArchivoDirecto: false, src: '' };

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return { esArchivoDirecto: true, src: url };
  }

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch?.[1]) {
    return { esArchivoDirecto: false, src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  return { esArchivoDirecto: false, src: url };
}

export default function ContenidoViewPage() {
  const params = useParams();
  const router = useRouter();
  const idContenido = params.id_contenido;

  const [detalle, setDetalle] = useState<DetalleContenido | null>(null);
  const [modulos, setModulos] = useState<ModuloSidebar[]>([]);
  const [tienePlanPro, setTienePlanPro] = useState<boolean>(false);
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [formulario, setFormulario] = useState<FormularioLeccion | null>(null);
  const [navAnterior, setNavAnterior] = useState<ItemNav | null>(null);
  const [navSiguiente, setNavSiguiente] = useState<ItemNav | null>(null);

  const [progresoGlobal, setProgresoGlobal] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [completadosItems, setCompletadosItems] = useState<number>(0);

  const [cargando, setCargando] = useState(true);
  const [guardandoProgreso, setGuardandoProgreso] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatosLeccion() {
      if (!idContenido || idContenido === 'undefined' || isNaN(Number(idContenido))) {
        return;
      }

      try {
        const res = await fetch(`/api/contenido/${idContenido}`, { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'No se pudo cargar la lección.');
          return;
        }

        setDetalle(data.contenido);
        setTienePlanPro(Boolean(data.tienePlanPro));
        setModulos(data.modulos || []);
        setBloques(data.bloques || []);
        setRecursos(data.recursos || []);
        setFormulario(data.formulario || null);
        setNavAnterior(data.navegacion?.anterior || null);
        setNavSiguiente(data.navegacion?.siguiente || null);

        if (data.resumenProgreso) {
          setProgresoGlobal(data.resumenProgreso.porcentajeGlobal || 0);
          setTotalItems(data.resumenProgreso.totalItems || 0);
          setCompletadosItems(data.resumenProgreso.completadosItems || 0);
        }
      } catch {
        setError('Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    }

    cargarDatosLeccion();
  }, [idContenido]);

  const avanzarLeccion = async () => {
    if (!detalle) return;

    try {
      setGuardandoProgreso(true);

      const res = await fetch('/api/progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_contenido: detalle.id_contenido,
          estado: 'completado',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`No se pudo guardar el progreso: ${errData.error || 'Error en servidor'}`);
        return;
      }

      if (navSiguiente) {
        const urlNext =
          navSiguiente.tipo === 'evaluacion'
            ? `/modulos/evaluaciones/${navSiguiente.id}`
            : `/modulos/${navSiguiente.id_modulo}/contenido/${navSiguiente.id}`;
        router.push(urlNext);
      } else {
        router.push('/modulos');
      }
    } catch (e) {
      console.error('Error de red al guardar progreso:', e);
    } finally {
      setGuardandoProgreso(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20 text-[#002547] font-semibold text-sm">
        Cargando lección...
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex flex-col gap-4 items-start">
        <p className="font-bold">{error || 'Lección no disponible.'}</p>
        <Link
          href="/modulos"
          className="px-4 py-2 bg-[#002547] text-white rounded-lg text-xs font-semibold"
        >
          Volver a la ruta de aprendizaje
        </Link>
      </div>
    );
  }

  const tieneRecursos = recursos && recursos.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-8 -mt-2">
      <SidebarNavegacion
        modulos={modulos}
        progresoGlobal={progresoGlobal}
        totalItems={totalItems}
        completadosItems={completadosItems}
        idActivo={detalle.id_contenido}
        tipoActivo="contenido"
        tienePlanPro={tienePlanPro}
      />

      <main className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#002547]">
              {detalle.orden}. {detalle.titulo}
            </h1>
            <p className="text-sm text-[#42474F] mt-1">{detalle.descripcion}</p>
          </div>
          {detalle.duracion && (
            <span className="self-start sm:self-center px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-xs font-semibold text-[#42474F] flex items-center gap-1.5 shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {detalle.duracion} min
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={tieneRecursos ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="flex flex-col gap-6">
              {bloques.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <h3 className="text-base font-bold text-[#002547] mb-3">Descripción de la Lección</h3>
                  <p className="text-sm text-[#42474F] leading-relaxed">
                    {detalle.descripcion || 'Sin información adicional disponible.'}
                  </p>
                </div>
              ) : (
                bloques.map((bloque) => {
                  const esVideo =
                    bloque.tipo_bloque === 'video' ||
                    Boolean(
                      bloque.url_recurso &&
                        (bloque.url_recurso.includes('youtube') ||
                          bloque.url_recurso.includes('youtu.be') ||
                          bloque.url_recurso.includes('vimeo') ||
                          /\.(mp4|webm|ogg)(\?.*)?$/i.test(bloque.url_recurso))
                    );

                  const esImagen = bloque.tipo_bloque === 'imagen';
                  const esDescarga = bloque.tipo_bloque === 'descarga';
                  const esUrl = bloque.tipo_bloque === 'url';

                  if (esVideo) {
                    const videoInfo = obtenerUrlEmbedVideo(bloque.url_recurso);

                    return (
                      <div
                        key={bloque.id_bloque}
                        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
                      >
                        {(bloque.titulo_bloque || bloque.contenido_texto) && (
                          <div className="p-5 sm:p-6 border-b border-[#E2E8F0]/70">
                            {bloque.titulo_bloque && (
                              <h3 className="text-base font-bold text-[#002547]">
                                {bloque.titulo_bloque}
                              </h3>
                            )}
                            {bloque.contenido_texto && (
                              <p className="text-sm text-[#42474F] leading-relaxed whitespace-pre-line mt-1.5">
                                {bloque.contenido_texto}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="w-full bg-[#001E2C] aspect-video overflow-hidden">
                          {videoInfo.esArchivoDirecto ? (
                            <video
                              src={videoInfo.src}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <iframe
                              src={videoInfo.src}
                              className="w-full h-full border-0"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            />
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (esImagen) {
                    return (
                      <figure
                        key={bloque.id_bloque}
                        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
                      >
                        {(bloque.titulo_bloque || bloque.contenido_texto) && (
                          <figcaption className="p-5 sm:p-6 border-b border-[#E2E8F0]/70">
                            {bloque.titulo_bloque && (
                              <h3 className="text-base font-bold text-[#002547]">
                                {bloque.titulo_bloque}
                              </h3>
                            )}
                            {bloque.contenido_texto && (
                              <p className="text-sm text-[#42474F] leading-relaxed whitespace-pre-line mt-1.5">
                                {bloque.contenido_texto}
                              </p>
                            )}
                          </figcaption>
                        )}

                        <div className="p-4 bg-[#F8FAFC]/50">
                          <img
                            src={bloque.url_recurso}
                            alt={bloque.titulo_bloque || 'Imagen del contenido'}
                            className="w-full h-auto max-h-[500px] object-contain rounded-xl mx-auto"
                          />
                        </div>
                      </figure>
                    );
                  }

                  if ((esDescarga || esUrl) && bloque.url_recurso) {
                    return (
                      <div
                        key={bloque.id_bloque}
                        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
                      >
                        {(bloque.titulo_bloque || bloque.contenido_texto) && (
                          <div className="p-5 sm:p-6 border-b border-[#E2E8F0]/70">
                            {bloque.titulo_bloque && (
                              <h3 className="text-base font-bold text-[#002547]">
                                {bloque.titulo_bloque}
                              </h3>
                            )}
                            {bloque.contenido_texto && (
                              <p className="text-sm text-[#42474F] leading-relaxed whitespace-pre-line mt-1.5">
                                {bloque.contenido_texto}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="p-4 bg-[#F8FAFC]/50 flex justify-start">
                          <a
                            href={bloque.url_recurso}
                            {...(esDescarga ? { download: true } : {})}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002547] text-white text-xs font-bold rounded-xl hover:bg-[#2566A8] transition-colors shadow-xs"
                          >
                            <span className="material-symbols-outlined text-base">
                              {esUrl ? 'open_in_new' : 'download'}
                            </span>
                            {esUrl ? 'Abrir enlace externo' : 'Descargar recurso'}
                          </a>
                        </div>
                      </div>
                    );
                  }

                  if (bloque.titulo_bloque || bloque.contenido_texto) {
                    return (
                      <div
                        key={bloque.id_bloque}
                        className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
                      >
                        {bloque.titulo_bloque && (
                          <h3 className="text-base font-bold text-[#002547] mb-3">
                            {bloque.titulo_bloque}
                          </h3>
                        )}
                        {bloque.contenido_texto && (
                          <div className="text-sm text-[#42474F] leading-relaxed whitespace-pre-line">
                            {bloque.contenido_texto}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })
              )}
            </div>
          </div>

          {tieneRecursos && (
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4 self-start">
              <h3 className="text-base font-bold text-[#002547] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#002547]">folder_open</span>
                Recursos
              </h3>

              <div className="flex flex-col gap-3">
                {recursos.map((rec) => (
                  <a
                    key={rec.id_recurso}
                    href={rec.url_recurso || '#'}
                    download={rec.nombre_archivo}
                    className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3 hover:border-[#38BDF5] transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-[#E6F2FB] text-[#002547] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">description</span>
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[#002547] truncate">
                          {rec.titulo_recurso}
                        </h4>
                        <span className="text-[11px] text-[#737780]">
                          {rec.tamano_bytes
                            ? `${Math.round(rec.tamano_bytes / 1024)} KB`
                            : 'Archivo adjunto'}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-base text-[#737780] group-hover:text-[#002547] transition-colors shrink-0">
                      download
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {formulario && <ConsultaContenido idContenido={Number(idContenido)} />}

        <footer className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-between gap-4">
          {navAnterior && !navAnterior.bloqueado ? (
            <Link
              href={
                navAnterior.tipo === 'evaluacion'
                  ? `/modulos/evaluaciones/${navAnterior.id}`
                  : `/modulos/${navAnterior.id_modulo}/contenido/${navAnterior.id}`
              }
              className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#002547] font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Anterior
            </Link>
          ) : (
            <div />
          )}

          <button
            onClick={avanzarLeccion}
            disabled={guardandoProgreso}
            className="px-6 py-2.5 bg-[#002547] text-white font-bold text-xs rounded-xl hover:bg-[#2566A8] transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {guardandoProgreso
              ? 'Guardando...'
              : navSiguiente
                ? navSiguiente.tipo === 'evaluacion'
                  ? 'Rendir Test'
                  : 'Siguiente Lección'
                : 'Completar y Finalizar'}
            <span className="material-symbols-outlined text-base">
              {navSiguiente ? 'arrow_forward' : 'check'}
            </span>
          </button>
        </footer>
      </main>
    </div>
  );
}