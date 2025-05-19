import z from "zod";

export const LocaleResponse = z
	.object({
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
	.or(z.object({}))
	.or(z.null());

export const KeyResponse = z.object({
	href: z.string(),
});

export const LinkSelfResponse = z.object({
	_links: z.object({
		self: KeyResponse,
	}),
});

export const KeyNameIdResponse = z.object({
	key: KeyResponse,
	name: LocaleResponse,
	id: z.number(),
});
