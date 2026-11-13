import { randomBytes } from 'node:crypto';
import { conTransaccion, query } from '@/lib/db';

export type PlanPro = {
  id: number;
  nombre: string;
  costo: number;
  duracionDias: number;
  descripcion: string | null;
};

type FilaPlan = {
  id_plan: number;
  nombre_plan: string;
  costo_plan: string; // pg devuelve NUMERIC como string
  duracion_plan: number;
  descripcion_plan: string | null;
};

function aPlanPro(fila: FilaPlan): PlanPro {
  return {
    id: fila.id_plan,
    nombre: fila.nombre_plan,
    costo: Number(fila.costo_plan),
    duracionDias: fila.duracion_plan,
    descripcion: fila.descripcion_plan,
  };
}

// Planes que se pueden comprar: de pago y activos.
export async function obtenerPlanesPro(): Promise<PlanPro[]> {
  const res = await query(
    `SELECT id_plan, nombre_plan, costo_plan, duracion_plan, descripcion_plan
       FROM public.plan
      WHERE costo_plan > 0 AND esta_activo
      ORDER BY duracion_plan`
  );
  return (res.rows as FilaPlan[]).map(aPlanPro);
}

// Lo usa la server action de pago: un plan gratuito o desactivado no se puede comprar.
export async function obtenerPlanPro(idPlan: number): Promise<PlanPro | null> {
  const res = await query(
    `SELECT id_plan, nombre_plan, costo_plan, duracion_plan, descripcion_plan
       FROM public.plan
      WHERE id_plan = $1 AND costo_plan > 0 AND esta_activo`,
    [idPlan]
  );
  const fila = res.rows[0] as FilaPlan | undefined;
  return fila ? aPlanPro(fila) : null;
}

// Orden de compra única y de máximo 26 caracteres (límite de Transbank).
// Ej: "EM" + fecha en base 36 + 6 caracteres al azar → "EMMH8K2Q1A3F9C2B" (16).
function generarOrdenCompra(): string {
  const tiempo = Date.now().toString(36).toUpperCase();
  const azar = randomBytes(3).toString('hex').toUpperCase();
  return `EM${tiempo}${azar}`;
}

// Registra el intento de pago ANTES de ir a Webpay, con estado 'pendiente'.
// El monto sale de la BD (plan.costo), nunca del navegador.
export async function crearPagoPendientePlan(
  idUsuario: number,
  plan: PlanPro
): Promise<{ idPago: number; ordenCompra: string }> {
  const ordenCompra = generarOrdenCompra();
  const res = await query(
    `INSERT INTO public.pago
       (monto_pago, estado_pago, id_proveedor_pago, usuario_id_usuario, orden_compra, plan_id_plan)
     VALUES (
       $1, 'pendiente',
       (SELECT id_proveedor_pago FROM public.proveedor_pago
         WHERE nombre_proveedor_pago = 'Transbank Webpay Plus'),
       $2, $3, $4
     )
     RETURNING id_pago`,
    [plan.costo, idUsuario, ordenCompra, plan.id]
  );
  return { idPago: res.rows[0].id_pago as number, ordenCompra };
}

export async function guardarTokenPago(idPago: number, token: string): Promise<void> {
  await query(
    `UPDATE public.pago
        SET token_ws = $2, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_pago = $1`,
    [idPago, token]
  );
}

// Si Webpay no responde al crear la transacción, el pago no queda "pendiente" para siempre.
export async function marcarPagoRechazado(idPago: number, motivo: string): Promise<void> {
  await query(
    `UPDATE public.pago
        SET estado_pago = 'rechazado', respuesta_pago = $2,
            fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_pago = $1`,
    [idPago, motivo]
  );
}

// ---------------------------------------------------------------------------
// Retorno desde Webpay
// ---------------------------------------------------------------------------

export type PagoGuardado = {
  idPago: number;
  idUsuario: number;
  ordenCompra: string;
  monto: number;
  estado: 'aprobado' | 'pendiente' | 'rechazado' | 'reembolsado';
  idPlan: number | null;
  nombrePlan: string | null;
  tipoPago: 'credito' | 'debito' | 'prepago' | null;
  codigoAutorizacion: string | null;
  fechaPago: Date | null;
  fechaTerminoPlan: Date | null;
};

type FilaPago = {
  id_pago: number;
  usuario_id_usuario: number;
  orden_compra: string;
  monto_pago: string;
  estado_pago: PagoGuardado['estado'];
  plan_id_plan: number | null;
  nombre_plan: string | null;
  tipo_pago: PagoGuardado['tipoPago'];
  codigo_autorizacion: string | null;
  fecha_pago: Date | null;
  fecha_termino: Date | null;
};

const SELECT_PAGO = `
  SELECT p.id_pago, p.usuario_id_usuario, p.orden_compra, p.monto_pago, p.estado_pago,
         p.plan_id_plan, pl.nombre_plan, p.tipo_pago, p.codigo_autorizacion, p.fecha_pago,
         pu.fecha_termino
    FROM public.pago p
    LEFT JOIN public.plan pl ON pl.id_plan = p.plan_id_plan
    LEFT JOIN public.plan_usuario pu ON pu.pago_id_pago = p.id_pago`;

function aPagoGuardado(f: FilaPago): PagoGuardado {
  return {
    idPago: f.id_pago,
    idUsuario: f.usuario_id_usuario,
    ordenCompra: f.orden_compra,
    monto: Number(f.monto_pago),
    estado: f.estado_pago,
    idPlan: f.plan_id_plan,
    nombrePlan: f.nombre_plan,
    tipoPago: f.tipo_pago,
    codigoAutorizacion: f.codigo_autorizacion,
    fechaPago: f.fecha_pago,
    fechaTerminoPlan: f.fecha_termino,
  };
}

export async function buscarPagoPorToken(token: string): Promise<PagoGuardado | null> {
  const res = await query(`${SELECT_PAGO} WHERE p.token_ws = $1`, [token]);
  const fila = res.rows[0] as FilaPago | undefined;
  return fila ? aPagoGuardado(fila) : null;
}

// Para la página de confirmación: solo devuelve el pago si es DEL usuario que mira.
export async function buscarPagoDeUsuario(
  ordenCompra: string,
  idUsuario: number
): Promise<PagoGuardado | null> {
  const res = await query(`${SELECT_PAGO} WHERE p.orden_compra = $1 AND p.usuario_id_usuario = $2`, [
    ordenCompra,
    idUsuario,
  ]);
  const fila = res.rows[0] as FilaPago | undefined;
  return fila ? aPagoGuardado(fila) : null;
}

// Webpay informa el tipo de tarjeta con un código; lo pasamos al DOMAIN tipo_pago.
// VD = débito, VP = prepago, el resto (VN, VC, SI, S2, NC) = crédito.
function tipoPagoDesdeWebpay(codigo: unknown): 'credito' | 'debito' | 'prepago' | null {
  if (codigo === 'VD') return 'debito';
  if (codigo === 'VP') return 'prepago';
  if (typeof codigo === 'string' && ['VN', 'VC', 'SI', 'S2', 'NC'].includes(codigo)) return 'credito';
  return null;
}

// Respuesta de commit() que nos importa (el SDK la tipa como `any`).
export type RespuestaCommit = {
  status?: string;
  response_code?: number;
  amount?: number;
  buy_order?: string;
  authorization_code?: string;
  payment_type_code?: string;
};

// El pago se aprueba SOLO si Transbank lo autorizó y además coincide con lo que
// registramos nosotros (mismo monto y misma orden). Así nadie puede "reciclar"
// un token de otra compra más barata.
export function esPagoAprobado(respuesta: RespuestaCommit, pago: PagoGuardado): boolean {
  return (
    respuesta.status === 'AUTHORIZED' &&
    respuesta.response_code === 0 &&
    Number(respuesta.amount) === pago.monto &&
    respuesta.buy_order === pago.ordenCompra
  );
}

// Aprueba el pago y activa el plan, todo en UNA transacción de BD.
// `WHERE estado_pago = 'pendiente'` hace que, si el retorno llega dos veces,
// la segunda vez no cambie nada (no se duplica el plan).
export async function aprobarPagoPlan(pago: PagoGuardado, respuesta: RespuestaCommit): Promise<void> {
  await conTransaccion(async (cliente) => {
    const actualizado = await cliente.query(
      `UPDATE public.pago
          SET estado_pago = 'aprobado',
              tipo_pago = $2,
              codigo_autorizacion = $3,
              respuesta_pago = $4,
              fecha_pago = CURRENT_TIMESTAMP,
              fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_pago = $1 AND estado_pago = 'pendiente'
        RETURNING id_pago`,
      [
        pago.idPago,
        tipoPagoDesdeWebpay(respuesta.payment_type_code),
        respuesta.authorization_code ?? null,
        JSON.stringify(respuesta),
      ]
    );
    if (actualizado.rowCount === 0 || pago.idPlan === null) return;

    // El plan dura plan.duracion_plan días desde hoy.
    await cliente.query(
      `INSERT INTO public.plan_usuario (fecha_inicio, fecha_termino, usuario_id_usuario, plan_id_plan, pago_id_pago)
       SELECT CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP + make_interval(days => pl.duracion_plan),
              $1, pl.id_plan, $2
         FROM public.plan pl
        WHERE pl.id_plan = $3
       ON CONFLICT (pago_id_pago) DO NOTHING`,
      [pago.idUsuario, pago.idPago, pago.idPlan]
    );
  });
}

// Rechaza un pago que sigue pendiente (rechazo del banco, anulación o timeout).
// Nunca pisa un pago que ya quedó aprobado.
export async function rechazarPagoPendiente(
  filtro: { token: string } | { ordenCompra: string },
  motivo: string
): Promise<void> {
  const [columna, valor] = 'token' in filtro ? ['token_ws', filtro.token] : ['orden_compra', filtro.ordenCompra];
  await query(
    `UPDATE public.pago
        SET estado_pago = 'rechazado', respuesta_pago = $2,
            fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE ${columna} = $1 AND estado_pago = 'pendiente'`,
    [valor, motivo]
  );
}
