'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { formatearClp } from '@/lib/planes';
import type { PlanPro } from '@/lib/pagos';
import { iniciarPago } from './actions';

type Props = {
  planes: PlanPro[];
};

export default function FormularioPago({ planes }: Props) {
  // useActionState (React 19) conecta el formulario con la Server Action:
  // `estado` guarda lo que la acción devuelve (error o datos de Webpay) y
  // `pendiente` indica que la acción se está ejecutando, para deshabilitar el botón.
  const [estado, accion, pendiente] = useActionState(iniciarPago, null);
  const [idPlan, setIdPlan] = useState<number | undefined>(planes[0]?.id);

  // Webpay pide recibir el token por POST en su URL. Cuando la acción devuelve
  // url + token, este formulario oculto se envía solo y lleva al usuario a Webpay.
  const formularioWebpay = useRef<HTMLFormElement>(null);
  const irAWebpay = estado !== null && 'url' in estado ? estado : null;

  useEffect(() => {
    if (irAWebpay) formularioWebpay.current?.submit();
  }, [irAWebpay]);

  if (planes.length === 0) {
    return (
      <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
        No hay planes disponibles por ahora.
      </p>
    );
  }

  return (
    <>
      <form action={accion} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm text-[#42474f]">
            Elige por cuánto tiempo quieres el plan Pro. Es un pago único, sin renovación automática.
          </legend>

          {planes.map((plan) => {
            const seleccionado = idPlan === plan.id;
            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                  seleccionado
                    ? 'border-2 border-[#002546] bg-[#e6f2fb]/50'
                    : 'border-[#c3c6d0]/70 hover:border-[#002546]/50'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={seleccionado}
                  onChange={() => setIdPlan(plan.id)}
                  className="h-4 w-4 accent-[#002546]"
                />
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-bold text-[#002546]">{plan.nombre}</span>
                  {plan.descripcion && (
                    <span className="text-xs text-[#42474f]">{plan.descripcion}</span>
                  )}
                </span>
                <span className="text-lg font-extrabold text-[#002546]">{formatearClp(plan.costo)}</span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex gap-3 rounded-xl bg-[#f1f4f6] p-4 text-xs text-[#42474f]">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[#002546]">
            lock
          </span>
          <p>
            <strong className="block text-[#002546]">Pago seguro con Webpay</strong>
            Empleamás no recibe ni guarda los datos de tu tarjeta. Los ingresarás directamente en
            Webpay, donde puedes pagar con crédito, débito o prepago.
          </p>
        </div>

        {estado !== null && 'error' in estado && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente || irAWebpay !== null}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#002546] px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0d3b66] disabled:cursor-wait disabled:opacity-60"
        >
          {pendiente || irAWebpay ? 'Conectando con Webpay…' : 'Continuar al pago'}
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
        <p className="text-center text-xs text-[#42474f]">
          Ambiente de pruebas de Transbank: no se realiza ningún cobro real.
        </p>
      </form>

      {/* Va FUERA del formulario principal: un <form> no puede ir dentro de otro. */}
      {irAWebpay && (
        <form ref={formularioWebpay} method="POST" action={irAWebpay.url} className="hidden">
          <input type="hidden" name="token_ws" value={irAWebpay.token} />
        </form>
      )}
    </>
  );
}
