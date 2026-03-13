import { z } from 'zod'

import { db } from '@auxarmory/db/client'
import { battlenetRespSink } from '@auxarmory/db/schema'

export const internalFailureSinkSchema = z
	.object({
		data: z.unknown(),
	})
	.strict()

export type InternalFailureSinkPayload = z.infer<
	typeof internalFailureSinkSchema
>

export async function persistInternalFailureSinkEvent(
	payload: InternalFailureSinkPayload,
) {
	const failureRef = crypto.randomUUID()

	await db.insert(battlenetRespSink).values({
		id: failureRef,
		data: payload.data,
	})

	return {
		ref: failureRef,
	}
}
