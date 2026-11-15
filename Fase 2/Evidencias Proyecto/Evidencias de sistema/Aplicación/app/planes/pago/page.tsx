import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { tienePlanActivo } from '@/lib/suscripcion';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { obtenerPlanesActivos } from '@/lib/planes-bd';
import FormularioPago from './FormularioPago';

export const metadata: Metadata = {
  title: 'Pago | Empleamás',
};

export default async function PagoPage() {
  // Esta ruta exige sesión. Si no hay, mandamos al login para que
  // después del inicio de sesión el usuario vuelva aquí mismo.
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect(`/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`);
  }
  if (await tienePlanActivo(sesion.id_usuario)) {
    redirect('/planes');
  }

  // Planes de pago activos desde public.plan; el resumen muestra el destacado.
  const planes = (await obtenerPlanesActivos()).filter((p) => p.costo > 0);
  const planResumen = planes.find((p) => p.destacado) ?? planes[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-[#c3c6d0]/60 bg-white px-5 py-3">
        <span className="rounded-md bg-[#e6f2fb] px-2 py-1 text-[11px] font-bold uppercase text-[#002546]">
          Paso 2 de 2
        </span>
        <span className="text-sm font-semibold text-[#002546]">Finaliza tu compra</span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="metodo-titulo" className="rounded-2xl border border-[#c3c6d0]/60 bg-white p-6 md:p-8">
          <h1 id="metodo-titulo" className="mb-4 text-2xl font-extrabold text-[#002546]">
            Elige tu plan
          </h1>
          <FormularioPago planes={planes} />
        </section>

        <aside aria-labelledby="resumen-titulo" className="flex flex-col gap-6 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#42474f]">Tu selección</p>
              <h2 id="resumen-titulo" className="mt-1 text-xl font-extrabold text-[#002546]">
                {planResumen?.nombre ?? 'Plan Pro'}
              </h2>
              <p className="text-xs text-[#42474f]">Pago único · sin renovación automática</p>
            </div>
            <Link href="/planes" className="text-xs font-bold text-[#006689] hover:underline">
              Ver planes
            </Link>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#42474f]">
              Se activará apenas se apruebe el pago
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {(planResumen?.beneficios ?? []).map((texto, i) => (
                <li key={`${i}-${texto}`} className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#002546]">
                    check_circle
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
