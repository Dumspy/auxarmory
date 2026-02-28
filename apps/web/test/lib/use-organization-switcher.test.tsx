import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOrganizationSwitcher } from '../../src/lib/use-organization-switcher'

const { useSessionMock, useListOrganizationsMock, setActiveOrganizationMock } =
	vi.hoisted(() => ({
		useSessionMock: vi.fn(),
		useListOrganizationsMock: vi.fn(),
		setActiveOrganizationMock: vi.fn(),
	}))

vi.mock('../../src/lib/auth-client', () => ({
	authClient: {
		useSession: () => useSessionMock(),
		useListOrganizations: () => useListOrganizationsMock(),
		organization: {
			setActive: setActiveOrganizationMock,
		},
	},
}))

describe('useOrganizationSwitcher', () => {
	beforeEach(() => {
		useSessionMock.mockReset()
		useListOrganizationsMock.mockReset()
		setActiveOrganizationMock.mockReset()

		useSessionMock.mockReturnValue({
			data: {
				session: {
					activeOrganizationId: null,
				},
			},
		})
		useListOrganizationsMock.mockReturnValue({
			data: [
				{
					id: 'org-1',
					name: 'Guild One',
					slug: 'guild-one',
				},
			],
			isPending: false,
		})
		setActiveOrganizationMock.mockResolvedValue({ data: { id: 'org-1' } })
	})

	it('does not mark first organization as active when activeOrganizationId is null', () => {
		const { result } = renderHook(() => useOrganizationSwitcher())

		expect(result.current.selectedOrganizationId).toBeNull()
		expect(result.current.activeOrganization).toBeNull()
	})

	it('allows setting active organization when none is active', async () => {
		const { result } = renderHook(() => useOrganizationSwitcher())

		await act(async () => {
			await result.current.setActiveOrganization('org-1')
		})

		expect(setActiveOrganizationMock).toHaveBeenCalledWith({
			organizationId: 'org-1',
		})
		expect(result.current.switchingOrganizationId).toBeNull()
	})
})
