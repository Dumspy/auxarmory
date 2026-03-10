import type { Client } from 'openapi-fetch'
import type {
	operations as PricingOperations,
	paths as PricingPaths,
} from './types/pricing.gen'
import type { TsmClientOptions } from './types/shared'

import { createTsmTransport } from './transport'

const PRICING_BASE_URL = 'https://pricing-api.tradeskillmaster.com'

type GetRegionItemResponse =
	PricingOperations['GetRegionItem_getItem']['responses'][200]['content']['application/json']
type GetRegionPetResponse =
	PricingOperations['GetRegionPet_getPet']['responses'][200]['content']['application/json']
type ListRegionItemsResponse =
	PricingOperations['ListRegionItems_listItems']['responses'][200]['content']
type GetAuctionHouseItemResponse =
	PricingOperations['GetAuctionHouseItem_getItem']['responses'][200]['content']['application/json']
type GetAuctionHousePetResponse =
	PricingOperations['GetAuctionHousePet_getPet']['responses'][200]['content']['application/json']
type ListAuctionHouseItemsResponse =
	PricingOperations['ListAuctionHouseItems_listItems']['responses'][200]['content']

export type PricingRawClient = Client<PricingPaths>

export interface PricingClient {
	raw: PricingRawClient
	getRegionItem(input: {
		regionId: number
		itemId: number
	}): Promise<GetRegionItemResponse | undefined>
	getRegionPet(input: {
		regionId: number
		petSpeciesId: number
	}): Promise<GetRegionPetResponse | undefined>
	listRegionItems(input: {
		regionId: number
	}): Promise<ListRegionItemsResponse | undefined>
	getAuctionHouseItem(input: {
		auctionHouseId: number
		itemId: number
	}): Promise<GetAuctionHouseItemResponse | undefined>
	getAuctionHousePet(input: {
		auctionHouseId: number
		petSpeciesId: number
	}): Promise<GetAuctionHousePetResponse | undefined>
	listAuctionHouseItems(input: {
		auctionHouseId: number
	}): Promise<ListAuctionHouseItemsResponse | undefined>
}

export function createPricingClient(options: TsmClientOptions): PricingClient {
	const client = createTsmTransport<PricingPaths>({
		baseUrl: PRICING_BASE_URL,
		options,
	})

	return {
		raw: client,
		async getRegionItem({ regionId, itemId }) {
			const { data } = await client.GET(
				'/region/{regionId}/item/{itemId}',
				{
					params: {
						path: { regionId, itemId },
					},
				},
			)
			return data
		},
		async getRegionPet({ regionId, petSpeciesId }) {
			const { data } = await client.GET(
				'/region/{regionId}/pet/{petSpeciesId}',
				{
					params: {
						path: { regionId, petSpeciesId },
					},
				},
			)
			return data
		},
		async listRegionItems({ regionId }) {
			const { data } = await client.GET('/region/{regionId}', {
				params: {
					path: { regionId },
				},
			})
			return data
		},
		async getAuctionHouseItem({ auctionHouseId, itemId }) {
			const { data } = await client.GET(
				'/ah/{auctionHouseId}/item/{itemId}',
				{
					params: {
						path: { auctionHouseId, itemId },
					},
				},
			)
			return data
		},
		async getAuctionHousePet({ auctionHouseId, petSpeciesId }) {
			const { data } = await client.GET(
				'/ah/{auctionHouseId}/pet/{petSpeciesId}',
				{
					params: {
						path: { auctionHouseId, petSpeciesId },
					},
				},
			)
			return data
		},
		async listAuctionHouseItems({ auctionHouseId }) {
			const { data } = await client.GET('/ah/{auctionHouseId}', {
				params: {
					path: { auctionHouseId },
				},
			})
			return data
		},
	}
}
