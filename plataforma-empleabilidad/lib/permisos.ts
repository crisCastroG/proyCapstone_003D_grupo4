import { obtenerSesionActual } from '@/lib/auth';

export async function requerirAdmin() {
  const sesion = await obtenerSesionActual();
  if (!sesion || (sesion.rol !== 'administrador' && sesion.rol !== 'superadministrador')) {
    throw new Error('No autorizado.');
  }
  return sesion;
}
