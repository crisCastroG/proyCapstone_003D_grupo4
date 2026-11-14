import Link from 'next/link';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import FormularioEditar from './FormularioEditar';

export const dynamic = 'force-dynamic';

export default async function EditarCuentaPage() {
  const sesion = await obtenerSesionActual();
  if (!sesion) redirect('/inicio_sesion');

  const [usuarioRes, profesiones, areas, regiones, ciudades] = await Promise.all([
    query(
      `SELECT u.run, u.correo, u.telefono, u.profesion_id_profesion, u.area_de_trabajo_id_area,
              u.ciudad_id_ciudad, c.region_id_region
         FROM public.usuario u
         JOIN public.ciudad c ON c.id_ciudad = u.ciudad_id_ciudad
        WHERE u.id_usuario = $1 AND u.estado_usuario = 'activo'`,
      [sesion.id_usuario]
    ),
    query('SELECT id_profesion, nombre_profesion FROM public.profesion ORDER BY nombre_profesion ASC'),
    query('SELECT id_area, nombre_area FROM public.area_de_trabajo ORDER BY nombre_area ASC'),
    query('SELECT id_region, nombre_region FROM public.region ORDER BY id_region ASC'),
    query('SELECT id_ciudad, nombre_ciudad, region_id_region FROM public.ciudad ORDER BY nombre_ciudad ASC'),
  ]);

  const u = usuarioRes.rows[0];
  if (!u) redirect('/modulos/cuenta');

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link href="/modulos/cuenta" className="text-sm font-semibold text-[#006689] hover:underline">
        ← Volver a mi cuenta
      </Link>
      <section className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30">
        <h1 className="text-xl font-extrabold text-[#002547]">Editar mis datos</h1>
        <p className="text-sm text-[#42474f] mt-1 mb-5">
          Tu RUN y tu correo no se pueden modificar. Si necesitas cambiarlos,{' '}
          <Link href="/contacto" className="text-[#006689] font-semibold hover:underline">contáctanos</Link>.
        </p>
        <FormularioEditar
          run={u.run}
          correo={u.correo}
          inicial={{
            telefono: u.telefono ?? '',
            profesionId: String(u.profesion_id_profesion),
            areaId: String(u.area_de_trabajo_id_area),
            regionId: String(u.region_id_region),
            ciudadId: String(u.ciudad_id_ciudad),
          }}
          profesiones={profesiones.rows}
          areas={areas.rows}
          regiones={regiones.rows}
          ciudades={ciudades.rows}
        />
      </section>
    </div>
  );
}
