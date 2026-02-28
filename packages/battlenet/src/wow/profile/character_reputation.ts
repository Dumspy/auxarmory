import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types';
import { CharacterResponse } from '../types/character';

export const CharacterReputationSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	reputations: z.array(
		z.strictObject({
			faction: KeyNameIdResponse,
			standing: z.strictObject({
				raw: z.number(),
				value: z.number(),
				max: z.number(),
				tier: z.number().optional(),
				name: LocaleResponse,
				renown_level: z.number().optional(),
			}),
			paragon: z
				.strictObject({
					raw: z.number(),
					value: z.number(),
					max: z.number(),
				})
				.optional(),
		}),
	),
});
export function CharacterReputationSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterReputationSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/reputations`,
		namespace: 'profile',
		zod: CharacterReputationSummaryResponse,
	});
}
