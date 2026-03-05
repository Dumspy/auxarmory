import { protectedProcedure, publicProcedure, router } from '../index.js'
import { adminRouter } from './admin.js'
import { createQueue, enqueueJob } from '@auxarmory/worker/producer'

export const appRouter = router({
	healthCheck: publicProcedure.query(() => 'OK'),
	admin: adminRouter,
	privateData: protectedProcedure.query(({ ctx }) => ({
		message: 'This is private',
		user: ctx.session.user,
	})),
	triggerExampleSync: protectedProcedure.mutation(async ({ ctx }) => {
		const queue = createQueue()

		try {
			const job = await enqueueJob(queue, {
				name: 'sync:example',
				payload: {
					profileId: ctx.session.user.id,
					region: 'us',
				},
			})

			return {
				jobId: String(job.id),
			}
		} finally {
			await queue.close()
		}
	}),
})

export type AppRouter = typeof appRouter
