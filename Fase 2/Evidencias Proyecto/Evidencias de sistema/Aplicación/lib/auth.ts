import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'empleamas-llconsulting-super-secret-key-2026'
);

export interface SessionPayload {
  id_usuario: number;
  run: string;
  nombre: string;
  apellido_paterno: string;
  correo: string;
  rol: 'usuario' | 'administrador' | 'superadministrador';
}

export async function crearTokenSesion(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verificarTokenSesion(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function obtenerSesionActual(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('empleamas_session')?.value;
  if (!token) return null;
  return await verificarTokenSesion(token);
}