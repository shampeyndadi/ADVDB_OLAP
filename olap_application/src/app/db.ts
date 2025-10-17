import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  database: process.env.PG_DATABASE,
});

export async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO dwh, public;");
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
