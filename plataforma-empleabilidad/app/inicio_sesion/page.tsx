import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";
import { rutaInternaSegura } from "@/lib/redirect";

export const metadata: Metadata = {
	title: "Iniciar sesión | Empleamás",
	description: "Accede a tu panel de gestión laboral de Empleamás.",
};

type Props = {
	searchParams: Promise<{ [clave: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: Props) {
	const { next } = await searchParams;
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
				<LoginForm next={rutaInternaSegura(next)} />
			</section>
		</main>
	);
}
