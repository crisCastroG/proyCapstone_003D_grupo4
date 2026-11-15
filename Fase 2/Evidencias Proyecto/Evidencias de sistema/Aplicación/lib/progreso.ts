import { query } from '@/lib/db';

export async function verificarPlanProUsuario(usuarioId: number): Promise<boolean> {
  if (!usuarioId) return false;

  try {
    const resPlan = await query(
      `SELECT 1
       FROM public.plan_usuario pu
       INNER JOIN public.plan p ON p.id_plan = pu.plan_id_plan
       LEFT JOIN public.pago pg ON pg.id_pago = pu.pago_id_pago
       WHERE pu.usuario_id_usuario = $1
         AND p.costo_plan > 0
         AND (pu.fecha_termino IS NULL OR pu.fecha_termino > NOW())
         AND (pu.pago_id_pago IS NULL OR LOWER(COALESCE(pg.estado_pago::text, 'aprobado')) = 'aprobado')
       LIMIT 1;`,
      [usuarioId]
    );
    return resPlan.rows.length > 0;
  } catch (e) {
    console.warn('No se pudo verificar el plan del usuario:', e);
    return false;
  }
}

export async function obtenerProgresoUsuario(idUsuario: number) {
  let totalLecciones = 0;
  let totalEvaluaciones = 0;
  let leccionesCompletadas = 0;
  let evaluacionesCompletadas = 0;

  try {
    const res = await query(
      `SELECT COUNT(*)::int AS total FROM public.contenido WHERE LOWER(COALESCE(estado_contenido::text, 'publicado')) = 'publicado';`
    );
    totalLecciones = Number(res.rows[0]?.total || 0);
  } catch (e) {
    try {
      const res = await query(`SELECT COUNT(*)::int AS total FROM public.contenido;`);
      totalLecciones = Number(res.rows[0]?.total || 0);
    } catch (err) {}
  }

  try {
    const res = await query(
      `SELECT COUNT(*)::int AS total FROM public.evaluacion WHERE LOWER(COALESCE(estado_evaluacion::text, 'publicada')) IN ('publicado', 'publicada');`
    );
    totalEvaluaciones = Number(res.rows[0]?.total || 0);
  } catch (e) {
    try {
      const res = await query(`SELECT COUNT(*)::int AS total FROM public.evaluacion;`);
      totalEvaluaciones = Number(res.rows[0]?.total || 0);
    } catch (err) {}
  }

  try {
    const res = await query(
      `SELECT COUNT(DISTINCT contenido_id_contenido)::int AS total 
       FROM public.progreso_contenido 
       WHERE usuario_id_usuario = $1 AND LOWER(COALESCE(estado_progreso::text, '')) = 'completado';`,
      [idUsuario]
    );
    leccionesCompletadas = Number(res.rows[0]?.total || 0);
  } catch (e) {
    try {
      const res = await query(
        `SELECT COUNT(DISTINCT contenido_id_contenido)::int AS total 
         FROM public.progreso 
         WHERE usuario_id_usuario = $1 AND LOWER(COALESCE(estado::text, '')) = 'completado';`,
        [idUsuario]
      );
      leccionesCompletadas = Number(res.rows[0]?.total || 0);
    } catch (err) {}
  }

  try {
    const res = await query(
      `SELECT COUNT(DISTINCT evaluacion_id_evaluacion)::int AS total 
       FROM public.progreso_evaluacion 
       WHERE usuario_id_usuario = $1 AND (aprobado = TRUE OR LOWER(COALESCE(estado_progreso::text, '')) = 'completado');`,
      [idUsuario]
    );
    evaluacionesCompletadas = Number(res.rows[0]?.total || 0);
  } catch (e) {
    try {
      const res = await query(
        `SELECT COUNT(DISTINCT evaluacion_id_evaluacion)::int AS total 
         FROM public.intento_evaluacion 
         WHERE usuario_id_usuario = $1 AND aprobado = TRUE;`,
        [idUsuario]
      );
      evaluacionesCompletadas = Number(res.rows[0]?.total || 0);
    } catch (err) {}
  }

  const totalItems = totalLecciones + totalEvaluaciones;
  const totalCompletados = leccionesCompletadas + evaluacionesCompletadas;
  const porcentajeGlobal = totalItems > 0 ? Math.round((totalCompletados / totalItems) * 100) : 0;

  return {
    totalItems,
    totalCompletados,
    porcentajeGlobal,
  };
}

export async function obtenerEstructuraConBloqueos(usuarioId: number) {
  const tienePlanPro = await verificarPlanProUsuario(usuarioId);

  let resModulos: { rows: any[] } = { rows: [] };
  try {
    resModulos = await query(
      `SELECT id_modulo, titulo_modulo AS titulo, posicion_modulo AS posicion, COALESCE(es_gratuito, true) AS es_gratuito 
       FROM public.modulo ORDER BY posicion_modulo ASC;`
    );
  } catch (e) {
    try {
      resModulos = await query(
        `SELECT id_modulo, titulo_modulo AS titulo, posicion_modulo AS posicion, true AS es_gratuito 
         FROM public.modulo ORDER BY posicion_modulo ASC;`
      );
    } catch (err) {
      console.error('Error al consultar módulos:', err);
    }
  }

  let resContenidos: { rows: any[] } = { rows: [] };
  try {
    resContenidos = await query(
      `SELECT id_contenido AS id, 'contenido' AS tipo, titulo_contenido AS titulo, 
              orden_contenido AS orden, modulo_id_modulo, duracion_estimada AS duracion
       FROM public.contenido 
       WHERE LOWER(COALESCE(estado_contenido::text, 'publicado')) = 'publicado'
       ORDER BY orden_contenido ASC;`
    );
  } catch (e) {
    try {
      resContenidos = await query(
        `SELECT id_contenido AS id, 'contenido' AS tipo, titulo_contenido AS titulo, 
                orden_contenido AS orden, modulo_id_modulo, duracion_estimada AS duracion
         FROM public.contenido 
         ORDER BY orden_contenido ASC;`
      );
    } catch (err) {}
  }

  let resEvaluaciones: { rows: any[] } = { rows: [] };
  try {
    resEvaluaciones = await query(
      `SELECT id_evaluacion AS id, 'evaluacion' AS tipo, titulo_evaluacion AS titulo, 
              orden_evaluacion AS orden, modulo_id_modulo, duracion_minutos, porcentaje_minimo_aprobacion
       FROM public.evaluacion 
       WHERE LOWER(COALESCE(estado_evaluacion::text, 'publicada')) IN ('publicado', 'publicada')
       ORDER BY orden_evaluacion ASC;`
    );
  } catch (e) {
    try {
      resEvaluaciones = await query(
        `SELECT id_evaluacion AS id, 'evaluacion' AS tipo, titulo_evaluacion AS titulo, 
                orden_evaluacion AS orden, modulo_id_modulo, duracion_minutos, porcentaje_minimo_aprobacion
         FROM public.evaluacion 
         ORDER BY orden_evaluacion ASC;`
      );
    } catch (err) {}
  }

  const leccionesCompletadas = new Set<number>();
  const evaluacionesAprobadas = new Set<number>();

  if (usuarioId) {
    try {
      const resLec = await query(
        `SELECT contenido_id_contenido FROM public.progreso_contenido WHERE usuario_id_usuario = $1 AND LOWER(COALESCE(estado_progreso::text, '')) = 'completado';`,
        [usuarioId]
      );
      resLec.rows.forEach((r: any) => leccionesCompletadas.add(Number(r.contenido_id_contenido)));
    } catch (e) {}

    try {
      const resEval = await query(
        `SELECT evaluacion_id_evaluacion FROM public.progreso_evaluacion WHERE usuario_id_usuario = $1 AND (aprobado = TRUE OR LOWER(COALESCE(estado_progreso::text, '')) = 'completado');`,
        [usuarioId]
      );
      resEval.rows.forEach((r: any) => evaluacionesAprobadas.add(Number(r.evaluacion_id_evaluacion)));
    } catch (e) {}
  }

  let anteriorCompletado = true;

  const modulosProcesados = resModulos.rows.map((m: any) => {
    const esGratuito = m.es_gratuito !== undefined ? Boolean(m.es_gratuito) : true;
    const tieneAccesoAlModulo = esGratuito || tienePlanPro;

    const lecciones = resContenidos.rows
      .filter((c: any) => Number(c.modulo_id_modulo) === Number(m.id_modulo))
      .map((c: any) => ({
        ...c,
        id: Number(c.id),
        id_modulo: Number(m.id_modulo),
        estado: leccionesCompletadas.has(Number(c.id)) ? 'completado' : 'no_completado',
      }));

    const tests = resEvaluaciones.rows
      .filter((e: any) => Number(e.modulo_id_modulo) === Number(m.id_modulo))
      .map((e: any) => ({
        ...e,
        id: Number(e.id),
        id_modulo: Number(m.id_modulo),
        estado: evaluacionesAprobadas.has(Number(e.id)) ? 'completado' : 'no_completado',
      }));

    const itemsUnificados = [...lecciones, ...tests].sort((a, b) => Number(a.orden) - Number(b.orden));

    const itemsConBloqueo = itemsUnificados.map((item: any) => {
      let bloqueado = false;

      if (!tieneAccesoAlModulo) {
        bloqueado = true;
      } else {
        bloqueado = !anteriorCompletado;
      }

      anteriorCompletado = item.estado === 'completado';

      return {
        ...item,
        bloqueado,
      };
    });

    const totalItems = itemsConBloqueo.length;
    const completadosItems = itemsConBloqueo.filter((i: any) => i.estado === 'completado').length;

    return {
      id_modulo: Number(m.id_modulo),
      titulo: m.titulo,
      posicion: Number(m.posicion),
      es_gratuito: esGratuito,
      bloqueado: !tieneAccesoAlModulo || (totalItems > 0 && itemsConBloqueo[0].bloqueado),
      totalItems,
      completadosItems,
      items: itemsConBloqueo,
    };
  });

  return modulosProcesados;
}