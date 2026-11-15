import { query } from '@/lib/db';

const ZONA = 'America/Santiago';
const MESES_SERIE = 6;

const n = (v: unknown): number => Number(v ?? 0);

export type PuntoMes = { mes: string; etiqueta: string; valor: number };
export type ItemCategoria = { etiqueta: string; valor: number };

export type MetricasDashboard = {
  usuarios: {
    total: number;
    activos: number;
    desactivados: number;
    nuevos30d: number;
    registrosPorMes: PuntoMes[];
  };
  pagos: {
    ingresosTotales: number;
    ingresos30d: number;
    pagosAprobados: number;
    suscripcionesVigentes: number;
    ingresosPorMes: PuntoMes[];
    pagosPorEstado: ItemCategoria[];
    suscripcionesPorPlan: ItemCategoria[];
  };
  tests: {
    evaluacionesPublicadas: number;
    intentosTotales: number;
    intentosAprobados: number;
    tasaAprobacion: number; // 0-100
    usuariosQueRindieron: number;
    intentosPorMes: PuntoMes[];
  };
  contenido: {
    modulosPublicados: number;
    leccionesPublicadas: number;
    leccionesCompletadas: number;
  };
  perfiles: {
    creados: number;
    porcentajeUsuarios: number; // 0-100
    conQr: number;
  };
};

// Serie de los últimos N meses (incluido el actual) con ceros donde no hay datos.
// `origen` es un SELECT que devuelve (fecha timestamptz, valor numeric).
async function serieMensual(origen: string): Promise<PuntoMes[]> {
  const res = await query(
    `WITH meses AS (
       SELECT generate_series(
                date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE '${ZONA}') - ($1::int - 1) * INTERVAL '1 month',
                date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE '${ZONA}'),
                INTERVAL '1 month'
              ) AS mes
     ),
     datos AS (
       SELECT date_trunc('month', fecha AT TIME ZONE '${ZONA}') AS mes, SUM(valor) AS valor
         FROM (${origen}) o
        GROUP BY 1
     )
     SELECT to_char(m.mes, 'YYYY-MM') AS mes, COALESCE(d.valor, 0) AS valor
       FROM meses m
       LEFT JOIN datos d ON d.mes = m.mes
      ORDER BY m.mes`,
    [MESES_SERIE]
  );
  return res.rows.map((r) => ({ mes: r.mes, etiqueta: etiquetaMes(r.mes), valor: n(r.valor) }));
}

const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export function etiquetaMes(yyyymm: string): string {
  const [anio, mes] = yyyymm.split('-').map(Number);
  return `${NOMBRES_MES[mes - 1]} ${String(anio).slice(2)}`;
}

export async function obtenerMetricasDashboard(): Promise<MetricasDashboard> {
  const [
    usuarios, registrosPorMes,
    ingresos, ingresosPorMes, pagosPorEstado, vigentes, suscripcionesPorPlan,
    tests, intentosPorMes,
    contenido,
    perfiles,
  ] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE u.estado_usuario = 'activo') AS activos,
              COUNT(*) FILTER (WHERE u.estado_usuario = 'desactivado') AS desactivados,
              COUNT(*) FILTER (WHERE u.fecha_creacion >= CURRENT_TIMESTAMP - INTERVAL '30 days') AS nuevos30d
         FROM public.usuario u
         JOIN public.rol_usuario r ON r.id_rol = u.rol_usuario_id_rol
        WHERE r.nombre_rol = 'usuario'`
    ),
    serieMensual(
      `SELECT u.fecha_creacion AS fecha, 1 AS valor
         FROM public.usuario u
         JOIN public.rol_usuario r ON r.id_rol = u.rol_usuario_id_rol
        WHERE r.nombre_rol = 'usuario'`
    ),
    query(
      `SELECT COALESCE(SUM(monto_pago), 0) AS total,
              COALESCE(SUM(monto_pago) FILTER (
                WHERE COALESCE(fecha_pago, fecha_creacion) >= CURRENT_TIMESTAMP - INTERVAL '30 days'), 0) AS ult30d,
              COUNT(*) AS cantidad
         FROM public.pago
        WHERE estado_pago = 'aprobado'`
    ),
    serieMensual(
      `SELECT COALESCE(fecha_pago, fecha_creacion) AS fecha, monto_pago AS valor
         FROM public.pago WHERE estado_pago = 'aprobado'`
    ),
    query(
      `SELECT estado_pago AS etiqueta, COUNT(*) AS valor
         FROM public.pago GROUP BY estado_pago ORDER BY COUNT(*) DESC`
    ),
    query(
      `SELECT COUNT(*) AS total
         FROM public.plan_usuario
        WHERE CURRENT_TIMESTAMP BETWEEN fecha_inicio AND fecha_termino`
    ),
    query(
      `SELECT p.nombre_plan AS etiqueta, COUNT(*) AS valor
         FROM public.plan_usuario pu
         JOIN public.plan p ON p.id_plan = pu.plan_id_plan
        WHERE CURRENT_TIMESTAMP BETWEEN pu.fecha_inicio AND pu.fecha_termino
        GROUP BY p.nombre_plan ORDER BY COUNT(*) DESC`
    ),
    query(
      `SELECT (SELECT COUNT(*) FROM public.evaluacion WHERE estado_evaluacion = 'publicada') AS publicadas,
              COUNT(*) AS intentos,
              COUNT(*) FILTER (WHERE aprobado) AS aprobados,
              COUNT(DISTINCT usuario_id_usuario) AS usuarios
         FROM public.intento_evaluacion`
    ),
    serieMensual(`SELECT fecha_intento AS fecha, 1 AS valor FROM public.intento_evaluacion`),
    query(
      `SELECT (SELECT COUNT(*) FROM public.modulo WHERE esta_publicado) AS modulos,
              (SELECT COUNT(*) FROM public.contenido WHERE estado_contenido = 'publicado') AS lecciones,
              (SELECT COUNT(*) FROM public.progreso_contenido WHERE estado_progreso = 'completado') AS completadas`
    ),
    query(
      `SELECT COUNT(*) AS creados,
              COUNT(*) FILTER (WHERE pp.qr IS NOT NULL AND pp.qr <> '') AS con_qr
         FROM public.perfil_profesional pp
         JOIN public.usuario u ON u.id_usuario = pp.usuario_id_usuario
         JOIN public.rol_usuario r ON r.id_rol = u.rol_usuario_id_rol
        WHERE r.nombre_rol = 'usuario'`
    ),
  ]);

  const u = usuarios.rows[0];
  const ing = ingresos.rows[0];
  const t = tests.rows[0];
  const c = contenido.rows[0];
  const pf = perfiles.rows[0];

  const intentos = n(t.intentos);
  const totalUsuarios = n(u.total);

  return {
    usuarios: {
      total: totalUsuarios,
      activos: n(u.activos),
      desactivados: n(u.desactivados),
      nuevos30d: n(u.nuevos30d),
      registrosPorMes,
    },
    pagos: {
      ingresosTotales: n(ing.total),
      ingresos30d: n(ing.ult30d),
      pagosAprobados: n(ing.cantidad),
      suscripcionesVigentes: n(vigentes.rows[0].total),
      ingresosPorMes,
      pagosPorEstado: pagosPorEstado.rows.map((r) => ({ etiqueta: r.etiqueta, valor: n(r.valor) })),
      suscripcionesPorPlan: suscripcionesPorPlan.rows.map((r) => ({ etiqueta: r.etiqueta, valor: n(r.valor) })),
    },
    tests: {
      evaluacionesPublicadas: n(t.publicadas),
      intentosTotales: intentos,
      intentosAprobados: n(t.aprobados),
      tasaAprobacion: intentos > 0 ? (n(t.aprobados) / intentos) * 100 : 0,
      usuariosQueRindieron: n(t.usuarios),
      intentosPorMes,
    },
    contenido: {
      modulosPublicados: n(c.modulos),
      leccionesPublicadas: n(c.lecciones),
      leccionesCompletadas: n(c.completadas),
    },
    perfiles: {
      creados: n(pf.creados),
      porcentajeUsuarios: totalUsuarios > 0 ? (n(pf.creados) / totalUsuarios) * 100 : 0,
      conQr: n(pf.con_qr),
    },
  };
}
