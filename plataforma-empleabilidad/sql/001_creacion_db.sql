BEGIN;

-- Dominios

CREATE DOMAIN public.estado_contenido AS VARCHAR(20)
CHECK (VALUE IN ('borrador', 'publicado'));

CREATE DOMAIN public.estado_evaluacion AS VARCHAR(20)
CHECK (VALUE IN ('borrador', 'publicada'));

CREATE DOMAIN public.estado_pago AS VARCHAR(20)
CHECK (
VALUE IN ('aprobado', 'pendiente', 'rechazado', 'reembolsado')
);

CREATE DOMAIN public.estado_progreso AS VARCHAR(20)
CHECK (VALUE IN ('no_completado', 'completado'));

CREATE DOMAIN public.estado_usuario AS VARCHAR(20)
CHECK (VALUE IN ('activo', 'desactivado'));

CREATE DOMAIN public.genero AS VARCHAR(20)
CHECK (VALUE IN ('Femenino', 'Masculino', 'Otros'));

CREATE DOMAIN public.tipo_bloque AS VARCHAR(20)
CHECK (VALUE IN ('descarga', 'imagen', 'texto', 'url', 'video'));

-- Webpay informa crédito, débito o prepago.
CREATE DOMAIN public.tipo_pago AS VARCHAR(20)
CHECK (VALUE IN ('credito', 'debito', 'prepago'));

-- Tablas maestras

CREATE TABLE public.rol_usuario (
id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_rol VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE public.profesion (
id_profesion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_profesion VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE public.area_de_trabajo (
id_area INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_area VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE public.region (
id_region INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_region VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE public.ciudad (
id_ciudad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_ciudad VARCHAR(100) NOT NULL,
region_id_region INTEGER NOT NULL
REFERENCES public.region (id_region),

CONSTRAINT ciudad_region_nombre_uk
    UNIQUE (region_id_region, nombre_ciudad)


);

-- Tablas de usuario

CREATE TABLE public.usuario (
id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

correo VARCHAR(254) NOT NULL,
contraseña VARCHAR(255) NOT NULL,
codigo_recuperacion_contrasena VARCHAR(255),
expiracion_codigo_recuperacion TIMESTAMPTZ,
run VARCHAR(12) NOT NULL UNIQUE,
nombre VARCHAR(80) NOT NULL,
apellido_paterno VARCHAR(80) NOT NULL,
apellido_materno VARCHAR(80),
fecha_nacimiento DATE,
genero public.genero NOT NULL,
estado_usuario public.estado_usuario NOT NULL DEFAULT 'activo',
telefono VARCHAR(20),
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,
fecha_desactivacion TIMESTAMPTZ,
motivo_desactivacion TEXT,

profesion_id_profesion INTEGER NOT NULL
    REFERENCES public.profesion (id_profesion),

area_de_trabajo_id_area INTEGER NOT NULL
    REFERENCES public.area_de_trabajo (id_area),

ciudad_id_ciudad INTEGER NOT NULL
    REFERENCES public.ciudad (id_ciudad),

rol_usuario_id_rol INTEGER NOT NULL
    REFERENCES public.rol_usuario (id_rol),

CONSTRAINT usuario_correo_basico_ck
    CHECK (correo = BTRIM(correo) AND correo <> '')


);

CREATE UNIQUE INDEX usuario_correo_lower_uk
ON public.usuario (LOWER(correo));

CREATE TABLE public.perfil_profesional (
id_perfil_profesional INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
resumen TEXT,
link_linkedin VARCHAR(255),
qr TEXT,
foto TEXT,
habilidades TEXT[],
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,
token_publico UUID DEFAULT gen_random_uuid() UNIQUE,

usuario_id_usuario INTEGER NOT NULL UNIQUE
    REFERENCES public.usuario (id_usuario) ON DELETE CASCADE
);

-- Empresa: un usuario pasa a ser "Empresa" cuando el superadministrador
-- lo agrega aquí con sus datos (nombre, razón social, RUT, giro, contacto).
-- No hay un rol "empresa": lo que la marca como empresa es tener su fila aquí.
-- Una fila por cuenta.
CREATE TABLE public.empresa (
id_empresa INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_empresa VARCHAR(200) NOT NULL,      -- nombre comercial (de fantasía)
razon_social VARCHAR(200) NOT NULL,        -- nombre legal
rut_empresa VARCHAR(12) NOT NULL UNIQUE,
giro VARCHAR(200) NOT NULL,                -- actividad económica
direccion VARCHAR(255) NOT NULL,
telefono_contacto VARCHAR(20) NOT NULL,
correo_contacto VARCHAR(254) NOT NULL,

usuario_id_usuario INTEGER NOT NULL UNIQUE
    REFERENCES public.usuario (id_usuario),

fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

-- Misma regla básica que usuario.correo: sin espacios al borde y no vacío.
CONSTRAINT empresa_correo_basico_ck
    CHECK (correo_contacto = BTRIM(correo_contacto) AND correo_contacto <> '')
);

-- Modulos y contenidos

CREATE TABLE public.modulo (
id_modulo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
titulo_modulo VARCHAR(200) NOT NULL,
descripcion_modulo TEXT,
posicion_modulo INTEGER NOT NULL,
esta_publicado BOOLEAN NOT NULL DEFAULT FALSE,
es_gratuito BOOLEAN NOT NULL DEFAULT FALSE, 
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT modulo_posicion_ck
    CHECK (posicion_modulo > 0)


);

CREATE TABLE public.contenido (
id_contenido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
titulo_contenido VARCHAR(200) NOT NULL,
descripcion_contenido TEXT,
orden_contenido INTEGER NOT NULL,

estado_contenido public.estado_contenido
    NOT NULL DEFAULT 'borrador',

duracion_estimada INTEGER,

fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_publicacion TIMESTAMPTZ,

modulo_id_modulo INTEGER NOT NULL
    REFERENCES public.modulo (id_modulo),

CONSTRAINT contenido_orden_ck
    CHECK (orden_contenido > 0),

CONSTRAINT contenido_duracion_ck
    CHECK (duracion_estimada > 0),

CONSTRAINT contenido_modulo_orden_uk
    UNIQUE (modulo_id_modulo, orden_contenido)


);

CREATE TABLE public.bloque_contenido (
id_bloque INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
tipo_bloque public.tipo_bloque NOT NULL,
titulo_bloque VARCHAR(200),
contenido_texto TEXT,
url_recurso VARCHAR(200),
orden_bloque INTEGER NOT NULL,
es_obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,

contenido_id_contenido INTEGER NOT NULL
    REFERENCES public.contenido (id_contenido),

CONSTRAINT bloque_orden_ck
    CHECK (orden_bloque > 0),

CONSTRAINT bloque_contenido_orden_uk
    UNIQUE (contenido_id_contenido, orden_bloque)


);

CREATE TABLE public.recurso (
id_recurso INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
titulo_recurso VARCHAR(200) NOT NULL,
url_recurso TEXT,
nombre_archivo VARCHAR(255),
tamano_bytes BIGINT,
es_descargable BOOLEAN NOT NULL DEFAULT TRUE,
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,

bloque_contenido_id_bloque INTEGER NOT NULL
    REFERENCES public.bloque_contenido (id_bloque),

CONSTRAINT recurso_tamano_ck
    CHECK (tamano_bytes >= 0)


);

CREATE TABLE public.formulario_leccion (
    id_formulario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_formulario VARCHAR(200),
    descripcion_formulario TEXT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contenido_id_contenido INTEGER NOT NULL UNIQUE 
        REFERENCES public.contenido (id_contenido) ON DELETE CASCADE,
    usuario_id_admin INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE
);

CREATE TABLE public.mensaje_contacto (
    id_mensaje INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_mensaje VARCHAR(20) NOT NULL DEFAULT 'no_leido' 
        CHECK (estado_mensaje IN ('no leido', 'leido', 'respondido')),
    contenido_id_contenido INTEGER NOT NULL 
        REFERENCES public.contenido (id_contenido) ON DELETE CASCADE,
    usuario_id_remitente INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE,
    usuario_id_destinatario INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE
);

-- Planes y pagos (Webpay Plus)
--   * Usuario natural: compra el plan Pro (todos los módulos) por 6 o 12 meses.
--   * Empresa: compra cupos de un módulo por 6 o 12 meses; cada cupo es un código
--     de acceso de un solo uso que queda ligado a la cuenta que lo canjea.
-- Va después de "Modulos" porque precio_modulo y compra_modulo apuntan a modulo.

CREATE TABLE public.proveedor_pago (
id_proveedor_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_proveedor_pago VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE public.plan (
id_plan INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
nombre_plan VARCHAR(80) NOT NULL UNIQUE,
costo_plan NUMERIC(12,2) NOT NULL,
duracion_plan INTEGER NOT NULL DEFAULT 30, -- Duración en días
descripcion_plan TEXT,

CONSTRAINT plan_costo_ck
    CHECK (costo_plan >= 0),
CONSTRAINT plan_duracion_ck
    CHECK (duracion_plan > 0)


);

-- Precio por cupo de cada módulo, a 6 o 12 meses.
-- Cada módulo de pago necesita sus 2 filas aquí.
CREATE TABLE public.precio_modulo (
id_precio_modulo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

modulo_id_modulo INTEGER NOT NULL
    REFERENCES public.modulo (id_modulo),

duracion_meses INTEGER NOT NULL,
precio_cupo NUMERIC(12,2) NOT NULL,
esta_activo BOOLEAN NOT NULL DEFAULT TRUE,

CONSTRAINT precio_modulo_meses_ck
    CHECK (duracion_meses IN (6, 12)),
CONSTRAINT precio_modulo_precio_ck
    CHECK (precio_cupo > 0),
CONSTRAINT precio_modulo_uk
    UNIQUE (modulo_id_modulo, duracion_meses)
);

-- pago: quién paga, datos de Webpay y QUÉ se está comprando.
-- Lo comprado se guarda en el pago porque la compra (plan_usuario o
-- compra_modulo) se crea recién cuando Webpay aprueba.
CREATE TABLE public.pago (
id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
monto_pago NUMERIC(12,2) NOT NULL,
estado_pago public.estado_pago NOT NULL DEFAULT 'pendiente',
codigo_transaccion VARCHAR(100),

fecha_pago TIMESTAMPTZ,

fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,
respuesta_pago TEXT,

tipo_pago public.tipo_pago,                 -- se conoce recién en el commit de Webpay

id_proveedor_pago INTEGER NOT NULL
    REFERENCES public.proveedor_pago (id_proveedor_pago),

usuario_id_usuario INTEGER NOT NULL
    REFERENCES public.usuario (id_usuario),
orden_compra VARCHAR(26) NOT NULL,          -- buy_order de Webpay (máx. 26)
token_ws VARCHAR(64),                       -- llega en create
codigo_autorizacion VARCHAR(10),            -- llega en commit

-- Lo comprado: un plan (usuario natural) O un módulo con cupos (empresa)
plan_id_plan INTEGER
    REFERENCES public.plan (id_plan),
precio_modulo_id_precio_modulo INTEGER
    REFERENCES public.precio_modulo (id_precio_modulo),
cantidad_cupos INTEGER,

CONSTRAINT pago_monto_ck
    CHECK (monto_pago > 0),
CONSTRAINT pago_orden_compra_uk
    UNIQUE (orden_compra),
CONSTRAINT pago_token_ws_uk
    UNIQUE (token_ws),
CONSTRAINT pago_que_se_compra_ck CHECK (
    (plan_id_plan IS NOT NULL
        AND precio_modulo_id_precio_modulo IS NULL
        AND cantidad_cupos IS NULL)
 OR (plan_id_plan IS NULL
        AND precio_modulo_id_precio_modulo IS NOT NULL
        AND cantidad_cupos > 0)
)
);

CREATE TABLE public.plan_usuario (
id_plan_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
fecha_inicio TIMESTAMPTZ NOT NULL,
fecha_termino TIMESTAMPTZ NOT NULL,

usuario_id_usuario INTEGER NOT NULL
    REFERENCES public.usuario (id_usuario),

plan_id_plan INTEGER NOT NULL
    REFERENCES public.plan (id_plan),

pago_id_pago INTEGER NOT NULL
    REFERENCES public.pago (id_pago),

CONSTRAINT plan_usuario_fechas_ck
    CHECK (fecha_termino > fecha_inicio),

-- Un pago activa como máximo UN período de plan
-- (si el commit se procesa dos veces, no se duplica el acceso).
CONSTRAINT plan_usuario_pago_uk
    UNIQUE (pago_id_pago)
);

-- Compra de un módulo por una empresa (se crea cuando Webpay aprueba).
CREATE TABLE public.compra_modulo (
id_compra_modulo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

empresa_id_empresa INTEGER NOT NULL
    REFERENCES public.empresa (id_empresa),
modulo_id_modulo INTEGER NOT NULL
    REFERENCES public.modulo (id_modulo),
pago_id_pago INTEGER NOT NULL UNIQUE
    REFERENCES public.pago (id_pago),

cantidad_cupos INTEGER NOT NULL,
fecha_inicio TIMESTAMPTZ NOT NULL,
fecha_termino TIMESTAMPTZ NOT NULL,

CONSTRAINT compra_modulo_cupos_ck
    CHECK (cantidad_cupos > 0),
CONSTRAINT compra_modulo_fechas_ck
    CHECK (fecha_termino > fecha_inicio)
);

-- Códigos de acceso: uno por cupo. Libre mientras usuario_id_usuario es NULL;
-- al canjearlo queda ligado a esa cuenta para siempre.
CREATE TABLE public.codigo_acceso (
id_codigo_acceso INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

compra_modulo_id_compra_modulo INTEGER NOT NULL
    REFERENCES public.compra_modulo (id_compra_modulo),

codigo VARCHAR(20) NOT NULL UNIQUE,

usuario_id_usuario INTEGER              -- quién lo canjeó (NULL = libre)
    REFERENCES public.usuario (id_usuario),
fecha_canje TIMESTAMPTZ,

-- Canjeado = tiene usuario Y fecha; libre = ninguno de los dos.
CONSTRAINT codigo_acceso_canje_ck
    CHECK ((usuario_id_usuario IS NULL) = (fecha_canje IS NULL)),
-- Una misma persona no puede ocupar dos cupos de la misma compra.
CONSTRAINT codigo_acceso_un_cupo_por_usuario_uk
    UNIQUE (compra_modulo_id_compra_modulo, usuario_id_usuario)
);

-- Evaluaciones

CREATE TABLE public.evaluacion (
    id_evaluacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_evaluacion VARCHAR(200) NOT NULL,
    descripcion_evaluacion TEXT,
    porcentaje_minimo_aprobacion NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    duracion_minutos INTEGER NOT NULL DEFAULT 15,
    orden_evaluacion INTEGER NOT NULL DEFAULT 1,
    estado_evaluacion public.estado_evaluacion NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    modulo_id_modulo INTEGER NOT NULL 
        REFERENCES public.modulo (id_modulo) ON DELETE CASCADE,

    CONSTRAINT evaluacion_porcentaje_ck
        CHECK (porcentaje_minimo_aprobacion BETWEEN 0 AND 100),
    CONSTRAINT evaluacion_duracion_ck
        CHECK (duracion_minutos > 0),
    CONSTRAINT evaluacion_modulo_orden_uk
        UNIQUE (modulo_id_modulo, orden_evaluacion)
);

CREATE TABLE public.pregunta (
    id_pregunta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enunciado TEXT NOT NULL,
    puntaje NUMERIC(8,2) NOT NULL DEFAULT 1.00,
    orden INTEGER NOT NULL,
    evaluacion_id_evaluacion INTEGER NOT NULL 
        REFERENCES public.evaluacion (id_evaluacion) ON DELETE CASCADE,

    CONSTRAINT pregunta_puntaje_ck
        CHECK (puntaje >= 0),
    CONSTRAINT pregunta_orden_ck
        CHECK (orden > 0),
    CONSTRAINT pregunta_evaluacion_orden_uk
        UNIQUE (evaluacion_id_evaluacion, orden)
);

CREATE TABLE public.alternativa (
    id_alternativa INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    texto_alternativa TEXT NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL,
    pregunta_id_pregunta INTEGER NOT NULL 
        REFERENCES public.pregunta (id_pregunta) ON DELETE CASCADE,

    CONSTRAINT alternativa_orden_ck
        CHECK (orden BETWEEN 1 AND 9),
    CONSTRAINT alternativa_pregunta_orden_uk
        UNIQUE (pregunta_id_pregunta, orden)
);

-- Intentos y respuestas

CREATE TABLE public.intento_evaluacion (
    id_intento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_intento INTEGER NOT NULL,
    fecha_intento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    puntaje_obtenido NUMERIC(8,2),
    aprobado BOOLEAN DEFAULT FALSE,
    usuario_id_usuario INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE,
    evaluacion_id_evaluacion INTEGER NOT NULL 
        REFERENCES public.evaluacion (id_evaluacion) ON DELETE CASCADE,

    CONSTRAINT intento_numero_ck
        CHECK (numero_intento > 0),
    CONSTRAINT intento_puntaje_ck
        CHECK (puntaje_obtenido >= 0),
    CONSTRAINT intento_usuario_evaluacion_numero_uk
        UNIQUE (usuario_id_usuario, evaluacion_id_evaluacion, numero_intento)
);

CREATE TABLE public.respuesta_usuario (
    id_respuesta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    es_correcta BOOLEAN,
    alternativa_id_alternativa INTEGER NOT NULL 
        REFERENCES public.alternativa (id_alternativa) ON DELETE CASCADE,
    intento_evaluacion_id_intento INTEGER NOT NULL 
        REFERENCES public.intento_evaluacion (id_intento) ON DELETE CASCADE,

    CONSTRAINT respuesta_intento_alternativa_uk
        UNIQUE (intento_evaluacion_id_intento, alternativa_id_alternativa)
);

-- Progreso del usuario

CREATE TABLE public.progreso_contenido (
    estado_progreso public.estado_progreso NOT NULL DEFAULT 'no_completado',
    fecha_completado TIMESTAMPTZ,
    usuario_id_usuario INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE,
    contenido_id_contenido INTEGER NOT NULL 
        REFERENCES public.contenido (id_contenido) ON DELETE CASCADE,

    CONSTRAINT progreso_contenido_pk 
        PRIMARY KEY (usuario_id_usuario, contenido_id_contenido)
);

CREATE TABLE public.progreso_evaluacion (
    estado_progreso public.estado_progreso NOT NULL DEFAULT 'no_completado',
    puntaje_maximo NUMERIC(8,2) DEFAULT 0,
    aprobado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_completado TIMESTAMPTZ,
    usuario_id_usuario INTEGER NOT NULL 
        REFERENCES public.usuario (id_usuario) ON DELETE CASCADE,
    evaluacion_id_evaluacion INTEGER NOT NULL 
        REFERENCES public.evaluacion (id_evaluacion) ON DELETE CASCADE,

    CONSTRAINT progreso_evaluacion_pk 
        PRIMARY KEY (usuario_id_usuario, evaluacion_id_evaluacion)
);

-- Indices

CREATE INDEX usuario_profesion_idx ON public.usuario (profesion_id_profesion);
CREATE INDEX usuario_area_idx ON public.usuario (area_de_trabajo_id_area);
CREATE INDEX usuario_ciudad_idx ON public.usuario (ciudad_id_ciudad);
CREATE INDEX usuario_rol_idx ON public.usuario (rol_usuario_id_rol);
CREATE INDEX perfil_profesional_usuario_idx ON public.perfil_profesional (usuario_id_usuario);
CREATE INDEX pago_proveedor_idx ON public.pago (id_proveedor_pago);
CREATE INDEX pago_codigo_transaccion_idx ON public.pago (codigo_transaccion);
CREATE INDEX plan_usuario_usuario_idx ON public.plan_usuario (usuario_id_usuario);
CREATE INDEX plan_usuario_plan_idx ON public.plan_usuario (plan_id_plan);
CREATE INDEX mensaje_contacto_destinatario_idx ON public.mensaje_contacto (usuario_id_destinatario);
CREATE INDEX mensaje_contacto_remitente_idx ON public.mensaje_contacto (usuario_id_remitente);
CREATE INDEX pago_usuario_idx ON public.pago (usuario_id_usuario);
CREATE INDEX compra_modulo_empresa_idx ON public.compra_modulo (empresa_id_empresa);
CREATE INDEX compra_modulo_modulo_idx ON public.compra_modulo (modulo_id_modulo);
CREATE INDEX codigo_acceso_compra_idx ON public.codigo_acceso (compra_modulo_id_compra_modulo);
CREATE INDEX codigo_acceso_usuario_idx ON public.codigo_acceso (usuario_id_usuario);
CREATE INDEX recurso_bloque_idx ON public.recurso (bloque_contenido_id_bloque);
CREATE INDEX evaluacion_contenido_idx ON public.evaluacion (modulo_id_modulo);
CREATE INDEX intento_evaluacion_idx ON public.intento_evaluacion (evaluacion_id_evaluacion);
CREATE INDEX respuesta_alternativa_idx ON public.respuesta_usuario (alternativa_id_alternativa);
CREATE INDEX progreso_contenido_idx ON public.progreso_contenido (contenido_id_contenido);

-- Datos iniciales

INSERT INTO public.rol_usuario (nombre_rol)
VALUES
('administrador'),
('usuario'),
('superadministrador');

-- Pagos: proveedor y planes Pro. Precios de ejemplo para la demo:
-- se cambian con UPDATE, no tocando código.
INSERT INTO public.proveedor_pago (nombre_proveedor_pago)
VALUES ('Transbank Webpay Plus')
ON CONFLICT (nombre_proveedor_pago) DO NOTHING;

INSERT INTO public.plan (nombre_plan, costo_plan, duracion_plan, descripcion_plan)
VALUES
('Pro 6 meses', 150000, 180, 'Acceso a todos los módulos por 6 meses.'),
('Pro 12 meses', 250000, 365, 'Acceso a todos los módulos por 12 meses.')
ON CONFLICT (nombre_plan) DO NOTHING;

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

INSERT INTO public.region (nombre_region) VALUES
    ('Región de Arica y Parinacota'),
    ('Región de Tarapacá'),
    ('Región de Antofagasta'),
    ('Región de Atacama'),
    ('Región de Coquimbo'),
    ('Región de Valparaíso'),
    ('Región Metropolitana de Santiago'),
    ('Región del Libertador General Bernardo O''Higgins'),
    ('Región del Maule'),
    ('Región de Ñuble'),
    ('Región del Biobío'),
    ('Región de La Araucanía'),
    ('Región de Los Ríos'),
    ('Región de Los Lagos'),
    ('Región de Aysén del General Carlos Ibáñez del Campo'),
    ('Región de Magallanes y de la Antártica Chilena')
ON CONFLICT (nombre_region) DO NOTHING;

INSERT INTO public.ciudad (nombre_ciudad, region_id_region) VALUES
    -- 1: Arica y Parinacota
    ('Arica', 1),
    ('Putre', 1),
    -- 2: Tarapacá
    ('Iquique', 2),
    ('Alto Hospicio', 2),
    ('Pozo Almonte', 2),
    -- 3: Antofagasta
    ('Antofagasta', 3),
    ('Calama', 3),
    ('Tocopilla', 3),
    ('Mejillones', 3),
    -- 4: Atacama
    ('Copiapó', 4),
    ('Vallenar', 4),
    ('Caldera', 4),
    ('Chañaral', 4),
    -- 5: Coquimbo
    ('La Serena', 5),
    ('Coquimbo', 5),
    ('Ovalle', 5),
    ('Illapel', 5),
    -- 6: Valparaíso
    ('Valparaíso', 6),
    ('Viña del Mar', 6),
    ('Quilpué', 6),
    ('Villa Alemana', 6),
    ('San Antonio', 6),
    ('Quillota', 6),
    ('Los Andes', 6),
    ('San Felipe', 6),
    -- 7: Metropolitana
    ('Santiago', 7),
    ('Providencia', 7),
    ('Las Condes', 7),
    ('Maipú', 7),
    ('Puente Alto', 7),
    ('Ñuñoa', 7),
    ('La Florida', 7),
    ('San Bernardo', 7),
    ('Colina', 7),
    ('Melipilla', 7),
    ('Talagante', 7),
    -- 8: O'Higgins
    ('Rancagua', 8),
    ('San Fernando', 8),
    ('Rengo', 8),
    ('Pichilemu', 8),
    ('Santa Cruz', 8),
    -- 9: Maule
    ('Talca', 9),
    ('Curicó', 9),
    ('Linares', 9),
    ('Cauquenes', 9),
    ('Constitución', 9),
    ('Molina', 9),
    -- 10: Ñuble
    ('Chillán', 10),
    ('Chillán Viejo', 10),
    ('San Carlos', 10),
    ('Bulnes', 10),
    ('Quirihue', 10),
    -- 11: Biobío
    ('Concepción', 11),
    ('Talcahuano', 11),
    ('Chiguayante', 11),
    ('San Pedro de la Paz', 11),
    ('Hualpén', 11),
    ('Coronel', 11),
    ('Lota', 11),
    ('Tomé', 11),
    ('Penco', 11),
    ('Los Ángeles', 11),
    ('Lebu', 11),
    ('Arauco', 11),
    -- 12: La Araucanía
    ('Temuco', 12),
    ('Padre Las Casas', 12),
    ('Villarrica', 12),
    ('Pucón', 12),
    ('Angol', 12),
    ('Victoria', 12),
    -- 13: Los Ríos
    ('Valdivia', 13),
    ('La Unión', 13),
    ('Río Bueno', 13),
    ('Panguipulli', 13),
    -- 14: Los Lagos
    ('Puerto Montt', 14),
    ('Osorno', 14),
    ('Puerto Varas', 14),
    ('Castro', 14),
    ('Ancud', 14),
    ('Frutillar', 14),
    -- 15: Aysén
    ('Coyhaique', 15),
    ('Puerto Aysén', 15),
    ('Chile Chico', 15),
    -- 16: Magallanes
    ('Punta Arenas', 16),
    ('Puerto Natales', 16),
    ('Porvenir', 16)
ON CONFLICT (region_id_region, nombre_ciudad) DO NOTHING;

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

COMMIT;