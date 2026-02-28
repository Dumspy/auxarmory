import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { CharacterResponse } from '../types/character'

export interface ChildCriteriaType {
	id: number
	amount?: number
	is_completed: boolean
	child_criteria?: ChildCriteriaType[]
}

const ChildCriteria: z.ZodType<ChildCriteriaType> = z.lazy(() =>
	z.strictObject({
		id: z.number(),
		amount: z.number().optional(),
		is_completed: z.boolean(),
		child_criteria: z.array(ChildCriteria).optional(),
	}),
)

export const CharacterAchievementsSummaryResponse = LinkSelfResponse.extend({
	total_quantity: z.number(),
	total_points: z.number(),
	achievements: z.array(
		z.strictObject({
			id: z.number(),
			achievement: KeyNameIdResponse,
			criteria: z
				.strictObject({
					id: z.number(),
					is_completed: z.boolean(),
					amount: z.number().optional(),
					child_criteria: z.array(ChildCriteria).optional(),
				})
				.optional(),
			completed_timestamp: z.number().optional(),
		}),
	),
	category_progress: z.array(
		z.strictObject({
			category: KeyNameIdResponse,
			quantity: z.number(),
			points: z.number(),
		}),
	),
	recent_events: z.array(
		z.strictObject({
			achievement: KeyNameIdResponse,
			timestamp: z.number(),
		}),
	),
	character: CharacterResponse,
	statistics: KeyResponse,
})
export function CharacterAchievementsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterAchievementsSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/achievements`,
		namespace: 'profile',
		zod: CharacterAchievementsSummaryResponse,
	})
}

export const CharacterAchievementsStatisticsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	categories: z.array(
		z.strictObject({
			id: z.number(),
			name: LocaleResponse,
			sub_categories: z
				.array(
					z.strictObject({
						id: z.number(),
						name: LocaleResponse,
						statistics: z.array(
							z.strictObject({
								id: z.number(),
								name: LocaleResponse,
								last_updated_timestamp: z.number(),
								quantity: z.number(),
								description: LocaleResponse.optional(),
							}),
						),
					}),
				)
				.optional(),
			statistics: z
				.array(
					z.strictObject({
						id: z.number(),
						name: LocaleResponse,
						last_updated_timestamp: z.number(),
						quantity: z.number(),
						description: LocaleResponse.optional(),
					}),
				)
				.optional(),
		}),
	),
})
export function CharacterAchievementsStatistics(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterAchievementsStatisticsResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/achievements/statistics`,
		namespace: 'profile',
		zod: CharacterAchievementsStatisticsResponse,
	})
}
