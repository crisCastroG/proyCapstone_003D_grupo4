'use client';

import { useState } from 'react';

export default function DarseDeBaja({ planVigenteHasta }: { planVigenteHasta: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cancelar = () => {
    setAbierto(false);
    setPassword('');
    setMotivo('');
    setError('');
  };

  const confirmarBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/baja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, motivo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo dar de baja la cuenta.');
        setCargando(false);
        return;
      }

        window.location.href = '/inicio_sesion';
        window.location.href = '/cuenta_desactivada';
    } catch {
      setError('No se pudo conectar con el servidor.');
      setCargando(false);
    }
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm font-semibold text-[#991B1B] border border-[#FCA5A5] hover:bg-[#FEF2F2] px-4 py-2 rounded-lg transition-colors"
      >
        Darme de baja
      </button>
    );
  }

  return (
    <form onSubmit={confirmarBaja} className="flex flex-col gap-4 max-w-md">
      <p className="text-sm text-[#42474f]">
        Tu cuenta quedará desactivada y no podrás volver a iniciar sesión. Tus datos no se borran, pero
        para reactivarla tendrás que contactar al equipo de Empleamás.
      </p>

      {planVigenteHasta && (
        <p className="text-sm font-semibold text-[#92400E] bg-[#FEF3C7] px-3 py-2 rounded-lg">
          Tienes un plan de pago vigente hasta el {planVigenteHasta}. Al darte de baja dejarás de tener acceso a él.
        </p>
      )}

      {error && (
        <div className="bg-[#FEE2E2] text-[#991B1B] text-sm font-medium px-3 py-2 rounded-lg">{error}</div>
      )}

      <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
        Confirma tu contraseña
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="border border-[#CBD5E1] rounded-lg px-3 py-2 font-normal"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
        ¿Por qué te vas? (opcional)
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={500}
          rows={3}
          className="border border-[#CBD5E1] rounded-lg px-3 py-2 font-normal"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={cargando}
          className="text-sm font-bold text-white bg-[#B91C1C] hover:bg-[#991B1B] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {cargando ? 'Procesando...' : 'Confirmar baja'}
        </button>
        <button
          type="button"
          onClick={cancelar}
          disabled={cargando}
          className="text-sm font-semibold text-[#42474f] border border-[#c3c6d0] hover:bg-[#f1f4f6] px-4 py-2 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}