'use client';

import { useState, useTransition } from 'react';
import { enviarConsultaEstudianteAction } from '../actions';

type Props = {
  idContenido: number;
  idAdminDestinatario: number;
  tituloFormulario?: string;
  descripcionFormulario?: string;
};

export default function FormularioContactoEstudiante({
  idContenido,
  idAdminDestinatario,
  tituloFormulario = 'Envíanos tu consulta',
  descripcionFormulario,
}: Props) {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('contenido_id_contenido', String(idContenido));
      formData.append('usuario_id_destinatario', String(idAdminDestinatario));
      formData.append('asunto', asunto);
      formData.append('mensaje', mensaje);

      const res = await enviarConsultaEstudianteAction(formData);

      if (res.success) {
        setFeedback({ tipo: 'exito', texto: res.message });
        setAsunto('');
        setMensaje('');
      } else {
        setFeedback({ tipo: 'error', texto: res.message });
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#c3c6d0]/40 p-6 shadow-sm flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
          <span className="material-symbols-outlined text-xl">mail</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#002547]">{tituloFormulario}</h3>
          {descripcionFormulario && (
            <p className="text-xs text-[#737780] mt-0.5">{descripcionFormulario}</p>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            feedback.tipo === 'exito'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {feedback.tipo === 'exito' ? 'check_circle' : 'error'}
          </span>
          {feedback.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-[#002547] uppercase tracking-wider text-[11px]">
            Asunto
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Duda con el concepto expuesto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-[#002547] uppercase tracking-wider text-[11px]">
            Mensaje
          </label>
          <textarea
            required
            rows={4}
            placeholder="Escribe aquí tu consulta para el administrador o tutor asignado..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="self-end px-5 py-2.5 bg-[#002547] hover:bg-[#2566A8] text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isPending ? 'Enviando...' : 'Enviar Consulta'}
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
}