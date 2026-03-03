import { z } from 'zod'
import type { WoWGameDataClient } from '..'

export const CharacterHouseSummaryResponse = z.unknown()
export function CharacterHouseSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	houseNumber: number,
) {
	return this.request<z.infer<typeof CharacterHouseSummaryResponse>>({
		endpoint: `/profile/wow/character/${realmSlug}/${characterName}/house/house-${houseNumber}`,
		namespace: 'profile',
		zod: CharacterHouseSummaryResponse,
	})
}
