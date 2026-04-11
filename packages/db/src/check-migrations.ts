import {
	checkDatabaseMigrationState,
	getExpectedDatabaseMigration,
} from './migrations'

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
			return 0
		}

		console.log(
			`[db-migrations] database is current for ${expected.tag} (${expected.when})`,
		)
		return 0
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

	return 1
}

try {
	const exitCode = await main()
	process.exit(exitCode)
} catch (error) {
	console.error('[db-migrations] fatal migration checker error', error)
	process.exit(2)
}
