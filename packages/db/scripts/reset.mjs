import process from 'node:process'
import readline from 'node:readline/promises'

import pg from 'pg'

const HELP_FLAGS = new Set(['-h', '--help'])
const FORCE_FLAGS = new Set(['-f', '--force'])
const args = new Set(process.argv.slice(2))

if ([...HELP_FLAGS].some((flag) => args.has(flag))) {
	console.log('Usage: pnpm --filter @auxarmory/db db:reset [-- --force]')
	console.log('Drops and recreates schema "public", then re-runs migrations.')
	process.exit(0)
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	console.error('DATABASE_URL is required to reset the database')
	process.exit(1)
}

const forced = [...FORCE_FLAGS].some((flag) => args.has(flag))
const isInteractive = process.stdin.isTTY && process.stdout.isTTY

if (!forced && isInteractive) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	const answer = await rl.question(
		'Are you sure you want to reset the database? All data will be lost. (y/N) ',
	)
	rl.close()

	if (!['y', 'yes'].includes(answer.trim().toLowerCase())) {
		console.log('Database reset cancelled.')
		process.exit(0)
	}
}

const { Client } = pg
const client = new Client({ connectionString: databaseUrl })

try {
	await client.connect()
	await client.query('DROP SCHEMA IF EXISTS public CASCADE;')
	await client.query('CREATE SCHEMA public;')
	await client.query('GRANT ALL ON SCHEMA public TO CURRENT_USER;')
	await client.query('GRANT ALL ON SCHEMA public TO public;')
	console.log('Database schema reset complete.')
} finally {
	await client.end()
}
