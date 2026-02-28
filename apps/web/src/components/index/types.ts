export interface CharacterSummary {
	id: number
	name: string
	level: number
	activeSpec: string
	className: string
	equippedItemLevel: number
	mythicRating?: number
	mythicRatingColor?: string
	lastLogin: string
	avatarUrl?: string
	favorite?: boolean
}

export interface CharacterDetail extends CharacterSummary {
	raidProgress: {
		normal: string
		heroic: string
		mythic: string
	}
	mythicScore: number
	pvpRating: number
	weeklyVault: {
		raid: number
		mythicPlus: number
		pvp: number
	}
	conquest: {
		current: number
		max: number
	}
}
