import { z } from "zod/v4"

export const LocaleResponse = z
	.strictObject({
		en_US: z.string(),
		es_MX: z.string().optional(),
		pt_BR: z.string().optional(),
		de_DE: z.string().optional(),
		en_GB: z.string().optional(),
		es_ES: z.string().optional(),
		fr_FR: z.string().optional(),
		it_IT: z.string().optional(),
		ru_RU: z.string().optional(),
		ko_KR: z.string().optional(),
		zh_TW: z.string().optional(),
		zh_CN: z.string().optional(),
	})
	.or(z.string())
	.or(z.strictObject({}))
	.or(z.null())

export const KeyResponse = z.strictObject({
	href: z.string(),
})

export const LinkSelfResponse = z.strictObject({
	_links: z.strictObject({
		self: KeyResponse,
	}),
})

export const KeyNameIdResponse = z.strictObject({
	key: KeyResponse,
	name: LocaleResponse,
	id: z.number(),
})

export const MediaKeyResponse = z.strictObject({
	key: KeyResponse,
	id: z.number(),
})

export const MediaAssetArray = z.array(
	z.strictObject({
		key: z.enum(["icon", "zoom", "image"]),
		value: z.string(),
		file_data_id: z.number().optional(),
	})
)

export const LocaleString = z.enum([
	"enUS",
	"esMX",
	"ptBR",
	"enGB",
	"esES",
	"frFR",
	"ruRU",
	"deDE",
	"ptPT",
	"itIT",
	"koKR",
	"zhTW",
	"zhCN",
])
