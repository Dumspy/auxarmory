import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	checkDatabaseConnection: vi.fn(),
	checkDatabaseMigrationState: vi.fn(),
}))

vi.mock('@auxarmory/db/client', () => ({
	checkDatabaseConnection: mocks.checkDatabaseConnection,
}))

vi.mock('@auxarmory/db/migrations', () => ({
	checkDatabaseMigrationState: mocks.checkDatabaseMigrationState,
}))

import { checkApiReadiness } from './health'

describe('checkApiReadiness', () => {
	beforeEach(() => {
		mocks.checkDatabaseConnection.mockReset()
		mocks.checkDatabaseMigrationState.mockReset()
	})

	it('reports ready when database and migrations are current', async () => {
		mocks.checkDatabaseConnection.mockResolvedValue(undefined)
		mocks.checkDatabaseMigrationState.mockResolvedValue({
			current: true,
			expected: null,
			appliedWhen: null,
		})

		await expect(checkApiReadiness()).resolves.toEqual({
			ready: true,
			checks: [
				{ name: 'database', ok: true },
				{ name: 'migrations', ok: true, error: undefined },
			],
		})
	})

	it('reports not ready when migrations are still pending', async () => {
		mocks.checkDatabaseConnection.mockResolvedValue(undefined)
		mocks.checkDatabaseMigrationState.mockResolvedValue({
			current: false,
			expected: { tag: '0007_dark_power_pack', when: 1773417373007 },
			appliedWhen: 1773417373006,
			error: 'waiting for migration 0007_dark_power_pack',
		})

		await expect(checkApiReadiness()).resolves.toEqual({
			ready: false,
			checks: [
				{ name: 'database', ok: true },
				{
					name: 'migrations',
					ok: false,
					error: 'waiting for migration 0007_dark_power_pack',
				},
			],
		})
	})

	it('reports migrations as blocked when the database check fails', async () => {
		mocks.checkDatabaseConnection.mockRejectedValue(
			new Error('connect ECONNREFUSED'),
		)

		await expect(checkApiReadiness()).resolves.toEqual({
			ready: false,
			checks: [
				{
					name: 'database',
					ok: false,
					error: 'connect ECONNREFUSED',
				},
				{
					name: 'migrations',
					ok: false,
					error: 'Database connection failed',
				},
			],
		})

		expect(mocks.checkDatabaseMigrationState).not.toHaveBeenCalled()
	})
})
