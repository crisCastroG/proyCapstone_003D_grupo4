'use client';

import { useState, useTransition } from 'react';
import { BloqueContenido } from '@/lib/types/bloque';
import { crearBloqueAction, actualizarBloqueAction, eliminarBloqueAction, eliminarFormularioLeccionAction } from './actions';
import { useUploadThing } from '@/lib/uploadthing';
import FormularioContactoModal from './FormularioContactoModal';

type Props = {
  bloques?: BloqueContenido[];
  bloquesIniciales?: BloqueContenido[];
  idModulo: number;
  idContenido: number;
  formularioLeccion?: any; 
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

export default function ListaBloques({
  bloques: propBloques,
  bloquesIniciales,
  idModulo,
  idContenido,
  formularioLeccion,
}: Props) {
  const bloques = bloquesIniciales || propBloques || [];

  const [modoVista, setModoVista] = useState<'editor' | 'previa'>('editor');
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);
  const [bloqueEditandoId, setBloqueEditandoId] = useState<number | null>(null);
  const [tipoBloque, setTipoBloque] = useState<string>('texto');
  const [contenidoTexto, setContenidoTexto] = useState<string>('');
  const [errorForm, setErrorForm] = useState<string>('');
  const [cargandoSubida, setCargandoSubida] = useState(false);

  const [bloqueAEliminar, setBloqueAEliminar] = useState<BloqueContenido | null>(null);
  const [isPending, startTransition] = useTransition();

  const { startUpload: subirImagen } = useUploadThing("imagenUploader");
  const { startUpload: subirVideo } = useUploadThing("videoUploader");
  const { startUpload: subirDocumento } = useUploadThing("documentoUploader");

  const resetFormulario = () => {
    setMostrarFormCrear(false);
    setBloqueEditandoId(null);
    setTipoBloque('texto');
    setContenidoTexto('');
    setErrorForm('');
    setCargandoSubida(false);
  };

  const handleIniciarEdicion = (bloque: BloqueContenido) => {
    setMostrarFormCrear(false);
    setBloqueEditandoId(bloque.id_bloque);
    setTipoBloque(bloque.tipo_bloque);
    setContenidoTexto(bloque.contenido_texto || '');
    setErrorForm('');
    setCargandoSubida(false);
  };

  const handleSubmitInline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local';
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    formData.set('id_modulo', idModulo.toString());
    formData.set('contenido_id_contenido', idContenido.toString());

    // Validar si el orden ya existe
    const ordenIngresado = parseInt(formData.get('orden_bloque') as string, 10);
    const ordenExistente = bloques.some(
      (b) => b.orden_bloque === ordenIngresado && b.id_bloque !== bloqueEditandoId
    );

    if (ordenExistente) {
      setErrorForm(`El orden #${ordenIngresado} ya está asignado a otro bloque de esta lección.`);
      return;
    }

    const archivoInput = formElement.querySelector<HTMLInputElement>('input[name="archivo_subida"]');
    const archivoSeleccionado = archivoInput?.files?.[0];

    if (provider === 'uploadthing' && archivoSeleccionado && archivoSeleccionado.size > 0) {
      setCargandoSubida(true);
      try {
        let uploadRes;
        if (tipoBloque === 'imagen') uploadRes = await subirImagen([archivoSeleccionado]);
        else if (tipoBloque === 'video') uploadRes = await subirVideo([archivoSeleccionado]);
        else if (tipoBloque === 'descarga') uploadRes = await subirDocumento([archivoSeleccionado]);

        if (!uploadRes || uploadRes.length === 0) {
          throw new Error('No se pudo subir el archivo a Uploadthing.');
        }

        formData.set('url_recurso', uploadRes[0].url);
        formData.delete('archivo_subida');
      } catch (err: any) {
        setCargandoSubida(false);
        setErrorForm(err.message || 'Error durante la subida.');
        return;
      }
      setCargandoSubida(false);
    }

    startTransition(async () => {
      let res;
      if (bloqueEditandoId) {
        res = await actualizarBloqueAction(bloqueEditandoId, formData);
      } else {
        res = await crearBloqueAction(formData);
      }

      if (res && !res.success) {
        setErrorForm(res.message || 'Error al guardar el bloque.');
      } else {
        resetFormulario();
      }
    });
  };

  const handleConfirmarEliminacion = () => {
    if (!bloqueAEliminar) return;

    startTransition(async () => {
      await eliminarBloqueAction(bloqueAEliminar.id_bloque, idModulo, idContenido);
      setBloqueAEliminar(null);
    });
  };

  const handleEliminarFormulario = () => {
    if (!formularioLeccion) return;
    if (confirm('¿Estás seguro de quitar el formulario de contacto de esta lección?')) {
      startTransition(async () => {
        await eliminarFormularioLeccionAction(
          formularioLeccion.id_formulario,
          idContenido,
          idModulo
        );
      });
    }
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
          <div className="flex items-center gap-2">
            <FormularioContactoModal
              idModulo={idModulo}
              idContenido={idContenido}
              formularioExistente={formularioLeccion}
            />
            <button
              type="button"
              onClick={() => {
                setBloqueEditandoId(null);
                setTipoBloque('texto');
                setContenidoTexto('');
                setErrorForm('');
                setMostrarFormCrear(true);
              }}
              className="px-4 py-2 bg-[#006689] hover:bg-[#002547] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Añadir Bloque
            </button>
          </div>
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
                disabled={isPending || cargandoSubida}
                className="px-4 py-2 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminacion}
                disabled={isPending || cargandoSubida}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de creación de bloque */}
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
            siguienteOrden={bloques.length + 1}
            errorForm={errorForm}
            isPending={isPending || cargandoSubida}
            cargandoSubida={cargandoSubida}
            onSubmit={handleSubmitInline}
            onCancel={resetFormulario}
          />
        </div>
      )}

      {/* Estado sin bloques educativos */}
      {bloques.length === 0 && !mostrarFormCrear && (
        <div className="bg-white rounded-xl border border-[#c3c6d0]/30 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#e6f2fb] text-[#006689] flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h3 className="text-base font-bold text-[#002547]">Esta lección aún no tiene contenido explicativo</h3>
          <p className="text-xs text-[#737780] mt-1 max-w-md mx-auto">
            Añade bloques de texto, imagen, video o material descargable usando el botón superior.
          </p>
        </div>
      )}

      {/* Listado de bloques educativos */}
      {bloques.length > 0 && (
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
                    siguienteOrden={bloque.orden_bloque}
                    errorForm={errorForm}
                    isPending={isPending || cargandoSubida}
                    cargandoSubida={cargandoSubida}
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

      {formularioLeccion && (
        <div className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-5 shadow-sm mt-2">
          {modoVista === 'editor' ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold shrink-0 border border-indigo-100">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-[#002547]">
                      {formularioLeccion.titulo_formulario || 'Formulario de Contacto'}
                    </h5>
                  </div>
                  <p className="text-xs text-[#737780] mt-0.5">
                    Destinatario: <strong>{formularioLeccion.nombre} {formularioLeccion.apellido_paterno}</strong> ({formularioLeccion.correo})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <FormularioContactoModal
                  idModulo={idModulo}
                  idContenido={idContenido}
                  formularioExistente={formularioLeccion}
                />
                <button
                  type="button"
                  onClick={handleEliminarFormulario}
                  disabled={isPending}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar formulario"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#002547]">
                <span className="material-symbols-outlined text-indigo-600 text-xl">mail</span>
                <h3 className="text-sm font-bold">
                  {formularioLeccion.titulo_formulario || 'Envíanos tu consulta'}
                </h3>
              </div>
              {formularioLeccion.descripcion_formulario && (
                <p className="text-xs text-[#737780]">
                  {formularioLeccion.descripcion_formulario}
                </p>
              )}
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#c3c6d0]/30 flex flex-col gap-2 text-xs opacity-70 pointer-events-none">
                <input type="text" placeholder="Asunto" disabled className="p-2 border rounded bg-white text-xs" />
                <textarea placeholder="Escribe tu mensaje aquí..." disabled rows={3} className="p-2 border rounded bg-white text-xs" />
                <button disabled className="self-end px-4 py-2 bg-[#002547] text-white rounded font-bold text-xs">
                  Enviar Mensaje (Vista Previa Estudiante)
                </button>
              </div>
            </div>
          )}
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
  siguienteOrden,
  errorForm,
  isPending,
  cargandoSubida,
  onSubmit,
  onCancel,
}: {
  bloque?: BloqueContenido;
  tipoBloque: string;
  setTipoBloque: (val: string) => void;
  contenidoTexto: string;
  setContenidoTexto: (val: string) => void;
  siguienteOrden: number;
  errorForm?: string;
  isPending: boolean;
  cargandoSubida?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const esUrlExterna = tipoBloque === 'url';
  const haCambiadoTipo = Boolean(bloque && tipoBloque !== bloque.tipo_bloque);
  const conservarRecursoAnterior = Boolean(bloque?.url_recurso && !haCambiadoTipo);

  const [modoEntrada, setModoEntrada] = useState<'url' | 'archivo'>(() => {
    if (conservarRecursoAnterior && (bloque?.url_recurso?.startsWith('/uploads/') || bloque?.url_recurso?.includes('utfs.io'))) {
      return 'archivo';
    }
    return 'url';
  });

  const modoEfectivo = esUrlExterna ? 'url' : modoEntrada;

  const obtenerAceptados = () => {
    switch (tipoBloque) {
      case 'imagen':
        return 'image/jpeg,image/png,image/webp,image/gif';
      case 'video':
        return 'video/mp4,video/webm,video/ogg,video/*';
      case 'descarga':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,application/pdf';
      default:
        return '*';
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
      {errorForm && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {errorForm}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Tipo de Bloque Educativo
          </label>
          <select
            name="tipo_bloque"
            value={tipoBloque}
            onChange={(e) => setTipoBloque(e.target.value)}
            className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white font-semibold text-[#002547]"
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

      {tipoBloque === 'texto' && (
        <div>
          <label className="block font-bold text-[#002547] uppercase mb-1">
            Contenido y Explicación
          </label>
          <textarea
            name="contenido_texto"
            rows={5}
            required
            value={contenidoTexto}
            onChange={(e) => setContenidoTexto(e.target.value)}
            placeholder="Escribe la teoría o explicación de la lección aquí..."
            className="w-full p-3 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white text-xs leading-relaxed"
          />
        </div>
      )}

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

      {tipoBloque !== 'texto' && (
        <div className="flex flex-col gap-2 bg-white p-3.5 rounded-lg border border-[#c3c6d0]/40">
          {!esUrlExterna && (
            <div className="flex items-center gap-3 border-b border-[#c3c6d0]/30 pb-2">
              <span className="font-bold text-[#002547] uppercase text-[11px]">
                Origen del Recurso:
              </span>
              <button
                type="button"
                onClick={() => setModoEntrada('url')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  modoEfectivo === 'url'
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
                  modoEfectivo === 'archivo'
                    ? 'bg-[#006689] text-white'
                    : 'text-[#737780] hover:bg-gray-100'
                }`}
              >
                Subir Archivo
              </button>
            </div>
          )}

          {haCambiadoTipo && (
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-md flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">info</span>
              Has cambiado el tipo a <strong>{tipoBloque}</strong>. Por favor proporciona un nuevo recurso acorde a este tipo.
            </div>
          )}

          {modoEfectivo === 'url' ? (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1 text-[11px]">
                {tipoBloque === 'video'
                  ? 'URL del Video (YouTube, Vimeo o archivo)'
                  : 'URL Externa o Enlace'}
              </label>
              <input
                type="text"
                name="url_recurso"
                required={!conservarRecursoAnterior}
                defaultValue={conservarRecursoAnterior ? bloque?.url_recurso : ''}
                placeholder={
                  tipoBloque === 'video'
                    ? 'https://www.youtube.com/watch?v=... o https://vimeo.com/...'
                    : 'https://...'
                }
                className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white font-mono text-[11px]"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1 text-[11px]">
                Seleccionar Archivo Local ({tipoBloque.toUpperCase()})
              </label>
              <input
                type="file"
                name="archivo_subida"
                required={!conservarRecursoAnterior}
                accept={obtenerAceptados()}
                className="w-full text-xs text-[#42474f] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#e6f2fb] file:text-[#006689] hover:file:bg-[#006689] hover:file:text-white transition-colors cursor-pointer bg-white p-1 rounded-lg border border-[#c3c6d0]"
              />
              {conservarRecursoAnterior && (
                <p className="text-[11px] text-[#737780] mt-1.5 font-medium">
                  Archivo actual: <span className="text-[#006689] font-mono">{bloque?.url_recurso}</span> (Selecciona uno nuevo solo si deseas reemplazarlo).
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
          className="w-full md:w-1/2 p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white font-semibold text-[#002547]"
        />
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
          {cargandoSubida
            ? 'Subiendo archivo...'
            : isPending
            ? 'Guardando...'
            : bloque
            ? 'Guardar Cambios'
            : 'Guardar Bloque'}
        </button>
      </div>
    </form>
  );
}