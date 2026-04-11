import {
	checkDatabaseMigrationState,
	getExpectedDatabaseMigration,
} from './migrations'

const MIGRATIONS_CURRENT_EXIT_CODE = 0
const MIGRATIONS_WAITING_EXIT_CODE = 3
const MIGRATIONS_FATAL_EXIT_CODE = 2

function formatMigrationValue(value: number | null): string {
	return value === null ? 'none' : String(value)
}

async function main(): Promise<number> {
	const expected = await getExpectedDatabaseMigration()
	const state = await checkDatabaseMigrationState()

	if (state.current) {
		if (!expected) {
			console.log(
				'[db-migrations] no migration entries found; continuing startup',
			)
			return MIGRATIONS_CURRENT_EXIT_CODE
		}

		console.log(
			`[db-migrations] database is current for ${expected.tag} (${expected.when})`,
		)
		return MIGRATIONS_CURRENT_EXIT_CODE
	}

	console.log(
		[
			'[db-migrations] waiting for migrations',
			expected
				? `expected=${expected.tag}(${expected.when})`
				: 'expected=none',
			`applied=${formatMigrationValue(state.appliedWhen)}`,
			state.error ? `reason=${state.error}` : undefined,
		]
			.filter(Boolean)
			.join(' '),
	)

	return MIGRATIONS_WAITING_EXIT_CODE
}

try {
	const exitCode = await main()
	process.exit(exitCode)
} catch (error) {
	console.error('[db-migrations] fatal migration checker error', error)
	process.exit(MIGRATIONS_FATAL_EXIT_CODE)
}
