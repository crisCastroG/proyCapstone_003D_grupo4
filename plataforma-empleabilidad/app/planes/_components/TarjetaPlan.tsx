import Link from 'next/link';
import { formatearClp, type Plan } from '@/lib/planes';

type Accion =
  | { tipo: 'enlace'; href: string; texto: string }
  | { tipo: 'deshabilitado'; texto: string };

type Props = {
  plan: Plan;
  destacado?: boolean;
  accion: Accion;
  // Texto pequeño bajo el botón, por ejemplo "Te pediremos iniciar sesión".
  nota?: string;
};

export default function TarjetaPlan({ plan, destacado = false, accion, nota }: Props) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-white p-7 ${
        destacado
          ? 'border-2 border-[#002546] shadow-xl md:-translate-y-3'
          : 'border border-[#c3c6d0]/60 shadow-sm'
      }`}
    >
      {destacado && (
        <span className="absolute -top-3 right-6 rounded-full bg-[#002546] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {plan.etiqueta}
        </span>
      )}

      <span
        className={`self-start rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
          destacado ? 'bg-[#e6f2fb] text-[#002546]' : 'bg-[#f1f4f6] text-[#42474f]'
        }`}
      >
        {destacado ? plan.nombre : plan.etiqueta}
      </span>

      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-[#002546]">
          {formatearClp(plan.precioMensualClp)}
        </span>
        <span className="text-sm text-[#42474f]">/ mes</span>
      </p>
      <p className="mt-3 text-sm text-[#42474f]">{plan.descripcion}</p>

      <ul className="mt-6 flex flex-col gap-3 border-t border-[#c3c6d0]/40 pt-6 text-sm">
        {plan.beneficios.map((b) => (
          <li
            key={b.texto}
            className={`flex items-start gap-2 ${b.incluido ? 'text-[#181c1e]' : 'text-[#9aa0a8]'}`}
          >
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[18px] ${
                b.incluido ? 'text-[#002546]' : 'text-[#c3c6d0]'
              }`}
            >
              {b.incluido ? 'check_circle' : 'block'}
            </span>
            <span>
              <span className="sr-only">{b.incluido ? 'Incluido: ' : 'No incluido: '}</span>
              {b.texto}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        {accion.tipo === 'enlace' ? (
          <Link
            href={accion.href}
            className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-bold transition-colors ${
              destacado
                ? 'bg-[#002546] text-white hover:bg-[#0d3b66]'
                : 'border border-[#002546]/30 text-[#002546] hover:bg-[#e6f2fb]'
            }`}
          >
            {accion.texto}
          </Link>
        ) : (
          <span className="block w-full cursor-default rounded-lg bg-[#e6f2fb] px-4 py-3 text-center text-sm font-bold text-[#002546]">
            {accion.texto}
          </span>
        )}
        {nota && <p className="mt-2 text-center text-xs text-[#42474f]">{nota}</p>}
      </div>
    </article>
  );
}
