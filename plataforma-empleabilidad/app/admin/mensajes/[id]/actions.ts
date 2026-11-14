'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { requerirAdmin } from '@/lib/permisos';
import { enviarCorreo } from '@/lib/correo';

export type EstadoRespuesta = { ok: boolean; mensaje: string };

// Envía la respuesta por correo al remitente y deja el mensaje marcado como respondido.
export async function responderMensajeAction(
  idMensaje: number,
  _estado: EstadoRespuesta | null,
  formData: FormData
): Promise<EstadoRespuesta> {
  try {
    await requerirAdmin();

    const texto = String(formData.get('respuesta') ?? '').trim();
    if (!texto) return { ok: false, mensaje: 'Escribe una respuesta antes de enviar.' };
    if (texto.length > 5000) return { ok: false, mensaje: 'La respuesta es demasiado larga.' };

    const res = await query(
      `SELECT u.nombre, u.correo, m.asunto, m.mensaje, c.titulo_contenido
         FROM public.mensaje_contacto m
         JOIN public.usuario u ON u.id_usuario = m.usuario_id_remitente
         JOIN public.contenido c ON c.id_contenido = m.contenido_id_contenido
        WHERE m.id_mensaje = $1`,
      [idMensaje]
    );
    const m = res.rows[0];
    if (!m) return { ok: false, mensaje: 'El mensaje no existe.' };

    const cuerpo =
      `Hola ${m.nombre},\n\n${texto}\n\n` +
      `Saludos,\nEquipo Empleamás\n\n` +
      `---\nTu consulta sobre la lección "${m.titulo_contenido}":\n${m.mensaje}`;

    const asuntoCorreo = `Re: ${m.asunto || `Tu consulta sobre "${m.titulo_contenido}"`}`;
    const envio = await enviarCorreo({ para: m.correo, asunto: asuntoCorreo, texto: cuerpo });

    await query(`UPDATE public.mensaje_contacto SET estado_mensaje = 'respondido' WHERE id_mensaje = $1`, [idMensaje]);

    revalidatePath('/admin/mensajes');
    revalidatePath(`/admin/mensajes/${idMensaje}`);
    return {
      ok: true,
      mensaje: envio.simulado
        ? 'Respuesta guardada. El envío de correos no está configurado (modo desarrollo): el correo se mostró en la consola del servidor.'
        : `Respuesta enviada a ${m.correo}.`,
    };
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    return { ok: false, mensaje: 'No se pudo enviar el correo. Revisa la configuración SMTP e inténtalo de nuevo.' };
  }
}
