import { describe, expect, it } from 'vitest'

import {
	formatWowProfileAccountJobId,
	formatWowProfileCharacterJobId,
	formatWowProfileCoordinatorJobId,
} from './profile_utils'

describe('profile sync job id helpers', () => {
	it('builds deterministic coordinator and account job ids', () => {
		expect(formatWowProfileCoordinatorJobId('user-123')).toBe(
			'wow-profile-coordinator-user-123',
		)
		expect(formatWowProfileAccountJobId('account-456')).toBe(
			'wow-profile-account-account-456',
		)
	})

	it('normalizes character job ids and keeps them deterministic', () => {
		expect(formatWowProfileCharacterJobId('US', '98765')).toBe(
			'wow-profile-character-us-98765',
		)
		expect(formatWowProfileCharacterJobId('US', '98765')).toBe(
			formatWowProfileCharacterJobId('us', '98765'),
		)
	})
})
