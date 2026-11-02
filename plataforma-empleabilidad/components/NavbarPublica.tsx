import Link from "next/link";
import styles from "./LandingPage.module.css";

// Navbar para visitantes sin sesión. Es la misma de la landing (mismas clases de
// LandingPage.module.css), pero con rutas absolutas ("/#como-funciona") para que
// funcione desde cualquier página y no solo desde "/".
export default function NavbarPublica({ activo }: { activo?: "planes" }) {
  return (
    // `.page` define las variables de color que usa la navbar. Se le quita el
    // overflow:hidden y se hace sticky aquí, porque un padre con overflow hidden
    // impediría que el header se quede pegado arriba al hacer scroll.
    <div
      className={`${styles.page} sticky top-0 z-50`}
      style={{ overflow: "visible" }}
    >
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Navegación principal">
          <Link
            className={styles.brand}
            href="/"
            aria-label="Empleamás, inicio"
          >
            emplea<span>más</span>
          </Link>
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
          <Link className={styles.loginLink} href="/inicio_sesion">
            Iniciar sesión <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>
    </div>
  );
}
