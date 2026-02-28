import { Client } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required to reset the database')
}

const client = new Client({ connectionString: databaseUrl })

try {
	await client.connect()
	await client.query('BEGIN')
	await client.query('DROP SCHEMA IF EXISTS public CASCADE')
	await client.query('CREATE SCHEMA public')
	await client.query('COMMIT')
} catch (error) {
	await client.query('ROLLBACK').catch(() => {})
	throw error
} finally {
	await client.end()
}
