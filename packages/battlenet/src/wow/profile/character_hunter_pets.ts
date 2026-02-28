import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyIdResponse,
	KeyNameIdResponse,
	LinkSelfResponse,
} from '../../types';
import { CharacterResponse } from '../types/character';

export const CharacterHunterPetsSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	hunter_pets: z.array(
		z.strictObject({
			name: z.string(),
			level: z.number(),
			creature: KeyNameIdResponse,
			slot: z.number(),
			is_active: z.boolean().optional(),
			creature_display: KeyIdResponse,
		}),
	),
});

export function CharacterHunterPetsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterHunterPetsSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/hunter-pets`,
		namespace: 'profile',
		zod: CharacterHunterPetsSummaryResponse,
	});
}
