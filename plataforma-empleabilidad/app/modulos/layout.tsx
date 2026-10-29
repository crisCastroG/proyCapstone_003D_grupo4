import type { ReactNode } from 'react';
import Link from 'next/link';

export default function ModulosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <header className="bg-white border-b border-[#c3c6d0]/40 shadow-sm sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1200px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[#002546] text-3xl font-bold">
              notes
            </span>
            <span className="text-xl font-bold text-[#002546] tracking-tight">
              Empleamás
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/modulos" className="text-[#002546] border-b-2 border-[#002546] pb-1 font-bold">
              Módulos
            </Link>
            <a href="#" className="text-[#42474f] hover:text-[#002546] transition-colors">
              Asesoría
            </a>
            <a href="#" className="text-[#42474f] hover:text-[#002546] transition-colors">
              Progreso
            </a>
            <a href="#" className="text-[#42474f] hover:text-[#002546] transition-colors">
              Recursos
            </a>
            <Link href="/admin/modulos" className="text-[#006689] font-bold hover:underline">
              Ir al Admin 🛠️
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button aria-label="Notificaciones" className="p-2 text-[#42474f] hover:bg-[#f1f4f6] rounded-full transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button aria-label="Ajustes" className="p-2 text-[#42474f] hover:bg-[#f1f4f6] rounded-full transition-colors">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c3c6d0] cursor-pointer ml-1 hover:opacity-80 transition-opacity">
              <div className="w-full h-full bg-[#002546] text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-[#002547] text-white border-t border-[#c3c6d0]/20 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-6 max-w-[1200px] mx-auto w-full gap-4 text-center md:text-left text-xs text-white/80">
          <span className="text-base font-bold text-white">Empleamás</span>
          <p>© {new Date().getFullYear()} Empleamás. Asesorías laborales que impulsan tu futuro.</p>
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}