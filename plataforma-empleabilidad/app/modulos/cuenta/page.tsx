import Link from 'next/link';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import BotonCerrarSesion from '@/components/BotonCerrarSesion';
import { PLAN_GRATUITO } from '@/lib/planes';
import DarseDeBaja from './DarseDeBaja';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-[#42474f]/70">{etiqueta}</dt>
      <dd className="text-sm font-semibold text-[#002547] mt-0.5">{valor || '—'}</dd>
    </div>
  );
}

export default async function CuentaPage() {
  const sesion = await obtenerSesionActual();
  if (!sesion) redirect('/inicio_sesion');

  const result = await query(
    `SELECT
       u.nombre,
       u.apellido_paterno,
       u.apellido_materno,
       u.run,
       u.correo,
       u.telefono,
       u.genero,
       to_char(u.fecha_nacimiento, 'DD/MM/YYYY') AS fecha_nacimiento,
       to_char(u.fecha_creacion AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY') AS miembro_desde,
       p.nombre_profesion,
       a.nombre_area,
       c.nombre_ciudad,
       r.nombre_region
     FROM public.usuario u
     INNER JOIN public.profesion p ON p.id_profesion = u.profesion_id_profesion
     INNER JOIN public.area_de_trabajo a ON a.id_area = u.area_de_trabajo_id_area
     INNER JOIN public.ciudad c ON c.id_ciudad = u.ciudad_id_ciudad
     INNER JOIN public.region r ON r.id_region = c.region_id_region
     WHERE u.id_usuario = $1 AND u.estado_usuario = 'activo'`,
    [sesion.id_usuario]
  );

  const usuario = result.rows[0];

  // Sesión válida pero cuenta inexistente o desactivada
  if (!usuario) {
    return (
      <div className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30 max-w-xl">
        <h1 className="text-xl font-extrabold text-[#002547] mb-2">Tu cuenta no está activa</h1>
        <p className="text-sm text-[#42474f] mb-4">
          No pudimos cargar tu perfil. Cierra sesión e intenta de nuevo, o contacta al equipo de Empleamás.
        </p>
        <BotonCerrarSesion className="text-sm font-semibold text-[#42474f] border border-[#c3c6d0] px-3 py-1.5 rounded-lg hover:bg-[#f1f4f6]" />
      </div>
    );
  }

  // Último plan comprado que ya empezó (el que termina más tarde).
  // Si nunca compró uno, el usuario está en el plan gratuito.
  const planRes = await query(
    `SELECT
       pl.nombre_plan,
       pl.duracion_plan,
       to_char(pu.fecha_inicio AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY') AS inicio,
       to_char(pu.fecha_termino AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY') AS termino,
       (CURRENT_TIMESTAMP <= pu.fecha_termino) AS vigente,
       GREATEST(CEIL(EXTRACT(EPOCH FROM (pu.fecha_termino - CURRENT_TIMESTAMP)) / 86400), 0)::int AS dias_restantes
     FROM public.plan_usuario pu
     INNER JOIN public.plan pl ON pl.id_plan = pu.plan_id_plan
     WHERE pu.usuario_id_usuario = $1
       AND pu.fecha_inicio <= CURRENT_TIMESTAMP
     ORDER BY pu.fecha_termino DESC
     LIMIT 1`,
    [sesion.id_usuario]
  );
  const ultimoPlan = planRes.rows[0] ?? null;
  const planVigente = ultimoPlan?.vigente ? ultimoPlan : null;
  const planVigenteHasta: string | null = planVigente?.termino ?? null; // para el aviso de la baja

  const nombreCompleto = [usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno]
    .filter(Boolean)
    .join(' ');
  const iniciales = `${usuario.nombre?.[0] ?? ''}${usuario.apellido_paterno?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <section className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border border-[#c3c6d0]/30">
        <div
          aria-hidden="true"
          className="w-16 h-16 rounded-full bg-[#002546] text-white flex items-center justify-center font-bold text-xl shrink-0"
        >
          {iniciales}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#42474f]/70">Mi cuenta</p>
          <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">{nombreCompleto}</h1>
          <p className="text-sm font-medium text-[#42474f]">{usuario.correo}</p>
          <p className="text-xs text-[#42474f]/70 mt-1">Miembro desde {usuario.miembro_desde}</p>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-[#002547]">Mi plan</h2>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              planVigente ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#E6F2FB] text-[#002546]'
            }`}
          >
            {planVigente ? 'Activo' : 'Gratuito'}
          </span>
        </div>

        {planVigente ? (
          <>
            <p className="text-xl font-extrabold text-[#002547] mb-4">{planVigente.nombre_plan}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Dato etiqueta="Inicio" valor={planVigente.inicio} />
              <Dato etiqueta="Vigente hasta" valor={planVigente.termino} />
              <Dato
                etiqueta="Días restantes"
                valor={`${planVigente.dias_restantes} ${planVigente.dias_restantes === 1 ? 'día' : 'días'}`}
              />
            </dl>
            <p className="text-xs text-[#42474f]/70 mt-4">
              Duración del plan: {planVigente.duracion_plan} días.
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-extrabold text-[#002547] mb-1">{PLAN_GRATUITO.nombre}</p>
            <p className="text-sm text-[#42474f] mb-4">
              {ultimoPlan
                ? `Tu último plan (${ultimoPlan.nombre_plan}) venció el ${ultimoPlan.termino}.`
                : PLAN_GRATUITO.descripcion}
            </p>
            <Link
              href="/planes"
              className="inline-block text-sm font-bold text-white bg-[#0D3B66] hover:bg-[#2566A8] px-4 py-2 rounded-lg transition-colors"
            >
              {ultimoPlan ? 'Renovar plan' : 'Ver planes'}
            </Link>
          </>
        )}
      </section>

      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#002547]">Datos personales</h2>
          <Link
            href="/modulos/cuenta/editar"
            className="text-sm font-semibold text-[#006689] border border-[#006689]/40 hover:bg-[#E6F2FB] px-3 py-1.5 rounded-lg transition-colors"
          >
            Editar mis datos
          </Link>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dato etiqueta="RUN" valor={usuario.run} />
          <Dato etiqueta="Género" valor={usuario.genero} />
          <Dato etiqueta="Fecha de nacimiento" valor={usuario.fecha_nacimiento} />
          <Dato etiqueta="Teléfono" valor={usuario.telefono} />
        </dl>
      </section>

      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <h2 className="text-lg font-bold text-[#002547] mb-4">Datos laborales y ubicación</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dato etiqueta="Profesión / Título" valor={usuario.nombre_profesion} />
          <Dato etiqueta="Área de trabajo" valor={usuario.nombre_area} />
          <Dato etiqueta="Región" valor={usuario.nombre_region} />
          <Dato etiqueta="Ciudad / Comuna" valor={usuario.nombre_ciudad} />
        </dl>
      </section>

      {sesion.rol === 'usuario' && (
        <section className="bg-white p-6 rounded-xl border border-[#FCA5A5]/60">
          <h2 className="text-lg font-bold text-[#991B1B] mb-1">Darse de baja</h2>
          <p className="text-sm text-[#42474f] mb-4">
            Si ya no quieres usar la plataforma, puedes desactivar tu cuenta.
          </p>
          <DarseDeBaja planVigenteHasta={planVigenteHasta} />
        </section>
      )}
    </div>
  );
}