'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { obtenerProgresoUsuario, obtenerEstructuraConBloqueos } from '@/lib/progreso';

export type EntregaRespuesta = {
  id_pregunta: number;
  id_alternativa_seleccionada: number;
};

export async function getTestParaRendir(idEvaluacion: number, usuarioId?: number) {
  try {
    let resEval: { rows: any[] } = { rows: [] };
    try {
      resEval = await query(
        `SELECT id_evaluacion, titulo_evaluacion, descripcion_evaluacion, duracion_minutos, porcentaje_minimo_aprobacion, modulo_id_modulo
         FROM public.evaluacion WHERE id_evaluacion = $1;`,
        [idEvaluacion]
      );
    } catch (e) {
      console.error('Error al consultar evaluacion:', e);
      return null;
    }

    if (resEval.rows.length === 0) return null;
    const evaluacion = resEval.rows[0];

    const resPreg = await query(
      `SELECT 
        p.id_pregunta,
        p.enunciado,
        p.puntaje,
        p.orden,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id_alternativa', a.id_alternativa,
              'texto_alternativa', a.texto_alternativa,
              'orden', a.orden
            ) ORDER BY a.orden ASC
          ) FILTER (WHERE a.id_alternativa IS NOT NULL), '[]'::json
        ) AS alternativas
       FROM public.pregunta p
       LEFT JOIN public.alternativa a ON a.pregunta_id_pregunta = p.id_pregunta
       WHERE p.evaluacion_id_evaluacion = $1
       GROUP BY p.id_pregunta
       ORDER BY p.orden ASC;`,
      [idEvaluacion]
    );

    const modulosEstructurados = await obtenerEstructuraConBloqueos(usuarioId || 0);

    const itemsOrdenadosGlobal: any[] = [];
    modulosEstructurados.forEach((m) => itemsOrdenadosGlobal.push(...m.items));

    const indexActual = itemsOrdenadosGlobal.findIndex(
      (item) => item.tipo === 'evaluacion' && Number(item.id) === idEvaluacion
    );

    const itemAnterior = indexActual > 0 ? itemsOrdenadosGlobal[indexActual - 1] : null;
    const itemSiguiente =
      indexActual !== -1 && indexActual < itemsOrdenadosGlobal.length - 1
        ? itemsOrdenadosGlobal[indexActual + 1]
        : null;

    let progreso = { totalItems: 0, totalCompletados: 0, porcentajeGlobal: 0 };
    if (usuarioId) {
      progreso = await obtenerProgresoUsuario(usuarioId);
    }

    return {
      evaluacion,
      preguntas: resPreg.rows,
      modulos: modulosEstructurados,
      navegacion: {
        anterior: itemAnterior
          ? {
              id: Number(itemAnterior.id),
              id_modulo: Number(itemAnterior.id_modulo),
              titulo: itemAnterior.titulo,
              tipo: itemAnterior.tipo as 'contenido' | 'evaluacion',
            }
          : null,
        siguiente: itemSiguiente
          ? {
              id: Number(itemSiguiente.id),
              id_modulo: Number(itemSiguiente.id_modulo),
              titulo: itemSiguiente.titulo,
              tipo: itemSiguiente.tipo as 'contenido' | 'evaluacion',
            }
          : null,
      },
      resumenProgreso: {
        porcentajeGlobal: progreso.porcentajeGlobal,
        totalItems: progreso.totalItems,
        completadosItems: progreso.totalCompletados,
      },
    };
  } catch (error) {
    console.error('Error en getTestParaRendir:', error);
    return null;
  }
}

export async function procesarIntentoEvaluacionAction(
  usuarioId: number,
  idEvaluacion: number,
  respuestas: EntregaRespuesta[]
) {
  try {
    const resNumIntento = await query(
      `SELECT COALESCE(MAX(numero_intento), 0) + 1 AS siguiente_intento
       FROM public.intento_evaluacion
       WHERE usuario_id_usuario = $1 AND evaluacion_id_evaluacion = $2;`,
      [usuarioId, idEvaluacion]
    );
    const numeroIntento = resNumIntento.rows[0].siguiente_intento;

    const resCorrectas = await query(
      `SELECT p.id_pregunta, p.puntaje, a.id_alternativa AS id_correcta
       FROM public.pregunta p
       JOIN public.alternativa a ON a.pregunta_id_pregunta = p.id_pregunta
       WHERE p.evaluacion_id_evaluacion = $1 AND a.es_correcta = TRUE;`,
      [idEvaluacion]
    );

    let puntajeObtenido = 0;
    let puntajeTotalPosible = 0;

    const mapaCorrectas = new Map<number, { id_correcta: number; puntaje: number }>();
    resCorrectas.rows.forEach((row) => {
      mapaCorrectas.set(row.id_pregunta, {
        id_correcta: Number(row.id_correcta),
        puntaje: Number(row.puntaje),
      });
      puntajeTotalPosible += Number(row.puntaje);
    });

    const respuestasProcesadas: { id_alternativa: number; es_correcta: boolean }[] = [];

    respuestas.forEach((resp) => {
      const datosPreg = mapaCorrectas.get(resp.id_pregunta);
      const esCorrecta = datosPreg ? datosPreg.id_correcta === resp.id_alternativa_seleccionada : false;

      if (esCorrecta && datosPreg) {
        puntajeObtenido += datosPreg.puntaje;
      }

      respuestasProcesadas.push({
        id_alternativa: resp.id_alternativa_seleccionada,
        es_correcta: esCorrecta,
      });
    });

    const resMinimo = await query(
      `SELECT porcentaje_minimo_aprobacion FROM public.evaluacion WHERE id_evaluacion = $1;`,
      [idEvaluacion]
    );
    const porcentajeExigido = Number(resMinimo.rows[0]?.porcentaje_minimo_aprobacion || 70);
    const porcentajeLogrado = (puntajeObtenido / (puntajeTotalPosible || 1)) * 100;
    const aprobado = porcentajeLogrado >= porcentajeExigido;

    const insertIntentoSql = `
      INSERT INTO public.intento_evaluacion (
        numero_intento,
        puntaje_obtenido,
        aprobado,
        usuario_id_usuario,
        evaluacion_id_evaluacion
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_intento;
    `;

    const resIntento = await query(insertIntentoSql, [
      numeroIntento,
      puntajeObtenido,
      aprobado,
      usuarioId,
      idEvaluacion,
    ]);

    const idIntento = resIntento.rows[0].id_intento;

    for (const r of respuestasProcesadas) {
      await query(
        `INSERT INTO public.respuesta_usuario (es_correcta, alternativa_id_alternativa, intento_evaluacion_id_intento)
         VALUES ($1, $2, $3);`,
        [r.es_correcta, r.id_alternativa, idIntento]
      );
    }

    const estadoProgreso = aprobado ? 'completado' : 'no_completado';

    const insertProgresoSql = `
      INSERT INTO public.progreso_evaluacion (
        usuario_id_usuario,
        evaluacion_id_evaluacion,
        estado_progreso,
        puntaje_maximo,
        aprobado,
        fecha_completado
      )
      VALUES ($1, $2, $3::public.estado_progreso, $4, $5, CASE WHEN $5 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT (usuario_id_usuario, evaluacion_id_evaluacion)
      DO UPDATE SET
        puntaje_maximo = GREATEST(public.progreso_evaluacion.puntaje_maximo, EXCLUDED.puntaje_maximo),
        aprobado = public.progreso_evaluacion.aprobado OR EXCLUDED.aprobado,
        estado_progreso = CASE 
          WHEN public.progreso_evaluacion.aprobado OR EXCLUDED.aprobado THEN 'completado'::public.estado_progreso 
          ELSE 'no_completado'::public.estado_progreso 
        END,
        fecha_completado = COALESCE(public.progreso_evaluacion.fecha_completado, EXCLUDED.fecha_completado);
    `;

    await query(insertProgresoSql, [
      usuarioId,
      idEvaluacion,
      estadoProgreso,
      puntajeObtenido,
      aprobado,
    ]);

    revalidatePath('/modulos');

    return {
      success: true,
      resultado: {
        puntajeObtenido,
        puntajeTotalPosible,
        porcentajeLogrado: Math.round(porcentajeLogrado),
        aprobado,
        numeroIntento,
      },
    };
  } catch (error: any) {
    console.error('Error en procesarIntentoEvaluacionAction:', error);
    return { success: false, message: error.message || 'Error al procesar el intento.' };
  }
}