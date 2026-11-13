import type { ItemCategoria } from '@/lib/metricas';

export default function BarrasHorizontales({
  datos, titulo, vacio,
}: { datos: ItemCategoria[]; titulo: string; vacio: string }) {
  const total = datos.reduce((s, d) => s + d.valor, 0);
  const max = Math.max(...datos.map((d) => d.valor), 0);

  return (
    <figure className="bg-white p-5 rounded-xl border border-[#c3c6d0]/30">
      <figcaption className="text-sm font-bold text-[#002547] mb-3">{titulo}</figcaption>
      {total === 0 ? (
        <p className="text-sm text-[#42474f] py-6 text-center">{vacio}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {datos.map((d) => (
            <li key={d.etiqueta}>
              <div className="flex justify-between text-xs font-semibold text-[#42474f] mb-1">
                <span className="capitalize">{d.etiqueta}</span>
                <span>{d.valor} ({Math.round((d.valor / total) * 100)}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#f1f4f6]">
                <div className="h-2.5 rounded-full bg-[#006689]" style={{ width: `${(d.valor / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
