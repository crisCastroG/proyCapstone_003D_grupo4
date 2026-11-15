import type { ReactNode } from 'react';

export default function TarjetaKpi({
  titulo, valor, detalle, icono,
}: { titulo: string; valor: string; detalle?: ReactNode; icono: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#c3c6d0]/30 shadow-[0px_4px_20px_rgba(13,59,102,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#42474f]/70">{titulo}</p>
        <span aria-hidden="true" className="material-symbols-outlined text-[#006689] text-xl">{icono}</span>
      </div>
      <p className="text-3xl font-extrabold text-[#002547] mt-2 tracking-tight">{valor}</p>
      {detalle && <p className="text-xs text-[#42474f] mt-1">{detalle}</p>}
    </div>
  );
}
