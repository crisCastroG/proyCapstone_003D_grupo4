'use server';

import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export async function enviarConsultaEstudianteAction(formData: FormData) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return { success: false, message: 'Debes iniciar sesión para enviar una consulta.' };
    }

    const idContenido = Number(formData.get('contenido_id_contenido'));
    const idAdminDestinatario = Number(formData.get('usuario_id_destinatario'));
    const asunto = (formData.get('asunto') as string)?.trim() || 'Consulta desde lección';
    const mensaje = (formData.get('mensaje') as string)?.trim();

    if (!idContenido || !idAdminDestinatario) {
      return { success: false, message: 'Faltan parámetros requeridos de la lección.' };
    }

    if (!mensaje) {
      return { success: false, message: 'Por favor escribe el contenido de tu mensaje.' };
    }

    await query(
      `INSERT INTO public.mensaje_contacto 
        (usuario_id_remitente, usuario_id_destinatario, contenido_id_contenido, asunto, mensaje, estado_mensaje)
       VALUES ($1, $2, $3, $4, $5,'no leido');`,
      [sesion.id_usuario, idAdminDestinatario, idContenido, asunto, mensaje]
    );

    return { success: true, message: 'Tu mensaje ha sido enviado correctamente.' };
  } catch (error: any) {
    console.error('Error al enviar mensaje de estudiante:', error);
    return { success: false, message: error.message || 'Error al enviar el mensaje.' };
  }
}