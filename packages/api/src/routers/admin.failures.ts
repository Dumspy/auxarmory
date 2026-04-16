import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { platformPermissions } from '@auxarmory/auth/permissions'
import { db } from '@auxarmory/db/client'
import { battlenetRespSink } from '@auxarmory/db/schema'

import { authorizedProcedure, router } from '../index'

const getByFailureIdInput = z.object({
	failureId: z.string().trim().min(1, 'Failure id is required'),
})

export const adminFailuresRouter = router({
	getByFailureId: authorizedProcedure
		.meta({ authz: platformPermissions.adminDiagnosticsRead })
		.input(getByFailureIdInput)
		.query(async ({ input }) => {
			const [row] = await db
				.select({
					id: battlenetRespSink.id,
					data: battlenetRespSink.data,
					createdAt: battlenetRespSink.createdAt,
				})
				.from(battlenetRespSink)
				.where(eq(battlenetRespSink.id, input.failureId))
				.limit(1)

			if (!row) {
				return {
					status: 'not_found' as const,
					input: {
						failureId: input.failureId,
					},
					dump: {
						found: false,
					},
				}
			}

			return {
				status: 'ok' as const,
				input: {
					failureId: input.failureId,
				},
				dump: {
					found: true,
					createdAt: row.createdAt.toISOString(),
					data: row.data,
				},
			}
		}),
})
