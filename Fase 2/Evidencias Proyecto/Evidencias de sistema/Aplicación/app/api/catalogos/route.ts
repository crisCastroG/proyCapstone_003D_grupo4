import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [profesionesRes, areasRes, regionesRes, ciudadesRes] = await Promise.all([
      query('SELECT id_profesion, nombre_profesion FROM public.profesion ORDER BY nombre_profesion ASC'),
      query('SELECT id_area, nombre_area FROM public.area_de_trabajo ORDER BY nombre_area ASC'),
      query('SELECT id_region, nombre_region FROM public.region ORDER BY id_region ASC'),
      query('SELECT id_ciudad, nombre_ciudad, region_id_region FROM public.ciudad ORDER BY nombre_ciudad ASC'),
    ]);

    return NextResponse.json({
      profesiones: profesionesRes.rows,
      areas: areasRes.rows,
      regiones: regionesRes.rows,
      ciudades: ciudadesRes.rows,
    });
  } catch (error) {
    console.error('Error al cargar catálogos:', error);
    return NextResponse.json(
      { error: 'No se pudieron cargar las opciones del formulario.' },
      { status: 500 }
    );
  }
}