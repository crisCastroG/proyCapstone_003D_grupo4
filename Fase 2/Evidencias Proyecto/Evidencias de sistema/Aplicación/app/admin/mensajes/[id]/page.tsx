import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import FormularioRespuesta from './FormularioRespuesta';

export const dynamic = 'force-dynamic';

export default async function MensajePage({ params }: { params: Promise<{ id: string }> }) {
  const sesion = await obtenerSesionActual();
  if (!sesion) redirect('/inicio_sesion');
  if (sesion.rol !== 'administrador' && sesion.rol !== 'superadministrador') redirect('/modulos');

  const { id } = await params;
  const idMensaje = Number(id);
  if (!Number.isInteger(idMensaje)) notFound();

  // Al abrirlo por primera vez pasa de "no leído" a "leído"
  await query(
    `UPDATE public.mensaje_contacto SET estado_mensaje = 'leido' WHERE id_mensaje = $1 AND estado_mensaje = 'no leido'`,
    [idMensaje]
  );

  const res = await query(
    `SELECT m.id_mensaje, m.asunto, m.mensaje, m.estado_mensaje,
            to_char(m.fecha_envio AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY HH24:MI') AS fecha,
            u.nombre, u.apellido_paterno, u.correo,
            c.id_contenido, c.titulo_contenido, c.modulo_id_modulo, mo.titulo_modulo
       FROM public.mensaje_contacto m
       JOIN public.usuario u ON u.id_usuario = m.usuario_id_remitente
       JOIN public.contenido c ON c.id_contenido = m.contenido_id_contenido
       JOIN public.modulo mo ON mo.id_modulo = c.modulo_id_modulo
      WHERE m.id_mensaje = $1`,
    [idMensaje]
  );
  const m = res.rows[0];
  if (!m) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link href="/admin/mensajes" className="text-sm font-semibold text-[#006689] hover:underline">
        ← Volver a mensajes
      </Link>

      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <h1 className="text-xl font-extrabold text-[#002547]">{m.asunto || 'Consulta sin asunto'}</h1>
        <p className="text-sm text-[#42474f] mt-1">
          {m.nombre} {m.apellido_paterno} ·{' '}
          <a href={`mailto:${m.correo}`} className="text-[#006689] hover:underline">{m.correo}</a> · {m.fecha}
        </p>
        <p className="text-xs text-[#42474f] mt-1">
          Sobre la lección{' '}
          <Link href={`/modulos/${m.modulo_id_modulo}/contenido/${m.id_contenido}`} className="text-[#006689] font-semibold hover:underline">
            {m.titulo_contenido}
          </Link>{' '}
          ({m.titulo_modulo})
        </p>
        <p className="text-sm text-[#1f2933] mt-4 whitespace-pre-wrap leading-relaxed">{m.mensaje}</p>
      </section>

      {m.estado_mensaje === 'respondido' && (
        <p className="text-sm font-semibold text-[#166534] bg-[#F0FDF4] border border-[#86EFAC]/60 rounded-xl px-5 py-3">
          Este mensaje ya fue respondido por correo.
        </p>
      )}

      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <h2 className="text-lg font-bold text-[#002547] mb-3">
          {m.estado_mensaje === 'respondido' ? 'Enviar otra respuesta' : 'Responder'}
        </h2>
        <FormularioRespuesta idMensaje={idMensaje} correo={m.correo} />
      </section>
    </div>
  );
}
