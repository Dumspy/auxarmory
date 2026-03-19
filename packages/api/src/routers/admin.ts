import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { auth } from '@auxarmory/auth'
import { platformPermissions } from '@auxarmory/auth/permissions'

import { authorizedProcedure, router } from '../index'
import { adminJobsRouter } from './admin.jobs'

const listUsersInput = z.object({
	limit: z.number().int().min(1).max(100).default(20),
	offset: z.number().int().min(0).default(0),
	searchValue: z.string().trim().optional(),
})

const setRoleInput = z.object({
	userId: z.string().min(1),
	role: z.enum(['user', 'admin']),
})

export const adminRouter = router({
	users: router({
		list: authorizedProcedure
			.meta({
				authz: platformPermissions.adminUsersList,
			})
			.input(listUsersInput)
			.query(async ({ ctx, input }) => {
				const result = await auth.api.listUsers({
					headers: ctx.headers,
					query: {
						limit: input.limit,
						offset: input.offset,
						searchField: input.searchValue ? 'email' : undefined,
						searchOperator: input.searchValue
							? 'contains'
							: undefined,
						searchValue: input.searchValue,
					},
				})

				return {
					users: result.users,
					total: result.total,
					limit: input.limit,
					offset: input.offset,
				}
			}),
		setRole: authorizedProcedure
			.meta({
				authz: platformPermissions.adminUsersSetRole,
			})
			.input(setRoleInput)
			.mutation(async ({ ctx, input }) => {
				if (ctx.session?.user?.id === input.userId) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'You cannot change your own role',
					})
				}

				return await auth.api.setRole({
					headers: ctx.headers,
					body: {
						userId: input.userId,
						role: input.role,
					},
				})
			}),
	}),
	jobs: adminJobsRouter,
})
