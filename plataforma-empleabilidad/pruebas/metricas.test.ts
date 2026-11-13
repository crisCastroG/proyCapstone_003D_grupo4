// Crea una base temporal con el esquema real (sql/), la llena con datos conocidos y comprueba que
// cada métrica coincida con el valor calculado a mano. No toca la base de desarrollo
//
// Para su Uso:   npm run test:metricas
// Requiere PostgreSQL accesible. Variable opcional TEST_ADMIN_URL (por defecto la misma
// conexión de DATABASE_URL pero a la base "postgres").

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const NOMBRE_BD = `metricas_test_${process.pid}`;
const urlBase = process.env.TEST_ADMIN_URL ?? process.env.DATABASE_URL;
if (!urlBase) throw new Error('Define DATABASE_URL o TEST_ADMIN_URL para correr las pruebas.');

const urlAdmin = new URL(urlBase);
urlAdmin.pathname = '/postgres';
const urlPrueba = new URL(urlBase);
urlPrueba.pathname = `/${NOMBRE_BD}`;

let m: Awaited<ReturnType<typeof import('../lib/metricas').obtenerMetricasDashboard>>;

before(async () => {
  const admin = new Client({ connectionString: urlAdmin.toString() });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${NOMBRE_BD}`);
  await admin.end();

  const c = new Client({ connectionString: urlPrueba.toString() });
  await c.connect();
  for (const f of ['001_creacion_db.sql', 'insert_profesion_area-trabajo.sql', 'insert_region_comuna.sql']) {
    await c.query(readFileSync(path.join(process.cwd(), 'sql', f), 'utf8'));
  }

  // Parte desde cero (el script 001 trae usuarios y datos de ejemplo); se conservan los roles y catálogos.
  await c.query(`TRUNCATE public.usuario, public.modulo, public.plan, public.pago, public.proveedor_pago RESTART IDENTITY CASCADE`);
  const rol = async (nombre: string) =>
    (await c.query(`SELECT id_rol FROM public.rol_usuario WHERE nombre_rol = $1`, [nombre])).rows[0].id_rol;
  const rolUsuario = await rol('usuario');
  const rolAdmin = await rol('administrador');

  const usuario = async (run: string, rolId: number, estado = 'activo', diasAtras = 0) =>
    (await c.query(
      `INSERT INTO public.usuario (correo, "contraseña", run, nombre, apellido_paterno, genero, estado_usuario,
         profesion_id_profesion, area_de_trabajo_id_area, ciudad_id_ciudad, rol_usuario_id_rol, fecha_creacion)
       VALUES ($1,'x',$2,'N','A','Otros',$3,1,1,1,$4, CURRENT_TIMESTAMP - ($5 || ' days')::interval)
       RETURNING id_usuario`,
      [`${run}@t.cl`, run, estado, rolId, String(diasAtras)]
    )).rows[0].id_usuario as number;

  const A = await usuario('1-1', rolUsuario);
  const B = await usuario('2-2', rolUsuario);
  const C = await usuario('3-3', rolUsuario);
  await usuario('4-4', rolUsuario, 'activo', 40);        // registrado hace 40 días
  await usuario('5-5', rolUsuario, 'desactivado');       // dado de baja
  const ADM = await usuario('9-9', rolAdmin);            // administrador: no debe contarse

  // Pagos y suscripciones
  await c.query(`INSERT INTO public.proveedor_pago (nombre_proveedor_pago) VALUES ('Demo')`);
  await c.query(`INSERT INTO public.plan (nombre_plan, costo_plan, duracion_plan) VALUES ('Pro', 9990, 30)`);
  const pago = async (estado: string, diasAtras: number) =>
    (await c.query(
      `INSERT INTO public.pago (monto_pago, estado_pago, tipo_pago, id_proveedor_pago, fecha_pago, fecha_creacion)
       VALUES (9990, $1, 'credito', 1, CURRENT_TIMESTAMP - ($2 || ' days')::interval, CURRENT_TIMESTAMP - ($2 || ' days')::interval)
       RETURNING id_pago`,
      [estado, String(diasAtras)]
    )).rows[0].id_pago as number;
  const p1 = await pago('aprobado', 0);
  const p2 = await pago('aprobado', 45);
  await pago('pendiente', 0);
  await pago('rechazado', 0);
  await c.query(
    `INSERT INTO public.plan_usuario (fecha_inicio, fecha_termino, usuario_id_usuario, plan_id_plan, pago_id_pago) VALUES
       (CURRENT_TIMESTAMP - INTERVAL '1 day',  CURRENT_TIMESTAMP + INTERVAL '29 days', $1, 1, $3),  -- vigente
       (CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '15 days', $2, 1, $4)  -- vencida`,
    [A, B, p1, p2]
  );

  // Contenido y evaluaciones
  await c.query(`INSERT INTO public.modulo (titulo_modulo, posicion_modulo, esta_publicado) VALUES ('M1', 1, true), ('M2', 2, false)`);
  await c.query(
    `INSERT INTO public.contenido (titulo_contenido, orden_contenido, estado_contenido, modulo_id_modulo) VALUES
       ('L1',1,'publicado',1), ('L2',2,'publicado',1), ('L3',3,'borrador',1)`
  );
  await c.query(
    `INSERT INTO public.evaluacion (titulo_evaluacion, modulo_id_modulo, estado_evaluacion, orden_evaluacion) VALUES
       ('T1',1,'publicada',1), ('T2',1,'borrador',2)`
  );
  const intento = (u: number, n: number, ok: boolean) =>
    c.query(
      `INSERT INTO public.intento_evaluacion (numero_intento, puntaje_obtenido, aprobado, usuario_id_usuario, evaluacion_id_evaluacion)
       VALUES ($1, 1, $2, $3, 1)`,
      [n, ok, u]
    );
  await intento(A, 1, false); await intento(A, 2, true);
  await intento(B, 1, false); await intento(C, 1, true);

  await c.query(
    `INSERT INTO public.progreso_contenido (estado_progreso, usuario_id_usuario, contenido_id_contenido) VALUES
       ('completado',$1,1), ('completado',$1,2), ('completado',$2,1), ('no_completado',$2,2)`,
    [A, B]
  );

  // Perfiles digitales: A con QR, B sin QR, y uno del administrador (no debe contarse)
  await c.query(
    `INSERT INTO public.perfil_profesional (usuario_id_usuario, qr) VALUES ($1,'data:qr'), ($2,NULL), ($3,'data:qr')`,
    [A, B, ADM]
  );
  await c.end();

  process.env.DATABASE_URL = urlPrueba.toString();
  const { obtenerMetricasDashboard } = await import('../lib/metricas');
  m = await obtenerMetricasDashboard();
});

after(async () => {
  const { cerrarPool } = await import('../lib/db');
  await cerrarPool(); // cerrar antes de borrar la base temporal
  const admin = new Client({ connectionString: urlAdmin.toString() });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${NOMBRE_BD} WITH (FORCE)`);
  await admin.end();
});

test('usuarios: no cuenta administradores y separa activos / baja / nuevos', () => {
  assert.equal(m.usuarios.total, 5);
  assert.equal(m.usuarios.activos, 4);
  assert.equal(m.usuarios.desactivados, 1);
  assert.equal(m.usuarios.activos + m.usuarios.desactivados, m.usuarios.total);
  assert.equal(m.usuarios.nuevos30d, 4); // todos menos el de hace 40 días
});

test('usuarios: la serie mensual tiene 6 meses ordenados y suma el total', () => {
  const s = m.usuarios.registrosPorMes;
  assert.equal(s.length, 6);
  assert.deepEqual(s.map((p) => p.mes), [...s.map((p) => p.mes)].sort());
  assert.equal(s.reduce((a, p) => a + p.valor, 0), 5);
  assert.equal(s.at(-1)!.valor, 4); // el de hace 40 días cae en un mes anterior
});

test('pagos: los ingresos suman solo pagos aprobados', () => {
  assert.equal(m.pagos.ingresosTotales, 19980);
  assert.equal(m.pagos.ingresos30d, 9990);
  assert.equal(m.pagos.pagosAprobados, 2);
  assert.equal(m.pagos.ingresosPorMes.reduce((a, p) => a + p.valor, 0), m.pagos.ingresosTotales);
});

test('pagos: conteo por estado y suscripciones vigentes', () => {
  const porEstado = Object.fromEntries(m.pagos.pagosPorEstado.map((e) => [e.etiqueta, e.valor]));
  assert.deepEqual(porEstado, { aprobado: 2, pendiente: 1, rechazado: 1 });
  assert.equal(m.pagos.suscripcionesVigentes, 1); // la vencida no cuenta
  assert.deepEqual(m.pagos.suscripcionesPorPlan, [{ etiqueta: 'Pro', valor: 1 }]);
});

test('tests: intentos, aprobados y tasa de aprobación', () => {
  assert.equal(m.tests.intentosTotales, 4);
  assert.equal(m.tests.intentosAprobados, 2);
  assert.equal(m.tests.tasaAprobacion, 50);
  assert.equal(m.tests.usuariosQueRindieron, 3);
  assert.equal(m.tests.evaluacionesPublicadas, 1); // la de borrador no cuenta
  assert.equal(m.tests.intentosPorMes.reduce((a, p) => a + p.valor, 0), 4);
});

test('contenido: solo lo publicado y solo lecciones completadas', () => {
  assert.equal(m.contenido.modulosPublicados, 1);
  assert.equal(m.contenido.leccionesPublicadas, 2);
  assert.equal(m.contenido.leccionesCompletadas, 3);
});

test('perfiles digitales: ignora al administrador y calcula el porcentaje', () => {
  assert.equal(m.perfiles.creados, 2);
  assert.equal(m.perfiles.conQr, 1);
  assert.equal(m.perfiles.porcentajeUsuarios, 40); // 2 de 5 usuarios
});

test('integridad: ninguna métrica es negativa ni NaN y los porcentajes están entre 0 y 100', () => {
  const numeros: number[] = [];
  const recorrer = (o: unknown) => {
    if (typeof o === 'number') numeros.push(o);
    else if (Array.isArray(o)) o.forEach(recorrer);
    else if (o && typeof o === 'object') Object.values(o).forEach(recorrer);
  };
  recorrer(m);
  for (const x of numeros) assert.ok(Number.isFinite(x) && x >= 0, `valor inválido: ${x}`);
  assert.ok(m.tests.tasaAprobacion <= 100 && m.perfiles.porcentajeUsuarios <= 100);
});
