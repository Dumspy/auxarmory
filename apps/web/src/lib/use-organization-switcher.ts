import { useState } from 'react'

import { authClient } from './auth-client'

export function useOrganizationSwitcher() {
	const { data: session } = authClient.useSession()
	const { data: organizations, isPending } = authClient.useListOrganizations()
	const [switchingOrganizationId, setSwitchingOrganizationId] = useState<
		string | null
	>(null)

	const activeOrganizationId = session?.session?.activeOrganizationId ?? null
	const activeOrganization =
		organizations?.find(
			(organization) => organization.id === activeOrganizationId,
		) ?? null
	const selectedOrganizationId = activeOrganizationId

	async function setActiveOrganization(organizationId: string) {
		if (
			switchingOrganizationId ||
			organizationId === activeOrganizationId
		) {
			return
		}

		setSwitchingOrganizationId(organizationId)

		try {
			await authClient.organization.setActive({ organizationId })
		} finally {
			setSwitchingOrganizationId(null)
		}
	}

	return {
		session,
		organizations,
		isPending,
		activeOrganization,
		selectedOrganizationId,
		switchingOrganizationId,
		setActiveOrganization,
	}
}
