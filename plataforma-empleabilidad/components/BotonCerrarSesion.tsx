'use client';

import { useState } from 'react';

export default function BotonCerrarSesion({ className = '' }: { className?: string }) {
  const [cargando, setCargando] = useState(false);

  const cerrarSesion = async () => {
    setCargando(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // Navegación completa: evita que el router de Next reutilice una página en caché
      window.location.assign('/inicio_sesion');
    }
  };

  return (
    <button type="button" onClick={cerrarSesion} disabled={cargando} className={className}>
      {cargando ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}