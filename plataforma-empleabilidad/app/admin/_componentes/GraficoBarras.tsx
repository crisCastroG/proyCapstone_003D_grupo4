import type { PuntoMes } from '@/lib/metricas';

// Gráfico de barras verticales en SVG (sin librerías). Las barras parten siempre de cero.
export default function GraficoBarras({
  datos, titulo, formato = (v) => String(v),
}: { datos: PuntoMes[]; titulo: string; formato?: (v: number) => string }) {
  const W = 480, H = 220, izq = 8, abajo = 28, arriba = 24;
  const max = Math.max(...datos.map((d) => d.valor), 0);
  const area = H - abajo - arriba;
  const paso = (W - izq * 2) / Math.max(datos.length, 1);
  const ancho = Math.min(48, paso * 0.6);

  return (
    <figure className="bg-white p-5 rounded-xl border border-[#c3c6d0]/30">
      <figcaption className="text-sm font-bold text-[#002547] mb-3">{titulo}</figcaption>
      {max === 0 ? (
        <p className="text-sm text-[#42474f] py-10 text-center">Aún no hay datos en este período.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={titulo} className="w-full h-auto">
          <line x1={izq} x2={W - izq} y1={H - abajo} y2={H - abajo} stroke="#c3c6d0" />
          {datos.map((d, i) => {
            const alto = (d.valor / max) * area;
            const x = izq + i * paso + (paso - ancho) / 2;
            const y = H - abajo - alto;
            return (
              <g key={d.mes}>
                <rect x={x} y={y} width={ancho} height={alto} rx={4} fill="#006689" opacity={0.9}>
                  <title>{`${d.etiqueta}: ${formato(d.valor)}`}</title>
                </rect>
                <text x={x + ancho / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#002547">
                  {d.valor > 0 ? formato(d.valor) : ''}
                </text>
                <text x={x + ancho / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#42474f">
                  {d.etiqueta}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </figure>
  );
}
