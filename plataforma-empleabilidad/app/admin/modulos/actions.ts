'use server';

import { query } from '@/lib/db';
import { Modulo, ModuloInput } from '@/lib/types/modulo';
import { revalidatePath } from 'next/cache';

export async function obtenerModulos(): Promise<Modulo[]> {
  try {
    const res = await query(
      `SELECT id_modulo, titulo_modulo, descripcion_modulo, posicion_modulo, 
              esta_publicado, es_gratuito, fecha_creacion 
       FROM public.modulo 
       ORDER BY posicion_modulo ASC`
    );
    return res.rows;
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    throw new Error('No se pudieron obtener los módulos.');
  }
}

export async function crearModulo(datos: ModuloInput) {
  try {
    await query(
      `INSERT INTO public.modulo 
        (titulo_modulo, descripcion_modulo, posicion_modulo, esta_publicado, es_gratuito) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        datos.titulo_modulo,
        datos.descripcion_modulo || null,
        datos.posicion_modulo,
        datos.esta_publicado,
        datos.es_gratuito,
      ]
    );

    revalidatePath('/admin/modulos');
    return { success: true, message: 'Módulo creado exitosamente' };
  } catch (error: any) {
    console.error('Error al crear módulo:', error);
    return { success: false, message: error.message || 'Error al crear el módulo' };
  }
}

export async function actualizarModulo(id_modulo: number, datos: ModuloInput) {
  try {
    await query(
      `UPDATE public.modulo 
       SET titulo_modulo = $1, 
           descripcion_modulo = $2, 
           posicion_modulo = $3, 
           esta_publicado = $4, 
           es_gratuito = $5 
       WHERE id_modulo = $6`,
      [
        datos.titulo_modulo,
        datos.descripcion_modulo || null,
        datos.posicion_modulo,
        datos.esta_publicado,
        datos.es_gratuito,
        id_modulo,
      ]
    );

    revalidatePath('/admin/modulos');
    return { success: true, message: 'Módulo actualizado exitosamente' };
  } catch (error: any) {
    console.error('Error al actualizar módulo:', error);
    return { success: false, message: error.message || 'Error al actualizar el módulo' };
  }
}

export async function crearContenidoAction(formData: FormData) {
  const modulo_id_modulo = parseInt(formData.get('modulo_id_modulo') as string, 10);
  const titulo_contenido = formData.get('titulo_contenido') as string;
  const descripcion_contenido = formData.get('descripcion_contenido') as string;
  const orden_contenido = parseInt(formData.get('orden_contenido') as string || '1', 10);
  const duracion_estimada = parseInt(formData.get('duracion_estimada') as string || '5', 10);
  const estado_contenido = (formData.get('estado_contenido') as string) || 'publicado';

  if (!modulo_id_modulo || !titulo_contenido) {
    throw new Error('El título y el módulo son obligatorios');
  }

  await query(
    `INSERT INTO contenido (
      modulo_id_modulo, 
      titulo_contenido, 
      descripcion_contenido, 
      orden_contenido, 
      duracion_estimada, 
      estado_contenido
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      modulo_id_modulo,
      titulo_contenido,
      descripcion_contenido || null,
      orden_contenido,
      duracion_estimada,
      estado_contenido,
    ]
  );

  revalidatePath('/admin/modulos');
}

export async function eliminarContenidoAction(idContenido: number) {
  await query(`DELETE FROM contenido WHERE id_contenido = $1`, [idContenido]);
  revalidatePath('/admin/modulos');
}