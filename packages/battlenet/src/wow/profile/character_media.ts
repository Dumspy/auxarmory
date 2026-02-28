import type { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import { LinkSelfResponse, MediaAssetArray } from '../../types'
import { CharacterResponse } from '../types/character'

export const CharacterMediaSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	assets: MediaAssetArray,
})
export function CharacterMediaSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterMediaSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/character-media`,
		namespace: 'profile',
		zod: CharacterMediaSummaryResponse,
	})
}
