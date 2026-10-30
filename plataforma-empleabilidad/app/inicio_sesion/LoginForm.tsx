'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estado para recuperación de contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión.');
        setCargando(false);
        return;
      }

      // Redirige según el rol devuelto por el servidor (/dashboard o /admin)
      router.push(data.redirectUrl);
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
      setCargando(false);
    }
  };

  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensajeRecuperacion('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      setMensajeRecuperacion(data.mensaje);
    } catch {
      setError('Error al solicitar el restablecimiento.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(13, 59, 102, 0.08)', border: '1px solid #E6F2FB' }}>
        <h1 style={{ color: '#0D3B66', fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {modoRecuperar ? 'Recuperar Contraseña' : 'Bienvenido a Empleamás'}
        </h1>
        <p style={{ color: '#2566A8', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {modoRecuperar
            ? 'Ingresa tu correo y te enviaremos un enlace temporal (válido por 15 minutos).'
            : 'Ingresa tus credenciales para continuar con tu ruta de empleabilidad.'}
        </p>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {mensajeRecuperacion && (
          <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {mensajeRecuperacion}
          </div>
        )}

        {!modoRecuperar ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Correo Electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.cl"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setModoRecuperar(true)}
                style={{ background: 'none', border: 'none', color: '#2566A8', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                backgroundColor: '#0D3B66',
                color: '#FFFFFF',
                padding: '0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                border: 'none',
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecuperarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Correo Registrado</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.cl"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{ backgroundColor: '#2566A8', color: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <button
              type="button"
              onClick={() => setModoRecuperar(false)}
              style={{ background: 'none', border: 'none', color: '#0D3B66', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#475569' }}>
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" style={{ color: '#2566A8', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}