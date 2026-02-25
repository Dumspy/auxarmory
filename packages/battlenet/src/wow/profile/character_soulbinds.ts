import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types';
import { CharacterResponse } from '../types/character';

const TraitUnion = z.union([
	z.strictObject({
		trait: KeyNameIdResponse,
		tier: z.number(),
		display_order: z.number(),
	}),
	z.strictObject({
		conduit_socket: z.strictObject({
			type: z.strictObject({
				type: z.enum(['POTENCY', 'ENDURANCE', 'FINESSE']),
				name: LocaleResponse,
			}),
			socket: z
				.strictObject({
					conduit: KeyNameIdResponse,
					rank: z.number(),
				})
				.optional(),
		}),
		tier: z.number(),
		display_order: z.number(),
	}),
]);

export const CharacterSoulbindsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	chosen_covenant: KeyNameIdResponse,
	renown_level: z.number(),
	soulbinds: z.array(
		z.strictObject({
			soulbind: KeyNameIdResponse,
			traits: z.array(TraitUnion).optional(),
			is_active: z.boolean().optional(),
		}),
	),
});
export function CharacterSoulbinds(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterSoulbindsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/soulbinds`,
		namespace: 'profile',
		zod: CharacterSoulbindsResponse,
	});
}
