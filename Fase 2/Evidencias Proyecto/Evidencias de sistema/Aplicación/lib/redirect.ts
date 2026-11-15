// Valida el parámetro ?next= que usamos para volver a la compra después del login.
// Solo se aceptan rutas internas: "/planes/pago" sí, "https://otro-sitio.com" o
// "//otro-sitio.com" no. Sin esta validación tendríamos un "open redirect":
// alguien podría mandar un enlace a nuestro login que termina en una página falsa.
export function rutaInternaSegura(valor: string | string[] | undefined): string | undefined {
  if (typeof valor !== 'string') return undefined;
  if (!valor.startsWith('/')) return undefined;
  if (valor.startsWith('//') || valor.startsWith('/\\')) return undefined;
  return valor;
}

export const RUTA_CHECKOUT = '/planes/pago';
