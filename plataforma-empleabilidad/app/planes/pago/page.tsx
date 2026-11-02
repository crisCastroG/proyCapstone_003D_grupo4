import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { tienePlanActivo } from '@/lib/suscripcion';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { formatearClp, PLAN_PRO } from '@/lib/planes';
import FormularioPago from './FormularioPago';

export const metadata: Metadata = {
  title: 'Método de pago | Empleamás',
};

export default async function PagoPage() {
  // Esta ruta exige sesión. Si no hay, mandamos al login con ?next= para que
  // después del inicio de sesión el usuario vuelva aquí mismo.
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect(`/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`);
  }
  if (await tienePlanActivo(sesion.id_usuario)) {
    redirect('/planes');
  }

  const precio = formatearClp(PLAN_PRO.precioMensualClp);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-[#c3c6d0]/60 bg-white px-5 py-3">
        <span className="rounded-md bg-[#e6f2fb] px-2 py-1 text-[11px] font-bold uppercase text-[#002546]">
          Paso 2 de 2
        </span>
        <span className="text-sm font-semibold text-[#002546]">Finaliza tu suscripción</span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="metodo-titulo" className="rounded-2xl border border-[#c3c6d0]/60 bg-white p-6 md:p-8">
          <h1 id="metodo-titulo" className="mb-4 text-2xl font-extrabold text-[#002546]">
            Método de pago
          </h1>
          <FormularioPago />
        </section>

        <aside aria-labelledby="resumen-titulo" className="flex flex-col gap-6 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#42474f]">Tu selección</p>
              <h2 id="resumen-titulo" className="mt-1 text-xl font-extrabold text-[#002546]">
                {PLAN_PRO.nombre}
              </h2>
              <p className="text-xs text-[#42474f]">Facturación mensual automática</p>
            </div>
            <Link href="/planes" className="text-xs font-bold text-[#006689] hover:underline">
              Cambiar plan
            </Link>
          </div>

          <dl className="flex flex-col gap-2 border-t border-[#c3c6d0]/40 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#42474f]">Suscripción mensual</dt>
              <dd className="font-semibold text-[#181c1e]">{precio}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between rounded-xl bg-[#e6f2fb] px-4 py-3">
            <span className="text-sm font-bold text-[#002546]">Total a pagar hoy</span>
            <span className="text-2xl font-extrabold text-[#002546]">{precio}</span>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#42474f]">
              Se activará de inmediato
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {PLAN_PRO.beneficios.map((b) => (
                <li key={b.texto} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#002546]">
                    check_circle
                  </span>
                  {b.texto}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
