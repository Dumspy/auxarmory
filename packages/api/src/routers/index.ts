import { protectedProcedure, publicProcedure, router } from '../index.js'
import { guildRouter } from './guild.js'

export const appRouter = router({
	healthCheck: publicProcedure.query(() => 'OK'),
	privateData: protectedProcedure.query(({ ctx }) => ({
		message: 'This is private',
		user: ctx.session.user,
	})),
	guild: guildRouter,
})

export type AppRouter = typeof appRouter
