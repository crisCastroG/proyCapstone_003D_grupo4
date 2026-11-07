'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

export type AlternativaDTO = {
  texto_alternativa: string;
  es_correcta: boolean;
  orden: number;
};

export type PreguntaDTO = {
  enunciado: string;
  puntaje: number;
  orden: number;
  alternativas: AlternativaDTO[];
};

export type EvaluacionPayload = {
  modulo_id_modulo: number;
  titulo_evaluacion: string;
  descripcion_evaluacion?: string;
  porcentaje_minimo_aprobacion: number;
  duracion_minutos: number;
  orden_evaluacion: number;
  estado_evaluacion: 'borrador' | 'publicada';
  preguntas: PreguntaDTO[];
};

// Carga una evaluación  
export async function getEvaluacionPorId(idEvaluacion: number) {
  try {
    const resEval = await query(
      `SELECT * FROM public.evaluacion WHERE id_evaluacion = $1;`,
      [idEvaluacion]
    );
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
              'es_correcta', a.es_correcta,
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

    return {
      ...evaluacion,
      preguntas: resPreg.rows,
    };
  } catch (error) {
    console.error('Error en getEvaluacionPorId:', error);
    return null;
  }
}

// Crear evaluación 
export async function crearEvaluacionCompletaAction(payload: EvaluacionPayload) {
  try {
    const {
      modulo_id_modulo,
      titulo_evaluacion,
      descripcion_evaluacion,
      porcentaje_minimo_aprobacion,
      duracion_minutos,
      orden_evaluacion,
      estado_evaluacion,
      preguntas,
    } = payload;

    const checkOrdenEval = await query(
      `SELECT id_evaluacion FROM public.evaluacion WHERE modulo_id_modulo = $1 AND orden_evaluacion = $2`,
      [modulo_id_modulo, orden_evaluacion]
    );

    if (checkOrdenEval.rows && checkOrdenEval.rows.length > 0) {
      return {
        success: false,
        message: `El orden #${orden_evaluacion} ya está asignado a otra evaluación en este módulo.`,
      };
    }

    const checkOrdenContenido = await query(
      `SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1 AND orden_contenido = $2`,
      [modulo_id_modulo, orden_evaluacion]
    );

    if (checkOrdenContenido.rows && checkOrdenContenido.rows.length > 0) {
      return {
        success: false,
        message: `El orden #${orden_evaluacion} ya está asignado a una lección de contenido en este módulo.`,
      };
    }

    const estadoLimpio = (estado_evaluacion || 'publicada').toLowerCase();

    const insertEvaluacionSql = `
      INSERT INTO public.evaluacion (
        titulo_evaluacion,
        descripcion_evaluacion,
        porcentaje_minimo_aprobacion,
        duracion_minutos,
        orden_evaluacion,
        estado_evaluacion,
        modulo_id_modulo
      )
      VALUES ($1, $2, $3, $4, $5, $6::public.estado_evaluacion, $7)
      RETURNING id_evaluacion;
    `;

    const resEvaluacion = await query(insertEvaluacionSql, [
      titulo_evaluacion,
      descripcion_evaluacion || null,
      porcentaje_minimo_aprobacion,
      duracion_minutos,
      orden_evaluacion,
      estadoLimpio,
      modulo_id_modulo,
    ]);

    const idEvaluacion = resEvaluacion.rows[0].id_evaluacion;

    for (const [pIndex, preg] of preguntas.entries()) {
      const ordenPregunta = preg.orden && preg.orden > 0 ? preg.orden : pIndex + 1;

      const insertPreguntaSql = `
        INSERT INTO public.pregunta (enunciado, puntaje, orden, evaluacion_id_evaluacion)
        VALUES ($1, $2, $3, $4)
        RETURNING id_pregunta;
      `;

      const resPregunta = await query(insertPreguntaSql, [
        preg.enunciado,
        preg.puntaje || 1,
        ordenPregunta,
        idEvaluacion,
      ]);

      const idPregunta = resPregunta.rows[0].id_pregunta;

      for (const [altIndex, alt] of preg.alternativas.entries()) {
        const ordenAlternativa = altIndex + 1;

        const insertAltSql = `
          INSERT INTO public.alternativa (texto_alternativa, es_correcta, orden, pregunta_id_pregunta)
          VALUES ($1, $2, $3, $4);
        `;
        await query(insertAltSql, [
          alt.texto_alternativa,
          alt.es_correcta,
          ordenAlternativa,
          idPregunta,
        ]);
      }
    }

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en crearEvaluacionCompletaAction:', error);
    return { success: false, message: error.message || 'Error al crear la evaluación.' };
  }
}

// Actualizar evaluación existente 
export async function actualizarEvaluacionAction(idEvaluacion: number, payload: EvaluacionPayload) {
  try {
    const {
      modulo_id_modulo,
      titulo_evaluacion,
      descripcion_evaluacion,
      porcentaje_minimo_aprobacion,
      duracion_minutos,
      orden_evaluacion,
      estado_evaluacion,
      preguntas,
    } = payload;

    const checkOrdenEval = await query(
      `SELECT id_evaluacion FROM public.evaluacion WHERE modulo_id_modulo = $1 AND orden_evaluacion = $2 AND id_evaluacion != $3`,
      [modulo_id_modulo, orden_evaluacion, idEvaluacion]
    );

    if (checkOrdenEval.rows && checkOrdenEval.rows.length > 0) {
      return {
        success: false,
        message: `El orden #${orden_evaluacion} ya está asignado a otra evaluación en este módulo.`,
      };
    }

    const checkOrdenContenido = await query(
      `SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1 AND orden_contenido = $2`,
      [modulo_id_modulo, orden_evaluacion]
    );

    if (checkOrdenContenido.rows && checkOrdenContenido.rows.length > 0) {
      return {
        success: false,
        message: `El orden #${orden_evaluacion} ya está asignado a una lección de contenido en este módulo.`,
      };
    }

    const estadoLimpio = (estado_evaluacion || 'publicada').toLowerCase();

    await query(
      `UPDATE public.evaluacion
       SET 
         titulo_evaluacion = $1,
         descripcion_evaluacion = $2,
         porcentaje_minimo_aprobacion = $3,
         duracion_minutos = $4,
         orden_evaluacion = $5,
         estado_evaluacion = $6::public.estado_evaluacion
       WHERE id_evaluacion = $7`,
      [
        titulo_evaluacion,
        descripcion_evaluacion || null,
        porcentaje_minimo_aprobacion,
        duracion_minutos,
        orden_evaluacion,
        estadoLimpio,
        idEvaluacion,
      ]
    );

    await query(`DELETE FROM public.pregunta WHERE evaluacion_id_evaluacion = $1;`, [idEvaluacion]);

    for (const [pIndex, preg] of preguntas.entries()) {
      const ordenPregunta = preg.orden && preg.orden > 0 ? preg.orden : pIndex + 1;

      const insertPreguntaSql = `
        INSERT INTO public.pregunta (enunciado, puntaje, orden, evaluacion_id_evaluacion)
        VALUES ($1, $2, $3, $4)
        RETURNING id_pregunta;
      `;

      const resPregunta = await query(insertPreguntaSql, [
        preg.enunciado,
        preg.puntaje || 1,
        ordenPregunta,
        idEvaluacion,
      ]);

      const idPregunta = resPregunta.rows[0].id_pregunta;

      for (const [altIndex, alt] of preg.alternativas.entries()) {
        const ordenAlternativa = altIndex + 1;

        const insertAltSql = `
          INSERT INTO public.alternativa (texto_alternativa, es_correcta, orden, pregunta_id_pregunta)
          VALUES ($1, $2, $3, $4);
        `;
        await query(insertAltSql, [
          alt.texto_alternativa,
          alt.es_correcta,
          ordenAlternativa,
          idPregunta,
        ]);
      }
    }

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en actualizarEvaluacionAction:', error);
    return { success: false, message: error.message || 'Error al actualizar la evaluación.' };
  }
}

export async function eliminarEvaluacionAction(idEvaluacion: number) {
  try {
    await query(`DELETE FROM public.evaluacion WHERE id_evaluacion = $1;`, [idEvaluacion]);
    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarEvaluacionAction:', error);
    return { success: false, message: error.message || 'Error al eliminar la evaluación.' };
  }
}