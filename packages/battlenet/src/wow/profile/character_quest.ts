import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import { KeyNameIdResponse, KeyResponse, LinkSelfResponse } from '../../types'
import { CharacterResponse } from '../types/character'

export const CharacterQuestsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	in_progress: z.array(KeyNameIdResponse).optional(),
	completed: KeyResponse,
})
export function CharacterQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterQuestsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/quests`,
		namespace: 'profile',
		zod: CharacterQuestsResponse,
	})
}

export const CharacterCompletedQuestsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	quests: z.array(KeyNameIdResponse),
})
export function CharacterCompletedQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterCompletedQuestsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/quests/completed`,
		namespace: 'profile',
		zod: CharacterCompletedQuestsResponse,
	})
}
