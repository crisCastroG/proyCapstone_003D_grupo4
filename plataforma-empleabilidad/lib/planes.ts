// Constantes y utilidades de planes que pueden usar componentes cliente.
// Los planes en sí se leen de public.plan en lib/planes-bd.ts (solo servidor).

// Debe coincidir con el DOMAIN public.tipo_pago ('credito', 'debito').
export type MetodoPago = 'credito' | 'debito';

export const METODOS_PAGO: readonly MetodoPago[] = ['credito', 'debito'];

export function esMetodoPago(valor: unknown): valor is MetodoPago {
  return typeof valor === 'string' && (METODOS_PAGO as readonly string[]).includes(valor);
}

export const PORCENTAJE_APROBACION = 80;

// Filas de la tabla comparativa: [característica, gratuito, pro]
export const COMPARATIVA: { caracteristica: string; gratuito: boolean; pro: boolean }[] = [
  { caracteristica: 'Módulo introductorio', gratuito: true, pro: true },
  { caracteristica: 'Módulos de contenido grabado', gratuito: false, pro: true },
  { caracteristica: 'Pruebas de avance por módulo', gratuito: false, pro: true },
  {
    caracteristica: `Desbloqueo de módulos al aprobar con ${PORCENTAJE_APROBACION}%`,
    gratuito: false,
    pro: true,
  },
];

export const PREGUNTAS_FRECUENTES: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿Qué incluye el plan gratuito?',
    respuesta:
      'Todas las cuentas nuevas parten con el plan gratuito. Te da acceso al módulo introductorio y puedes ver el resto de los módulos, pero no entrar en ellos.',
  },
  {
    pregunta: '¿Cómo se desbloquean los módulos?',
    respuesta: `Cada módulo termina con una prueba. Si la apruebas con ${PORCENTAJE_APROBACION}% o más, se desbloquea el siguiente módulo.`,
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Puedes pagar con tarjeta de crédito o de débito.',
  },
  {
    pregunta: '¿Necesito una cuenta para comprar?',
    respuesta:
      'Sí. Al pulsar "Comprar plan" te pediremos iniciar sesión o crear una cuenta, y después volverás directo al pago.',
  },
];

const formateadorClp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatearClp(monto: number): string {
  return formateadorClp.format(monto);
}

export const ETIQUETA_METODO: Record<MetodoPago, string> = {
  credito: 'Tarjeta de crédito',
  debito: 'Tarjeta de débito',
};

// Texto que acompaña al precio: 30 → "/ mes", 180 → "/ 6 meses", 365 → "/ año".
export function textoDuracion(dias: number): string {
  if (dias % 365 === 0) {
    const anios = dias / 365;
    return anios === 1 ? '/ año' : `/ ${anios} años`;
  }
  if (dias % 30 === 0) {
    const meses = dias / 30;
    return meses === 1 ? '/ mes' : `/ ${meses} meses`;
  }
  return `/ ${dias} días`;
}
