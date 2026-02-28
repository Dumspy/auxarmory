import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'

export const TitleIndexResponse = LinkSelfResponse.extend({
	titles: z.array(KeyNameIdResponse),
})
export function TitleIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof TitleIndexResponse>>({
		endpoint: `data/wow/title/index`,
		namespace: 'static',
		zod: TitleIndexResponse,
	})
}

const Source = z.union([
	z.strictObject({
		type: z.strictObject({
			type: z.literal('ACHIEVEMENT'),
			name: LocaleResponse,
		}),
		achievements: z.array(KeyNameIdResponse),
	}),
	z.strictObject({
		type: z.strictObject({
			type: z.literal('QUEST'),
			name: LocaleResponse,
		}),
		quests: z.array(KeyNameIdResponse),
	}),
])

export const TitleResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	gender_name: z.strictObject({
		male: LocaleResponse,
		female: LocaleResponse,
	}),
	source: Source.optional(),
})
export function Title(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof TitleResponse>>({
		endpoint: `data/wow/title/${id}`,
		namespace: 'static',
		zod: TitleResponse,
	})
}
