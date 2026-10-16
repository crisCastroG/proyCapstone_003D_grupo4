"use client";

import { useState, type FormEvent } from "react";
import styles from "./login.module.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("El acceso todavía no está conectado. Tus datos no se enviaron.");
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Correo electrónico</label>
          <div className={styles.inputWrap}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.fieldIcon}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="tu@correo.com"
              required
              type="email"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Contraseña</label>
          <div className={styles.inputWrap}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.fieldIcon}>
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
            </svg>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className={styles.visibilityButton}
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div className={styles.options}>
          <label className={styles.remember}>
            <input name="remember" type="checkbox" />
            <span>Mantener sesión iniciada</span>
          </label>
          <button
            className={styles.textButton}
            onClick={() => setNotice("La recuperación de contraseña aún no está disponible.")}
            type="button"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button className={styles.submitButton} type="submit">
          Iniciar sesión <span aria-hidden="true">→</span>
        </button>
        <p aria-live="polite" className={styles.notice} role="status">
          {notice}
        </p>
      </form>

      <div className={styles.register}>
        <p>¿No tienes cuenta?</p>
        <button
          className={styles.registerButton}
          onClick={() => setNotice("El registro estará disponible próximamente.")}
          type="button"
        >
          Regístrate
        </button>
      </div>
    </>
  );
}