import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export async function GET() {
    try {
        const sesion = await obtenerSesionActual();
        if (!sesion) {
            return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
        }

        const idUsuario = sesion.id_usuario ?? (sesion as any).id;

        const resultLecciones = await query(
            `SELECT 
    c.id_contenido,
    c.modulo_id_modulo AS id_modulo,
    c.titulo_contenido AS titulo,
    c.descripcion_contenido AS descripcion,
    c.orden_contenido AS orden,
    c.duracion_estimada AS duracion,
    c.estado_contenido,
    m.id_modulo,
    m.titulo_modulo AS modulo_titulo,
    m.posicion_modulo AS modulo_posicion,
    COALESCE(p.estado_progreso, 'no_completado') AS estado
   FROM public.contenido c
   JOIN public.modulo m ON c.modulo_id_modulo = m.id_modulo
   LEFT JOIN public.progreso_contenido p 
     ON c.id_contenido = p.contenido_id_contenido 
    AND p.usuario_id_usuario = $1
   WHERE LOWER(c.estado_contenido::text) = 'publicado'
   ORDER BY m.posicion_modulo ASC, c.orden_contenido ASC`,
            [idUsuario]
        );

        const leccionesRaw = resultLecciones.rows;


        let disponible = true; // La primera lección global siempre inicia desbloqueada
        const leccionesProcesadasMap = new Map<number, any>();

        for (const leccion of leccionesRaw) {
            const estaBloqueada = !disponible;

            leccionesProcesadasMap.set(leccion.id_contenido, {
                ...leccion,
                bloqueado: estaBloqueada,
            });

            // La lección subsiguiente sólo se desbloquea si esta lección está 'completado'
            if (estaBloqueada || leccion.estado !== 'completado') {
                disponible = false;
            }
        }

        // 3. Agrupar módulos y sus lecciones
        const resultModulos = await query(
            `SELECT 
        id_modulo,
        titulo_modulo AS titulo,
        descripcion_modulo AS descripcion,
        posicion_modulo AS posicion,
        esta_publicado
       FROM public.modulo
       ORDER BY posicion_modulo ASC`
        );

        const totalLeccionesGlobales = leccionesRaw.length;
        const leccionesCompletadasGlobales = leccionesRaw.filter((l) => l.estado === 'completado').length;

        const modulosFinales = resultModulos.rows.map((mod: any) => {
            const contenidosDelModulo = leccionesRaw
                .filter((l) => l.id_modulo === mod.id_modulo)
                .map((l) => leccionesProcesadasMap.get(l.id_contenido));

            const primerContenido = contenidosDelModulo[0];
            const moduloBloqueado = primerContenido ? primerContenido.bloqueado : true;
            const completadosEnModulo = contenidosDelModulo.filter((c) => c.estado === 'completado').length;

            let estadoModulo = 'no_completado';
            if (contenidosDelModulo.length > 0 && completadosEnModulo === contenidosDelModulo.length) {
                estadoModulo = 'completado';
            }

            return {
                ...mod,
                estado: estadoModulo,
                bloqueado: moduloBloqueado,
                contenidos: contenidosDelModulo,
                totalContenidos: contenidosDelModulo.length,
                contenidosCompletados: completadosEnModulo,
            };
        });

        const porcentajeGlobal =
            totalLeccionesGlobales > 0
                ? Math.round((leccionesCompletadasGlobales / totalLeccionesGlobales) * 100)
                : 0;

        return NextResponse.json({
            usuario: { nombre: sesion.nombre },
            modulos: modulosFinales,
            resumenProgreso: {
                totalLecciones: totalLeccionesGlobales,
                leccionesCompletadas: leccionesCompletadasGlobales,
                porcentajeGlobal,
            },
        });
    } catch (error) {
        console.error('Error en GET /api/modulos:', error);
        return NextResponse.json(
            { error: 'Error interno al cargar los módulos.' },
            { status: 500 }
        );
    }
}