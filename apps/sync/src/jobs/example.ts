import { defineJob } from '../registry'

export interface ExampleJobPayload {
	profileId: string
	region: 'us' | 'eu' | 'kr' | 'tw'
}

export const SYNC_EXAMPLE_NAME = 'sync:example'

export const syncExample = defineJob({
	name: SYNC_EXAMPLE_NAME,
	data: {
		profileId: '',
		region: 'us' as ExampleJobPayload['region'],
	},
	handler: async (job) => {
		console.log('[sync] example handler', {
			profileId: (job.data as ExampleJobPayload).profileId,
			region: (job.data as ExampleJobPayload).region,
		})
		return { ok: true }
	},
})

export default syncExample
