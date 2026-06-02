// lib/db.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from environment variables');
}

// Creates a serverless SQL client
const sql = neon(process.env.DATABASE_URL);

export default sql;