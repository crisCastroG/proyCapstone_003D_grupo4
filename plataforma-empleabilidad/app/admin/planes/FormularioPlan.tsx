'use client';

import { useActionState, useEffect, useState } from 'react';
import type { PlanBD } from '@/lib/planes-bd';
import { guardarPlan, type EstadoFormPlan } from './actions';

type Props = {
  // Si viene, el formulario edita ese plan; si no, crea uno nuevo.
  plan?: PlanBD;
};

const claseInput =
  'w-full rounded-lg border border-[#c3c6d0] bg-white px-3 py-2 text-sm text-[#181c1e] focus:border-[#006689] focus:outline-none';
const claseEtiqueta = 'mb-1 block text-xs font-bold uppercase tracking-wider text-[#42474f]';

export default function FormularioPlan({ plan }: Props) {
  const [estado, accion, pendiente] = useActionState<EstadoFormPlan, FormData>(guardarPlan, null);
  const [abierto, setAbierto] = useState(false);

  // Si se guardó bien, se cierra el formulario.
  useEffect(() => {
    if (estado?.ok) setAbierto(false);
  }, [estado]);

  if (!abierto) {
    return plan ? (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-xs font-bold text-[#006689] hover:underline"
      >
        Editar
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-lg bg-[#002546] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0d3b66]"
      >
        + Nuevo plan
      </button>
    );
  }

  return (
    <form
      action={accion}
      className="flex w-full flex-col gap-4 rounded-xl border border-[#c3c6d0]/40 bg-[#f7fafc] p-5"
    >
      {plan && <input type="hidden" name="id_plan" value={plan.id} />}

      <div>
        <label className={claseEtiqueta} htmlFor={`nombre-${plan?.id ?? 'nuevo'}`}>
          Nombre
        </label>
        <input
          id={`nombre-${plan?.id ?? 'nuevo'}`}
          name="nombre_plan"
          required
          maxLength={80}
          defaultValue={plan?.nombre ?? ''}
          className={claseInput}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={claseEtiqueta} htmlFor={`costo-${plan?.id ?? 'nuevo'}`}>
            Precio (CLP, 0 = gratuito)
          </label>
          <input
            id={`costo-${plan?.id ?? 'nuevo'}`}
            name="costo_plan"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={plan?.costo ?? 0}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseEtiqueta} htmlFor={`duracion-${plan?.id ?? 'nuevo'}`}>
            Duración (días)
          </label>
          <input
            id={`duracion-${plan?.id ?? 'nuevo'}`}
            name="duracion_plan"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={plan?.duracionDias ?? 30}
            className={claseInput}
          />
        </div>
      </div>

      <div>
        <label className={claseEtiqueta} htmlFor={`descripcion-${plan?.id ?? 'nuevo'}`}>
          Descripción
        </label>
        <textarea
          id={`descripcion-${plan?.id ?? 'nuevo'}`}
          name="descripcion_plan"
          rows={2}
          defaultValue={plan?.descripcion ?? ''}
          className={claseInput}
        />
      </div>

      <div>
        <label className={claseEtiqueta} htmlFor={`beneficios-${plan?.id ?? 'nuevo'}`}>
          Beneficios (uno por línea)
        </label>
        <textarea
          id={`beneficios-${plan?.id ?? 'nuevo'}`}
          name="beneficios"
          rows={4}
          defaultValue={plan?.beneficios.join('\n') ?? ''}
          className={claseInput}
        />
      </div>

      <div className="flex flex-wrap gap-6 text-sm font-semibold text-[#181c1e]">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="destacado" defaultChecked={plan?.destacado ?? false} />
          Destacado (Recomendado)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="esta_activo" defaultChecked={plan?.estaActivo ?? true} />
          Activo (visible en /planes)
        </label>
      </div>

      {estado && !estado.ok && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {estado.mensaje}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-lg border border-[#c3c6d0] px-4 py-2 text-xs font-bold text-[#42474f] hover:bg-[#f1f4f6]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-[#002546] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0d3b66] disabled:opacity-60"
        >
          {pendiente ? 'Guardando…' : plan ? 'Guardar cambios' : 'Crear plan'}
        </button>
      </div>
    </form>
  );
}
