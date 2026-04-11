import { checkDatabaseConnection } from '@auxarmory/db/client'

export interface ApiReadinessCheckResult {
	name: 'database'
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

	try {
		await checkDatabaseConnection(timeoutMs)
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

	return {
		ready: checks.every((check) => check.ok),
		checks,
	}
}
