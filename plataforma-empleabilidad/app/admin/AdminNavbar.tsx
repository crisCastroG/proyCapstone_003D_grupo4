'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BotonCerrarSesion from '@/components/BotonCerrarSesion';

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-[#c3c6d0]/40 shadow-sm sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center h-16 px-6 max-w-[1200px] mx-auto w-full">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#002546] text-3xl font-bold">
            notes
          </span>
          <span className="text-xl font-bold text-[#002546] tracking-tight">
            Empleamás
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link
            href="/admin"
            className={`pb-1 transition-all ${pathname === '/admin'
                ? 'text-[#002546] border-b-2 border-[#002546] font-bold'
                : 'text-[#42474f] hover:text-[#002546]'
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/modulos"
            className={`pb-1 transition-all ${pathname.startsWith('/admin/modulos')
                ? 'text-[#002546] border-b-2 border-[#002546] font-bold'
                : 'text-[#42474f] hover:text-[#002546]'
              }`}
          >
            Módulos
          </Link>
          <Link
            href="/modulos"
            className="text-[#42474f] hover:text-[#002546] pb-1 transition-all"
          >
            Vista Usuario
          </Link>
        </nav>

        {/* Acciones del Administrador */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold bg-[#E6F2FB] text-[#002546] px-3 py-1 rounded-full uppercase tracking-wider">
            SuperAdmin
          </span>
          <div className="w-9 h-9 rounded-full bg-[#002546] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AD
          </div>
        </div>
        <BotonCerrarSesion className="ml-2 text-sm font-semibold text-[#42474f] hover:text-[#002546] hover:bg-[#f1f4f6] border border-[#c3c6d0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60" />
      </div>
    </header>
  );
}