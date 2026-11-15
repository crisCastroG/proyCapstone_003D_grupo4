'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function RecuperarPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenUrl = searchParams.get('token');

  const [correo, setCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enlaceGenerado, setEnlaceGenerado] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tieneMin8 = nuevaPassword.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(nuevaPassword);
  const tieneMinuscula = /[a-z]/.test(nuevaPassword);
  const tieneNumero = /[0-9]/.test(nuevaPassword);

  // Solicitar enlace con correo
  const handleSolicitarEnlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setEnlaceGenerado('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo procesar la solicitud.');
      } else {
        setMensaje(data.mensaje);
        if (data.resetLink) {
          setEnlaceGenerado(data.resetLink);
        }
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // Guardar nueva contraseña usando el token temporal
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!tieneMin8 || !tieneMayuscula || !tieneMinuscula || !tieneNumero) {
      setError('La nueva contraseña debe cumplir todos los requisitos de seguridad.');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenUrl, nuevaPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al actualizar la contraseña.');
      } else {
        setMensaje('¡Contraseña actualizada con éxito! Redirigiendo al login...');
        setTimeout(() => {
          router.push('/inicio_sesion');
        }, 2000);
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', maxWidth: '460px', width: '100%', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(13, 59, 102, 0.08)', border: '1px solid #E6F2FB' }}>
        <h1 style={{ color: '#0D3B66', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {tokenUrl ? 'Definir Nueva Contraseña' : 'Recuperar Contraseña'}
        </h1>
        <p style={{ color: '#2566A8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {tokenUrl
            ? 'Ingresa tu nueva contraseña segura para restablecer el acceso a tu cuenta.'
            : 'Ingresa el correo electrónico de tu cuenta y generaremos un enlace temporal válido por 15 minutos.'}
        </p>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {mensaje}
            {enlaceGenerado && (
              <div style={{ marginTop: '0.65rem' }}>
                <Link
                  href={enlaceGenerado}
                  style={{ color: '#0D3B66', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Haz clic aquí para abrir tu enlace de restablecimiento →
                </Link>
              </div>
            )}
          </div>
        )}

        {!tokenUrl ? (
          <form onSubmit={handleSolicitarEnlace} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                placeholder="usuario@correo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{ backgroundColor: '#0D3B66', color: '#FFF', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {cargando ? 'Generando enlace...' : 'Solicitar enlace de recuperación'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#0D3B66', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div style={{ backgroundColor: '#E6F2FB', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#0D3B66' }}>
              <strong>Requisitos:</strong>
              <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                <li style={{ color: tieneMin8 ? '#15803D' : '#64748B' }}>{tieneMin8 ? '✔' : '○'} Mínimo 8 caracteres</li>
                <li style={{ color: tieneMayuscula ? '#15803D' : '#64748B' }}>{tieneMayuscula ? '✔' : '○'} Al menos 1 mayúscula</li>
                <li style={{ color: tieneMinuscula ? '#15803D' : '#64748B' }}>{tieneMinuscula ? '✔' : '○'} Al menos 1 minúscula</li>
                <li style={{ color: tieneNumero ? '#15803D' : '#64748B' }}>{tieneNumero ? '✔' : '○'} Al menos 1 número</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{ backgroundColor: '#0D3B66', color: '#FFF', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {cargando ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/inicio_sesion" style={{ color: '#2566A8', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>}>
      <RecuperarPasswordContent />
    </Suspense>
  );
}