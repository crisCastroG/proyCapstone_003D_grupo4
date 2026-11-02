'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// `next` es la ruta a la que volver después del login (ya validada en page.tsx).
export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

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

      // Redirige a `next` si viene de /planes; si no, según el rol (/modulos o /admin)
      router.push(next ?? data.redirectUrl);
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(13, 59, 102, 0.08)', border: '1px solid #E6F2FB' }}>
        <h1 style={{ color: '#0D3B66', fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Bienvenido a Empleamás
        </h1>
        <p style={{ color: '#2566A8', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          Ingresa tus credenciales para continuar con tu ruta de empleabilidad.
        </p>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

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
            <Link
              href="/recuperar_password"
              style={{ color: '#2566A8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
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

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#475569' }}>
          ¿Aún no tienes cuenta?{' '}
          <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : '/registro'} style={{ color: '#2566A8', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}