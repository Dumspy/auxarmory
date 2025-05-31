import type { StorageAdapter } from "@openauthjs/openauth/storage/storage";
import type { RedisOptions } from "ioredis";
import { joinKey, splitKey } from "@openauthjs/openauth/storage/storage";
import { Redis } from "ioredis";

import { env } from "../env";

export interface RedisStorageOptions {
	connectionUrl: string;
}

export type RedisStorageCredentials = RedisOptions;

export function RedisStorage(): StorageAdapter {
	const client = new Redis(env.REDIS_URL);

	return {
		async get(key: string[]) {
			const value = await client.get(joinKey(key));
			if (!value) return;
			return JSON.parse(value) as Record<string, unknown>;
		},
		async set(key: string[], value: unknown, expiry?: Date) {
			if (expiry !== undefined && expiry > new Date()) {
				const ttl = Math.trunc((expiry.getTime() - Date.now()) / 1000);
				await client.set(
					joinKey(key),
					JSON.stringify(value),
					"EX",
					Math.trunc(ttl),
				);
			} else {
				await client.set(joinKey(key), JSON.stringify(value));
			}
		},
		async remove(key: string[]) {
			await client.del(joinKey(key));
		},
		async *scan(prefix: string[]) {
			let cursor = "0";

			while (true) {
				const [next, keys] = await client.scan(
					cursor,
					"MATCH",
					`${joinKey(prefix)}*`,
				);

				for (const key of keys) {
					const value = await client.get(key);
					if (value !== null) {
						yield [splitKey(key), JSON.parse(value)];
					}
				}

				// Number(..) cant handle 64bit integer
				if (BigInt(next) === BigInt(0)) {
					break;
				}

				cursor = next;
			}
		},
	};
}
