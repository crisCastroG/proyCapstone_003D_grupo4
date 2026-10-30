import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { validarPasswordSegura } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();
    if (!correo) {
      return NextResponse.json({ error: 'Ingresa tu correo registrado.' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos (HU-03)

    const updateRes = await query(
      `UPDATE public.usuario
       SET codigo_recuperacion_contrasena = $1,
           expiracion_codigo_recuperacion = $2,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE LOWER(correo) = LOWER($3) AND estado_usuario = 'activo'
       RETURNING id_usuario, correo`,
      [token, expiraEn, correo.trim()]
    );

    if (updateRes.rows.length > 0) {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recuperar_password?token=${token}`;
      console.log(`[HU-03 Enlace de recuperación para ${correo}]: ${resetLink}`);
    }

    return NextResponse.json({
      mensaje: 'Si el correo está registrado, recibirás un enlace válido por 15 minutos.',
    });
  } catch (error) {
    console.error('Error al generar código de recuperación:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { token, nuevaPassword } = await request.json();

    const validacionPass = validarPasswordSegura(nuevaPassword || '');
    if (!validacionPass.valida) {
      return NextResponse.json(
        { error: `Contraseña inválida: ${validacionPass.errores.join(' ')}` },
        { status: 400 }
      );
    }

    const userRes = await query(
      `SELECT id_usuario, expiracion_codigo_recuperacion
       FROM public.usuario
       WHERE codigo_recuperacion_contrasena = $1 LIMIT 1`,
      [token]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Código de recuperación inválido.' }, { status: 400 });
    }

    const usuario = userRes.rows[0];
    if (
      !usuario.expiracion_codigo_recuperacion ||
      new Date(usuario.expiracion_codigo_recuperacion) < new Date()
    ) {
      return NextResponse.json(
        { error: 'El enlace de recuperación ha expirado (superó los 15 minutos).' },
        { status: 400 }
      );
    }

    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);

    await query(
      `UPDATE public.usuario
       SET "contraseña" = $1,
           codigo_recuperacion_contrasena = NULL,
           expiracion_codigo_recuperacion = NULL,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $2`,
      [nuevoHash, usuario.id_usuario]
    );

    return NextResponse.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return NextResponse.json({ error: 'Error al restablecer la contraseña.' }, { status: 500 });
  }
}