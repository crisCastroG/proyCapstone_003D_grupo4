import Link from "next/link";
import type { SessionPayload } from "@/lib/auth";
import BotonCerrarSesion from "@/components/BotonCerrarSesion";

type Seccion = "modulos" | "perfil" | "planes";

const ENLACES: { seccion: Seccion; href: string; texto: string }[] = [
  { seccion: "modulos", href: "/modulos", texto: "Módulos" }, 
];
export default function NavbarUsuario({
  sesion,
  activo,
}: {
  sesion: SessionPayload;
  activo: Seccion;
}) {
  const esAdmin =
    sesion.rol === "administrador" || sesion.rol === "superadministrador";

  return (
    <header className="bg-white border-b border-[#c3c6d0]/40 shadow-sm sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center h-16 px-6 max-w-[1200px] mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[#002546] text-3xl font-bold"
          >
            notes
          </span>
          <span className="text-xl font-bold text-[#002546] tracking-tight">
            Empleamás
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {ENLACES.map((e) =>
            e.seccion === activo ? (
              <Link
                key={e.href}
                href={e.href}
                aria-current="page"
                className="text-[#002546] border-b-2 border-[#002546] pb-1 font-bold"
              >
                {e.texto}
              </Link>
            ) : (
              <Link
                key={e.href}
                href={e.href}
                className="text-[#42474f] hover:text-[#002546] transition-colors"
              >
                {e.texto}
              </Link>
            ),
          )}
          {esAdmin && (
            <Link
              href="/admin"
              className="text-[#006689] font-bold hover:underline"
            >
              Ir al Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/modulos/cuenta"
            aria-label="Mi cuenta"
            className="w-10 h-10 rounded-full bg-[#002546] text-white flex items-center justify-center font-bold text-sm hover:opacity-80 transition-opacity"
>
            {sesion.nombre.charAt(0).toUpperCase()}
          </Link>
          <BotonCerrarSesion className="ml-2 text-sm font-semibold text-[#42474f] hover:text-[#002546] hover:bg-[#f1f4f6] border border-[#c3c6d0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60" />
        </div>
      </div>
    </header>
  );
}
