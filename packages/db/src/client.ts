import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool, { schema });
