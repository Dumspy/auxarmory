import { defineJob } from '../registry'
import { JOB_PRIORITIES } from '../types'
import { z } from 'zod'

export interface ExampleJobPayload {
	profileId: string
	region: 'us' | 'eu' | 'kr'
}

const exampleJobPayloadSchema = z.object({
	profileId: z.string().min(1),
	region: z.enum(['us', 'eu', 'kr']),
})

export const syncExample = defineJob({
	name: 'sync:example',
	description: 'Run a one-off example sync job',
	allowManualRun: true,
	schema: exampleJobPayloadSchema,
	data: {
		profileId: '',
		region: 'us',
	} satisfies ExampleJobPayload,
	handler: async function handleSyncExample(job) {
		console.log('[worker] example handler', {
			profileId: job.data.profileId,
			region: job.data.region,
		})
		return { ok: true }
	},
})

export const syncRepeatableExample = defineJob({
	name: 'sync:example:repeatable',
	description: 'Run a scheduled example sync job',
	allowManualRun: true,
	schema: exampleJobPayloadSchema,
	schedule: {
		id: 'sync-example-repeatable',
		everyMs: 15 * 60 * 1000,
		priority: JOB_PRIORITIES.STANDARD,
	},
	data: {
		profileId: 'repeatable-example',
		region: 'us',
	} satisfies ExampleJobPayload,
	handler: async function handleSyncRepeatableExample(job) {
		console.log('[worker] repeatable example handler', {
			profileId: job.data.profileId,
			region: job.data.region,
		})
		return { ok: true }
	},
})
