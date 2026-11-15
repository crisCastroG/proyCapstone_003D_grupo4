import Link from "next/link";
import styles from "./LandingPage.module.css";
import { obtenerSesionActual } from "@/lib/auth";

export default async function NavbarPublica({ activo }: { activo?: "planes" }) {
  let sesion = null;
  try {
    sesion = await obtenerSesionActual();
  } catch {
    sesion = null;
  }

  const inicialUsuario = sesion?.nombre?.[0]?.toUpperCase() || "A";

  return (
    <div
      className={`${styles.page} sticky top-0 z-50`}
      style={{ overflow: "visible" }}
    >
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Navegación principal">
          {/* LOGO IDÉNTICO AL DE NAVBARUSUARIO */}
          <Link
            className="flex items-center gap-2 no-underline hover:opacity-90 transition-opacity"
            href="/"
            aria-label="Empleamás, inicio"
          >
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

          {/* ENLACES DE LA LANDING */}
          <div className={styles.navLinks}>
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#historias">Historias</Link>
            <Link
              href="/planes"
              aria-current={activo === "planes" ? "page" : undefined}
            >
              Planes
            </Link>
          </div>

          {/* ACCIONES DE SESIÓN */}
          <div className="flex items-center gap-3 justify-end">
            {sesion ? (
              <>
                <Link
                  href="/modulos"
                  className="px-4 py-2 bg-[#002546] hover:bg-[#2566A8] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs no-underline"
                >
                  <span>Acceder a la plataforma</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>

                <div
                  className="w-9 h-9 rounded-full bg-[#002546] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0"
                  title={sesion.nombre || "Usuario"}
                >
                  {inicialUsuario}
                </div>
              </>
            ) : (
              <Link className={styles.loginLink} href="/inicio_sesion">
                Iniciar sesión <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
}