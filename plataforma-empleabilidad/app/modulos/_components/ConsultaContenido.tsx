'use client';

import { useState } from 'react';

const campo = 'border border-[#CBD5E1] rounded-lg px-3 py-2 font-normal text-sm w-full bg-white';

// Formulario para que el usuario envíe una duda sobre la lección que está viendo.
export default function ConsultaContenido({ idContenido }: { idContenido: number }) {
  const [abierto, setAbierto] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido_id: idContenido, asunto, mensaje }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la consulta.');
        return;
      }
      setEnviado(true);
      setAsunto('');
      setMensaje('');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="mt-8 bg-white border border-[#E2E8F0] rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#002547]">¿Tienes una duda sobre esta lección?</h3>
          <p className="text-xs text-[#42474f] mt-0.5">Escríbenos y te responderemos al correo de tu cuenta.</p>
        </div>
        {!abierto && (
          <button
            type="button"
            onClick={() => { setAbierto(true); setEnviado(false); }}
            className="text-xs font-bold text-[#006689] border border-[#006689]/40 hover:bg-[#E6F2FB] px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Enviar consulta
          </button>
        )}
      </div>

      {enviado && (
        <div role="status" className="mt-4 bg-[#DCFCE7] text-[#166534] text-sm font-medium px-3 py-2 rounded-lg">
          ¡Gracias! Recibimos tu consulta y te responderemos a tu correo.
        </div>
      )}

      {abierto && !enviado && (
        <form onSubmit={enviar} className="flex flex-col gap-3 mt-4">
          {error && <div role="alert" className="bg-[#FEE2E2] text-[#991B1B] text-sm font-medium px-3 py-2 rounded-lg">{error}</div>}
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#002547]">
            Asunto (opcional)
            <input value={asunto} onChange={(e) => setAsunto(e.target.value)} maxLength={200} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#002547]">
            Tu consulta
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} required maxLength={2000} rows={4} className={campo} />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={cargando}
              className="text-xs font-bold text-white bg-[#002547] hover:bg-[#2566A8] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {cargando ? 'Enviando...' : 'Enviar'}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-xs font-semibold text-[#42474f] border border-[#c3c6d0] hover:bg-[#f1f4f6] px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
