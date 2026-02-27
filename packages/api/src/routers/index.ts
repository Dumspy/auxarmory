import { protectedProcedure, publicProcedure, router } from '../index.js';

export const appRouter = router({
	healthCheck: publicProcedure.query(() => 'OK'),
	privateData: protectedProcedure.query(({ ctx }) => ({
		message: 'This is private',
		user: ctx.session.user,
	})),
});

export type AppRouter = typeof appRouter;
