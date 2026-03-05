import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'

import { BattlenetUnwrapError, BattlenetZodUnwrapError, unwrap } from '..'

describe('unwrap', () => {
	it('returns data for successful responses', () => {
		const result = unwrap({
			success: true,
			data: { id: 42 },
			raw_data: { id: 42 },
			request_context: {
				endpoint: 'data/wow/test',
				method: 'GET',
				namespace: 'static',
				url: 'https://eu.api.blizzard.com/data/wow/test?locale=en_US',
				params: { locale: 'en_US' },
			},
		})

		expect(result).toEqual({ id: 42 })
	})

	it('throws a zod unwrap error with request and response context', () => {
		const parsed = z.object({ id: z.number() }).safeParse({ id: 'bad' })
		if (parsed.success) {
			throw new Error('Expected zod parse to fail for test setup')
		}

		expect(() =>
			unwrap({
				success: false,
				error_type: 'zod',
				error: parsed.error,
				raw_data: { id: 'bad' } as never,
				request_context: {
					endpoint: 'profile/wow/character/realm/name',
					method: 'GET',
					namespace: 'profile',
					url: 'https://eu.api.blizzard.com/profile/wow/character/realm/name?namespace=profile-eu&locale=en_US',
					params: { namespace: 'profile-eu', locale: 'en_US' },
				},
			}),
		).toThrowError(BattlenetZodUnwrapError)

		try {
			unwrap({
				success: false,
				error_type: 'zod',
				error: parsed.error,
				raw_data: { id: 'bad' } as never,
				request_context: {
					endpoint: 'profile/wow/character/realm/name',
					method: 'GET',
					namespace: 'profile',
					url: 'https://eu.api.blizzard.com/profile/wow/character/realm/name?namespace=profile-eu&locale=en_US',
					params: { namespace: 'profile-eu', locale: 'en_US' },
				},
			})
		} catch (error) {
			expect(error).toBeInstanceOf(BattlenetZodUnwrapError)
			const zodError = error as BattlenetZodUnwrapError
			expect(zodError.context.request.params).toEqual({
				namespace: 'profile-eu',
				locale: 'en_US',
			})
			expect(zodError.context.response).toEqual({ id: 'bad' })
		}
	})

	it('throws a generic unwrap error for non-zod failures', () => {
		expect(() =>
			unwrap({
				success: false,
				error_type: 'unknown',
				error: new Error('Request failed'),
				raw_data: {} as never,
				request_context: {
					endpoint: 'data/wow/item/19019',
					method: 'GET',
					namespace: 'static',
					url: 'https://eu.api.blizzard.com/data/wow/item/19019?namespace=static-eu&locale=en_US',
					params: { namespace: 'static-eu', locale: 'en_US' },
				},
			}),
		).toThrowError(BattlenetUnwrapError)
	})
})
