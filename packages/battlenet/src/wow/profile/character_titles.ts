import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { CharacterResponse } from '../types/character'

export const CharacterTitlesSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	titles: z.array(KeyNameIdResponse),
	active_title: KeyNameIdResponse.extend({
		display_string: LocaleResponse,
	}).optional(),
})
export function CharacterTitlesSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterTitlesSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/titles`,
		namespace: 'profile',
		zod: CharacterTitlesSummaryResponse,
	})
}
