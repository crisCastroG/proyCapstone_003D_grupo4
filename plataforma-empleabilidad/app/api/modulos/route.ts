import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import { obtenerProgresoUsuario } from '@/lib/progreso';

export async function GET() {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let resModulos: { rows: any[] } = { rows: [] };
    try {
      resModulos = await query(
        `SELECT id_modulo, titulo_modulo AS titulo, descripcion_modulo AS descripcion, posicion_modulo AS posicion, COALESCE(es_gratuito, true) AS es_gratuito
         FROM public.modulo ORDER BY posicion_modulo ASC, id_modulo ASC;`
      );
    } catch (e) {
      resModulos = await query(
        `SELECT id_modulo, titulo_modulo AS titulo, descripcion_modulo AS descripcion, posicion_modulo AS posicion, true AS es_gratuito
         FROM public.modulo ORDER BY posicion_modulo ASC, id_modulo ASC;`
      );
    }

    // Obtener contenidos 
    const resContenidos = await query(
      `SELECT id_contenido, titulo_contenido AS titulo, descripcion_contenido AS descripcion, 
              orden_contenido AS orden, duracion_estimada AS duracion, modulo_id_modulo
       FROM public.contenido 
       WHERE LOWER(COALESCE(estado_contenido::text, 'publicado')) = 'publicado'
       ORDER BY orden_contenido ASC;`
    );

    // Obtener evaluaciones 
    let resEvaluaciones: { rows: any[] } = { rows: [] };
    try {
      resEvaluaciones = await query(
        `SELECT id_evaluacion, titulo_evaluacion, descripcion_evaluacion, 
                duracion_minutos, porcentaje_minimo_aprobacion, orden_evaluacion, modulo_id_modulo
         FROM public.evaluacion
         WHERE LOWER(COALESCE(estado_evaluacion::text, 'publicada')) IN ('publicado', 'publicada')
         ORDER BY orden_evaluacion ASC;`
      );
    } catch (e) {
      console.warn('Evaluaciones no disponibles para navegación:', e);
    }

    // Consultar avances del usuario
    const leccionesCompletadasIds = new Set<number>();
    const evalAprobadasIds = new Set<number>();

    try {
      const resLecComp = await query(
        `SELECT contenido_id_contenido FROM public.progreso_contenido 
         WHERE usuario_id_usuario = $1 AND LOWER(COALESCE(estado_progreso::text, '')) = 'completado';`,
        [sesion.id_usuario]
      );
      resLecComp.rows.forEach((r: any) => leccionesCompletadasIds.add(Number(r.contenido_id_contenido)));
    } catch (e) {}

    try {
      const resEvalComp = await query(
        `SELECT evaluacion_id_evaluacion FROM public.progreso_evaluacion 
         WHERE usuario_id_usuario = $1 AND (aprobado = TRUE OR LOWER(COALESCE(estado_progreso::text, '')) = 'completado');`,
        [sesion.id_usuario]
      );
      resEvalComp.rows.forEach((r: any) => evalAprobadasIds.add(Number(r.evaluacion_id_evaluacion)));
    } catch (e) {}

    let precedenteCompletado = true; 

    const modulosFormateados = resModulos.rows.map((m) => {
      const esGratuito = m.es_gratuito !== undefined ? Boolean(m.es_gratuito) : true;

      const lecciones = resContenidos.rows
        .filter((c) => Number(c.modulo_id_modulo) === Number(m.id_modulo))
        .map((c) => ({
          tipo: 'leccion' as const,
          raw: c,
          id: Number(c.id_contenido),
          orden: Number(c.orden || 1),
          estado: leccionesCompletadasIds.has(Number(c.id_contenido)) ? 'completado' : 'no_completado',
        }));

      const tests = resEvaluaciones.rows
        .filter((e) => Number(e.modulo_id_modulo) === Number(m.id_modulo))
        .map((e) => ({
          tipo: 'evaluacion' as const,
          raw: e,
          id: Number(e.id_evaluacion),
          orden: Number(e.orden_evaluacion || 1),
          estado: evalAprobadasIds.has(Number(e.id_evaluacion)) ? 'completado' : 'no_completado',
        }));

      const itemsUnificados = [...lecciones, ...tests].sort((a, b) => a.orden - b.orden);

      const contenidosProcesados: any[] = [];
      const evaluacionesProcesadas: any[] = [];
      let completadosCount = 0;

      itemsUnificados.forEach((item) => {
        let bloqueado = false;

        if (!esGratuito) {
          bloqueado = true;
        } else {
          bloqueado = !precedenteCompletado;
        }

        const esCompletado = item.estado === 'completado';
        if (esCompletado) completadosCount++;

        precedenteCompletado = esCompletado;

        if (item.tipo === 'leccion') {
          contenidosProcesados.push({
            ...item.raw,
            estado: item.estado,
            bloqueado,
          });
        } else {
          evaluacionesProcesadas.push({
            ...item.raw,
            estado: item.estado,
            bloqueado,
          });
        }
      });

      const totalItems = itemsUnificados.length;
      
      // Un módulo se considera bloqueado si es de pago o si su primer ítem está bloqueado
      const primerItemBloqueado = totalItems > 0 
        ? (contenidosProcesados.find((c) => c.id_contenido === itemsUnificados[0].id) ||
           evaluacionesProcesadas.find((e) => e.id_evaluacion === itemsUnificados[0].id))?.bloqueado
        : !esGratuito;

      const moduloBloqueado = !esGratuito || Boolean(primerItemBloqueado);
      const estadoModulo = completadosCount === totalItems && totalItems > 0 ? 'completado' : 'en_curso';

      return {
        id_modulo: m.id_modulo,
        titulo: m.titulo,
        descripcion: m.descripcion || '',
        posicion: m.posicion,
        es_gratuito: esGratuito,
        bloqueado: moduloBloqueado,
        estado: estadoModulo,
        totalContenidos: totalItems,
        contenidosCompletados: completadosCount,
        contenidos: contenidosProcesados,
        evaluaciones: evaluacionesProcesadas,
      };
    });

    const progreso = await obtenerProgresoUsuario(sesion.id_usuario);

    return NextResponse.json({
      usuario: { nombre: sesion.nombre },
      modulos: modulosFormateados,
      resumenProgreso: {
        totalLecciones: progreso.totalItems,
        leccionesCompletadas: progreso.totalCompletados,
        porcentajeGlobal: progreso.porcentajeGlobal,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/modulos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}