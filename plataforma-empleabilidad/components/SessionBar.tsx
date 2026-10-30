'use client';

import { useRouter } from 'next/navigation';
import { SessionPayload } from '@/lib/auth';

export default function SessionBar({ usuario }: { usuario: SessionPayload }) {
  const router = useRouter();

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/inicio_sesion');
    router.refresh();
  };

  return (
    <header
      style={{
        backgroundColor: '#0D3B66',
        color: '#FFFFFF',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #38BDF5',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          Emplea<span style={{ color: '#38BDF5' }}>más</span>
        </span>
        <span
          style={{
            backgroundColor: 'rgba(56, 189, 245, 0.2)',
            color: '#38BDF5',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ width: '8px', height: '8px', backgroundColor: '#4ADE80', borderRadius: '50%', display: 'inline-block' }} />
          Sesión Activa • Rol: {usuario.rol.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600 }}>{usuario.nombre}</div>
          <div style={{ color: '#E6F2FB', fontSize: '0.75rem' }}>{usuario.correo}</div>
        </div>
        <button
          onClick={cerrarSesion}
          style={{
            backgroundColor: '#2566A8',
            color: '#FFFFFF',
            border: '1px solid #38BDF5',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}