'use client';

import { useEffect, useState, useTransition, ChangeEvent } from 'react';
import Link from 'next/link';
import { obtenerPerfilUsuarioAction, guardarPerfilUsuarioAction } from './actions';

export default function PerfilProfesionalPage() {
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [perfilData, setPerfilData] = useState<any>(null);
  const [logrosModulos, setLogrosModulos] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [descargandoQR, setDescargandoQR] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [isPending, startTransition] = useTransition();
  
  const [resumen, setResumen] = useState('');
  const [linkLinkedin, setLinkLinkedin] = useState('');
  const [foto, setFoto] = useState('');
  const [habilidades, setHabilidades] = useState('');

  useEffect(() => {
    async function cargarPerfil() {
      const res = await obtenerPerfilUsuarioAction();
      if (res.success && res.perfil) {
        setPerfilData(res.perfil);
        setLogrosModulos(res.logrosModulos || []);

        setResumen(res.perfil.resumen || '');
        setLinkLinkedin(res.perfil.link_linkedin || '');
        setFoto(res.perfil.foto || '');
        setHabilidades(res.perfil.habilidades ? res.perfil.habilidades.join(', ') : '');
      }
      setCargando(false);
    }

    cargarPerfil();
  }, []);

  const handleImagenSeleccionada = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append('resumen', resumen);
    formData.append('link_linkedin', linkLinkedin);
    formData.append('foto', foto);
    formData.append('habilidades', habilidades);

    startTransition(async () => {
      const res = await guardarPerfilUsuarioAction(formData);
      if (res.success) {
        setFeedback({ tipo: 'exito', texto: res.message });
        setModoEdicion(false);
        setPerfilData((prev: any) => ({
          ...prev,
          resumen,
          link_linkedin: linkLinkedin,
          foto,
          habilidades: habilidades.split(',').map((s) => s.trim()).filter(Boolean),
        }));
      } else {
        setFeedback({ tipo: 'error', texto: res.message });
      }
    });
  };

  const handleImprimirPDF = () => {
    window.print();
  };

  // URL del perfil basada en token UUID seguro
  const urlPerfilPublico = typeof window !== 'undefined'
    ? `${window.location.origin}/perfil/publico/${perfilData?.token_publico}`
    : '';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlPerfilPublico)}`;

  // Función para descargar la imagen del QR al dispositivo
  const descargarQR = async () => {
    try {
      setDescargandoQR(true);
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `QR-Perfil-${perfilData?.nombre || 'profesional'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error al descargar el QR:', error);
      alert('Ocurrió un problema al descargar el código QR.');
    } finally {
      setDescargandoQR(false);
    }
  };

  // Función para copiar el link directo al portapapeles
  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlPerfilPublico);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20 text-[#0D3B66] font-semibold text-sm">
        Cargando perfil profesional...
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .no-imprimir {
            display: none !important;
          }
          .seccion-imprimir {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-6 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 no-imprimir">
          <Link href="/modulos" className="text-xs font-bold text-[#2566A8] hover:text-[#0D3B66] flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Módulos
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMostrarModalQR(true)}
              className="px-3.5 py-2 bg-[#E6F2FB] border border-[#38BDF5]/40 text-[#0D3B66] hover:bg-[#38BDF5]/20 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base text-[#2566A8]">qr_code_2</span>
              Compartir QR
            </button>
            <button
              type="button"
              onClick={() => setModoEdicion(!modoEdicion)}
              className="px-4 py-2 bg-[#0D3B66] hover:bg-[#2566A8] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">
                {modoEdicion ? 'close' : 'edit'}
              </span>
              {modoEdicion ? 'Cancelar Edición' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 no-imprimir ${
              feedback.tipo === 'exito'
                ? 'bg-[#E6F2FB] text-[#0D3B66] border border-[#38BDF5]/40'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {feedback.tipo === 'exito' ? 'check_circle' : 'error'}
            </span>
            {feedback.texto}
          </div>
        )}

        {modoEdicion ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col gap-5 no-imprimir">
            <h2 className="text-base font-bold text-[#0D3B66] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38BDF5]">badge</span>
              Editar Datos Profesionales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0D3B66] uppercase mb-1">
                  Enlace Perfil LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/usuario"
                  value={linkLinkedin}
                  onChange={(e) => setLinkLinkedin(e.target.value)}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2566A8]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0D3B66] uppercase mb-1">
                  Habilidades Clave (Separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Gestión de Proyectos, SQL, Liderazgo"
                  value={habilidades}
                  onChange={(e) => setHabilidades(e.target.value)}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2566A8]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block font-bold text-[#0D3B66] uppercase text-xs">
                Fotografía de Perfil
              </label>
              
              <div className="flex items-center gap-4 bg-[#F7FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                {foto ? (
                  <img
                    src={foto}
                    alt="Previsualización"
                    className="w-16 h-16 rounded-full object-cover border border-[#38BDF5]/50 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#E6F2FB] text-[#0D3B66] flex items-center justify-center shrink-0 border border-[#E2E8F0]">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:border-[#2566A8] text-[#0D3B66] font-bold text-xs rounded-lg transition-colors shadow-xs w-fit">
                    <span className="material-symbols-outlined text-base text-[#2566A8]">upload</span>
                    {foto ? 'Cambiar Imagen' : 'Subir Fotografía'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenSeleccionada}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#737780]">
                    Archivos soportados: JPG, PNG, WEBP (Máx. 5MB)
                  </span>
                </div>

                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto('')}
                    className="ml-auto text-xs font-bold text-red-600 hover:underline"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0D3B66] uppercase mb-1 text-xs">
                Resumen / Extracto Profesional
              </label>
              <textarea
                rows={4}
                placeholder="Escribe un resumen de tu trayectoria profesional, metas e intereses de carrera..."
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                className="w-full p-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2566A8] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setModoEdicion(false)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg font-bold text-xs text-[#42474f] hover:bg-[#F7FAFC]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-[#0D3B66] hover:bg-[#2566A8] text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="seccion-imprimir flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                {perfilData?.foto ? (
                  <img
                    src={perfilData.foto}
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-full object-cover border border-[#E2E8F0] shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0D3B66] text-white font-black text-2xl flex items-center justify-center shadow-xs">
                    {perfilData?.nombre?.[0]}
                    {perfilData?.apellido_paterno?.[0]}
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-extrabold text-[#0D3B66]">
                    {perfilData?.nombre} {perfilData?.apellido_paterno} {perfilData?.apellido_materno || ''}
                  </h1>

                  <p className="text-sm font-bold text-[#2566A8] mt-0.5">
                    {perfilData?.profesion || 'Profesional'} {perfilData?.area_trabajo ? `• Área: ${perfilData.area_trabajo}` : ''}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#737780] mt-2">
                    {perfilData?.ciudad && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#2566A8]">location_on</span>
                        {perfilData.ciudad}{perfilData.region ? `, ${perfilData.region}` : ''}
                      </span>
                    )}
                    {perfilData?.correo && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#2566A8]">mail</span>
                        {perfilData.correo}
                      </span>
                    )}
                    {perfilData?.telefono && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#2566A8]">call</span>
                        {perfilData.telefono}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {perfilData?.link_linkedin && (
                <div className="flex items-center gap-2 self-end md:self-center">
                  <a
                    href={perfilData.link_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#2566A8] text-white font-bold text-xs rounded-lg hover:bg-[#0D3B66] flex items-center gap-1 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38BDF5] text-lg">description</span>
                  Resumen Profesional
                </h3>
                <p className="text-xs text-[#42474f] leading-relaxed whitespace-pre-line">
                  {perfilData?.resumen || 'Sin resumen especificado. Haz clic en "Editar Perfil" para redactarlo.'}
                </p>
              </div>

              <div className="md:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38BDF5] text-lg">psychology</span>
                  Habilidades Clave
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {perfilData?.habilidades && perfilData.habilidades.length > 0 ? (
                    perfilData.habilidades.map((h: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#E6F2FB] border border-[#38BDF5]/30 text-[#0D3B66] rounded-md font-bold text-[11px]"
                      >
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#737780] italic">No registradas.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <span className="material-symbols-outlined text-[#38BDF5] text-lg">verified</span>
                Formación Acreditada
              </h3>

              <div className="flex flex-col gap-2.5">
                {logrosModulos.length > 0 ? (
                  logrosModulos.map((m) => (
                    <div key={m.id_modulo} className="p-3.5 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#38BDF5] text-lg">check_circle</span>
                        <span className="text-xs font-bold text-[#0D3B66]">
                          Módulo {m.posicion_modulo}: {m.titulo_modulo}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#E6F2FB] text-[#0D3B66]">
                        Completado
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#737780] italic">No hay módulos registrados.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {mostrarModalQR && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-imprimir">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-full flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <h3 className="text-sm font-bold text-[#0D3B66]">Código QR de Perfil</h3>
              <button
                type="button"
                onClick={() => setMostrarModalQR(false)}
                className="text-[#737780] hover:text-[#0D3B66]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-inner my-1">
              <img src={qrUrl} alt="Código QR del Perfil" className="w-48 h-48" />
            </div>

            <p className="text-xs text-[#42474f] leading-relaxed">
              Muestra o descarga este QR para dar acceso rápido a tu perfil profesional público.
            </p>

            <div className="w-full flex items-center justify-between gap-2 p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg">
              <span className="text-[11px] font-mono text-[#0D3B66] truncate text-left flex-1 px-1">
                {urlPerfilPublico}
              </span>
              <button
                type="button"
                onClick={copiarEnlace}
                title="Copiar enlace público"
                className="p-1.5 bg-white border border-[#E2E8F0] hover:border-[#2566A8] text-[#2566A8] hover:text-[#0D3B66] rounded-md transition-colors flex items-center justify-center shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">
                  {copiado ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>

            {copiado && (
              <span className="text-[11px] font-bold text-[#2566A8] -mt-2 animate-fade-in">
                ¡Enlace copiado al portapapeles!
              </span>
            )}

            <div className="flex flex-col gap-2 w-full mt-1">
              <button
                type="button"
                onClick={descargarQR}
                disabled={descargandoQR}
                className="w-full py-2 bg-[#2566A8] hover:bg-[#0D3B66] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">download</span>
                {descargandoQR ? 'Descargando...' : 'Descargar Imagen QR'}
              </button>

              <button
                type="button"
                onClick={() => setMostrarModalQR(false)}
                className="w-full py-2 border border-[#E2E8F0] text-[#0D3B66] hover:bg-[#F7FAFC] rounded-lg font-bold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}