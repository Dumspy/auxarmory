import { describe, expect, it } from 'vitest'

import { isWowProviderId, parseWowProviderRegion } from './profile_accounts.js'

describe('wow profile account helpers', () => {
	it('parses supported battlenet provider regions', () => {
		expect(parseWowProviderRegion('battlenet-us')).toBe('us')
		expect(parseWowProviderRegion('battlenet-eu')).toBe('eu')
		expect(parseWowProviderRegion('battlenet-kr')).toBe('kr')
		expect(parseWowProviderRegion('battlenet-tw')).toBe('tw')
	})

	it('rejects unsupported providers and regions', () => {
		expect(parseWowProviderRegion('battlenet-cn')).toBeNull()
		expect(parseWowProviderRegion('warcraftlogs-us')).toBeNull()
		expect(isWowProviderId('battlenet-us')).toBe(true)
		expect(isWowProviderId('warcraftlogs-us')).toBe(false)
	})
})
