// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // จำเป็นสำหรับ Neon Serverless Postgres
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
