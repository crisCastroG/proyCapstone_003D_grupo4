import { obtenerTodosLosPlanes } from '@/lib/planes-bd';
import { formatearClp, textoDuracion } from '@/lib/planes';
import { cambiarEstadoPlan } from './actions';
import FormularioPlan from './FormularioPlan';

export default async function Page() {
  const planes = await obtenerTodosLosPlanes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-[#c3c6d0]/30 shadow-sm">
        <div>
          <span className="text-xs font-bold text-[#006689] uppercase tracking-wider">
            Panel de Administración
          </span>
          <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">Gestión de Planes</h1>
          <p className="text-sm font-medium text-[#42474f] mt-1">
            Los planes activos se muestran en /planes. Desactiva un plan en vez de borrarlo: puede tener
            pagos asociados.
          </p>
        </div>

        <FormularioPlan />
      </div>

      {planes.length === 0 ? (
        <p className="rounded-xl border border-[#c3c6d0]/30 bg-white p-6 text-sm text-[#42474f]">
          Todavía no hay planes. Crea el primero con &quot;+ Nuevo plan&quot;.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {planes.map((plan) => (
            <li
              key={plan.id}
              className={`flex flex-col gap-4 rounded-xl border border-[#c3c6d0]/30 bg-white p-5 shadow-sm ${
                plan.estaActivo ? '' : 'opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[#002547]">{plan.nombre}</h2>
                    {plan.destacado && (
                      <span className="rounded-full bg-[#E6F2FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#002546]">
                        Destacado
                      </span>
                    )}
                    {!plan.estaActivo && (
                      <span className="rounded-full bg-[#f1f4f6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#42474f]">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#42474f]">
                    <span className="font-semibold text-[#181c1e]">
                      {plan.costo === 0
                        ? 'Gratis'
                        : `${formatearClp(plan.costo)} ${textoDuracion(plan.duracionDias)}`}
                    </span>
                    {' · '}
                    {plan.beneficios.length} {plan.beneficios.length === 1 ? 'beneficio' : 'beneficios'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <form action={cambiarEstadoPlan.bind(null, plan.id, !plan.estaActivo)}>
                    <button
                      type="submit"
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                        plan.estaActivo
                          ? 'border-[#FCA5A5] text-[#991B1B] hover:bg-red-50'
                          : 'border-[#86EFAC] text-[#166534] hover:bg-green-50'
                      }`}
                    >
                      {plan.estaActivo ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                </div>
              </div>

              <FormularioPlan plan={plan} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
