import type { ReactNode } from 'react';
import { obtenerSesionActual } from '@/lib/auth';
import NavbarPublica from '@/components/NavbarPublica';
import NavbarUsuario from '@/components/NavbarUsuario';

export default async function PlanesLayout({ children }: { children: ReactNode }) {
  // /planes es pública: la sesión es opcional y solo cambia lo que muestra el header.
  const sesion = await obtenerSesionActual();

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      {/* Sin sesión: la misma navbar de la landing (sin "Módulos").
          Con sesión: la navbar de la plataforma. */}
      {sesion ? <NavbarUsuario sesion={sesion} activo="planes" /> : <NavbarPublica activo="planes" />}

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
