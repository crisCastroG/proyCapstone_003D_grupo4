import type { Metadata } from 'next';
import { obtenerSesionActual } from '@/lib/auth';
import { tienePlanActivo } from '@/lib/suscripcion';
import { RUTA_CHECKOUT } from '@/lib/redirect';
import { COMPARATIVA, PREGUNTAS_FRECUENTES } from '@/lib/planes';
import { obtenerPlanesActivos, type PlanBD } from '@/lib/planes-bd';
import TarjetaPlan from './_components/TarjetaPlan';

export const metadata: Metadata = {
  title: 'Planes | Empleamás',
  description: 'Compara el plan gratuito y el plan Pro de Empleamás.',
};

export default async function PlanesPage() {
  const sesion = await obtenerSesionActual();
  const esPro = sesion ? await tienePlanActivo(sesion.id_usuario) : false;
  const planes = await obtenerPlanesActivos();

  // El botón "Comprar" depende de quién está mirando:
  // - sin sesión: va al login y, después, vuelve al checkout gracias a ?next=
  // - con sesión y sin plan: va directo al checkout
  // - con plan vigente: no se puede volver a comprar
  const loginConRetorno = `/inicio_sesion?next=${encodeURIComponent(RUTA_CHECKOUT)}`;
  const accionPro = esPro
    ? ({ tipo: 'deshabilitado', texto: 'Tu plan actual' } as const)
    : ({ tipo: 'enlace', href: sesion ? RUTA_CHECKOUT : loginConRetorno, texto: 'Comprar plan Pro' } as const);

  const accionGratis = sesion
    ? ({ tipo: 'deshabilitado', texto: esPro ? 'Incluido en tu plan' : 'Tu plan actual' } as const)
    : ({ tipo: 'enlace', href: '/registro', texto: 'Crear cuenta gratis' } as const);

  // Los planes de costo 0 usan la acción "gratis"; los de pago, la de compra.
  const accionPara = (plan: PlanBD) => (plan.costo === 0 ? accionGratis : accionPro);

  return (
    <div className="flex flex-col gap-20">
      {/* Encabezado */}
      <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="rounded-full bg-[#e6f2fb] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#002546]">
          Invierte en tu futuro laboral
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#002546] md:text-4xl">
          Elige el plan ideal para acelerar tu reinserción laboral
        </h1>
        <p className="mt-4 text-[#42474f]">
          Comienza sin costo con el módulo introductorio o desbloquea todos los módulos con el
          plan Pro.
        </p>
      </section>

      {/* Tarjetas */}
      {planes.length === 0 ? (
        <p className="text-center text-sm text-[#42474f]">No hay planes disponibles por ahora.</p>
      ) : (
        <section
          aria-label="Planes disponibles"
          className={`mx-auto grid w-full gap-8 ${
            planes.length >= 3 ? 'max-w-5xl md:grid-cols-3' : 'max-w-3xl md:grid-cols-2'
          }`}
        >
          {planes.map((plan) => (
            <TarjetaPlan
              key={plan.id}
              plan={plan}
              accion={accionPara(plan)}
              nota={
                plan.costo > 0 && !sesion ? 'Te pediremos iniciar sesión o crear una cuenta.' : undefined
              }
            />
          ))}
        </section>
      )}

      {/* Comparativa */}
      <section aria-labelledby="comparativa-titulo" className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#006689]">Análisis detallado</p>
          <h2 id="comparativa-titulo" className="mt-2 text-2xl font-extrabold text-[#002546]">
            Comparativa de características
          </h2>
        </div>
        <div className="w-full max-w-3xl overflow-x-auto rounded-2xl border border-[#c3c6d0]/60 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#c3c6d0]/60">
                <th scope="col" className="px-5 py-4 font-bold text-[#002546]">Característica</th>
                <th scope="col" className="px-5 py-4 text-center font-bold text-[#002546]">Gratuito</th>
                <th scope="col" className="bg-[#e6f2fb] px-5 py-4 text-center font-bold text-[#002546]">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA.map((fila) => (
                <tr key={fila.caracteristica} className="border-b border-[#c3c6d0]/30 last:border-0">
                  <th scope="row" className="px-5 py-4 font-medium text-[#181c1e]">
                    {fila.caracteristica}
                  </th>
                  <CeldaIncluido incluido={fila.gratuito} />
                  <CeldaIncluido incluido={fila.pro} destacada />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Preguntas frecuentes: <details> funciona sin JavaScript */}
      <section aria-labelledby="faq-titulo" className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#006689]">Resolvemos tus dudas</p>
          <h2 id="faq-titulo" className="mt-2 text-2xl font-extrabold text-[#002546]">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {PREGUNTAS_FRECUENTES.map((item) => (
            <details
              key={item.pregunta}
              className="group rounded-xl border border-[#c3c6d0]/60 bg-white px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#002546]">
                {item.pregunta}
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180"
                >
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#42474f]">{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function CeldaIncluido({ incluido, destacada = false }: { incluido: boolean; destacada?: boolean }) {
  return (
    <td className={`px-5 py-4 text-center ${destacada ? 'bg-[#e6f2fb]/60' : ''}`}>
      {incluido ? (
        <span className="material-symbols-outlined text-[20px] text-[#002546]" aria-label="Incluido">
          check_circle
        </span>
      ) : (
        <span className="text-[#9aa0a8]" aria-label="No incluido">—</span>
      )}
    </td>
  );
}
