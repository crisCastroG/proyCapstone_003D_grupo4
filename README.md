# Empleamás — Plataforma Web de Empleabilidad y Aprendizaje

## Descripción del Proyecto

**Empleamás** es una plataforma web *full-stack* diseñada para cerrar la brecha entre la capacitación laboral y la empleabilidad real. Bajo un modelo de negocio de prueba gratis, el sistema combina un entorno de aprendizaje secuencial con la generación automatizada de un **Perfil Profesional Digital** compartible.

Los usuarios avanzan a través de módulos multimedia y evaluaciones con exigencia mínima de aprobación, desbloqueando progresivamente los contenidos hasta habilitar una carta de presentación digital moderna (con enlace público único y código QR) para presentar y compartir de manera comnfiable a empleadores.

## Integrantes

| Nombre Completo | Rol en el Proyecto |
| :--- | :--- |
| `Cristian Castro` | Arquitectura Full-Stack & Base de Datos |
| `Tomás Leon` |  Desarrollo Frontend & UX/UI |
| `Hector Nahuelpan` | Integraciones, QA & Despliegue |

## Funciones Principales

* **Gestión de Identidad y Control de Acceso:**

  * Registro e inicio de sesión seguro con cifrado de credenciales mediante `bcrypt` y manejo de sesiones.

  * Segmentación de privilegios por roles y gestión de estado de cuentas.

* **Sistema de Aprendizaje Progresivo:**

  * Malla curricular organizada en módulos secuenciales con lecciones multimedia (texto, video, imágenes, enlaces y recursos descargables).

  * Seguimiento en tiempo real del porcentaje de avance por lección y módulo.

* **Motor de Evaluaciones y Desbloqueo Condicional:**

  * Cuestionarios por módulo con registro de intentos y respuestas.

  * Validación automática de umbral mínimo(que también es editable) de aprobación para habilitar el acceso al siguiente módulo.

* **Perfil Profesional Digital (Empleabilidad):**

  * Herramienta habilitada al completar el **100%** de la ruta de aprendizaje.

  * Edición de resumen profesional, habilidades clave, fotografía y enlace a LinkedIn.

  * Generación de vista pública de solo lectura accesible sin registro mediante identificador único y código QR descargable.

* **Monetización y Pasarela de Pagos:**

  * Modelo de prueba gratis con módulo introductorio abierto y planes de suscripción (**Pro 6 meses** y **Pro 12 meses**).

  * Integración transaccional con **Transbank Webpay Plus** para validación de pagos y activación automática de planes.

* **Soporte Contextual y Panel Administrativo (Backoffice):**

  * Canal de mensajería directa vinculado a cada lección para resolver consultas académicas.

  * Dashboard administrativo para gestión de contenidos , evaluaciones, mensajería y gestión de planes.

## Arquitectura

La aplicación sigue una arquitectura web construida sobre **Next.js**, integrando interfaz de usuario, lógica de negocio y rutas de API en un mismo proyecto TypeScript, conectado a una base de datos relacional en la nube.

```
+-------------------------------------------------------------------+
|                        Cliente (Navegador)                        |
|                         React + TypeScript                        |
+---------------------------------+---------------------------------+
                                  | HTTPS
                                  v
+-------------------------------------------------------------------+
|                            Servidor Next.js                       |
|               App Router , Server Actions , API Routes            |
+----------------+---------------------------------+----------------+
                 |                                 |
                 | SQL                             | REST API
                 v                                 v
+---------------------------------+ +-------------------------------+
|    PostgreSQL alojado en Neon   | |    Transbank Webpay Plus      |
|  Esquema Relacional & Dominios  | |    Pasarela de Pagos          |
+---------------------------------+ +-------------------------------+

```

### Tecnologías utilizadas

* **Frontend:** Next.js, React, TypeScript.

* **Backend & Seguridad:** Next.js API Routes , Server Actions, `bcrypt` paa el hashing de contraseñas, control de sesiones.

* **Base de Datos:** PostgreSQL alojado en **Neon.tech** (modelado en Oracle SQL Developer Data Modeler).

* **Almacenamiento de archivos:** Cloud storage en Uploadthing.

* **Pagos:** SDK / API de **Transbank Webpay Plus**.

* **Mnesajería y notificaciones:** Nodemailer / Gmail SMTP.

* **Infraestructura, contenedor y control de versiones:** Docker , GitHub y Vercel.

## Instrucciones de Despliegue con Docker

El proyecto incluye un `Dockerfile` optimizado mediante **construcción multietapa** sobre `node:20-alpine` para reducir el tamaño final de la imagen y mejorar la seguridad en producción:

1. **Etapa `deps`:** Instala de forma limpia y determinista las dependencias definidas en `package-lock.json` (`npm ci`).

2. **Etapa `builder`:** Copia el código fuente y compila la aplicación de producción (`npm run build`) con telemetría deshabilitada.

3. **Etapa `runner`:** Genera una imagen ligera de ejecución que expone el puerto `3000` bajo un usuario sin privilegios de administrador ejecutando `npm start`.

### Prerrequisitos

* [Docker](https://docs.docker.com/get-docker/) instalado y en ejecución.

* Instancia de base de datos PostgreSQL operativa (local o en Neon.tech) con el esquema inicial ejecutado.

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (junto al `Dockerfile`) con las variables requeridas por la aplicación:

```
# --- Base de Datos PostgreSQL ---
# Opción A: Testeo local
DATABASE_URL="postgresql://apt_dev:<tu_clave_local>@localhost:5432/empleabilidad_dev"

# Opción B: Producción (Neon.tech)
# DATABASE_URL="postgresql://<usuario>:<password>@<host>.neon.tech/neondb?sslmode=require&channel_binding=require"

# --- Almacenamiento de Archivos ---
# Opciones: 'local' para desarrollo | 'uploadthing' para producción
NEXT_PUBLIC_STORAGE_PROVIDER=local
UPLOADTHING_TOKEN="<tu_uploadthing_token>"
UPLOADTHING_APP_ID="<tu_uploadthing_app_id>"

# --- Pasarela de Pagos (Transbank Webpay Plus) ---
# Credenciales de integración por defecto; reemplazar por credenciales productivas en producción
TBK_COMMERCE_CODE=597055555532
TBK_API_KEY="<tu_tbk_api_key>"

# URL base de la aplicación (obligatoria para retornos de Webpay Plus)
APP_URL="http://localhost:3000"

# --- Servidor de Correo (SMTP) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=<TU_CONTRASENA_DE_APLICACION>
SMTP_FROM="Empleamás <tu-correo@gmail.com>"
```

### 2. Construir la Imagen Docker

Desde la raíz del proyecto donde se ubica el `Dockerfile`, ejecuta:

```
docker build -t empleamas-web:latest .

```

### 3. Ejecutar el Contenedor

Levanta el contenedor inyectando el archivo de variables de entorno y mapeando el puerto `3000` del host al puerto `3000` expuesto por la imagen:

```
docker run -d \
  --name empleamas-app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  empleamas-web:latest

```

Una vez iniciado, la plataforma estará disponible en **`http://localhost:3000`**.

### Comandos Útiles de Administración

* **Ver registros en tiempo real:** `docker logs -f empleamas-app`

* **Detener el contenedor:** `docker stop empleamas-app`

* **Iniciar nuevamente:** `docker start empleamas-app`

* **Eliminar contenedor:** `docker rm -f empleamas-app`