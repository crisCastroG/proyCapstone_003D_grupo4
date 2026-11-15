'use server';

import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Obtener datos del perfil con token público
export async function obtenerPerfilUsuarioAction() {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return { success: false, message: 'No autorizado' };
    }

    // Si la persona entra por primera vez, aseguramos que tenga un perfil creado con token
    await query(
      `INSERT INTO public.perfil_profesional (usuario_id_usuario)
       VALUES ($1)
       ON CONFLICT (usuario_id_usuario) DO NOTHING;`,
      [sesion.id_usuario]
    );

    const resPerfil = await query(
      `SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.correo,
        u.telefono,
        prof.nombre_profesion AS profesion,
        area.nombre_area AS area_trabajo,
        ciu.nombre_ciudad AS ciudad,
        reg.nombre_region AS region,
        p.id_perfil_profesional,
        p.token_publico,
        p.resumen,
        p.link_linkedin,
        p.foto,
        p.habilidades
       FROM public.usuario u
       LEFT JOIN public.perfil_profesional p ON p.usuario_id_usuario = u.id_usuario
       LEFT JOIN public.profesion prof ON prof.id_profesion = u.profesion_id_profesion
       LEFT JOIN public.area_de_trabajo area ON area.id_area = u.area_de_trabajo_id_area
       LEFT JOIN public.ciudad ciu ON ciu.id_ciudad = u.ciudad_id_ciudad
       LEFT JOIN public.region reg ON reg.id_region = ciu.region_id_region
       WHERE u.id_usuario = $1;`,
      [sesion.id_usuario]
    );

    const resModulos = await query(
      `SELECT m.id_modulo, m.titulo_modulo, m.posicion_modulo,
              COUNT(DISTINCT c.id_contenido) AS total_contenidos
       FROM public.modulo m
       JOIN public.contenido c ON c.modulo_id_modulo = m.id_modulo
       JOIN public.progreso_contenido pc ON pc.contenido_id_contenido = c.id_contenido
       WHERE pc.usuario_id_usuario = $1 AND pc.estado_progreso = 'completado'
       GROUP BY m.id_modulo, m.titulo_modulo, m.posicion_modulo
       ORDER BY m.posicion_modulo ASC;`,
      [sesion.id_usuario]
    );

    return {
      success: true,
      perfil: resPerfil.rows[0] || null,
      logrosModulos: resModulos.rows || [],
    };
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    return { success: false, message: error.message };
  }
}

// Guardar datos actualizados del perfil
export async function guardarPerfilUsuarioAction(formData: FormData) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return { success: false, message: 'No autorizado' };
    }

    const resumen = (formData.get('resumen') as string) || '';
    const linkLinkedin = (formData.get('link_linkedin') as string) || '';
    const foto = (formData.get('foto') as string) || '';
    const habilidadesRaw = (formData.get('habilidades') as string) || '';

    const habilidadesArray = habilidadesRaw
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    await query(
      `INSERT INTO public.perfil_profesional 
        (usuario_id_usuario, resumen, link_linkedin, foto, habilidades, fecha_actualizacion)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (usuario_id_usuario)
       DO UPDATE SET
        resumen = EXCLUDED.resumen,
        link_linkedin = EXCLUDED.link_linkedin,
        foto = EXCLUDED.foto,
        habilidades = EXCLUDED.habilidades,
        fecha_actualizacion = CURRENT_TIMESTAMP;`,
      [sesion.id_usuario, resumen, linkLinkedin, foto, habilidadesArray]
    );

    revalidatePath('/perfil');
    return { success: true, message: 'Perfil profesional actualizado con éxito.' };
  } catch (error: any) {
    console.error('Error al guardar perfil:', error);
    return { success: false, message: error.message || 'Error al guardar cambios.' };
  }
}

export async function obtenerPerfilPublicoPorTokenAction(tokenPublico: string) {
  try {
    const resPerfil = await query(
      `SELECT 
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.correo,
        u.telefono,
        prof.nombre_profesion AS profesion,
        area.nombre_area AS area_trabajo,
        ciu.nombre_ciudad AS ciudad,
        reg.nombre_region AS region,
        p.resumen,
        p.link_linkedin,
        p.foto,
        p.habilidades,
        p.fecha_actualizacion
       FROM public.perfil_profesional p
       JOIN public.usuario u ON u.id_usuario = p.usuario_id_usuario
       LEFT JOIN public.profesion prof ON prof.id_profesion = u.profesion_id_profesion
       LEFT JOIN public.area_de_trabajo area ON area.id_area = u.area_de_trabajo_id_area
       LEFT JOIN public.ciudad ciu ON ciu.id_ciudad = u.ciudad_id_ciudad
       LEFT JOIN public.region reg ON reg.id_region = ciu.region_id_region
       WHERE p.token_publico = $1;`,
      [tokenPublico]
    );

    if (resPerfil.rows.length === 0) {
      return { success: false, message: 'El perfil profesional solicitado no existe o no se encuentra disponible.' };
    }

    const perfil = resPerfil.rows[0];

    const resModulos = await query(
      `SELECT m.id_modulo, m.titulo_modulo, m.posicion_modulo
       FROM public.modulo m
       JOIN public.contenido c ON c.modulo_id_modulo = m.id_modulo
       JOIN public.progreso_contenido pc ON pc.contenido_id_contenido = c.id_contenido
       JOIN public.perfil_profesional p ON p.usuario_id_usuario = pc.usuario_id_usuario
       WHERE p.token_publico = $1 AND pc.estado_progreso = 'completado'
       GROUP BY m.id_modulo, m.titulo_modulo, m.posicion_modulo
       ORDER BY m.posicion_modulo ASC;`,
      [tokenPublico]
    );

    return {
      success: true,
      perfil,
      logrosModulos: resModulos.rows || [],
    };
  } catch (error: any) {
    console.error('Error al obtener perfil público:', error);
    return { success: false, message: 'Error al conectar con el servidor.' };
  }
}