import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { obtenerSesionActual } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    // Evita que un administrador deje la plataforma sin acceso por error
    if (sesion.rol !== 'usuario') {
      return NextResponse.json(
        { error: 'Las cuentas administrativas no pueden darse de baja desde aquí.' },
        { status: 403 }
      );
    }

    const { password, motivo } = await request.json();
    if (!password) {
      return NextResponse.json(
        { error: 'Ingresa tu contraseña para confirmar la baja.' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT "contraseña" AS password_hash, estado_usuario
       FROM public.usuario
       WHERE id_usuario = $1`,
      [sesion.id_usuario]
    );
    const usuario = result.rows[0];

    if (!usuario || usuario.estado_usuario !== 'activo') {
      return NextResponse.json({ error: 'La cuenta ya no se encuentra activa.' }, { status: 409 });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return NextResponse.json({ error: 'La contraseña es incorrecta.' }, { status: 401 });
    }

    const motivoLimpio = typeof motivo === 'string' ? motivo.trim().slice(0, 500) : '';

    await query(
      `UPDATE public.usuario
       SET estado_usuario = 'desactivado',
           fecha_desactivacion = CURRENT_TIMESTAMP,
           motivo_desactivacion = $2,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $1`,
      [sesion.id_usuario, motivoLimpio || null]
    );

    const response = NextResponse.json({ mensaje: 'Tu cuenta fue dada de baja correctamente.' });
    response.cookies.delete('empleamas_session');
    return response;
  } catch (error) {
    console.error('Error en baja de cuenta:', error);
    return NextResponse.json({ error: 'Error interno al dar de baja la cuenta.' }, { status: 500 });
  }
}