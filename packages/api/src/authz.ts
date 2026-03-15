import { TRPCError } from '@trpc/server'

import { auth } from '@auxarmory/auth'

import type { Context } from './context'

export type PermissionStatement = Readonly<Record<string, readonly string[]>>

export interface AuthzMeta {
	authz?: {
		scope: 'platform' | 'organization'
		permissions: PermissionStatement
		orgIdSource?: 'session' | { inputKey: string }
	}
}

function normalizePermissions(
	permissions: PermissionStatement,
): PermissionStatement {
	return Object.fromEntries(
		Object.entries(permissions)
			.map(([resource, actions]) => [
				resource,
				Array.from(new Set(actions ?? [])).filter(
					(action) => action.length > 0,
				),
			])
			.filter(
				([, actions]) => Array.isArray(actions) && actions.length > 0,
			),
	)
}

function parsePermissionResult(result: unknown) {
	if (typeof result === 'boolean') {
		return result
	}

	if (
		typeof result === 'object' &&
		result !== null &&
		'success' in result &&
		typeof result.success === 'boolean'
	) {
		return result.success
	}

	return false
}

function readOrganizationIdFromInput(input: unknown, inputKey: string) {
	if (typeof input !== 'object' || input === null) {
		return null
	}

	const value = Reflect.get(input, inputKey)
	return typeof value === 'string' && value.length > 0 ? value : null
}

function getOrganizationId({
	authz,
	ctx,
	input,
}: {
	authz: NonNullable<AuthzMeta['authz']>
	ctx: Context
	input: unknown
}) {
	if (authz.orgIdSource && typeof authz.orgIdSource === 'object') {
		return readOrganizationIdFromInput(input, authz.orgIdSource.inputKey)
	}

	const sessionOrganizationId = ctx.session?.session.activeOrganizationId
	return typeof sessionOrganizationId === 'string' &&
		sessionOrganizationId.length > 0
		? sessionOrganizationId
		: null
}

export async function hasPlatformPermission({
	ctx,
	permissions,
}: {
	ctx: Context
	permissions: PermissionStatement
}) {
	if (!ctx.session?.user?.id) {
		return false
	}

	const normalizedPermissions = normalizePermissions(permissions)

	if (Object.keys(normalizedPermissions).length === 0) {
		return false
	}

	const result = await auth.api.userHasPermission({
		body: {
			userId: ctx.session.user.id,
			permissions: normalizedPermissions,
		},
	})

	return parsePermissionResult(result)
}

export async function hasOrganizationPermission({
	ctx,
	permissions,
	organizationId,
}: {
	ctx: Context
	permissions: PermissionStatement
	organizationId: string
}) {
	const normalizedPermissions = normalizePermissions(permissions)

	if (Object.keys(normalizedPermissions).length === 0) {
		return false
	}

	const result = await auth.api.hasPermission({
		headers: ctx.headers,
		body: {
			organizationId,
			permissions: normalizedPermissions,
		},
	})

	return parsePermissionResult(result)
}

export async function assertProcedurePermission({
	ctx,
	meta,
	input,
}: {
	ctx: Context
	meta: AuthzMeta | undefined
	input: unknown
}) {
	const authz = meta?.authz

	if (!authz) {
		return
	}

	if (authz.scope === 'platform') {
		const permitted = await hasPlatformPermission({
			ctx,
			permissions: authz.permissions,
		})

		if (!permitted) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You do not have permission to perform this action',
			})
		}

		return
	}

	const organizationId = getOrganizationId({ authz, ctx, input })

	if (!organizationId) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'An active organization is required for this action',
		})
	}

	const permitted = await hasOrganizationPermission({
		ctx,
		permissions: authz.permissions,
		organizationId,
	})

	if (!permitted) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have permission to perform this action',
		})
	}
}
