'use client';

type TarjetaProgresoProps = {
  completados: number;
  total: number;
  porcentaje: number;
  variant?: 'banner' | 'sidebar';
};

export default function TarjetaProgreso({
  completados,
  total,
  porcentaje,
  variant = 'banner',
}: TarjetaProgresoProps) {
  const pct = Math.min(100, Math.max(0, Math.round(porcentaje || 0)));

  if (variant === 'sidebar') {
    return (
      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#002547] text-lg">
            account_circle
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#002547]">Progreso</h4>
            <p className="text-[11px] text-[#38BDF5] font-semibold">{pct}% completado</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-[#002547] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-[#737780] block mt-1.5 text-right">
          {completados} de {total} completados
        </span>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/3 flex flex-col gap-2 min-w-[250px]">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-[#002547]">Progreso General</span>
        <span className="text-xs font-extrabold text-[#38BDF5]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-[#E6F2FB] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#38BDF5] to-[#002547] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-medium text-[#42474f] text-right">
        {completados} de {total} contenidos completados
      </span>
    </div>
  );
}