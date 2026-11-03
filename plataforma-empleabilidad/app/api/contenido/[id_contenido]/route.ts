import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import {tienePlanActivo} from '@/lib/suscripcion';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id_contenido: string }> | { id_contenido: string } }
) {
    try {
        const sesion = await obtenerSesionActual();
        if (!sesion) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const rawId = resolvedParams?.id_contenido;
        const idContenido = parseInt(rawId, 10);
        const idUsuario = sesion.id_usuario ?? (sesion as any).id;
        const esPro = await tienePlanActivo(idUsuario);
        if (!rawId || isNaN(idContenido) || !idUsuario) {
            return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 });
        }

        const todasLasLeccionesResult = await query(
            `SELECT 
        c.id_contenido,
        c.modulo_id_modulo AS id_modulo,
        c.titulo_contenido AS titulo,
        c.orden_contenido AS orden,
        m.posicion_modulo,
        m.es_gratuito AS modulo_gratuito,
        COALESCE(p.estado_progreso, 'no_iniciado') AS estado
       FROM public.contenido c
       JOIN public.modulo m ON c.modulo_id_modulo = m.id_modulo
       LEFT JOIN public.progreso_contenido p 
         ON c.id_contenido = p.contenido_id_contenido 
        AND p.usuario_id_usuario = $1
       ORDER BY m.posicion_modulo ASC, c.orden_contenido ASC`,
            [idUsuario]
        );

        const todasLecciones = todasLasLeccionesResult.rows;

        let disponible = true;
        const leccionesConBloqueo = todasLecciones.map((leccion) => {
            const requierePro = !esPro && !leccion.modulo_gratuito;
            const estaBloqueada = !disponible || requierePro;
            if (estaBloqueada || leccion.estado !== 'completado') {
                disponible = false;
            }
            return { ...leccion, bloqueado: estaBloqueada, requierePro };
        });

        const indexActual = leccionesConBloqueo.findIndex((l) => l.id_contenido === idContenido);
        if (indexActual === -1) {
            return NextResponse.json({ error: 'Contenido no encontrado.' }, { status: 404 });
        }

        const leccionActualSecuencia = leccionesConBloqueo[indexActual];

        if(leccionActualSecuencia.requierePro) {
            return NextResponse.json(
                { error: 'Esta lección requiere una suscripción Pro para acceder.' },
                { status: 403 }
            );
        }

        if (leccionActualSecuencia.bloqueado) {
            return NextResponse.json(
                { error: 'Esta lección se encuentra bloqueada. Completa las lecciones anteriores para acceder.' },
                { status: 403 }
            );
        }

        if (leccionActualSecuencia.estado === 'no_iniciado') {
            try {
                await query(
                    `INSERT INTO public.progreso_contenido (usuario_id_usuario, contenido_id_contenido, estado_progreso)
           VALUES ($1, $2, 'en_curso')
           ON CONFLICT (usuario_id_usuario, contenido_id_contenido) DO NOTHING`,
                    [idUsuario, idContenido]
                );
            } catch (e) {
                console.warn('No se pudo registrar en_curso automático:', e);
            }
        }

        const contenidoResult = await query(
            `SELECT 
        c.id_contenido,
        c.titulo_contenido AS titulo,
        c.descripcion_contenido AS descripcion,
        c.orden_contenido AS orden,
        c.duracion_estimada AS duracion,
        m.id_modulo,
        m.titulo_modulo AS modulo_titulo,
        m.posicion_modulo AS modulo_posicion
       FROM public.contenido c
       JOIN public.modulo m ON c.modulo_id_modulo = m.id_modulo
       WHERE c.id_contenido = $1`,
            [idContenido]
        );

        const contenidoActual = contenidoResult.rows[0];

        const leccionAnterior = indexActual > 0 ? leccionesConBloqueo[indexActual - 1] : null;
        const leccionSiguiente =
            indexActual < leccionesConBloqueo.length - 1 ? leccionesConBloqueo[indexActual + 1] : null;

        const modulosResult = await query(
            `SELECT 
        m.id_modulo,
        m.titulo_modulo AS titulo,
        m.posicion_modulo AS posicion,
        COALESCE(
          json_agg(
            json_build_object(
              'id_contenido', c.id_contenido,
              'titulo', c.titulo_contenido,
              'orden', c.orden_contenido,
              'duracion', c.duracion_estimada
            ) ORDER BY c.orden_contenido ASC
          ) FILTER (WHERE c.id_contenido IS NOT NULL), '[]'
        ) AS lecciones_raw
       FROM public.modulo m
       LEFT JOIN public.contenido c ON m.id_modulo = c.modulo_id_modulo
       GROUP BY m.id_modulo
       ORDER BY m.posicion_modulo ASC`
        );

        const modulosProcesados = modulosResult.rows.map((m: any) => {
            const leccionesDelModulo = (m.lecciones_raw || []).map((l: any) => {
                const itemSec = leccionesConBloqueo.find((item) => item.id_contenido === l.id_contenido);
                return {
                    ...l,
                    estado: itemSec?.estado || 'no_iniciado',
                    bloqueado: itemSec?.bloqueado ?? true,
                };
            });

            return {
                ...m,
                lecciones: leccionesDelModulo,
            };
        });

        const totalContenidos = todasLecciones.length;
        const totalCompletados = todasLecciones.filter((l) => l.estado === 'completado').length;
        const porcentajeProgreso =
            totalContenidos > 0 ? Math.round((totalCompletados / totalContenidos) * 100) : 0;

        const bloquesResult = await query(
            `SELECT id_bloque, tipo_bloque, titulo_bloque, contenido_texto, url_recurso, orden_bloque
       FROM public.bloque_contenido
       WHERE contenido_id_contenido = $1
       ORDER BY orden_bloque ASC`,
            [idContenido]
        );

        const recursosResult = await query(
            `SELECT r.id_recurso, r.titulo_recurso, r.url_recurso, r.nombre_archivo, r.tamano_bytes, r.es_descargable
       FROM public.recurso r
       JOIN public.bloque_contenido b ON r.bloque_contenido_id_bloque = b.id_bloque
       WHERE b.contenido_id_contenido = $1`,
            [idContenido]
        );

        return NextResponse.json({
            contenido: contenidoActual,
            modulos: modulosProcesados,
            bloques: bloquesResult.rows,
            recursos: recursosResult.rows,
            navegacion: {
                anterior: leccionAnterior,
                siguiente: leccionSiguiente,
            },
            progresoGlobal: porcentajeProgreso,
        });
    } catch (error) {
        console.error('Error al cargar contenido en API:', error);
        return NextResponse.json({ error: 'Error interno al cargar la lección.' }, { status: 500 });
    }
}