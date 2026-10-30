'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { BloqueContenido } from '@/lib/types/bloque';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


async function obtenerUrlRecurso(formData: FormData): Promise<string | null> {
  const archivo = formData.get('archivo_subida') as File | null;
  const urlManual = (formData.get('url_recurso') as string) || null;

  if (archivo && archivo.size > 0) {
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nombreUnico = `${Date.now()}_${nombreLimpio}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, nombreUnico), buffer);

    return `/uploads/${nombreUnico}`;
  }

  return urlManual;
}

export async function getBloquesPorContenido(idContenido: number): Promise<BloqueContenido[]> {
  try {
    const sql = `
      SELECT 
        b.id_bloque,
        b.tipo_bloque,
        b.titulo_bloque,
        b.contenido_texto,
        b.url_recurso,
        b.orden_bloque,
        b.es_obligatorio,
        b.fecha_creacion,
        b.fecha_actualizacion,
        b.contenido_id_contenido,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id_recurso', r.id_recurso,
              'titulo_recurso', r.titulo_recurso,
              'url_recurso', r.url_recurso,
              'nombre_archivo', r.nombre_archivo,
              'tamano_bytes', r.tamano_bytes,
              'es_descargable', r.es_descargable,
              'bloque_contenido_id_bloque', r.bloque_contenido_id_bloque,
              'fecha_creacion', r.fecha_creacion
            )
          ) FILTER (WHERE r.id_recurso IS NOT NULL), '[]'::json
        ) AS recursos
      FROM public.bloque_contenido b
      LEFT JOIN public.recurso r ON r.bloque_contenido_id_bloque = b.id_bloque
      WHERE b.contenido_id_contenido = $1
      GROUP BY b.id_bloque
      ORDER BY b.orden_bloque ASC;
    `;

    const { rows } = await query(sql, [idContenido]);
    return rows as BloqueContenido[];
  } catch (error) {
    console.error('Error en getBloquesPorContenido:', error);
    return [];
  }
}


export async function crearBloqueAction(formData: FormData) {
  try {
    const idModulo = Number(formData.get('id_modulo'));
    const idContenido = Number(formData.get('contenido_id_contenido'));
    const tipoBloque = formData.get('tipo_bloque') as string;
    const tituloBloque = (formData.get('titulo_bloque') as string) || null;
    const contenidoTexto = (formData.get('contenido_texto') as string) || null;
    const ordenBloque = Number(formData.get('orden_bloque')) || 1;
    const esObligatorio = formData.get('es_obligatorio') === 'on';

    const urlRecurso = await obtenerUrlRecurso(formData);

    const insertSql = `
      INSERT INTO public.bloque_contenido (
        tipo_bloque,
        titulo_bloque,
        contenido_texto,
        url_recurso,
        orden_bloque,
        es_obligatorio,
        contenido_id_contenido
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_bloque;
    `;

    await query(insertSql, [
      tipoBloque,
      tituloBloque,
      contenidoTexto,
      urlRecurso,
      ordenBloque,
      esObligatorio,
      idContenido,
    ]);

    revalidatePath(`/admin/modulos/${idModulo}/contenidos/${idContenido}`, 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error en crearBloqueAction:', error);
    return { success: false, message: error.message || 'Error al crear el bloque.' };
  }
}


export async function actualizarBloqueAction(idBloque: number, formData: FormData) {
  try {
    const idModulo = Number(formData.get('id_modulo'));
    const idContenido = Number(formData.get('contenido_id_contenido'));
    const tipoBloque = formData.get('tipo_bloque') as string;
    const tituloBloque = (formData.get('titulo_bloque') as string) || null;
    const contenidoTexto = (formData.get('contenido_texto') as string) || null;
    const ordenBloque = Number(formData.get('orden_bloque'));
    const esObligatorio = formData.get('es_obligatorio') === 'on';

    const urlRecurso = await obtenerUrlRecurso(formData);

    const updateSql = `
      UPDATE public.bloque_contenido
      SET 
        tipo_bloque = $1,
        titulo_bloque = $2,
        contenido_texto = $3,
        url_recurso = COALESCE($4, url_recurso),
        orden_bloque = $5,
        es_obligatorio = $6,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_bloque = $7 AND contenido_id_contenido = $8;
    `;

    await query(updateSql, [
      tipoBloque,
      tituloBloque,
      contenidoTexto,
      urlRecurso,
      ordenBloque,
      esObligatorio,
      idBloque,
      idContenido,
    ]);

    revalidatePath(`/admin/modulos/${idModulo}/contenidos/${idContenido}`, 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error en actualizarBloqueAction:', error);
    return { success: false, message: error.message || 'Error al actualizar el bloque.' };
  }
}

export async function getContenidoPorId(idContenido: number) {
  try {
    const sql = `
      SELECT 
        id_contenido,
        titulo_contenido,
        descripcion_contenido
      FROM public.contenido
      WHERE id_contenido = $1;
    `;
    const { rows } = await query(sql, [idContenido]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getContenidoPorId:', error);
    return null;
  }
}

export async function eliminarBloqueAction(idBloque: number, idModulo: number, idContenido: number) {
  try {
    await query(`DELETE FROM public.recurso WHERE bloque_contenido_id_bloque = $1;`, [idBloque]);
    await query(`DELETE FROM public.bloque_contenido WHERE id_bloque = $1;`, [idBloque]);

    revalidatePath(`/admin/modulos/${idModulo}/contenidos/${idContenido}`, 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarBloqueAction:', error);
    return { success: false, message: error.message || 'Error al eliminar el bloque.' };
  }
}