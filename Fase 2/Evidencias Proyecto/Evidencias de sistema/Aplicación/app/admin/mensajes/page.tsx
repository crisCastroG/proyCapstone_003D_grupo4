import Link from 'next/link';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FILTROS = [
  { clave: 'todos', etiqueta: 'Todos', estado: 'todos' },
  { clave: 'nuevos', etiqueta: 'Nuevos', estado: 'no leido' },
  { clave: 'leidos', etiqueta: 'Leídos', estado: 'leido' },
  { clave: 'respondidos', etiqueta: 'Respondidos', estado: 'respondido' },
];

const ETIQUETA: Record<string, { texto: string; clase: string }> = {
  'no leido': { texto: 'Nuevo', clase: 'bg-[#FEF3C7] text-[#92400E]' },
  leido: { texto: 'Leído', clase: 'bg-[#E6F2FB] text-[#002546]' },
  respondido: { texto: 'Respondido', clase: 'bg-[#DCFCE7] text-[#166534]' },
};

export default async function MensajesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const sesion = await obtenerSesionActual();
  if (!sesion) redirect('/inicio_sesion');
  if (sesion.rol !== 'administrador' && sesion.rol !== 'superadministrador') redirect('/modulos');

  const { estado } = await searchParams;
  const filtroActual = FILTROS.find((f) => f.clave === estado) ?? FILTROS[0];
  const filtro = filtroActual.clave;

  const res = await query(
    `SELECT m.id_mensaje, m.asunto, m.mensaje, m.estado_mensaje,
            u.nombre, u.apellido_paterno, u.correo,
            c.titulo_contenido,
            to_char(m.fecha_envio AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY HH24:MI') AS fecha
       FROM public.mensaje_contacto m
       JOIN public.usuario u ON u.id_usuario = m.usuario_id_remitente
       JOIN public.contenido c ON c.id_contenido = m.contenido_id_contenido
      WHERE $1 = 'todos' OR m.estado_mensaje = $1
      ORDER BY m.fecha_envio DESC
      LIMIT 200`,
    [filtroActual.estado]
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">Mensajes de contacto</h1>
        <p className="text-sm text-[#42474f] mt-1">Consultas que los usuarios envían desde las lecciones.</p>
      </header>

      <nav className="flex gap-2" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <Link
            key={f.clave}
            href={f.clave === 'todos' ? '/admin/mensajes' : `/admin/mensajes?estado=${f.clave}`}
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg border ${
              filtro === f.clave
                ? 'bg-[#002547] text-white border-[#002547]'
                : 'text-[#42474f] border-[#c3c6d0] hover:bg-[#f1f4f6]'
            }`}
          >
            {f.etiqueta}
          </Link>
        ))}
      </nav>

      {res.rows.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-[#c3c6d0]/30 text-center text-sm text-[#42474f]">
          No hay mensajes en esta vista.
        </div>
      ) : (
        <ul className="bg-white rounded-xl border border-[#c3c6d0]/30 divide-y divide-[#c3c6d0]/30">
          {res.rows.map((m) => {
            const et = ETIQUETA[m.estado_mensaje];
            return (
              <li key={m.id_mensaje}>
                <Link href={`/admin/mensajes/${m.id_mensaje}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7fafc]">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm text-[#002547] truncate ${m.estado_mensaje === 'no leido' ? 'font-extrabold' : 'font-semibold'}`}>
                      {m.asunto || m.mensaje}
                    </p>
                    <p className="text-xs text-[#42474f] truncate">
                      {m.nombre} {m.apellido_paterno} · {m.correo} · Lección: {m.titulo_contenido}
                    </p>
                  </div>
                  <span className="text-xs text-[#42474f] whitespace-nowrap hidden sm:block">{m.fecha}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${et.clase}`}>{et.texto}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
