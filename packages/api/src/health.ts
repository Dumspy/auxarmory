import { checkDatabaseConnection } from '@auxarmory/db/client'
import { checkDatabaseMigrationState } from '@auxarmory/db/migrations'

export interface ApiReadinessCheckResult {
	name: 'database' | 'migrations'
	ok: boolean
	error?: string
}

export interface ApiReadinessResult {
	ready: boolean
	checks: ApiReadinessCheckResult[]
}

export async function checkApiReadiness(
	timeoutMs = 1_500,
): Promise<ApiReadinessResult> {
	const checks: ApiReadinessCheckResult[] = []
	let databaseReady = false

	try {
		await checkDatabaseConnection(timeoutMs)
		databaseReady = true
		checks.push({ name: 'database', ok: true })
	} catch (error) {
		checks.push({
			name: 'database',
			ok: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown database error',
		})
	}

	if (!databaseReady) {
		checks.push({
			name: 'migrations',
			ok: false,
			error: 'Database connection failed',
		})
	} else {
		const migrationState = await checkDatabaseMigrationState(timeoutMs)
		checks.push({
			name: 'migrations',
			ok: migrationState.current,
			error: migrationState.current ? undefined : migrationState.error,
		})
	}

	return {
		ready: checks.every((check) => check.ok),
		checks,
	}
}
