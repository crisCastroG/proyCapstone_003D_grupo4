'use client';

import { useState, useTransition } from 'react';
import { BloqueContenido } from '@/lib/types/bloque';
import { crearBloqueAction, actualizarBloqueAction, eliminarBloqueAction } from './actions';

type Props = {
  bloques: BloqueContenido[];
  idModulo: number;
  idContenido: number;
};

function obtenerUrlEmbed(url?: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export default function ListaBloques({ bloques, idModulo, idContenido }: Props) {
  const [modoVista, setModoVista] = useState<'editor' | 'previa'>('editor');
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);
  const [bloqueEditandoId, setBloqueEditandoId] = useState<number | null>(null);
  const [tipoBloque, setTipoBloque] = useState<string>('texto');
  const [contenidoTexto, setContenidoTexto] = useState<string>('');

  const [bloqueAEliminar, setBloqueAEliminar] = useState<BloqueContenido | null>(null);
  const [isPending, startTransition] = useTransition();

  const insertarFormatoTexto = (marcadorInicio: string, marcadorFin: string = '') => {
    setContenidoTexto((prev) => `${prev}${marcadorInicio}texto${marcadorFin}`);
  };

  const resetFormulario = () => {
    setMostrarFormCrear(false);
    setBloqueEditandoId(null);
    setTipoBloque('texto');
    setContenidoTexto('');
  };

  const handleIniciarEdicion = (bloque: BloqueContenido) => {
    setMostrarFormCrear(false);
    setBloqueEditandoId(bloque.id_bloque);
    setTipoBloque(bloque.tipo_bloque);
    setContenidoTexto(bloque.contenido_texto || '');
  };

  const handleSubmitInline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id_modulo', idModulo.toString());
    formData.append('contenido_id_contenido', idContenido.toString());

    startTransition(async () => {
      if (bloqueEditandoId) {
        await actualizarBloqueAction(bloqueEditandoId, formData);
      } else {
        await crearBloqueAction(formData);
      }
      resetFormulario();
    });
  };

  const handleConfirmarEliminacion = () => {
    if (!bloqueAEliminar) return;

    startTransition(async () => {
      await eliminarBloqueAction(bloqueAEliminar.id_bloque, idModulo, idContenido);
      setBloqueAEliminar(null);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] p-2 rounded-xl border border-[#c3c6d0]/30">
        <div className="flex items-center gap-1.5 bg-[#e6f2fb]/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setModoVista('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              modoVista === 'editor'
                ? 'bg-white text-[#002547] shadow-sm'
                : 'text-[#737780] hover:text-[#002547]'
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Modo Edición
          </button>

          <button
            type="button"
            onClick={() => {
              setModoVista('previa');
              resetFormulario();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              modoVista === 'previa'
                ? 'bg-[#006689] text-white shadow-sm'
                : 'text-[#737780] hover:text-[#002547]'
            }`}
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Vista Previa Estudiante
          </button>
        </div>

        {modoVista === 'editor' && !mostrarFormCrear && (
          <button
            type="button"
            onClick={() => {
              setBloqueEditandoId(null);
              setTipoBloque('texto');
              setContenidoTexto('');
              setMostrarFormCrear(true);
            }}
            className="px-4 py-2 bg-[#006689] hover:bg-[#002547] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Añadir Bloque
          </button>
        )}
      </div>

      {bloqueAEliminar && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#002547]">¿Eliminar bloque educativo?</h3>
                <p className="text-xs text-[#737780]">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-[#42474f] leading-relaxed">
              ¿Estás seguro de eliminar este bloque de tipo <strong className="text-[#002547]">{bloqueAEliminar.tipo_bloque}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
              <button
                type="button"
                onClick={() => setBloqueAEliminar(null)}
                disabled={isPending}
                className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminacion}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Creación */}
      {mostrarFormCrear && modoVista === 'editor' && (
        <div className="bg-[#e6f2fb]/40 rounded-xl border-2 border-[#006689] p-5 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-[#006689]/20 mb-4">
            <h3 className="text-sm font-bold text-[#002547] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#006689]">add_circle</span>
              Nuevo Bloque de Contenido
            </h3>
            <button
              type="button"
              onClick={resetFormulario}
              className="text-[#737780] hover:text-[#002547]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <FormularioBloqueInlineContent
            tipoBloque={tipoBloque}
            setTipoBloque={setTipoBloque}
            contenidoTexto={contenidoTexto}
            setContenidoTexto={setContenidoTexto}
            insertarFormatoTexto={insertarFormatoTexto}
            siguienteOrden={bloques.length + 1}
            isPending={isPending}
            onSubmit={handleSubmitInline}
            onCancel={resetFormulario}
          />
        </div>
      )}

      {/* Listado de Bloques */}
      {bloques.length === 0 && !mostrarFormCrear ? (
        <div className="bg-white rounded-xl border border-[#c3c6d0]/30 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#e6f2fb] text-[#006689] flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h3 className="text-base font-bold text-[#002547]">Esta lección aún no tiene contenido</h3>
          <p className="text-xs text-[#737780] mt-1 max-w-md mx-auto">
            Añade el primer bloque de texto, imagen, video o material descargable directamente usando el botón superior.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bloques.map((bloque) => {
            const esModoEdicionInline = bloqueEditandoId === bloque.id_bloque;
            const embedUrl = obtenerUrlEmbed(bloque.url_recurso);

            if (esModoEdicionInline && modoVista === 'editor') {
              return (
                <div
                  key={bloque.id_bloque}
                  className="bg-[#e6f2fb]/40 rounded-xl border-2 border-[#006689] p-5 shadow-sm"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-[#006689]/20 mb-4">
                    <h3 className="text-sm font-bold text-[#002547] flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#006689]">edit</span>
                      Editando Bloque #{bloque.orden_bloque}
                    </h3>
                    <button
                      type="button"
                      onClick={resetFormulario}
                      className="text-[#737780] hover:text-[#002547]"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <FormularioBloqueInlineContent
                    bloque={bloque}
                    tipoBloque={tipoBloque}
                    setTipoBloque={setTipoBloque}
                    contenidoTexto={contenidoTexto}
                    setContenidoTexto={setContenidoTexto}
                    insertarFormatoTexto={insertarFormatoTexto}
                    siguienteOrden={bloque.orden_bloque}
                    isPending={isPending}
                    onSubmit={handleSubmitInline}
                    onCancel={resetFormulario}
                  />
                </div>
              );
            }

            return (
              <div
                key={bloque.id_bloque}
                className={`bg-white rounded-xl border transition-all ${
                  modoVista === 'editor'
                    ? 'border-[#c3c6d0]/40 p-5 shadow-sm'
                    : 'border-[#E6F2FB] p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.03)]'
                }`}
              >
                {modoVista === 'editor' && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d0]/20 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#002547] text-white flex items-center justify-center font-bold text-xs">
                        {bloque.orden_bloque}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#006689] bg-[#e6f2fb] px-2.5 py-0.5 rounded-md">
                        {bloque.tipo_bloque}
                      </span>
                      {bloque.es_obligatorio && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Obligatorio
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleIniciarEdicion(bloque)}
                        className="p-1 text-[#006689] hover:bg-[#e6f2fb] rounded-md transition-colors"
                        title="Editar bloque inline"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBloqueAEliminar(bloque)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar bloque"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {bloque.titulo_bloque && (
                  <h3 className="text-base font-bold text-[#002547] mb-3">
                    {bloque.titulo_bloque}
                  </h3>
                )}

                {bloque.tipo_bloque === 'texto' && bloque.contenido_texto && (
                  <div className="prose max-w-none text-xs leading-relaxed text-[#181c1e] bg-[#fafbfc] p-4 rounded-lg border border-[#c3c6d0]/20 whitespace-pre-line">
                    {bloque.contenido_texto}
                  </div>
                )}
                {bloque.tipo_bloque === 'imagen' && (
                  <div className="flex flex-col gap-3">
                    {bloque.contenido_texto && (
                      <div className="prose max-w-none text-xs leading-relaxed text-[#181c1e] bg-[#fafbfc] p-3 rounded-lg border border-[#c3c6d0]/20 whitespace-pre-line">
                        {bloque.contenido_texto}
                      </div>
                    )}
                    {bloque.url_recurso && (
                      <div className="relative w-full max-h-[480px] overflow-hidden rounded-xl border border-[#c3c6d0]/30 bg-[#f8fafc] flex items-center justify-center p-2">
                        <img
                          src={bloque.url_recurso}
                          alt={bloque.titulo_bloque || 'Imagen ilustrativa'}
                          className="max-h-[460px] w-auto object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {bloque.tipo_bloque === 'video' && (
                  <div className="flex flex-col gap-3">
                    {bloque.contenido_texto && (
                      <div className="prose max-w-none text-xs leading-relaxed text-[#181c1e] bg-[#fafbfc] p-3 rounded-lg border border-[#c3c6d0]/20 whitespace-pre-line">
                        {bloque.contenido_texto}
                      </div>
                    )}
                    {embedUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/90 shadow-md">
                        <iframe
                          src={embedUrl}
                          title={bloque.titulo_bloque || 'Video lección'}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[#006689] bg-[#e6f2fb] p-3 rounded-lg border border-[#006689]/20">
                        <span className="material-symbols-outlined">play_circle</span>
                        <a
                          href={bloque.url_recurso}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline truncate"
                        >
                          {bloque.url_recurso}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {(bloque.tipo_bloque === 'descarga' || bloque.tipo_bloque === 'url') && (
                  <div className="flex flex-col gap-3">
                    {bloque.contenido_texto && (
                      <div className="prose max-w-none text-xs leading-relaxed text-[#181c1e] bg-[#fafbfc] p-3 rounded-lg border border-[#c3c6d0]/20 whitespace-pre-line">
                        {bloque.contenido_texto}
                      </div>
                    )}

                    {(() => {
                      const esPdf = bloque.url_recurso?.toLowerCase().endsWith('.pdf');

                      return (
                        <div className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#c3c6d0]/30 rounded-xl hover:border-[#006689]/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#e6f2fb] text-[#006689] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-2xl">
                                {bloque.tipo_bloque === 'url' ? 'link' : esPdf ? 'picture_as_pdf' : 'folder_open'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#002547]">
                                {bloque.titulo_bloque || (esPdf ? 'Documento PDF de la Lección' : 'Material de la Lección')}
                              </h4>
                              <p className="text-[11px] text-[#737780] mt-0.5">
                                {bloque.tipo_bloque === 'url' ? 'Enlace externo' : esPdf ? 'Documento PDF' : 'Recurso descargable'}
                              </p>
                            </div>
                          </div>

                          {bloque.url_recurso && (
                            <a
                              href={bloque.url_recurso}
                              target="_blank"
                              download={bloque.tipo_bloque === 'descarga'}
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#006689] hover:bg-[#002547] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {bloque.tipo_bloque === 'url' ? 'open_in_new' : 'download'}
                              </span>
                              {bloque.tipo_bloque === 'url' ? 'Abrir Enlace' : 'Descargar'}
                            </a>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormularioBloqueInlineContent({
  bloque,
  tipoBloque,
  setTipoBloque,
  contenidoTexto,
  setContenidoTexto,
  insertarFormatoTexto,
  siguienteOrden,
  isPending,
  onSubmit,
  onCancel,
}: {
  bloque?: BloqueContenido;
  tipoBloque: string;
  setTipoBloque: (val: string) => void;
  contenidoTexto: string;
  setContenidoTexto: (val: string) => void;
  insertarFormatoTexto: (inicio: string, fin?: string) => void;
  siguienteOrden: number;
  isPending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [modoEntrada, setModoEntrada] = useState<'url' | 'archivo'>('url');

  const obtenerAceptados = () => {
    switch (tipoBloque) {
      case 'imagen':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'descarga':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,application/pdf';
      default:
        return '*';
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Tipo de Bloque Educativo
          </label>
          <select
            name="tipo_bloque"
            value={tipoBloque}
            onChange={(e) => setTipoBloque(e.target.value)}
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white"
          >
            <option value="texto">Texto / Explicación Formateada</option>
            <option value="imagen">Imagen Ilustrativa</option>
            <option value="video">Video Didáctico</option>
            <option value="descarga">Archivo / Documento Descargable (PDF, ZIP, Docs)</option>
            <option value="url">Enlace / URL Externa</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Título del Bloque (Opcional)
          </label>
          <input
            type="text"
            name="titulo_bloque"
            defaultValue={bloque?.titulo_bloque || ''}
            placeholder="Ej. Diagrama explicativo, Conceptos clave..."
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white"
          />
        </div>
      </div>

      {/* TEXTO EXPLICATIVO PRINCIPAL */}
      {tipoBloque === 'texto' && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-bold text-[#002547] uppercase">
              Contenido y Explicación
            </label>

            <div className="flex items-center gap-1 bg-white border border-[#c3c6d0] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => insertarFormatoTexto('**', '**')}
                className="px-2 py-1 hover:bg-gray-100 rounded text-xs font-bold text-[#002547]"
                title="Negrita"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertarFormatoTexto('*', '*')}
                className="px-2 py-1 hover:bg-gray-100 rounded text-xs italic font-bold text-[#002547]"
                title="Cursiva"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertarFormatoTexto('### ')}
                className="px-2 py-1 hover:bg-gray-100 rounded text-xs font-bold text-[#006689]"
                title="Subtítulo"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertarFormatoTexto('\n- ')}
                className="px-2 py-1 hover:bg-gray-100 rounded text-xs font-bold text-[#002547]"
                title="Lista"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => insertarFormatoTexto('💡 NOTA: ')}
                className="px-2 py-1 hover:bg-gray-100 rounded text-xs font-bold text-amber-700 bg-amber-50"
                title="Consejo"
              >
                💡 Alerta
              </button>
            </div>
          </div>

          <textarea
            name="contenido_texto"
            rows={5}
            required
            value={contenidoTexto}
            onChange={(e) => setContenidoTexto(e.target.value)}
            placeholder="Escribe la teoría o explicación de la lección aquí..."
            className="w-full p-3 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white font-mono text-xs leading-relaxed"
          />
        </div>
      )}

      {/* TEXTO ACOMPAÑANTE OPCIONAL (IMAGEN, VIDEO, DESCARGA, URL) */}
      {tipoBloque !== 'texto' && (
        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Texto / Instrucción Acompañante (Opcional)
          </label>
          <textarea
            name="contenido_texto"
            rows={2}
            value={contenidoTexto}
            onChange={(e) => setContenidoTexto(e.target.value)}
            placeholder="Escribe aquí un texto o indicación que aparecerá arriba del recurso..."
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white text-xs leading-relaxed"
          />
        </div>
      )}

      {/* SELECTOR DE ENTRADA PARA MULTIMEDIA / ARCHIVO / URL */}
      {tipoBloque !== 'texto' && (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-[#c3c6d0]/40">
          <div className="flex items-center gap-3 border-b border-[#c3c6d0]/30 pb-2">
            <span className="font-bold text-[#002547] uppercase text-[11px]">
              Origen del Recurso:
            </span>
            <button
              type="button"
              onClick={() => setModoEntrada('url')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                modoEntrada === 'url'
                  ? 'bg-[#006689] text-white'
                  : 'text-[#737780] hover:bg-gray-100'
              }`}
            >
              Enlace URL
            </button>
            <button
              type="button"
              onClick={() => setModoEntrada('archivo')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                modoEntrada === 'archivo'
                  ? 'bg-[#006689] text-white'
                  : 'text-[#737780] hover:bg-gray-100'
              }`}
            >
              Subir Archivo
            </button>
          </div>

          {modoEntrada === 'url' ? (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1 text-[11px]">
                URL Externa
              </label>
              <input
                type="url"
                name="url_recurso"
                required
                defaultValue={bloque?.url_recurso || ''}
                placeholder="https://..."
                className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1 text-[11px]">
                Seleccionar Archivo Local
              </label>
              <input
                type="file"
                name="archivo_subida"
                required={!bloque?.url_recurso}
                accept={obtenerAceptados()}
                className="w-full text-xs text-[#42474f] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#e6f2fb] file:text-[#006689] hover:file:bg-[#006689] hover:file:text-white transition-colors cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 items-center pt-1">
        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Orden de Aparición
          </label>
          <input
            type="number"
            name="orden_bloque"
            defaultValue={siguienteOrden}
            min={1}
            required
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white"
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id={`es_obligatorio_${bloque?.id_bloque || 'nuevo'}`}
            name="es_obligatorio"
            defaultChecked={bloque?.es_obligatorio || false}
            className="w-4 h-4 accent-[#002547] rounded cursor-pointer"
          />
          <label
            htmlFor={`es_obligatorio_${bloque?.id_bloque || 'nuevo'}`}
            className="font-bold text-[#002547] cursor-pointer"
          >
            ¿Lectura / Visualización Obligatoria?
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border border-[#c3c6d0] rounded-lg font-bold text-[#42474f] bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-[#006689] text-white rounded-lg font-bold hover:bg-[#002547] transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : bloque ? 'Guardar Cambios' : 'Guardar Bloque'}
        </button>
      </div>
    </form>
  );
}