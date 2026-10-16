import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
	title: "Iniciar sesión | Empleamás",
	description: "Accede a tu panel de gestión laboral de Empleamás.",
};

export default function LoginPage() {
	return (
		<main className={styles.screen}>
			<section className={styles.panel} aria-labelledby="login-title">
				<header className={styles.header}>
					<Link className={styles.logoLink} href="/" aria-label="Empleamás, volver al inicio">
						<span className={styles.logo} role="img" aria-label="Empleamás, asesorías laborales que impulsan tu futuro" />
					</Link>
					<div>
						<h1 id="login-title">Bienvenido a Empleamás</h1>
						<p>Accede a tu panel de gestión laboral.</p>
					</div>
				</header>
				<LoginForm />
			</section>
		</main>
	);
}
