'use server';

import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { esMetodoPago } from '@/lib/planes';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { tienePlanActivo } from '@/lib/suscripcion';

export type EstadoPago = { error: string } | null;

// Se llama al pulsar "Continuar al pago".
// Una Server Action es un endpoint POST público, así que se vuelve a validar
// todo aquí, aunque la página ya lo haya hecho.
export async function iniciarPago(_previo: EstadoPago, formData: FormData): Promise<EstadoPago> {
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect(`/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`);
  }

  const metodo = formData.get('metodo');
  if (!esMetodoPago(metodo)) {
    return { error: 'Selecciona tarjeta de crédito o de débito.' };
  }

  if (await tienePlanActivo(sesion.id_usuario)) {
    return { error: 'Ya tienes el plan Pro activo.' };
  }

  // TODO(proveedor de pagos): cuando se elija el proveedor, aquí se debe:
  //   1. Insertar una fila en public.pago con estado 'pendiente' y tipo_pago = metodo.
  //   2. Crear la transacción en el proveedor y redirigir a su URL de pago.
  //   3. En la ruta de retorno/webhook, marcar el pago como 'aprobado' y crear
  //      la fila en public.plan_usuario. Nunca activar el plan desde aquí.
  // Mientras tanto la vista funciona en modo demostración: no se cobra ni se
  // escribe nada en la base de datos.
  redirect(`/planes/confirmacion?metodo=${metodo}&demo=1`);
}
