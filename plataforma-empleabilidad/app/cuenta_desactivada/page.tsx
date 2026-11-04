import Link from 'next/link';
import RedireccionAutomatica from './RedireccionAutomatica';

export const metadata = {
  title: 'Cuenta desactivada - Empleamás',
};

// Página pública: la sesión ya fue cerrada cuando el usuario llega aquí.
export default function CuentaDesactivadaPage() {
  return (
    <div className="flex-grow flex items-center justify-center bg-[#f7fafc] px-6 py-12">
      <div className="bg-white max-w-md w-full p-8 rounded-xl border border-[#E6F2FB] shadow-[0px_8px_24px_rgba(13,59,102,0.08)] text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center text-2xl font-bold"
        >
          ✓
        </div>

        <h1 className="text-2xl font-extrabold text-[#0D3B66] mb-2">Tu cuenta ha sido dada de baja</h1>
        <p className="text-sm text-[#42474f] mb-5">
          Desactivamos tu cuenta correctamente y cerramos tu sesión. Si más adelante quieres volver,
          contacta al equipo de Empleamás para reactivarla.
        </p>

        <RedireccionAutomatica destino="/" segundos={10} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/"
            className="text-sm font-bold text-white bg-[#0D3B66] hover:bg-[#2566A8] px-5 py-2.5 rounded-lg transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/inicio_sesion"
            className="text-sm font-semibold text-[#0D3B66] border border-[#c3c6d0] hover:bg-[#f1f4f6] px-5 py-2.5 rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}