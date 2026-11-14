'use client';

import { useActionState } from 'react';
import { responderMensajeAction, type EstadoRespuesta } from './actions';

export default function FormularioRespuesta({ idMensaje, correo }: { idMensaje: number; correo: string }) {
  const [estado, accion, enviando] = useActionState<EstadoRespuesta | null, FormData>(
    responderMensajeAction.bind(null, idMensaje),
    null
  );

  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
        Respuesta (se enviará a {correo})
        <textarea
          name="respuesta"
          required
          rows={6}
          maxLength={5000}
          className="border border-[#CBD5E1] rounded-lg px-3 py-2 font-normal text-sm"
        />
      </label>

      {estado && (
        <div
          role={estado.ok ? 'status' : 'alert'}
          className={`text-sm font-medium px-3 py-2 rounded-lg ${
            estado.ok ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
          }`}
        >
          {estado.mensaje}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="self-start text-sm font-bold text-white bg-[#002547] hover:bg-[#0d3b66] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
      >
        {enviando ? 'Enviando...' : 'Enviar respuesta'}
      </button>
    </form>
  );
}
