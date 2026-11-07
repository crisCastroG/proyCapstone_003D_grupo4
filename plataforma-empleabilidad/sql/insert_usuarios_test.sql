INSERT INTO public.usuario (
  correo,
  "contraseña",
  run,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  genero,
  estado_usuario,
  telefono,
  profesion_id_profesion,
  area_de_trabajo_id_area,
  ciudad_id_ciudad,
  rol_usuario_id_rol
)
VALUES (
  'admin@test.com',
  '$2a$10$22characterlongsalts1uzFFPfS.lyzYNmT0c3i.lWjG4JPFFL7O', 
  '11111111-1',
  'Administrador',
  'Principal',
  'Sistema',
  '1990-01-01',
  'Otros',
  'activo',
  '+56911111111',
  1,
  1,
  1,
  1 
)
ON CONFLICT (run) DO UPDATE SET 
  "contraseña" = EXCLUDED."contraseña",
  correo = EXCLUDED.correo,
  estado_usuario = 'activo',
  rol_usuario_id_rol = 1;

INSERT INTO public.usuario (
  correo,
  "contraseña",
  run,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  genero,
  estado_usuario,
  telefono,
  profesion_id_profesion,
  area_de_trabajo_id_area,
  ciudad_id_ciudad,
  rol_usuario_id_rol
)
VALUES (
  'usuario@test.com',
  '$2a$10$22characterlongsalts1uzFFPfS.lyzYNmT0c3i.lWjG4JPFFL7O', 
  '22222222-2',
  'Juan',
  'Pérez',
  'Gómez',
  '1995-05-15',
  'Masculino',
  'activo',
  '+56922222222',
  1,
  1,
  1,
  2 
)
ON CONFLICT (run) DO UPDATE SET 
  "contraseña" = EXCLUDED."contraseña",
  correo = EXCLUDED.correo,
  estado_usuario = 'activo',
  rol_usuario_id_rol = 2;


INSERT INTO public.perfil_profesional (usuario_id_usuario)
SELECT id_usuario FROM public.usuario WHERE run IN ('11111111-1', '22222222-2')
ON CONFLICT DO NOTHING;


INSERT INTO public.progreso_contenido (usuario_id_usuario, contenido_id_contenido, estado_progreso)
SELECT u.id_usuario, c.id_contenido, 'no_completado'
FROM public.usuario u
CROSS JOIN public.contenido c
WHERE u.run IN ('11111111-1', '22222222-2')
ON CONFLICT DO NOTHING;