import { createAccessControl } from 'better-auth/plugins/access'
import {
	adminAc as platformAdminAc,
	defaultStatements as platformDefaultStatements,
	userAc as platformUserAc,
} from 'better-auth/plugins/admin/access'
import {
	adminAc as organizationAdminAc,
	defaultStatements as organizationDefaultStatements,
	memberAc as organizationMemberAc,
	ownerAc as organizationOwnerAc,
} from 'better-auth/plugins/organization/access'

const workerStatements = {
	job: ['read', 'enqueue', 'retry'],
} as const

export const statements = {
	...platformDefaultStatements,
	...organizationDefaultStatements,
	...workerStatements,
} as const

export const ac = createAccessControl(statements)

export const roles = {
	admin: ac.newRole({
		...platformAdminAc.statements,
		...organizationAdminAc.statements,
		job: ['read', 'enqueue', 'retry'],
	}),
	user: ac.newRole({
		...platformUserAc.statements,
		...organizationMemberAc.statements,
		job: [],
	}),
	owner: ac.newRole({
		...platformUserAc.statements,
		...organizationOwnerAc.statements,
		job: [],
	}),
	member: ac.newRole({
		...platformUserAc.statements,
		...organizationMemberAc.statements,
		job: [],
	}),
}

export type PermissionStatement = Record<string, string[]>

export type PermissionScope = 'platform' | 'organization'

export type PermissionCheckInput =
	| {
			scope: 'platform'
			permissions: PermissionStatement
	  }
	| {
			scope: 'organization'
			permissions: PermissionStatement
			organizationId?: string
	  }

export interface PermissionPolicy {
	scope: PermissionScope
	permissions: PermissionStatement
}

export const platformPermissions = {
	adminUsersList: {
		scope: 'platform',
		permissions: {
			user: ['list'],
		},
	},
	adminUsersSetRole: {
		scope: 'platform',
		permissions: {
			user: ['set-role'],
		},
	},
	adminJobsRead: {
		scope: 'platform',
		permissions: {
			job: ['read'],
		},
	},
	adminJobsEnqueue: {
		scope: 'platform',
		permissions: {
			job: ['enqueue'],
		},
	},
	adminJobsRetry: {
		scope: 'platform',
		permissions: {
			job: ['retry'],
		},
	},
} satisfies Record<string, PermissionPolicy>
