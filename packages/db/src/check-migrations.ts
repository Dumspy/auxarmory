import { readFile } from 'node:fs/promises'

import { sql } from 'drizzle-orm'

import { db } from './client'

const MIGRATIONS_CURRENT_EXIT_CODE = 0
const MIGRATIONS_WAITING_EXIT_CODE = 3
const MIGRATIONS_FATAL_EXIT_CODE = 2
const MIGRATION_CHECK_TIMEOUT_MS = 1_500

const MIGRATION_TABLE_QUERY = sql<{
	created_at: number | string | null
}>`SELECT created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`

interface MigrationJournalEntry {
	tag: string
	when: number
}

interface MigrationJournal {
	entries?: MigrationJournalEntry[]
}

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

function getMigrationJournalPath(): URL {
	return new URL('../drizzle/meta/_journal.json', import.meta.url)
}

function isMissingMigrationMetadataError(error: unknown): boolean {
	if (!error || typeof error !== 'object') {
		return false
	}

	const code = 'code' in error ? error.code : undefined
	return code === '3F000' || code === '42P01'
}

function parseAppliedMigrationWhen(value: unknown): number | null {
	if (value === null || value === undefined) {
		return null
	}

	const parsed = Number(value)
	if (Number.isNaN(parsed)) {
		throw new Error(`Invalid applied migration timestamp: ${String(value)}`)
	}

	return parsed
}

async function getExpectedDatabaseMigration(): Promise<MigrationJournalEntry | null> {
	const rawJournal = await readFile(getMigrationJournalPath(), 'utf8')
	const journal = JSON.parse(rawJournal) as MigrationJournal
	const latestEntry = journal.entries?.at(-1)

	if (!latestEntry) {
		return null
	}

	if (
		typeof latestEntry.tag !== 'string' ||
		typeof latestEntry.when !== 'number'
	) {
		throw new Error(
			'Invalid migration journal entry in packages/db/drizzle/meta/_journal.json',
		)
	}

	return latestEntry
}

async function getAppliedDatabaseMigrationWhen(): Promise<number | null> {
	const result = await withTimeout(
		db.execute<{ created_at: number | string | null }>(
			MIGRATION_TABLE_QUERY,
		),
		MIGRATION_CHECK_TIMEOUT_MS,
		`migration check timed out after ${MIGRATION_CHECK_TIMEOUT_MS}ms`,
	)

	return parseAppliedMigrationWhen(result.rows[0]?.created_at)
}

function formatMigrationValue(value: number | null): string {
	return value === null ? 'none' : String(value)
}

async function main(): Promise<number> {
	const expected = await getExpectedDatabaseMigration()

	if (!expected) {
		console.log(
			'[db-migrations] no migration entries found; continuing startup',
		)
		return MIGRATIONS_CURRENT_EXIT_CODE
	}

	try {
		const appliedWhen = await getAppliedDatabaseMigrationWhen()

		if (appliedWhen !== null && appliedWhen >= expected.when) {
			console.log(
				`[db-migrations] database is current for ${expected.tag} (${expected.when})`,
			)
			return MIGRATIONS_CURRENT_EXIT_CODE
		}

		console.log(
			[
				'[db-migrations] waiting for migrations',
				`expected=${expected.tag}(${expected.when})`,
				`applied=${formatMigrationValue(appliedWhen)}`,
				`reason=waiting for migration ${expected.tag}`,
			]
				.filter(Boolean)
				.join(' '),
		)

		return MIGRATIONS_WAITING_EXIT_CODE
	} catch (error) {
		if (isMissingMigrationMetadataError(error)) {
			console.log(
				[
					'[db-migrations] waiting for migrations',
					`expected=${expected.tag}(${expected.when})`,
					'applied=none',
					'reason=migration table is not available yet',
				].join(' '),
			)

			return MIGRATIONS_WAITING_EXIT_CODE
		}

		throw error
	}
}

try {
	const exitCode = await main()
	process.exit(exitCode)
} catch (error) {
	console.error('[db-migrations] fatal migration checker error', error)
	process.exit(MIGRATIONS_FATAL_EXIT_CODE)
}
