import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

const MAX_POR_HORA = 5;

// Un usuario envía una consulta sobre una lección. Queda guardada para los administradores.
export async function POST(request: Request) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'Debes iniciar sesión para enviar una consulta.' }, { status: 401 });
    }

    const body = await request.json();
    const contenidoId = Number(body.contenido_id);
    const asunto = String(body.asunto ?? '').trim();
    const mensaje = String(body.mensaje ?? '').trim();

    if (!Number.isInteger(contenidoId) || contenidoId <= 0) {
      return NextResponse.json({ error: 'La lección indicada no es válida.' }, { status: 400 });
    }
    if (!mensaje) {
      return NextResponse.json({ error: 'Escribe tu consulta antes de enviar.' }, { status: 400 });
    }
    if (mensaje.length > 2000 || asunto.length > 200) {
      return NextResponse.json({ error: 'El texto es demasiado largo.' }, { status: 400 });
    }

    const contenido = await query(
      `SELECT 1 FROM public.contenido WHERE id_contenido = $1 AND estado_contenido = 'publicado'`,
      [contenidoId]
    );
    if (contenido.rows.length === 0) {
      return NextResponse.json({ error: 'La lección no existe.' }, { status: 404 });
    }

    // Límite por usuario: evita llenar la bandeja de los administradores
    const recientes = await query(
      `SELECT COUNT(*) AS n FROM public.mensaje_contacto
        WHERE usuario_id_remitente = $1 AND fecha_envio > CURRENT_TIMESTAMP - INTERVAL '1 hour'`,
      [sesion.id_usuario]
    );
    if (Number(recientes.rows[0].n) >= MAX_POR_HORA) {
      return NextResponse.json({ error: 'Enviaste muchas consultas. Inténtalo más tarde.' }, { status: 429 });
    }

    // La tabla exige un destinatario: se asigna el primer administrador activo.
    // La bandeja de administración muestra todos los mensajes, así que cualquier admin puede responder.
    const admin = await query(
      `SELECT u.id_usuario
         FROM public.usuario u
         JOIN public.rol_usuario r ON r.id_rol = u.rol_usuario_id_rol
        WHERE r.nombre_rol IN ('administrador', 'superadministrador') AND u.estado_usuario = 'activo'
        ORDER BY u.id_usuario ASC LIMIT 1`
    );
    if (admin.rows.length === 0) {
      return NextResponse.json({ error: 'No hay un administrador disponible en este momento.' }, { status: 503 });
    }

    await query(
      `INSERT INTO public.mensaje_contacto
         (asunto, mensaje, contenido_id_contenido, usuario_id_remitente, usuario_id_destinatario)
       VALUES ($1, $2, $3, $4, $5)`,
      [asunto || null, mensaje, contenidoId, sesion.id_usuario, admin.rows[0].id_usuario]
    );

    return NextResponse.json({ mensaje: 'Consulta enviada. Te responderemos a tu correo.' }, { status: 201 });
  } catch (error) {
    console.error('Error al guardar la consulta:', error);
    return NextResponse.json({ error: 'No pudimos enviar tu consulta. Inténtalo más tarde.' }, { status: 500 });
  }
}
