import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import { obtenerProgresoUsuario, obtenerEstructuraConBloqueos } from '@/lib/progreso';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id_contenido?: string; idContenido?: string }> | { id_contenido?: string; idContenido?: string } }
) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const rawId = resolvedParams?.id_contenido || resolvedParams?.idContenido;
    const idContenido = parseInt(String(rawId), 10);

    if (!rawId || isNaN(idContenido)) {
      return NextResponse.json({ error: 'ID de contenido inválido' }, { status: 400 });
    }

    // Obtiene el contenido actual
    let resContenido: { rows: any[] } = { rows: [] };
    try {
      resContenido = await query(
        `SELECT 
          c.id_contenido,
          c.titulo_contenido AS titulo,
          c.descripcion_contenido AS descripcion,
          c.orden_contenido AS orden,
          c.duracion_estimada AS duracion,
          c.modulo_id_modulo AS id_modulo,
          m.titulo_modulo AS modulo_titulo,
          m.posicion_modulo AS modulo_posicion
         FROM public.contenido c
         JOIN public.modulo m ON m.id_modulo = c.modulo_id_modulo
         WHERE c.id_contenido = $1;`,
        [idContenido]
      );
    } catch (e) {
      resContenido = await query(
        `SELECT 
          c.id_contenido,
          c.titulo_contenido AS titulo,
          c.descripcion_contenido AS descripcion,
          c.orden_contenido AS orden,
          c.modulo_id_modulo AS id_modulo,
          m.titulo_modulo AS modulo_titulo,
          m.posicion_modulo AS modulo_posicion
         FROM public.contenido c
         JOIN public.modulo m ON m.id_modulo = c.modulo_id_modulo
         WHERE c.id_contenido = $1;`,
        [idContenido]
      );
    }

    if (resContenido.rows.length === 0) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }
    const contenido = resContenido.rows[0];

    // Bloques 
    let bloques: any[] = [];
    try {
      const resBloques = await query(
        `SELECT id_bloque, tipo_bloque, titulo_bloque, contenido_texto, url_recurso, orden_bloque
         FROM public.bloque_contenido
         WHERE contenido_id_contenido = $1
         ORDER BY orden_bloque ASC;`,
        [idContenido]
      );
      bloques = resBloques.rows;
    } catch (e) {
      try {
        const resBloques = await query(
          `SELECT id_bloque, tipo_bloque, titulo_bloque, contenido_texto, url_recurso, orden_bloque
           FROM public.bloque
           WHERE contenido_id_contenido = $1
           ORDER BY orden_bloque ASC;`,
          [idContenido]
        );
        bloques = resBloques.rows;
      } catch (err) {}
    }

    // Recursos descargables
    let recursos: any[] = [];
    try {
      const resRecursos = await query(
        `SELECT id_recurso, titulo_recurso, url_recurso, nombre_archivo, tamano_bytes, es_descargable
         FROM public.recurso_contenido
         WHERE contenido_id_contenido = $1;`,
        [idContenido]
      );
      recursos = resRecursos.rows;
    } catch (e) {
      try {
        const resRecursos = await query(
          `SELECT id_recurso, titulo_recurso, url_recurso, nombre_archivo, tamano_bytes, es_descargable
           FROM public.recurso
           WHERE contenido_id_contenido = $1;`,
          [idContenido]
        );
        recursos = resRecursos.rows;
      } catch (err) {}
    }

    const modulosEstructurados = await obtenerEstructuraConBloqueos(sesion.id_usuario);

    const itemsOrdenadosGlobal: any[] = [];
    modulosEstructurados.forEach((m) => itemsOrdenadosGlobal.push(...m.items));

    const indexActual = itemsOrdenadosGlobal.findIndex(
      (item) => item.tipo === 'contenido' && Number(item.id) === idContenido
    );

    const itemAnterior = indexActual > 0 ? itemsOrdenadosGlobal[indexActual - 1] : null;
    const itemSiguiente =
      indexActual !== -1 && indexActual < itemsOrdenadosGlobal.length - 1
        ? itemsOrdenadosGlobal[indexActual + 1]
        : null;

    const progreso = await obtenerProgresoUsuario(sesion.id_usuario);

    return NextResponse.json({
      contenido,
      bloques,
      recursos,
      modulos: modulosEstructurados,
      navegacion: {
        anterior: itemAnterior
          ? {
              id: Number(itemAnterior.id),
              id_modulo: Number(itemAnterior.id_modulo),
              titulo: itemAnterior.titulo,
              tipo: itemAnterior.tipo,
              bloqueado: itemAnterior.bloqueado ?? false,
            }
          : null,
        siguiente: itemSiguiente
          ? {
              id: Number(itemSiguiente.id),
              id_modulo: Number(itemSiguiente.id_modulo),
              titulo: itemSiguiente.titulo,
              tipo: itemSiguiente.tipo,
              bloqueado: itemSiguiente.bloqueado ?? false,
            }
          : null,
      },
      resumenProgreso: {
        porcentajeGlobal: progreso.porcentajeGlobal,
        totalItems: progreso.totalItems,
        completadosItems: progreso.totalCompletados,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/contenido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}