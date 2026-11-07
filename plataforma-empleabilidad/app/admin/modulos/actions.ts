'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { eliminarArchivoStorage } from '@/lib/storage-helper';

export async function crearModulo(data: FormData | any) {
  try {
    let titulo: string;
    let descripcion: string | null;
    let posicion: number;
    let esGratuito: boolean;
    let estaPublicado: boolean;

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      titulo = data.get('titulo_modulo') as string;
      descripcion = (data.get('descripcion_modulo') as string) || null;
      posicion = Number(data.get('posicion_modulo')) || 1;
      esGratuito = data.get('es_gratuito') === 'on' || data.get('es_gratuito') === 'true';
      estaPublicado = data.get('esta_publicado') === 'on' || data.get('esta_publicado') === 'true';
    } else {
      titulo = data.titulo_modulo;
      descripcion = data.descripcion_modulo || null;
      posicion = Number(data.posicion_modulo) || 1;
      esGratuito = Boolean(data.es_gratuito);
      estaPublicado = Boolean(data.esta_publicado);
    }

    // Verifica si la posición del módulo ya está ocupada
    const checkPosicion = await query(
      `SELECT id_modulo FROM public.modulo WHERE posicion_modulo = $1`,
      [posicion]
    );

    if (checkPosicion.rows && checkPosicion.rows.length > 0) {
      return {
        success: false,
        message: `La posición #${posicion} ya está ocupada por otro módulo. Por favor elige una posición diferente.`,
      };
    }

    await query(
      `INSERT INTO public.modulo (titulo_modulo, descripcion_modulo, posicion_modulo, es_gratuito, esta_publicado)
       VALUES ($1, $2, $3, $4, $5)`,
      [titulo, descripcion, posicion, esGratuito, estaPublicado]
    );

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en crearModulo:', error);
    return { success: false, message: error.message || 'Error al crear el módulo.' };
  }
}

export async function actualizarModulo(param1: any, param2?: any) {
  try {
    let idModulo: number;
    let data: any;

    if (typeof param1 === 'number' || typeof param1 === 'string') {
      idModulo = Number(param1);
      data = param2;
    } else {
      data = param1;
      idModulo = Number(data instanceof FormData ? data.get('id_modulo') : data.id_modulo);
    }

    let titulo: string;
    let descripcion: string | null;
    let posicion: number;
    let esGratuito: boolean;
    let estaPublicado: boolean;

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      titulo = data.get('titulo_modulo') as string;
      descripcion = (data.get('descripcion_modulo') as string) || null;
      posicion = Number(data.get('posicion_modulo'));
      esGratuito = data.get('es_gratuito') === 'on' || data.get('es_gratuito') === 'true';
      estaPublicado = data.get('esta_publicado') === 'on' || data.get('esta_publicado') === 'true';
    } else {
      titulo = data.titulo_modulo;
      descripcion = data.descripcion_modulo || null;
      posicion = Number(data.posicion_modulo);
      esGratuito = Boolean(data.es_gratuito);
      estaPublicado = Boolean(data.esta_publicado);
    }

    const checkPosicion = await query(
      `SELECT id_modulo FROM public.modulo WHERE posicion_modulo = $1 AND id_modulo != $2`,
      [posicion, idModulo]
    );

    if (checkPosicion.rows && checkPosicion.rows.length > 0) {
      return {
        success: false,
        message: `La posición #${posicion} ya está ocupada por otro módulo. Por favor elige una posición diferente.`,
      };
    }

    await query(
      `UPDATE public.modulo
       SET 
         titulo_modulo = $1,
         descripcion_modulo = $2,
         posicion_modulo = $3,
         es_gratuito = $4,
         esta_publicado = $5
       WHERE id_modulo = $6`,
      [titulo, descripcion, posicion, esGratuito, estaPublicado, idModulo]
    );

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en actualizarModulo:', error);
    return { success: false, message: error.message || 'Error al actualizar el módulo.' };
  }
}

export async function crearContenidoAction(formData: FormData) {
  try {
    const idModulo = Number(formData.get('modulo_id_modulo') || formData.get('id_modulo'));
    const titulo = formData.get('titulo_contenido') as string;
    const descripcion = (formData.get('descripcion_contenido') as string) || null;
    const orden = Number(formData.get('orden_contenido')) || 1;
    const duracion = Number(formData.get('duracion_estimada')) || 10;
    const estado = ((formData.get('estado_contenido') as string) || 'publicado').toLowerCase();

    // Validar si el número de orden está ocupado en lecciones o evaluaciones del mismo módulo
    const checkColision = await query(
      `SELECT 'contenido' AS tipo FROM public.contenido WHERE modulo_id_modulo = $1 AND orden_contenido = $2
       UNION ALL
       SELECT 'evaluacion' AS tipo FROM public.evaluacion WHERE modulo_id_modulo = $1 AND orden_evaluacion = $2`,
      [idModulo, orden]
    );

    if (checkColision.rows && checkColision.rows.length > 0) {
      const ocupadoPor = checkColision.rows[0].tipo === 'evaluacion' ? 'una evaluación' : 'otra lección';
      return {
        success: false,
        message: `El número de orden ${orden} ya está asignado a ${ocupadoPor} de este módulo.`,
      };
    }

    const insertSql = `
      INSERT INTO public.contenido (
        modulo_id_modulo,
        titulo_contenido,
        descripcion_contenido,
        orden_contenido,
        duracion_estimada,
        estado_contenido,
        fecha_publicacion
      )
      VALUES (
        $1, $2, $3, $4, $5, 
        $6::public.estado_contenido, 
        CASE WHEN $6 = 'publicado' THEN CURRENT_TIMESTAMP ELSE NULL END
      );
    `;

    await query(insertSql, [idModulo, titulo, descripcion, orden, duracion, estado]);

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en crearContenidoAction:', error);
    if (error.code === '23505') {
      return {
        success: false,
        message: 'El número de orden ya está asignado a otro contenido de este módulo.',
      };
    }
    return { success: false, message: error.message || 'Error al crear el contenido.' };
  }
}

export async function actualizarContenidoAction(formData: FormData) {
  try {
    const idContenido = Number(formData.get('id_contenido'));
    const idModulo = Number(formData.get('modulo_id_modulo') || formData.get('id_modulo'));
    const titulo = formData.get('titulo_contenido') as string;
    const descripcion = (formData.get('descripcion_contenido') as string) || null;
    const orden = Number(formData.get('orden_contenido'));
    const duracion = Number(formData.get('duracion_estimada'));
    const estado = ((formData.get('estado_contenido') as string) || 'publicado').toLowerCase();

    // Validar si el número de orden está ocupado en lecciones o evaluaciones (excluyendo el contenido actual)
    const checkColision = await query(
      `SELECT 'contenido' AS tipo FROM public.contenido WHERE modulo_id_modulo = $1 AND orden_contenido = $2 AND id_contenido != $3
       UNION ALL
       SELECT 'evaluacion' AS tipo FROM public.evaluacion WHERE modulo_id_modulo = $1 AND orden_evaluacion = $2`,
      [idModulo, orden, idContenido]
    );

    if (checkColision.rows && checkColision.rows.length > 0) {
      const ocupadoPor = checkColision.rows[0].tipo === 'evaluacion' ? 'una evaluación' : 'otra lección';
      return {
        success: false,
        message: `El número de orden ${orden} ya está asignado a ${ocupadoPor} de este módulo.`,
      };
    }

    const updateSql = `
      UPDATE public.contenido
      SET 
        modulo_id_modulo = $1,
        titulo_contenido = $2,
        descripcion_contenido = $3,
        orden_contenido = $4,
        duracion_estimada = $5,
        estado_contenido = $6::public.estado_contenido,
        fecha_publicacion = CASE 
          WHEN $6 = 'publicado' THEN COALESCE(fecha_publicacion, CURRENT_TIMESTAMP) 
          ELSE fecha_publicacion 
        END
      WHERE id_contenido = $7;
    `;

    await query(updateSql, [idModulo, titulo, descripcion, orden, duracion, estado, idContenido]);

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en actualizarContenidoAction:', error);
    if (error.code === '23505') {
      return {
        success: false,
        message: 'El número de orden ya está asignado a otro contenido de este módulo.',
      };
    }
    return { success: false, message: error.message || 'Error al actualizar el contenido.' };
  }
}

export async function eliminarContenidoAction(idContenido: number) {
  try {
    const resUrls = await query(
      `SELECT url_recurso FROM public.bloque_contenido 
       WHERE contenido_id_contenido = $1 AND url_recurso IS NOT NULL;`,
      [idContenido]
    );

    const archivosAEliminar = resUrls.rows.map((row) => row.url_recurso);
    await Promise.all(archivosAEliminar.map((url) => eliminarArchivoStorage(url)));

    await query(`DELETE FROM public.progreso_contenido WHERE contenido_id_contenido = $1;`, [idContenido]);
    await query(
      `DELETE FROM public.recurso WHERE bloque_contenido_id_bloque IN (SELECT id_bloque FROM public.bloque_contenido WHERE contenido_id_contenido = $1);`,
      [idContenido]
    );
    await query(`DELETE FROM public.bloque_contenido WHERE contenido_id_contenido = $1;`, [idContenido]);
    await query(`DELETE FROM public.contenido WHERE id_contenido = $1;`, [idContenido]);

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarContenidoAction:', error);
    return { success: false, message: error.message || 'Error al eliminar el contenido.' };
  }
}

export async function eliminarModulo(idModulo: number) {
  try {
    const resUrls = await query(
      `SELECT url_recurso FROM public.bloque_contenido 
       WHERE contenido_id_contenido IN (
         SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1
       ) AND url_recurso IS NOT NULL;`,
      [idModulo]
    );

    const archivosAEliminar = resUrls.rows.map((row) => row.url_recurso);
    await Promise.all(archivosAEliminar.map((url) => eliminarArchivoStorage(url)));

    await query(
      `DELETE FROM public.recurso WHERE bloque_contenido_id_bloque IN (
         SELECT id_bloque FROM public.bloque_contenido WHERE contenido_id_contenido IN (
           SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1
         )
       );`,
      [idModulo]
    );

    await query(
      `DELETE FROM public.bloque_contenido WHERE contenido_id_contenido IN (
         SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1
       );`,
      [idModulo]
    );

    await query(
      `DELETE FROM public.progreso_contenido WHERE contenido_id_contenido IN (
         SELECT id_contenido FROM public.contenido WHERE modulo_id_modulo = $1
       );`,
      [idModulo]
    );

    await query(`DELETE FROM public.contenido WHERE modulo_id_modulo = $1;`, [idModulo]);
    await query(`DELETE FROM public.modulo WHERE id_modulo = $1;`, [idModulo]);

    revalidatePath('/admin/modulos');
    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarModulo:', error);
    return { success: false, message: error.message || 'Error al eliminar el módulo.' };
  }
}