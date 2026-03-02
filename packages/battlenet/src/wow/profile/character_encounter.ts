import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { CharacterResponse } from '../types/character'

export const CharacterEncounterSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	dungeons: KeyResponse,
	raids: KeyResponse,
})
export function CharacterEncounterSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterEncounterSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/encounters`,
		namespace: 'profile',
		zod: CharacterEncounterSummaryResponse,
	})
}

export const CharacterDungeonsResponse = LinkSelfResponse.extend({
	expansions: z.array(
		z.strictObject({
			expansion: KeyNameIdResponse,
			instances: z.array(
				z.strictObject({
					instance: KeyNameIdResponse,
					modes: z.array(
						z.strictObject({
							difficulty: z
								.strictObject({
									type: z.enum([
										'NORMAL',
										'HEROIC',
										'MYTHIC',
										'MYTHIC_KEYSTONE',
									]),
									name: LocaleResponse,
								})
								.or(z.strictObject({})),
							status: z.strictObject({
								type: z.enum(['COMPLETE', 'IN_PROGRESS']),
								name: LocaleResponse,
							}),
							progress: z.strictObject({
								completed_count: z.number(),
								total_count: z.number(),
								encounters: z.array(
									z.strictObject({
										encounter: KeyNameIdResponse,
										completed_count: z.number(),
										last_kill_timestamp: z.number(),
									}),
								),
							}),
						}),
					),
				}),
			),
		}),
	),
})
export function CharacterDungeons(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterDungeonsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/encounters/dungeons`,
		namespace: 'profile',
		zod: CharacterDungeonsResponse,
	})
}

export const CharacterRaidResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	expansions: z
		.array(
			z.strictObject({
				expansion: KeyNameIdResponse,
				instances: z.array(
					z.strictObject({
						instance: KeyNameIdResponse,
						modes: z.array(
							z.strictObject({
								difficulty: z.strictObject({
									type: z.enum([
										'LFR',
										'NORMAL',
										'HEROIC',
										'MYTHIC',
										'LEGACY_25_MAN_HEROIC',
										'LEGACY_10_MAN',
										'LEGACY_10_MAN_HEROIC',
									]),
									name: LocaleResponse,
								}),
								status: z.strictObject({
									type: z.enum(['COMPLETE', 'IN_PROGRESS']),
									name: LocaleResponse,
								}),
								progress: z.strictObject({
									completed_count: z.number(),
									total_count: z.number(),
									encounters: z.array(
										z.strictObject({
											encounter: KeyNameIdResponse,
											completed_count: z.number(),
											last_kill_timestamp: z.number(),
										}),
									),
								}),
							}),
						),
					}),
				),
			}),
		)
		.optional(),
})

export function CharacterRaid(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterRaidResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/encounters/raids`,
		namespace: 'profile',
		zod: CharacterRaidResponse,
	})
}
