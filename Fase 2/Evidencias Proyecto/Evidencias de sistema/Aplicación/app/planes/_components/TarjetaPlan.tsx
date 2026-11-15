import Link from 'next/link';
import { formatearClp, textoDuracion } from '@/lib/planes';
import type { PlanBD } from '@/lib/planes-bd';

type Accion =
  | { tipo: 'enlace'; href: string; texto: string }
  | { tipo: 'deshabilitado'; texto: string };

type Props = {
  plan: PlanBD;
  accion: Accion;
  nota?: string;
};

export default function TarjetaPlan({ plan, accion, nota }: Props) {
  // Administrador puede marcar un plan como destacado desde la pagina de admin
  const destacado = plan.destacado;
  const esGratis = plan.costo === 0;

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
          Recomendado
        </span>
      )}

      <span
        className={`self-start rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
          destacado ? 'bg-[#e6f2fb] text-[#002546]' : 'bg-[#f1f4f6] text-[#42474f]'
        }`}
      >
        {plan.nombre}
      </span>

      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-[#002546]">
          {esGratis ? 'Gratis' : formatearClp(plan.costo)}
        </span>
        {!esGratis && (
          <span className="text-sm text-[#42474f]">{textoDuracion(plan.duracionDias)}</span>
        )}
      </p>
      {plan.descripcion && <p className="mt-3 text-sm text-[#42474f]">{plan.descripcion}</p>}

      {plan.beneficios.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3 border-t border-[#c3c6d0]/40 pt-6 text-sm">
          {plan.beneficios.map((texto, i) => (
            <li key={`${i}-${texto}`} className="flex items-start gap-2 text-[#181c1e]">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#002546]">
                check_circle
              </span>
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      )}

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
