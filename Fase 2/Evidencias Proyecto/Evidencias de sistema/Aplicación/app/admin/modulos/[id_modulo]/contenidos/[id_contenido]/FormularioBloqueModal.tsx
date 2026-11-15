'use client';

import { useState } from 'react';
import { crearBloqueAction } from './actions';

type Props = {
  idModulo: number;
  idContenido: number;
  siguienteOrden: number;
};

export default function FormularioBloqueModal({ idModulo, idContenido, siguienteOrden }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [tipoBloque, setTipoBloque] = useState<string>('texto');
  const [modoEntrada, setModoEntrada] = useState<'url' | 'archivo'>('url');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('id_modulo', idModulo.toString());
    formData.append('contenido_id_contenido', idContenido.toString());

    const res = await crearBloqueAction(formData);
    setCargando(false);

    if (res.success) {
      setIsOpen(false);
      setModoEntrada('url');
    } else {
      setError(res.message || 'Ocurrió un error al guardar el bloque.');
    }
  };

  const obtenerAceptados = () => {
    switch (tipoBloque) {
      case 'imagen':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'descarga':
      case 'pdf':
      case 'recurso':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,application/pdf';
      default:
        return '*';
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#006689] hover:bg-[#002547] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Añadir Bloque
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-lg p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[#c3c6d0]/30 pb-3">
          <h3 className="text-base font-bold text-[#002547]">Nuevo Bloque de Contenido</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[#737780] hover:text-[#002547]"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#002547] uppercase mb-1">
              Tipo de Bloque
            </label>
            <select
              name="tipo_bloque"
              value={tipoBloque}
              onChange={(e) => setTipoBloque(e.target.value)}
              className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689] bg-white font-medium"
            >
              <option value="texto">Texto / Explicación</option>
              <option value="imagen">Imagen Ilustrativa</option>
              <option value="video">Video (URL / Embed)</option>
              <option value="descarga">Archivo / Documento Descargable (PDF, Docs, ZIP)</option>
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
              placeholder="Ej. Introducción al tema"
              className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689]"
            />
          </div>

          {tipoBloque === 'texto' ? (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1">
                Contenido de Texto
              </label>
              <textarea
                name="contenido_texto"
                rows={4}
                required
                placeholder="Escribe aquí las instrucciones o la teoría..."
                className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689]"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1">
                Texto / Instrucción Acompañante (Opcional)
              </label>
              <textarea
                name="contenido_texto"
                rows={2}
                placeholder="Escribe un texto aclaratorio opcional..."
                className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689]"
              />
            </div>
          )}

          {tipoBloque !== 'texto' && (
            <div className="flex flex-col gap-2 bg-[#f8fafc] p-3 rounded-lg border border-[#c3c6d0]/40">
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
                      : 'text-[#737780] hover:bg-gray-200'
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
                      : 'text-[#737780] hover:bg-gray-200'
                  }`}
                >
                  Subir Archivo Local
                </button>
              </div>

              {modoEntrada === 'url' ? (
                <div>
                  <label className="block font-bold text-[#002547] uppercase mb-1 text-[11px]">
                    URL Externa o Ruta
                  </label>
                  <input
                    type="text"
                    name="url_recurso"
                    required
                    placeholder="https://... o /uploads/..."
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
                    required
                    accept={obtenerAceptados()}
                    className="w-full text-xs text-[#42474f] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#e6f2fb] file:text-[#006689] hover:file:bg-[#006689] hover:file:text-white transition-colors cursor-pointer bg-white p-1 rounded-lg border border-[#c3c6d0]"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-center pt-2">
            <div>
              <label className="block font-bold text-[#002547] uppercase mb-1">
                Orden del Bloque
              </label>
              <input
                type="number"
                name="orden_bloque"
                defaultValue={siguienteOrden}
                min={1}
                required
                className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-[#006689]"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="es_obligatorio_modal"
                name="es_obligatorio"
                className="w-4 h-4 accent-[#002547] rounded cursor-pointer"
              />
              <label htmlFor="es_obligatorio_modal" className="font-bold text-[#002547] cursor-pointer">
                ¿Es Obligatorio?
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={cargando}
              className="px-4 py-2 border border-[#c3c6d0] rounded-lg font-bold text-[#42474f] hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-4 py-2 bg-[#006689] text-white rounded-lg font-bold hover:bg-[#002547] transition-colors disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar Bloque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}