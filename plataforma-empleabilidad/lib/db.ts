import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Query ejecutada', { text, duration, rows: res.rowCount });
  return res;
}

// Solo para pruebas y scripts: cierra las conexiones abiertas.
export async function cerrarPool() {
  await pool.end();
}
