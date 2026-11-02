BEGIN;


INSERT INTO public.profesion (nombre_profesion) VALUES
    ('Ingeniero/a Civil Informático/a'),
    ('Ingeniero/a Comercial'),
    ('Contador/a Auditor/a'),
    ('Psicólogo/a'),
    ('Abogado/a'),
    ('Diseñador/a Gráfico/a'),
    ('Enfermero/a'),
    ('Arquitecto/a'),
    ('Periodista / Comunicador/a Digital'),
    ('Administrador/a de Empresas'),
    ('Ingeniero/a Industrial'),
    ('Médico/a Cirujano/a'),
    ('Profesor/a / Docente'),
    ('Trabajador/a Social'),
    ('Kinesiólogo/a'),
    ('Publicista / Especialista en Marketing'),
    ('Nutricionista'),
    ('Científico/a / Analista de Datos'),
    ('Terapeuta Ocupacional'),
    ('Administrador/a Gastronómico/a')
ON CONFLICT (nombre_profesion) DO NOTHING;
INSERT INTO public.area_de_trabajo (nombre_area) VALUES
    ('Tecnología de la Información y Desarrollo de Software'),
    ('Recursos Humanos y Gestión del Talento'),
    ('Finanzas, Contabilidad y Auditoría'),
    ('Marketing, Publicidad y Crecimiento (Growth)'),
    ('Ventas y Desarrollo de Negocios'),
    ('Operaciones y Logística'),
    ('Salud y Servicios Sanitarios'),
    ('Educación, Formación y EdTech'),
    ('Legal, Asuntos Corporativos y Compliance'),
    ('Administración General y Gestión Operativa'),
    ('Servicio al Cliente y Experiencia del Usuario (CX)'),
    ('Diseño, UX/UI y Creatividad Digital'),
    ('Minería, Energía y Recursos Naturales'),
    ('Construcción e Ingeniería Civil'),
    ('Consultoría Estratégica y de Negocios'),
    ('Comunicaciones, PR y Medios'),
    ('Compras, Abastecimiento y Supply Chain'),
    ('Innovación y Transformación Digital'),
    ('Medio Ambiente, Sustentabilidad y ESG'),
    ('Sector Público y Políticas Públicas')
ON CONFLICT (nombre_area) DO NOTHING;

INSERT INTO public.region (nombre_region)
VALUES 
  ('Región Metropolitana de Santiago'),
  ('Región del Biobío'),
  ('Región de Valparaíso');

INSERT INTO public.ciudad (nombre_ciudad, region_id_region)
VALUES 
  ('Santiago', 1),
  ('Concepción', 1),
  ('Valparaíso', 3);

COMMIT;
