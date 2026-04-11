import { readFile } from 'node:fs/promises'

import { queryDatabase } from './client'

const MIGRATION_TABLE_QUERY =
	'SELECT created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1'

export interface ExpectedDatabaseMigration {
	tag: string
	when: number
}

export interface DatabaseMigrationState {
	current: boolean
	expected: ExpectedDatabaseMigration | null
	appliedWhen: number | null
	error?: string
}

interface MigrationJournalEntry {
	tag: string
	when: number
}

interface MigrationJournal {
	entries?: MigrationJournalEntry[]
}

let expectedDatabaseMigrationPromise:
	| Promise<ExpectedDatabaseMigration | null>
	| undefined

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

export async function getExpectedDatabaseMigration(): Promise<ExpectedDatabaseMigration | null> {
	expectedDatabaseMigrationPromise ??= (async () => {
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

		return {
			tag: latestEntry.tag,
			when: latestEntry.when,
		}
	})()

	return expectedDatabaseMigrationPromise
}

export async function checkDatabaseMigrationState(
	timeoutMs = 1_500,
): Promise<DatabaseMigrationState> {
	const expected = await getExpectedDatabaseMigration()

	if (!expected) {
		return {
			current: true,
			expected: null,
			appliedWhen: null,
		}
	}

	try {
		const result = await queryDatabase<{
			created_at: number | string | null
		}>(MIGRATION_TABLE_QUERY, timeoutMs)
		const appliedWhen = parseAppliedMigrationWhen(
			result.rows[0]?.created_at,
		)

		if (appliedWhen !== null && appliedWhen >= expected.when) {
			return {
				current: true,
				expected,
				appliedWhen,
			}
		}

		return {
			current: false,
			expected,
			appliedWhen,
			error: `waiting for migration ${expected.tag}`,
		}
	} catch (error) {
		if (isMissingMigrationMetadataError(error)) {
			return {
				current: false,
				expected,
				appliedWhen: null,
				error: 'migration table is not available yet',
			}
		}

		return {
			current: false,
			expected,
			appliedWhen: null,
			error:
				error instanceof Error
					? error.message
					: 'Unknown migration state error',
		}
	}
}
