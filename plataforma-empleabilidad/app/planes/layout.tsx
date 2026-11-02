import type { ReactNode } from 'react';
import Link from 'next/link';
import { obtenerSesionActual } from '@/lib/auth';

export default async function PlanesLayout({ children }: { children: ReactNode }) {
  // /planes es pública: la sesión es opcional y solo cambia lo que muestra el header.
  const sesion = await obtenerSesionActual();

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <header className="bg-white border-b border-[#c3c6d0]/40 shadow-sm sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1200px] mx-auto w-full">
          <Link href="/" className="text-xl font-extrabold text-[#002546] tracking-tight">
            EMPLEAMÁS
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/modulos" className="text-[#42474f] hover:text-[#002546] transition-colors">
              Módulos
            </Link>
            <Link
              href="/planes"
              aria-current="page"
              className="text-[#002546] border-b-2 border-[#002546] pb-1 font-bold"
            >
              Planes
            </Link>
          </nav>

          {sesion ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-semibold text-[#002546]">
                {sesion.nombre}
              </span>
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-full bg-[#002546] text-white flex items-center justify-center font-bold text-sm"
              >
                {sesion.nombre.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link
              href="/inicio_sesion"
              className="text-sm font-bold text-[#002546] border border-[#002546]/30 rounded-lg px-4 py-2 hover:bg-[#002546] hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-10">{children}</main>

      <footer className="bg-[#002547] text-white mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-6 max-w-[1200px] mx-auto w-full gap-4 text-xs text-white/80">
          <span className="text-base font-bold text-white">Empleamás</span>
          <p>© {new Date().getFullYear()} Empleamás. Asesorías laborales que impulsan tu futuro.</p>
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
