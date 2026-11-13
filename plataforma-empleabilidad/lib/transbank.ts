import { IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } from 'transbank-sdk';

// Configuración de Webpay Plus.
// Por ahora SIEMPRE usa el ambiente de integración (demo): no se cobra dinero real.
// Si faltan las variables, se usan las credenciales públicas de prueba que trae el SDK.
const codigoComercio = process.env.TBK_COMMERCE_CODE ?? IntegrationCommerceCodes.WEBPAY_PLUS;
const apiKey = process.env.TBK_API_KEY ?? IntegrationApiKeys.WEBPAY;

export function transaccionWebpay() {
  return WebpayPlus.Transaction.buildForIntegration(codigoComercio, apiKey);
}

// URL base de la app, para armar la returnUrl a la que Webpay devuelve al usuario.
export function urlApp(): string {
  const url = process.env.APP_URL;
  if (!url) {
    throw new Error('Falta APP_URL en .env.local (ej: http://localhost:3000)');
  }
  return url.replace(/\/$/, ''); // sin "/" al final
}

export const RUTA_RETORNO_WEBPAY = '/api/pagos/webpay/retorno';
