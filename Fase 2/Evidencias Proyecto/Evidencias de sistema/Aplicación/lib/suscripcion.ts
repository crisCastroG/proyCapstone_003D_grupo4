import { query } from '@/lib/db';

// ¿El usuario tiene un plan de pago vigente hoy?
// Usa public.plan_usuario: hay una fila por cada período pagado.
export async function tienePlanActivo(idUsuario: number): Promise<boolean> {
  const res = await query(
    `SELECT 1
       FROM public.plan_usuario
      WHERE usuario_id_usuario = $1
        AND CURRENT_TIMESTAMP BETWEEN fecha_inicio AND fecha_termino
      LIMIT 1`,
    [idUsuario]
  );
  return (res.rowCount ?? 0) > 0;
}
