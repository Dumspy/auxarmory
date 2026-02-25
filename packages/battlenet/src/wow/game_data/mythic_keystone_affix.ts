import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from '../../types';

export const MythicKeystoneAffixesIndexResponse = LinkSelfResponse.extend({
	affixes: z.array(KeyNameIdResponse),
});
export function MythicKeystoneAffixesIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MythicKeystoneAffixesIndexResponse>>({
		endpoint: `data/wow/keystone-affix/index`,
		namespace: 'static',
		zod: MythicKeystoneAffixesIndexResponse,
	});
}

export const MythicKeystoneAffixResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse,
	media: MediaKeyResponse,
});
export function MythicKeystoneAffix(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MythicKeystoneAffixResponse>>({
		endpoint: `data/wow/keystone-affix/${id}`,
		namespace: 'static',
		zod: MythicKeystoneAffixResponse,
	});
}

export const MythicKeystoneAffixMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray.optional(),
	id: z.number(),
});
export function MythicKeystoneAffixMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MythicKeystoneAffixMediaResponse>>({
		endpoint: `data/wow/media/keystone-affix/${id}`,
		namespace: 'static',
		zod: MythicKeystoneAffixMediaResponse,
	});
}
