import { createAuthClient } from 'better-auth/react'
import { queryOptions } from '@tanstack/react-query'
import {
	adminClient,
	genericOAuthClient,
	organizationClient,
	usernameClient,
} from 'better-auth/client/plugins'

import { ac, roles } from '@auxarmory/auth/permissions'
import type {
	PermissionCheckInput,
	PermissionStatement,
} from '@auxarmory/auth/permissions'

import { env } from '../env'

export const authClient = createAuthClient({
	baseURL: env.VITE_AUTH_URL,
	fetchOptions: {
		credentials: 'include',
	},
	plugins: [
		adminClient({ ac, roles }),
		organizationClient({ ac, roles }),
		usernameClient(),
		genericOAuthClient(),
	],
})

export type PermissionMap = PermissionStatement
export type { PermissionCheckInput } from '@auxarmory/auth/permissions'

function normalizePermissionMap(permissions: PermissionMap) {
	const entries: [string, string[]][] = Object.entries(permissions).map(
		([resource, actions]) => [
			resource,
			Array.from(new Set(actions)).sort(),
		],
	)

	entries.sort((left, right) => left[0].localeCompare(right[0]))

	return Object.fromEntries(entries)
}

function permissionQueryKey(input: PermissionCheckInput) {
	return [
		'permission-check',
		input.scope,
		input.scope === 'organization' ? (input.organizationId ?? null) : null,
		normalizePermissionMap(input.permissions),
	] as const
}

export async function hasPermission(input: PermissionCheckInput) {
	if (input.scope === 'platform') {
		const result = await authClient.admin.hasPermission({
			permissions: input.permissions,
		})

		if (result.error) {
			return false
		}

		return result.data?.success === true
	}

	if (!input.organizationId) {
		return false
	}

	const result = await authClient.organization.hasPermission({
		organizationId: input.organizationId,
		permissions: input.permissions,
	})

	if (result.error) {
		return false
	}

	return result.data?.success === true
}

export function permissionQueryOptions(input: PermissionCheckInput) {
	return queryOptions({
		queryKey: permissionQueryKey(input),
		queryFn: async () => hasPermission(input),
		staleTime: 60_000,
		retry: 1,
	})
}
