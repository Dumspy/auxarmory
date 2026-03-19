import { TRPCError, initTRPC } from '@trpc/server'

import { assertProcedurePermission } from './authz'
import type { AuthzMeta } from './authz'
import type { Context } from './context'

const t = initTRPC.context<Context>().meta<AuthzMeta>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Authentication required',
		})
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	})
})

export const authorizedProcedure = protectedProcedure.use(
	async ({ ctx, meta, input, next }) => {
		await assertProcedurePermission({
			ctx,
			meta,
			input,
		})

		return next()
	},
)
