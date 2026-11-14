// Formatea y limpia el RUT (ej: "12345678-9")
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo}-${dv}`;
}

// Validación para RUT Chileno
export function validarRutChileno(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 8 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dvIngresado === dvCalculado;
}

// Regla de negocio de contraseña: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
export function validarPasswordSegura(password: string): {
  valida: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (password.length < 8) {
    errores.push('Debe tener al menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errores.push('Debe incluir al menos una letra mayúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errores.push('Debe incluir al menos una letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errores.push('Debe incluir al menos un número.');
  }

  return {
    valida: errores.length === 0,
    errores,
  };
}

// Fecha de hoy en Chile (YYYY-MM-DD). Se usa para que la fecha de nacimiento nunca sea futura,
// sin importar la zona horaria del servidor o del navegador.
export function hoyEnChile(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// La fecha de nacimiento debe ser una fecha real, no futura y no anterior a 1900.
export function validarFechaNacimiento(fecha: string): { valida: boolean; error?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { valida: false, error: 'La fecha de nacimiento no es válida.' };
  }
  const [a, m, d] = fecha.split('-').map(Number);
  const real = new Date(Date.UTC(a, m - 1, d));
  if (real.getUTCFullYear() !== a || real.getUTCMonth() !== m - 1 || real.getUTCDate() !== d) {
    return { valida: false, error: 'La fecha de nacimiento no es válida.' };
  }
  if (fecha > hoyEnChile()) {
    return { valida: false, error: 'La fecha de nacimiento no puede ser posterior a hoy.' };
  }
  if (a < 1900) {
    return { valida: false, error: 'La fecha de nacimiento no es válida.' };
  }
  return { valida: true };
}

// Teléfono chileno: acepta "9 1234 5678", "+56 9 1234 5678", "912345678"... y lo deja como "9 1234 5678".
export function normalizarTelefonoChile(telefono: string): string | null {
  let digitos = telefono.replace(/[\s+\-().]/g, '');
  if (!/^\d+$/.test(digitos)) return null;
  if (digitos.startsWith('56') && digitos.length === 11) digitos = digitos.slice(2);
  if (digitos.length !== 9) return null;
  return `${digitos[0]} ${digitos.slice(1, 5)} ${digitos.slice(5)}`;
}
