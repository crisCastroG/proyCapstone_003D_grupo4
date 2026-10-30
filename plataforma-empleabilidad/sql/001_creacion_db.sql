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
CHECK (VALUE IN ('no_iniciado', 'en_progreso', 'completado'));

CREATE DOMAIN public.estado_usuario AS VARCHAR(20)
CHECK (VALUE IN ('activo', 'desactivado'));

CREATE DOMAIN public.genero AS VARCHAR(20)
CHECK (VALUE IN ('Femenino', 'Masculino', 'Otros'));

CREATE DOMAIN public.tipo_bloque AS VARCHAR(20)
CHECK (VALUE IN ('descarga', 'imagen', 'texto', 'url', 'video'));

CREATE DOMAIN public.tipo_pago AS VARCHAR(20)
CHECK (VALUE IN ('credito', 'debito'));

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
fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,

usuario_id_usuario INTEGER NOT NULL UNIQUE
    REFERENCES public.usuario (id_usuario) ON DELETE CASCADE
);

-- Planes y pagos

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

CREATE TABLE public.pago (
id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
monto_pago NUMERIC(12,2) NOT NULL,
estado_pago public.estado_pago NOT NULL DEFAULT 'pendiente',
codigo_transaccion VARCHAR(100), 

fecha_pago TIMESTAMPTZ,

fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMPTZ,
respuesta_pago TEXT,

tipo_pago public.tipo_pago NOT NULL,

id_proveedor_pago INTEGER NOT NULL
    REFERENCES public.proveedor_pago (id_proveedor_pago),

CONSTRAINT pago_monto_ck
    CHECK (monto_pago > 0)


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
    CHECK (fecha_termino > fecha_inicio)


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

-- Evaluaciones

CREATE TABLE public.evaluacion (
id_evaluacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
titulo_evaluacion VARCHAR(200) NOT NULL,
descripcion_evaluacion TEXT,
porcentaje_minimo_aprobacion NUMERIC(5,2) NOT NULL,
duracion_minutos INTEGER NOT NULL,

estado_evaluacion public.estado_evaluacion
    NOT NULL DEFAULT 'borrador',

fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

contenido_id_contenido INTEGER NOT NULL
    REFERENCES public.contenido (id_contenido),

CONSTRAINT evaluacion_porcentaje_ck
    CHECK (porcentaje_minimo_aprobacion BETWEEN 0 AND 100),

CONSTRAINT evaluacion_duracion_ck
    CHECK (duracion_minutos > 0)


);

CREATE TABLE public.pregunta (
id_pregunta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
enunciado TEXT NOT NULL,
puntaje NUMERIC(8,2) NOT NULL,
orden INTEGER NOT NULL,

evaluacion_id_evaluacion INTEGER NOT NULL
    REFERENCES public.evaluacion (id_evaluacion),

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
    REFERENCES public.pregunta (id_pregunta),

CONSTRAINT alternativa_orden_ck
    CHECK (orden > 0),

CONSTRAINT alternativa_pregunta_orden_uk
    UNIQUE (pregunta_id_pregunta, orden)


);

-- Intentos y respuestas

CREATE TABLE public.intento_evaluacion (
id_intento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

numero_intento INTEGER NOT NULL,

fecha_intento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

puntaje_obtenido NUMERIC(8,2),
aprobado BOOLEAN,

usuario_id_usuario INTEGER NOT NULL
    REFERENCES public.usuario (id_usuario),

evaluacion_id_evaluacion INTEGER NOT NULL
    REFERENCES public.evaluacion (id_evaluacion),

CONSTRAINT intento_numero_ck
    CHECK (numero_intento > 0),

CONSTRAINT intento_puntaje_ck
    CHECK (puntaje_obtenido >= 0),

CONSTRAINT intento_usuario_evaluacion_numero_uk
    UNIQUE (
        usuario_id_usuario,
        evaluacion_id_evaluacion,
        numero_intento
    )


);

CREATE TABLE public.respuesta_usuario (
id_respuesta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

es_correcta BOOLEAN,

alternativa_id_alternativa INTEGER NOT NULL
    REFERENCES public.alternativa (id_alternativa),

intento_evaluacion_id_intento INTEGER NOT NULL
    REFERENCES public.intento_evaluacion (id_intento),

CONSTRAINT respuesta_intento_alternativa_uk
    UNIQUE (
        intento_evaluacion_id_intento,
        alternativa_id_alternativa
    )


);

-- Progreso del usuario

CREATE TABLE public.progreso_contenido (
estado_progreso public.estado_progreso
NOT NULL DEFAULT 'no_iniciado',

fecha_completado TIMESTAMPTZ,

usuario_id_usuario INTEGER NOT NULL
    REFERENCES public.usuario (id_usuario),

contenido_id_contenido INTEGER NOT NULL
    REFERENCES public.contenido (id_contenido),

CONSTRAINT progreso_contenido_pk
    PRIMARY KEY (
        usuario_id_usuario,
        contenido_id_contenido
    )


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
CREATE INDEX plan_usuario_pago_idx ON public.plan_usuario (pago_id_pago);

CREATE INDEX recurso_bloque_idx ON public.recurso (bloque_contenido_id_bloque);
CREATE INDEX evaluacion_contenido_idx ON public.evaluacion (contenido_id_contenido);
CREATE INDEX intento_evaluacion_idx ON public.intento_evaluacion (evaluacion_id_evaluacion);
CREATE INDEX respuesta_alternativa_idx ON public.respuesta_usuario (alternativa_id_alternativa);
CREATE INDEX progreso_contenido_idx ON public.progreso_contenido (contenido_id_contenido);

-- Datos iniciales

INSERT INTO public.rol_usuario (nombre_rol)
VALUES
('administrador'),
('usuario');

COMMIT;