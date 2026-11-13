// Lectura de planes desde public.plan. SOLO servidor: importa la conexión a la BD.
// (lib/planes.ts no puede importar db porque lo usan componentes cliente.)
import { query } from '@/lib/db';

export type PlanBD = {
  id: number;
  nombre: string;
  costo: number;
  duracionDias: number;
  descripcion: string | null;
  beneficios: string[];
  destacado: boolean;
  estaActivo: boolean;
};

type FilaPlan = {
  id_plan: number;
  nombre_plan: string;
  costo_plan: string; // pg devuelve NUMERIC como string
  duracion_plan: number;
  descripcion_plan: string | null;
  beneficios: string[] | null;
  destacado: boolean;
  esta_activo: boolean;
};

const COLUMNAS =
  'id_plan, nombre_plan, costo_plan, duracion_plan, descripcion_plan, beneficios, destacado, esta_activo';

// Convierte una fila de la BD al objeto que usa la app.
function aPlan(fila: FilaPlan): PlanBD {
  return {
    id: fila.id_plan,
    nombre: fila.nombre_plan,
    costo: Number(fila.costo_plan),
    duracionDias: fila.duracion_plan,
    descripcion: fila.descripcion_plan,
    beneficios: fila.beneficios ?? [],
    destacado: fila.destacado,
    estaActivo: fila.esta_activo,
  };
}

// Planes visibles para el público (cards de /planes y checkout).
export async function obtenerPlanesActivos(): Promise<PlanBD[]> {
  const res = await query(
    `SELECT ${COLUMNAS} FROM public.plan WHERE esta_activo ORDER BY costo_plan, duracion_plan`
  );
  return (res.rows as FilaPlan[]).map(aPlan);
}

// Todos los planes, incluidos los inactivos (panel de administración).
export async function obtenerTodosLosPlanes(): Promise<PlanBD[]> {
  const res = await query(
    `SELECT ${COLUMNAS} FROM public.plan ORDER BY esta_activo DESC, costo_plan, duracion_plan`
  );
  return (res.rows as FilaPlan[]).map(aPlan);
}

// El plan gratuito activo (costo 0). Si hay varios, el más antiguo.
export async function obtenerPlanGratuito(): Promise<PlanBD | null> {
  const res = await query(
    `SELECT ${COLUMNAS} FROM public.plan
      WHERE esta_activo AND costo_plan = 0
      ORDER BY id_plan
      LIMIT 1`
  );
  const fila = res.rows[0] as FilaPlan | undefined;
  return fila ? aPlan(fila) : null;
}
