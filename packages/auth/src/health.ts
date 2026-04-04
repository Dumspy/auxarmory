import { checkDatabaseConnection } from '@auxarmory/db/client'

export interface AuthReadinessCheckResult {
	name: 'database'
	ok: boolean
	error?: string
}

export interface AuthReadinessResult {
	ready: boolean
	checks: AuthReadinessCheckResult[]
}

export async function checkAuthReadiness(
	timeoutMs = 1_500,
): Promise<AuthReadinessResult> {
	const checks: AuthReadinessCheckResult[] = []

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
