'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export type EstadoFormPlan = { ok: boolean; mensaje: string } | null;

// Las server actions son endpoints públicos: se valida el rol en cada una.
async function esAdmin(): Promise<boolean> {
  const sesion = await obtenerSesionActual();
  return sesion?.rol === 'administrador' || sesion?.rol === 'superadministrador';
}

// Las páginas que muestran planes deben volver a leer la BD.
function revalidarPlanes() {
  revalidatePath('/admin/planes');
  revalidatePath('/planes');
  revalidatePath('/planes/pago');
}

// Crea (sin id_plan) o edita (con id_plan) un plan.
export async function guardarPlan(_prev: EstadoFormPlan, formData: FormData): Promise<EstadoFormPlan> {
  if (!(await esAdmin())) return { ok: false, mensaje: 'No tienes permisos para gestionar planes.' };

  const idPlan = Number(formData.get('id_plan')) || null;
  const nombre = String(formData.get('nombre_plan') ?? '').trim();
  const costo = Number(formData.get('costo_plan'));
  const duracion = Number(formData.get('duracion_plan'));
  const descripcion = String(formData.get('descripcion_plan') ?? '').trim() || null;
  const beneficios = String(formData.get('beneficios') ?? '')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);
  const destacado = formData.get('destacado') === 'on';
  const estaActivo = formData.get('esta_activo') === 'on';

  if (!nombre) return { ok: false, mensaje: 'El nombre es obligatorio.' };
  if (nombre.length > 80) return { ok: false, mensaje: 'El nombre no puede superar 80 caracteres.' };
  if (!Number.isInteger(costo) || costo < 0) {
    return { ok: false, mensaje: 'El precio debe ser un número entero mayor o igual a 0.' };
  }
  if (!Number.isInteger(duracion) || duracion <= 0) {
    return { ok: false, mensaje: 'La duración debe ser un número entero de días mayor a 0.' };
  }

  const valores = [nombre, costo, duracion, descripcion, beneficios, destacado, estaActivo];

  try {
    if (idPlan) {
      const res = await query(
        `UPDATE public.plan
            SET nombre_plan = $1, costo_plan = $2, duracion_plan = $3, descripcion_plan = $4,
                beneficios = $5, destacado = $6, esta_activo = $7
          WHERE id_plan = $8`,
        [...valores, idPlan]
      );
      if (res.rowCount === 0) return { ok: false, mensaje: 'El plan ya no existe.' };
    } else {
      await query(
        `INSERT INTO public.plan
           (nombre_plan, costo_plan, duracion_plan, descripcion_plan, beneficios, destacado, esta_activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        valores
      );
    }
  } catch (error) {
    // 23505 = unique_violation (nombre_plan es UNIQUE).
    if ((error as { code?: string }).code === '23505') {
      return { ok: false, mensaje: 'Ya existe un plan con ese nombre.' };
    }
    console.error('Error al guardar plan:', error);
    return { ok: false, mensaje: 'No se pudo guardar el plan. Inténtalo de nuevo.' };
  }

  revalidarPlanes();
  return { ok: true, mensaje: idPlan ? 'Plan actualizado.' : 'Plan creado.' };
}

// Activa o desactiva un plan (no se borra: puede tener pagos asociados).
export async function cambiarEstadoPlan(idPlan: number, activo: boolean): Promise<void> {
  if (!(await esAdmin())) return;
  await query('UPDATE public.plan SET esta_activo = $2 WHERE id_plan = $1', [idPlan, activo]);
  revalidarPlanes();
}
