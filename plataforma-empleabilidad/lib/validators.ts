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

// Validación oficial Módulo 11 para RUT Chileno
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