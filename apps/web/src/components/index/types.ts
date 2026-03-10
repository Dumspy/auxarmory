export interface CharacterSummary {
	id: string
	name: string
	level: number | null
	activeSpec: string | null
	className: string | null
	equippedItemLevel: number | null
	mythicRating: number | null
	mythicRatingColor: string | null
	lastLogin: string | null
	avatarUrl: string | null
	favorite: boolean
}

export interface CharacterDetail extends CharacterSummary {
	raidProgress: {
		instanceName: string | null
		normal: string | null
		heroic: string | null
		mythic: string | null
	} | null
	mythicScore: number | null
	pvpRating: number | null
	weeklyVault: {
		raid: number
		mythicPlus: number
		pvp: number
	} | null
	conquest: {
		current: number
		max: number
	} | null
	guild: {
		name: string
		realm: string
		memberCount: number | null
	} | null
	snapshotAt: string | null
}
