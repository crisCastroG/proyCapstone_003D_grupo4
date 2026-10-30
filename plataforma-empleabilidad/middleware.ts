import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarTokenSesion } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('empleamas_session')?.value;

  const sesion = token ? await verificarTokenSesion(token) : null;

  // nProtege rutas que requieren sesión activa 
  const esRutaProtegida =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/contenidos') ||
    pathname.startsWith('/admin');

  if (esRutaProtegida && !sesion) {
    const loginUrl = new URL('/inicio_sesion', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Control de Accesos por Roles - RBAC 
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!sesion || (sesion.rol !== 'administrador' && sesion.rol !== 'superadministrador')) {
      // Si es llamada a API devuelve 403 explícito
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '403 Prohibido: No tienes permisos de administrador.' },
          { status: 403 }
        );
      }
      // Si es en navegador, redirige a su área de notificando el 403
      const urlCliente = new URL('/dashboard?error=403', request.url);
      return NextResponse.redirect(urlCliente);
    }
  }

  // Si ya tiene sesión activa y va a login o registro, llevarlo a su dashboard
  if ((pathname.startsWith('/inicio_sesion') || pathname.startsWith('/registro')) && sesion) {
    const destino =
      sesion.rol === 'administrador' || sesion.rol === 'superadministrador'
        ? '/admin'
        : '/dashboard';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contenidos/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/inicio_sesion',
    '/registro',
  ],
};