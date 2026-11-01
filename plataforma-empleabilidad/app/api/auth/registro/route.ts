import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { formatearRut, validarRutChileno, validarPasswordSegura } from '@/lib/validators';
import { crearTokenSesion } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      telefono,
      run,
      fecha_nacimiento,
      genero,
      profesion_id_profesion,
      area_de_trabajo_id_area,
      ciudad_id_ciudad,
      profesion_nombre,
      area_nombre,
      region_nombre,
      ciudad_nombre,
      password,
    } = body;

    // 1. Validar campos obligatorios
    if (
      !nombre ||
      !apellido_paterno ||
      !correo ||
      !run ||
      !genero ||
      !profesion_id_profesion ||
      !area_de_trabajo_id_area ||
      !ciudad_id_ciudad ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Por favor completa todos los campos obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Validar género contra el dominio public.genero
    if (!['Femenino', 'Masculino', 'Otros'].includes(genero)) {
      return NextResponse.json({ error: 'Género seleccionado no válido.' }, { status: 400 });
    }

    // 3. Validar RUN chileno (Módulo 11)
    if (!validarRutChileno(run)) {
      return NextResponse.json(
        { error: 'El RUN ingresado no es válido (verifica el dígito verificador).' },
        { status: 400 }
      );
    }
    const runFormateado = formatearRut(run);
    const correoLimpio = correo.trim().toLowerCase();

    // 4. Validar contraseña segura
    const validacionPass = validarPasswordSegura(password);
    if (!validacionPass.valida) {
      return NextResponse.json(
        { error: `Contraseña insegura: ${validacionPass.errores.join(' ')}` },
        { status: 400 }
      );
    }

    // 5. Verificar duplicidad de correo o RUN (HU-01 Escenario 2)
    const existeRes = await query(
      `SELECT correo, run FROM public.usuario 
       WHERE LOWER(correo) = LOWER($1) OR run = $2 LIMIT 1`,
      [correoLimpio, runFormateado]
    );

    if (existeRes.rows.length > 0) {
      const existente = existeRes.rows[0];
      const mensaje =
        existente.run === runFormateado
          ? 'El RUN ingresado ya se encuentra registrado en la plataforma.'
          : 'El correo electrónico ya se encuentra registrado.';
      return NextResponse.json({ error: mensaje }, { status: 409 });
    }

    // 6. Asegurar ID real de Profesión en la BD
    let idProfesionFinal = Number(profesion_id_profesion);
    if (profesion_nombre) {
      const profRes = await query(
        `INSERT INTO public.profesion (nombre_profesion)
         VALUES ($1)
         ON CONFLICT (nombre_profesion) DO UPDATE SET nombre_profesion = EXCLUDED.nombre_profesion
         RETURNING id_profesion`,
        [profesion_nombre.trim()]
      );
      idProfesionFinal = profRes.rows[0].id_profesion;
    }

    // 7. Asegurar ID real de Área de Trabajo en la BD
    let idAreaFinal = Number(area_de_trabajo_id_area);
    if (area_nombre) {
      const areaRes = await query(
        `INSERT INTO public.area_de_trabajo (nombre_area)
         VALUES ($1)
         ON CONFLICT (nombre_area) DO UPDATE SET nombre_area = EXCLUDED.nombre_area
         RETURNING id_area`,
        [area_nombre.trim()]
      );
      idAreaFinal = areaRes.rows[0].id_area;
    }

    // 8. Asegurar ID real de Región y Ciudad en la BD
    let idCiudadFinal = Number(ciudad_id_ciudad);
    if (region_nombre && ciudad_nombre) {
      const regRes = await query(
        `INSERT INTO public.region (nombre_region)
         VALUES ($1)
         ON CONFLICT (nombre_region) DO UPDATE SET nombre_region = EXCLUDED.nombre_region
         RETURNING id_region`,
        [region_nombre.trim()]
      );
      const idRegionReal = regRes.rows[0].id_region;

      const ciuRes = await query(
        `INSERT INTO public.ciudad (nombre_ciudad, region_id_region)
         VALUES ($1, $2)
         ON CONFLICT (region_id_region, nombre_ciudad) DO UPDATE SET nombre_ciudad = EXCLUDED.nombre_ciudad
         RETURNING id_ciudad`,
        [ciudad_nombre.trim(), idRegionReal]
      );
      idCiudadFinal = ciuRes.rows[0].id_ciudad;
    }

    // 9. Asegurar y obtener siempre el rol 'usuario' (cliente normal)
    const rolRes = await query(
      `INSERT INTO public.rol_usuario (nombre_rol)
       VALUES ('usuario')
       ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol
       RETURNING id_rol`
    );
    const idRolUsuario = rolRes.rows[0].id_rol;

    // 10. Hashear contraseña e insertar en public.usuario
    const passwordHash = await bcrypt.hash(password, 10);

    const insertUserRes = await query(
      `INSERT INTO public.usuario (
        correo, "contraseña", run, nombre, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono,
        profesion_id_profesion, area_de_trabajo_id_area, ciudad_id_ciudad, rol_usuario_id_rol
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id_usuario, run, nombre, apellido_paterno, correo`,
      [
        correoLimpio,
        passwordHash,
        runFormateado,
        nombre.trim(),
        apellido_paterno.trim(),
        apellido_materno ? apellido_materno.trim() : null,
        fecha_nacimiento || null,
        genero,
        telefono ? telefono.trim() : null,
        idProfesionFinal,
        idAreaFinal,
        idCiudadFinal,
        idRolUsuario,
      ]
    );

    const nuevoUsuario = insertUserRes.rows[0];

    // 11. Inicializar Perfil Profesional y Progreso de Contenidos
    await query(
      `INSERT INTO public.perfil_profesional (usuario_id_usuario)
       VALUES ($1) ON CONFLICT DO NOTHING`,
      [nuevoUsuario.id_usuario]
    );

    await query(
      `INSERT INTO public.progreso_contenido (usuario_id_usuario, contenido_id_contenido, estado_progreso)
       SELECT $1, id_contenido, 'no_iniciado'
       FROM public.contenido
       ON CONFLICT DO NOTHING`,
      [nuevoUsuario.id_usuario]
    );

    // 12. Crear sesión automática y redirigir a /modulos
    const token = await crearTokenSesion({
      id_usuario: nuevoUsuario.id_usuario,
      run: nuevoUsuario.run,
      nombre: nuevoUsuario.nombre,
      apellido_paterno: nuevoUsuario.apellido_paterno,
      correo: nuevoUsuario.correo,
      rol: 'usuario',
    });

    const response = NextResponse.json(
      {
        mensaje: 'Cuenta creada exitosamente',
        usuario: nuevoUsuario,
        redirectUrl: '/modulos',
      },
      { status: 201 }
    );

    response.cookies.set('empleamas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar el usuario.' },
      { status: 500 }
    );
  }
}