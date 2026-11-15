import { NextResponse, type NextRequest } from 'next/server';
import {
  aprobarPagoPlan,
  buscarPagoPorToken,
  esPagoAprobado,
  rechazarPagoPendiente,
  type RespuestaCommit,
} from '@/lib/pagos';
import { transaccionWebpay, urlApp } from '@/lib/transbank';

// Webpay devuelve al usuario aquí después de pagar (o de abandonar el pago).
// Según el caso, llegan parámetros distintos:
//   - Pago terminado (aprobado o rechazado por el banco): solo token_ws
//   - Usuario pulsó "Anular" en Webpay:                    TBK_TOKEN + TBK_ORDEN_COMPRA
//   - Se acabó el tiempo en Webpay:                        solo TBK_ORDEN_COMPRA
//   - Error en el formulario de Webpay:                    token_ws + TBK_TOKEN
// Puede llegar por GET o por POST, así que atendemos ambos.

type Parametros = {
  tokenWs: string | null;
  tbkToken: string | null;
  tbkOrdenCompra: string | null;
};

function texto(valor: FormDataEntryValue | string | null): string | null {
  return typeof valor === 'string' && valor.length > 0 ? valor : null;
}

async function leerParametros(request: NextRequest): Promise<Parametros> {
  if (request.method === 'POST') {
    const form = await request.formData();
    return {
      tokenWs: texto(form.get('token_ws')),
      tbkToken: texto(form.get('TBK_TOKEN')),
      tbkOrdenCompra: texto(form.get('TBK_ORDEN_COMPRA')),
    };
  }
  const q = request.nextUrl.searchParams;
  return {
    tokenWs: texto(q.get('token_ws')),
    tbkToken: texto(q.get('TBK_TOKEN')),
    tbkOrdenCompra: texto(q.get('TBK_ORDEN_COMPRA')),
  };
}

// 303 = "ve a esta otra página con GET". Así, si el usuario recarga la
// confirmación, el navegador no vuelve a enviar el retorno de Webpay.
function irAConfirmacion(params: Record<string, string>) {
  const url = new URL('/planes/confirmacion', urlApp());
  for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, valor);
  return NextResponse.redirect(url, 303);
}

async function procesarRetorno(request: NextRequest) {
  const { tokenWs, tbkToken, tbkOrdenCompra } = await leerParametros(request);

  // Caso 1: pago terminado en Webpay → hay que confirmarlo con commit().
  if (tokenWs && !tbkToken) {
    const pago = await buscarPagoPorToken(tokenWs);
    if (!pago) {
      // Token que no creamos nosotros: no se hace commit de nada.
      return irAConfirmacion({ resultado: 'desconocido' });
    }

    // Si el retorno llega dos veces (recarga, doble clic), no se repite el commit.
    if (pago.estado !== 'pendiente') {
      return irAConfirmacion({ orden: pago.ordenCompra });
    }

    let respuesta: RespuestaCommit;
    try {
      respuesta = (await transaccionWebpay().commit(tokenWs)) as RespuestaCommit;
    } catch (error) {
      console.error('Error al confirmar (commit) la transacción en Webpay', error);
      await rechazarPagoPendiente({ token: tokenWs }, 'Error al confirmar la transacción con Webpay');
      return irAConfirmacion({ orden: pago.ordenCompra });
    }

    if (esPagoAprobado(respuesta, pago)) {
      await aprobarPagoPlan(pago, respuesta);
    } else {
      await rechazarPagoPendiente(
        { token: tokenWs },
        `Rechazado por Webpay: ${JSON.stringify(respuesta)}`
      );
    }
    return irAConfirmacion({ orden: pago.ordenCompra });
  }

  // Caso 2: el usuario anuló en Webpay, se acabó el tiempo o hubo error de formulario.
  // No se hace commit (no hay nada que confirmar); solo se cierra el pago pendiente.
  if (tbkOrdenCompra) {
    const motivo = tbkToken ? 'Pago anulado por el usuario en Webpay' : 'Tiempo agotado en Webpay';
    await rechazarPagoPendiente({ ordenCompra: tbkOrdenCompra }, motivo);
    return irAConfirmacion({ orden: tbkOrdenCompra });
  }
  if (tokenWs) {
    await rechazarPagoPendiente({ token: tokenWs }, 'Error en el formulario de pago de Webpay');
    const pago = await buscarPagoPorToken(tokenWs);
    return irAConfirmacion(pago ? { orden: pago.ordenCompra } : { resultado: 'desconocido' });
  }

  return irAConfirmacion({ resultado: 'desconocido' });
}

export async function GET(request: NextRequest) {
  return procesarRetorno(request);
}

export async function POST(request: NextRequest) {
  return procesarRetorno(request);
}
