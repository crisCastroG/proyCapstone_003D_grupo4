import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { ETIQUETA_METODO, esMetodoPago, formatearClp, PLAN_PRO } from '@/lib/planes';

export const metadata: Metadata = {
  title: 'Bienvenido a Pro | Empleamás',
};

type Props = {
  // En Next 16, searchParams es una Promise y hay que esperarla con await.
  searchParams: Promise<{ [clave: string]: string | string[] | undefined }>;
};

export default async function ConfirmacionPage({ searchParams }: Props) {
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect(`/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`);
  }

  const { metodo, demo } = await searchParams;
  const esDemo = demo === '1';
  // TODO(proveedor de pagos): cuando exista el pago real, estos datos se deben
  // leer de public.pago / public.plan_usuario usando el id de la transacción,
  // y no desde la URL (cualquiera puede escribir la URL a mano).
  const metodoTexto = esMetodoPago(metodo) ? ETIQUETA_METODO[metodo] : 'Tarjeta';
  const fecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date());

  return (
    <div className="flex flex-col gap-14">
      {esDemo && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm font-semibold text-amber-800">
          Modo demostración: no se realizó ningún cobro y el plan no se activó.
        </p>
      )}

      <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-[#002546] text-3xl text-white"
        >
          verified
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#006689]">
          Transacción exitosa · Membresía activa
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#002546] md:text-4xl">
          ¡Bienvenido a EmpleaMás Pro, {sesion.nombre}!
        </h1>
        <p className="mt-4 text-[#42474f]">
          Tu suscripción está activa. Ya puedes entrar a todos los módulos de contenido grabado y
          avanzar aprobando cada prueba.
        </p>
      </section>

      <dl className="mx-auto grid w-full max-w-3xl gap-4 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-[#42474f]">Fecha</dt>
          <dd className="mt-1 font-bold text-[#002546]">{fecha}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#42474f]">Método de pago</dt>
          <dd className="mt-1 font-bold text-[#002546]">{metodoTexto}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#42474f]">Total</dt>
          <dd className="mt-1 font-bold text-[#002546]">
            {formatearClp(PLAN_PRO.precioMensualClp)} <span className="text-xs font-normal">/ mes</span>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="pasos-titulo" className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <h2 id="pasos-titulo" className="text-xl font-extrabold text-[#002546]">
          Primeros pasos en la plataforma
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="flex flex-col gap-3 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6">
            <span aria-hidden="true" className="material-symbols-outlined text-[#002546]">play_circle</span>
            <h3 className="font-bold text-[#002546]">Explora los módulos</h3>
            <p className="text-sm text-[#42474f]">
              Avanza módulo a módulo. Al aprobar cada prueba con 80% o más se desbloquea el
              siguiente.
            </p>
            <Link
              href="/modulos"
              className="mt-auto flex items-center justify-between rounded-lg bg-[#e6f2fb] px-4 py-3 text-sm font-bold text-[#002546] hover:bg-[#d6e8f7]"
            >
              Ir a los módulos
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </article>
          <article className="flex flex-col gap-3 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6">
            <span aria-hidden="true" className="material-symbols-outlined text-[#002546]">person</span>
            <h3 className="font-bold text-[#002546]">Configura tu perfil</h3>
            <p className="text-sm text-[#42474f]">
              Completa tu perfil profesional para aprovechar mejor la plataforma.
            </p>
            {/* TODO: no existe aún una ruta de perfil. */}
            <span className="mt-auto rounded-lg bg-[#f1f4f6] px-4 py-3 text-sm font-bold text-[#9aa0a8]">
              Próximamente
            </span>
          </article>
        </div>
      </section>
    </div>
  );
}
