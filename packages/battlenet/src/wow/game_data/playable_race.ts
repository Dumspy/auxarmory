import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types';
import { Faction } from '../types';

export const PlayableRaceIndexResponse = LinkSelfResponse.extend({
	races: z.array(KeyNameIdResponse),
});
export function PlayableRaceIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PlayableRaceIndexResponse>>({
		endpoint: `data/wow/playable-race/index`,
		namespace: 'static',
		zod: PlayableRaceIndexResponse,
	});
}

export const PlayableRaceResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	gender_name: z.strictObject({
		male: LocaleResponse,
		female: LocaleResponse,
	}),
	faction: Faction,
	is_selectable: z.boolean(),
	is_allied_race: z.boolean(),
	playable_classes: z.array(KeyNameIdResponse),
});
export function PlayableRace(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PlayableRaceResponse>>({
		endpoint: `data/wow/playable-race/${id}`,
		namespace: 'static',
		zod: PlayableRaceResponse,
	});
}
