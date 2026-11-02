import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const idUsuario = sesion.id_usuario ?? (sesion as any).id;
    const body = await request.json();
    const { id_contenido, estado = 'completado' } = body;

    if (!id_contenido || !idUsuario) {
      return NextResponse.json(
        { error: 'id_contenido e id_usuario son requeridos.' },
        { status: 400 }
      );
    }

    const estadoDB = estado === 'completado' ? 'completado' : 'no_completado';
    const fechaCompletado = estadoDB === 'completado' ? new Date() : null;

    await query(
      `INSERT INTO public.progreso_contenido (
        usuario_id_usuario, 
        contenido_id_contenido, 
        estado_progreso, 
        fecha_completado
       )
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id_usuario, contenido_id_contenido)
       DO UPDATE SET 
         estado_progreso = EXCLUDED.estado_progreso,
         fecha_completado = COALESCE(EXCLUDED.fecha_completado, public.progreso_contenido.fecha_completado)`,
      [idUsuario, id_contenido, estadoDB, fechaCompletado]
    );

    return NextResponse.json({ success: true, estado_progreso: estadoDB });
  } catch (error: any) {
    console.error('Error al guardar progreso en PostgreSQL:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al registrar el progreso.' },
      { status: 500 }
    );
  }
}