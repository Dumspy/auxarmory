import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import type { PermissionCheckInput } from './auth-client'
import { permissionQueryOptions } from './auth-client'

export async function ensurePermissionOrRedirect({
	queryClient,
	permission,
	redirectTo = '/dashboard',
}: {
	queryClient: QueryClient
	permission: PermissionCheckInput
	redirectTo?: string
}) {
	if (typeof window === 'undefined') {
		return
	}

	const allowed = await queryClient.ensureQueryData(
		permissionQueryOptions(permission),
	)

	if (!allowed) {
		throw redirect({ href: redirectTo })
	}
}
