import type { ReactNode } from 'react';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <AdminNavbar />
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
          </nav>
        </div>
      </footer>
    </div>
  );
}