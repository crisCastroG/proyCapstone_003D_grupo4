import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { crearTokenSesion } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Debes ingresar tu correo y contraseña.' },
        { status: 400 }
      );
    }

    const correoLimpio = correo.trim().toLowerCase();

    const result = await query(
      `SELECT 
         u.id_usuario,
         u.run,
         u.nombre,
         u.apellido_paterno,
         u.correo,
         u."contraseña" AS password_hash,
         u.estado_usuario,
         r.nombre_rol
       FROM public.usuario u
       INNER JOIN public.rol_usuario r ON u.rol_usuario_id_rol = r.id_rol
       WHERE LOWER(u.correo) = LOWER($1)
       LIMIT 1`,
      [correoLimpio]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    const usuario = result.rows[0];

    if (usuario.estado_usuario !== 'activo') {
      return NextResponse.json(
        { error: 'Esta cuenta se encuentra desactivada.' },
        { status: 403 }
      );
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    const rolNormalizado = usuario.nombre_rol.toLowerCase() as
      | 'usuario'
      | 'administrador'
      | 'superadministrador';

    const token = await crearTokenSesion({
      id_usuario: usuario.id_usuario,
      run: usuario.run,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      correo: usuario.correo,
      rol: rolNormalizado,
    });

    const redirectUrl =
      rolNormalizado === 'administrador' || rolNormalizado === 'superadministrador'
        ? '/admin'
        : '/dashboard';

    const response = NextResponse.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: `${usuario.nombre} ${usuario.apellido_paterno}`,
        correo: usuario.correo,
        rol: rolNormalizado,
      },
      redirectUrl,
    });

    response.cookies.set('empleamas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno al iniciar sesión.' },
      { status: 500 }
    );
  }
}