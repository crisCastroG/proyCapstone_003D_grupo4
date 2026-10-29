'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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

  revalidatePath(`/admin/modulos/${modulo_id_modulo}`);
}

export async function eliminarContenidoAction(idContenido: number, idModulo: number) {
  await query(`DELETE FROM contenido WHERE id_contenido = $1`, [idContenido]);
  revalidatePath(`/admin/modulos/${idModulo}`);
}