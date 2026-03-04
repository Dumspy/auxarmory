import fs from 'fs'

import { AccountClient, ApplicationClient } from '.'
import { env } from './env'
import type { ClientReturn } from './types'
import { MountIndexResponse, MountResponse } from './wow/game_data/mount'
import {
	AccountDecorCollectionSummaryResponse,
	AccountHeirloomsCollectionSummaryResponse,
} from './wow/profile/account_profile'

type EndpointFn<T, R> = (input: T) => Promise<R>
interface Validator<R> {
	safeParse: (data: unknown) => {
		success: boolean
		error?: unknown
		data?: R
	}
}

interface ProcessChainParams<T, R> {
	inputs: T[]
	endpoint: EndpointFn<T, ClientReturn<R>>
	validator: Validator<R>
	saveId: (input: T) => string | number
	next?: (result: R, input: T) => Promise<void>
}

function serializeError(error: unknown) {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		}
	}
	return error
}

async function processChain<T, R>({
	inputs,
	endpoint,
	validator,
	saveId,
	next,
}: ProcessChainParams<T, R>) {
	for (const input of inputs) {
		const id = saveId(input)
		try {
			const data = await endpoint(input)
			const res = validator.safeParse(data.raw_data)
			if (res.success) {
				console.log('ok', id)
				if (next) await next(res.data as R, input)
			} else {
				fs.mkdirSync('./out', { recursive: true })
				const errorFile = `./out/error-${id}.txt`
				const dataFile = `./out/data-${id}.json`
				fs.writeFileSync(errorFile, String(res.error))
				const dataWithError = {
					...data,
					error: serializeError(data.error),
				}
				fs.writeFileSync(
					dataFile,
					JSON.stringify(dataWithError, null, 2),
				)
				console.error(
					`Parse error for ${id}, saved to ${errorFile} and ${dataFile}`,
				)
			}
		} catch (error) {
			console.error(`Error fetching data for ${id}:`)
			console.error(error)
		}
	}
}

;(async () => {
	const client = new ApplicationClient({
		region: 'eu',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		suppressZodErrors: true,
	})

	const profileClient = new AccountClient({
		region: 'eu',
		accessToken: env.BATTLE_NET_ACCOUNT_TOKEN,
		suppressZodErrors: true,
	})

	await processChain({
		inputs: [null],
		endpoint: async () => profileClient.wow.AccountCollectionIndex(),
		validator: AccountDecorCollectionSummaryResponse,
		saveId: () => 'root',
		next: async (index) => {
			// await processChain({
			// 	inputs: index.mounts,
			// 	endpoint: async (decor) => client.wow.Mount(decor.id),
			// 	validator: MountResponse,
			// 	saveId: (decor) => `mount-${decor.id}`,
			// })
		},
	})
})()
