// Datos de los planes que se muestran en /planes y en el checkout.
// Están en un solo lugar para que el precio se cambie una sola vez.
// Más adelante estos valores pueden venir de la tabla public.plan.

// Debe coincidir con el DOMAIN public.tipo_pago ('credito', 'debito').
export type MetodoPago = 'credito' | 'debito';

export const METODOS_PAGO: readonly MetodoPago[] = ['credito', 'debito'];

export function esMetodoPago(valor: unknown): valor is MetodoPago {
  return typeof valor === 'string' && (METODOS_PAGO as readonly string[]).includes(valor);
}

export type Plan = {
  id: 'gratuito' | 'pro';
  nombre: string;
  etiqueta: string;
  precioMensualClp: number;
  descripcion: string;
  beneficios: { texto: string; incluido: boolean }[];
};

export const PORCENTAJE_APROBACION = 80;

export const PLAN_GRATUITO: Plan = {
  id: 'gratuito',
  nombre: 'Plan Gratuito',
  etiqueta: 'Plan por defecto',
  precioMensualClp: 0,
  descripcion: 'Viene con tu cuenta. Conoce la plataforma con el módulo introductorio.',
  beneficios: [
    { texto: 'Acceso al módulo introductorio', incluido: true },
    { texto: 'Vista previa de todos los módulos', incluido: true },
    { texto: 'Módulos de contenido grabado completos', incluido: false },
    { texto: 'Pruebas de avance por módulo', incluido: false },
    { texto: 'Desbloqueo progresivo de módulos', incluido: false },
  ],
};

export const PLAN_PRO: Plan = {
  id: 'pro',
  nombre: 'Plan EmpleaMás Pro',
  etiqueta: 'Recomendado',
  precioMensualClp: 30000,
  descripcion: 'Todo el contenido grabado y las pruebas para avanzar a tu ritmo.',
  beneficios: [
    { texto: 'Acceso al módulo introductorio', incluido: true },
    { texto: 'Acceso a todos los módulos de contenido grabado', incluido: true },
    { texto: 'Pruebas de avance al final de cada módulo', incluido: true },
    {
      texto: `Desbloqueo del siguiente módulo al aprobar con ${PORCENTAJE_APROBACION}% o más`,
      incluido: true,
    },
  ],
};

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
