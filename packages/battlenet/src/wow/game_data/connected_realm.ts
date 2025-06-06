import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	LocaleString,
} from "../../types";

export const ConnectedRealmIndexResponse = LinkSelfResponse.extend({
	connected_realms: z.array(KeyResponse),
});
export function ConnectedRealmIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ConnectedRealmIndexResponse>>({
		endpoint: `data/wow/connected-realm/index`,
		namespace: "dynamic",
		zod: ConnectedRealmIndexResponse,
	});
}

export const ConnectedRealmResponse = LinkSelfResponse.extend({
	id: z.number(),
	has_queue: z.boolean(),
	status: z.strictObject({
		type: z.enum(["UP", "DOWN"]),
		name: LocaleResponse,
	}),
	population: z.strictObject({
		type: z.enum(["FULL", "HIGH", "RECOMMENDED", "MEDIUM", "LOW"]),
		name: LocaleResponse,
	}),
	realms: z.array(
		z.strictObject({
			id: z.number(),
			region: KeyNameIdResponse,
			connected_realm: KeyResponse,
			name: LocaleResponse,
			category: LocaleResponse,
			locale: LocaleString,
			timezone: z.enum([
				"America/Los_Angeles",
				"America/New_York",
				"America/Denver",
				"America/Chicago",
				"America/Sao_Paulo",
				"Australia/Melbourne",
				"Europe/Paris",
				"Asia/Seoul",
			]),
			type: z.strictObject({
				type: z.enum(["NORMAL", "RP"]),
				name: LocaleResponse,
			}),
			is_tournament: z.boolean(),
			slug: z.string(),
		}),
	),
	mythic_leaderboards: KeyResponse,
	auctions: KeyResponse,
});
export function ConnectedRealm(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ConnectedRealmResponse>>({
		endpoint: `data/wow/connected-realm/${id}`,
		namespace: "dynamic",
		zod: ConnectedRealmResponse,
	});
}

export function ConnectedRealmSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<unknown>({
		endpoint: "data/wow/search/connected-realm",
		namespace: "dynamic",
		zod: z.unknown(),
		params,
	});
}
