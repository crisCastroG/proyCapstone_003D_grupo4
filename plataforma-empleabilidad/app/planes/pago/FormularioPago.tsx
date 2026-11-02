'use client';

import { useActionState, useState } from 'react';
import { ETIQUETA_METODO, METODOS_PAGO, type MetodoPago } from '@/lib/planes';
import { iniciarPago } from './actions';

const DESCRIPCION_METODO: Record<MetodoPago, string> = {
  credito: 'Visa, Mastercard, American Express y otras tarjetas de crédito.',
  debito: 'Tarjetas de débito de bancos nacionales.',
};

const ICONO_METODO: Record<MetodoPago, string> = {
  credito: 'credit_card',
  debito: 'account_balance',
};

export default function FormularioPago() {
  // useActionState (React 19) conecta el formulario con la Server Action:
  // `estado` guarda lo que la acción devuelve (un error) y `pendiente` indica
  // que la acción se está ejecutando, para deshabilitar el botón.
  const [estado, accion, pendiente] = useActionState(iniciarPago, null);
  const [metodo, setMetodo] = useState<MetodoPago>('credito');

  return (
    <form action={accion} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm text-[#42474f]">
          Selecciona cómo quieres pagar. Te llevaremos a una plataforma segura para completar
          la transacción.
        </legend>

        {METODOS_PAGO.map((m) => {
          const seleccionado = metodo === m;
          return (
            <label
              key={m}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                seleccionado
                  ? 'border-2 border-[#002546] bg-[#e6f2fb]/50'
                  : 'border-[#c3c6d0]/70 hover:border-[#002546]/50'
              }`}
            >
              <input
                type="radio"
                name="metodo"
                value={m}
                checked={seleccionado}
                onChange={() => setMetodo(m)}
                className="h-4 w-4 accent-[#002546]"
              />
              <span
                aria-hidden="true"
                className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#002546] shadow-sm"
              >
                {ICONO_METODO[m]}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-[#002546]">{ETIQUETA_METODO[m]}</span>
                <span className="text-xs text-[#42474f]">{DESCRIPCION_METODO[m]}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex gap-3 rounded-xl bg-[#f1f4f6] p-4 text-xs text-[#42474f]">
        <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[#002546]">
          lock
        </span>
        <p>
          <strong className="block text-[#002546]">Redirección cifrada y segura</strong>
          Empleamás no recibe ni guarda los datos de tu tarjeta. Los ingresarás directamente en
          la plataforma del proveedor de pagos.
        </p>
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#002546] px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0d3b66] disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? 'Procesando…' : 'Continuar al pago'}
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </button>
      <p className="text-center text-xs text-[#42474f]">
        Transacción protegida. Puedes cancelar tu suscripción en cualquier momento.
      </p>
    </form>
  );
}
