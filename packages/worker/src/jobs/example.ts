import { defineJob } from '../registry.js'

export interface ExampleJobPayload {
	profileId: string
	region: 'us' | 'eu' | 'kr' | 'tw'
}

export const syncExample = defineJob({
	name: 'sync:example',
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
