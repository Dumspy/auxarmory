import { protectedProcedure, publicProcedure, router } from '../index.js'
import { adminRouter } from './admin.js'

export const appRouter = router({
	healthCheck: publicProcedure.query(() => 'OK'),
	admin: adminRouter,
	privateData: protectedProcedure.query(({ ctx }) => ({
		message: 'This is private',
		user: ctx.session.user,
	})),
})

export type AppRouter = typeof appRouter
