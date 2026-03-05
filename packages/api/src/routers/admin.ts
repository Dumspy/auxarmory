import { z } from 'zod'

import { auth } from '@auxarmory/auth'

import { authorizedProcedure, router } from '../index.js'

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
				authz: {
					scope: 'platform',
					permissions: {
						user: ['list'],
					},
				},
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
				authz: {
					scope: 'platform',
					permissions: {
						user: ['set-role'],
					},
				},
			})
			.input(setRoleInput)
			.mutation(async ({ ctx, input }) => {
				return await auth.api.setRole({
					headers: ctx.headers,
					body: {
						userId: input.userId,
						role: input.role,
					},
				})
			}),
	}),
})
