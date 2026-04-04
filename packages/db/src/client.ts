import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import { env } from './env'
import * as schema from './schema/index'

const { Pool } = pg
const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error(errorMessage))
		}, timeoutMs)

		promise
			.then((value) => {
				clearTimeout(timeoutId)
				resolve(value)
			})
			.catch((error: unknown) => {
				clearTimeout(timeoutId)
				reject(error)
			})
	})
}

export async function checkDatabaseConnection(
	timeoutMs = 1_500,
): Promise<void> {
	await withTimeout(
		pool.query('select 1'),
		timeoutMs,
		`database check timed out after ${timeoutMs}ms`,
	)
}
