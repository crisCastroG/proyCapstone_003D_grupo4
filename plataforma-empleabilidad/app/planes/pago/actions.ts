'use server';

import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import {
  crearPagoPendientePlan,
  guardarTokenPago,
  marcarPagoRechazado,
  obtenerPlanPro,
} from '@/lib/pagos';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { tienePlanActivo } from '@/lib/suscripcion';
import { RUTA_RETORNO_WEBPAY, transaccionWebpay, urlApp } from '@/lib/transbank';

// Lo que la acción le devuelve al formulario:
// - error: se muestra en pantalla
// - url + token: el formulario redirige al usuario a Webpay
export type EstadoPago = { error: string } | { url: string; token: string } | null;

// Se llama al pulsar "Continuar al pago".
export async function iniciarPago(_previo: EstadoPago, formData: FormData): Promise<EstadoPago> {
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect(`/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`);
  }

  // Del navegador solo se acepta QUÉ plan eligió; el precio se lee de la BD.
  const idPlan = Number(formData.get('plan'));
  if (!Number.isInteger(idPlan) || idPlan <= 0) {
    return { error: 'Selecciona un plan.' };
  }
  const plan = await obtenerPlanPro(idPlan);
  if (!plan) {
    return { error: 'El plan seleccionado no existe.' };
  }

  if (await tienePlanActivo(sesion.id_usuario)) {
    return { error: 'Ya tienes el plan Pro activo.' };
  }

  // Registra el intento en la BD como 'pendiente'.
  const { idPago, ordenCompra } = await crearPagoPendientePlan(sesion.id_usuario, plan);

  // Crea la transacción en Webpay (ambiente de integración: sin cobro real).
  try {
    const respuesta = await transaccionWebpay().create(
      ordenCompra,
      String(sesion.id_usuario), // sessionId: dato nuestro que Webpay devuelve en el commit
      plan.costo,
      `${urlApp()}${RUTA_RETORNO_WEBPAY}`
    );

    //  Guarda el token para reconocer el pago cuando Webpay devuelva al usuario.
    await guardarTokenPago(idPago, respuesta.token);
    return { url: respuesta.url, token: respuesta.token };
  } catch (error) {
    console.error('Error al crear la transacción en Webpay', error);
    await marcarPagoRechazado(idPago, 'No se pudo crear la transacción en Webpay');
    return { error: 'No pudimos conectar con Webpay. Intenta de nuevo en unos minutos.' };
  }
}
