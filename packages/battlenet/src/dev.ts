import fs from 'fs';

import { ApplicationClient } from '.';
import { env } from './env';
import { AuctionsResponse } from './wow/game_data/auction';
import { ConnectedRealmIndexResponse } from './wow/game_data/connected_realm';

type EndpointFn<T, R> = (input: T) => Promise<R>;
interface Validator<R> {
	safeParse: (data: unknown) => {
		success: boolean;
		error?: unknown;
		data?: R;
	};
}

interface ProcessChainParams<T, R> {
	inputs: T[];
	endpoint: EndpointFn<T, unknown>;
	validator: Validator<R>;
	saveId: (input: T) => string | number;
	next?: (result: R, input: T) => Promise<void>;
}

async function processChain<T, R>({
	inputs,
	endpoint,
	validator,
	saveId,
	next,
}: ProcessChainParams<T, R>) {
	for (const input of inputs) {
		const id = saveId(input);
		try {
			const data = await endpoint(input);
			const res = validator.safeParse(data);
			if (res.success) {
				console.log('ok', id);
				if (next) await next(res.data as R, input);
			} else {
				const errorFile = `./out/error-${id}.txt`;
				const dataFile = `./out/data-${id}.json`;
				fs.writeFileSync(errorFile, String(res.error));
				fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
				console.error(
					`Parse error for ${id}, saved to ${errorFile} and ${dataFile}`,
				);
			}
		} catch (error) {
			console.error(`Error fetching data for ${id}:`);
			console.error(error);
		}
	}
}

(async () => {
	const client = new ApplicationClient({
		region: 'eu',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		suppressZodErrors: true,
	});

	await processChain({
		inputs: [null],
		endpoint: async () => client.wow.Azerite('2000000'),
		validator: ConnectedRealmIndexResponse,
		saveId: () => 'root',
		next: async (idx) => {
			await processChain({
				inputs: idx.connected_realms,
				endpoint: async (data) =>
					client.wow.Auctions(
						Number(data.href.match(/\/(\d+)(?:[/?]|$)/)?.[1]),
					),
				validator: AuctionsResponse,
				saveId: (data) =>
					Number(data.href.match(/\/(\d+)(?:[/?]|$)/)?.[1]),
				// next: async (idx, orig_idx) => {
				// 	if (!idx.skill_tiers) return;
				// 	await processChain({
				// 		inputs: idx.skill_tiers,
				// 		endpoint: async (input) =>
				// 			client.wow.ProfessionSkillTier(
				// 				orig_idx.id,
				// 				input.id,
				// 			),
				// 		validator: ProfessionSkillTierResponse,
				// 		saveId: (input) => `${input.id}-${orig_idx.id}`,
				// 		// next: async (tier) => {
				// 		// 	if (!tier.categories) return;
				// 		// 	for (const category of tier.categories) {
				// 		// 		await processChain({
				// 		// 			inputs: category.recipes,
				// 		// 			endpoint: async (input) =>
				// 		// 				client.wow.ProfessionRecipeMedia(
				// 		// 					input.id
				// 		// 				),
				// 		// 			validator: ProfessionRecipeMediaResponse,
				// 		// 			saveId: (input) =>
				// 		// 				`recipe-${input.id}`,
				// 		// 		});
				// 		// 	}
				// 		// },
				// 	});
				// },
			});
		},
	});
})();
