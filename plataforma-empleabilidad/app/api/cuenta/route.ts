import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import { normalizarTelefonoChile } from '@/lib/validators';

// El usuario edita sus propios datos de contacto y laborales.
// El RUN y el correo NO se pueden cambiar desde aquí. El id sale de la sesión, nunca del cuerpo de la petición.
export async function PATCH(request: Request) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const body = await request.json();
    const telefono = normalizarTelefonoChile(String(body.telefono ?? ''));
    const profesionId = Number(body.profesion_id);
    const areaId = Number(body.area_id);
    const regionId = Number(body.region_id);
    const ciudadId = Number(body.ciudad_id);

    if (!telefono) {
      return NextResponse.json(
        { error: 'Ingresa un teléfono chileno válido de 9 dígitos (ej: 9 1234 5678).' },
        { status: 400 }
      );
    }
    if (![profesionId, areaId, regionId, ciudadId].every((n) => Number.isInteger(n) && n > 0)) {
      return NextResponse.json(
        { error: 'Selecciona tu profesión, área de trabajo, región y ciudad.' },
        { status: 400 }
      );
    }

    // La ciudad debe pertenecer a la región elegida
    const ciudadRes = await query(
      `SELECT 1 FROM public.ciudad WHERE id_ciudad = $1 AND region_id_region = $2`,
      [ciudadId, regionId]
    );
    if (ciudadRes.rows.length === 0) {
      return NextResponse.json({ error: 'La ciudad no pertenece a la región seleccionada.' }, { status: 400 });
    }
    const [prof, area] = await Promise.all([
      query(`SELECT 1 FROM public.profesion WHERE id_profesion = $1`, [profesionId]),
      query(`SELECT 1 FROM public.area_de_trabajo WHERE id_area = $1`, [areaId]),
    ]);
    if (prof.rows.length === 0 || area.rows.length === 0) {
      return NextResponse.json({ error: 'La profesión o el área seleccionada no existe.' }, { status: 400 });
    }

    const res = await query(
      `UPDATE public.usuario
          SET telefono = $2,
              profesion_id_profesion = $3,
              area_de_trabajo_id_area = $4,
              ciudad_id_ciudad = $5,
              fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $1 AND estado_usuario = 'activo'`,
      [sesion.id_usuario, telefono, profesionId, areaId, ciudadId]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'La cuenta no se encuentra activa.' }, { status: 409 });
    }

    return NextResponse.json({ mensaje: 'Tus datos fueron actualizados.' });
  } catch (error) {
    console.error('Error al actualizar los datos de la cuenta:', error);
    return NextResponse.json({ error: 'Error interno al actualizar tus datos.' }, { status: 500 });
  }
}
