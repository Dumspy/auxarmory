import { Redis } from 'ioredis'
import type { RedisOptions } from 'ioredis'
import { joinKey, splitKey, StorageAdapter } from '@openauthjs/openauth/storage/storage'

// Source https://github.com/toolbeam/openauth/pull/237

/**
 * Creates a Redis KV store.
 * @param options - The config for the adapter.
 */
export async function RedisStorage(options?: RedisOptions): Promise<StorageAdapter> {
  const client = new Redis(options || {})
  client.on('error', (err: Error) => console.error('Redis Client Error', err))

  return {
    async get(key: string[]) {
      const value = await client.get(joinKey(key))
      if (!value) return
      return JSON.parse(value) as Record<string, any>
    },

    async set(key: string[], value: any, expiry?: Date) {
      if (expiry) {
        const expirySeconds = Math.ceil((expiry.getTime() - Date.now()) / 1000)
        await client.setex(joinKey(key), expirySeconds, JSON.stringify(value))
      } else {
        await client.set(joinKey(key), JSON.stringify(value))
      }
    },

    async remove(key: string[]) {
      await client.del(joinKey(key))
    },

    async *scan(prefix: string[]) {
      let cursor = "0"

      while (true) {
        const [next, keys] = await client.scan(cursor, "MATCH", `${joinKey(prefix)}*`)

        for (const key of keys) {
          const value = await client.get(key)
          if (value !== null) {
            yield [splitKey(key), JSON.parse(value)]
          }
        }
        cursor = next
      }
    },
  }
}