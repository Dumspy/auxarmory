import type { Client } from 'openapi-fetch'
import type {
	operations as RealmOperations,
	paths as RealmPaths,
} from './types/realm.gen'
import type { TsmClientOptions } from './types/shared'

import { createTsmTransport } from './transport'

const REALM_BASE_URL = 'https://realm-api.tradeskillmaster.com'

type GetRegionsResponse =
	RealmOperations['v1-GetRegions']['responses'][200]['content']['application/json']
type GetRegionResponse =
	RealmOperations['v1-GetRegion']['responses'][200]['content']['application/json']
type GetRegionRealmsResponse =
	RealmOperations['v1-GetRegionRealms']['responses'][200]['content']['application/json']
type GetRealmsResponse =
	RealmOperations['v1-GetRealm']['responses'][200]['content']['application/json']
type GetRealmResponse =
	RealmOperations['v1-GetRealms']['responses'][200]['content']['application/json']
type GetAuctionHouseResponse =
	RealmOperations['v1-GetAuctionHouse']['responses'][200]['content']['application/json']

export type RealmRawClient = Client<RealmPaths>

export interface RealmClient {
	raw: RealmRawClient
	getRegions(): Promise<GetRegionsResponse | undefined>
	getRegion(input: {
		regionId: number
	}): Promise<GetRegionResponse | undefined>
	getRegionRealms(input: {
		regionId: number
	}): Promise<GetRegionRealmsResponse | undefined>
	getRealms(): Promise<GetRealmsResponse | undefined>
	getRealm(input: { realmId: number }): Promise<GetRealmResponse | undefined>
	getAuctionHouse(input: {
		auctionHouseId: number
	}): Promise<GetAuctionHouseResponse | undefined>
}

export function createRealmClient(options: TsmClientOptions): RealmClient {
	const client = createTsmTransport<RealmPaths>({
		baseUrl: REALM_BASE_URL,
		options,
	})

	return {
		raw: client,
		async getRegions() {
			const { data } = await client.GET('/regions')
			return data
		},
		async getRegion({ regionId }) {
			const { data } = await client.GET('/regions/{regionId}', {
				params: {
					path: { regionId },
				},
			})
			return data
		},
		async getRegionRealms({ regionId }) {
			const { data } = await client.GET('/regions/{regionId}/realms', {
				params: {
					path: { regionId },
				},
			})
			return data
		},
		async getRealms() {
			const { data } = await client.GET('/realms')
			return data
		},
		async getRealm({ realmId }) {
			const { data } = await client.GET('/realms/{realmId}', {
				params: {
					path: { realmId },
				},
			})
			return data
		},
		async getAuctionHouse({ auctionHouseId }) {
			const { data } = await client.GET(
				'/auction-houses/{auctionHouseId}',
				{
					params: {
						path: { auctionHouseId },
					},
				},
			)
			return data
		},
	}
}
