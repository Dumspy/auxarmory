import { createClient, type RedisClientOptions } from 'redis'
import { joinKey, splitKey, StorageAdapter } from '@openauthjs/openauth/storage/storage'

// Source https://github.com/toolbeam/openauth/pull/237

/**
 * Creates a Redis KV store.
 * @param options - The config for the adapter.
 */
export async function RedisStorage(options?: RedisClientOptions): Promise<StorageAdapter> {
  const client = await createClient(options)
    .on('error', (err) => console.error('Redis Client Error', err))
    .connect()

  return {
    async get(key: string[]) {
      const value = await client.get(joinKey(key))
      if (!value) return
      return JSON.parse(value) as Record<string, any>
    },

    async set(key: string[], value: any, expiry?: Date) {
      const _opts = expiry ? { EXAT: expiry.getTime() } : {}
      await client.set(joinKey(key), JSON.stringify(value), _opts)
    },

    async remove(key: string[]) {
      await client.del(joinKey(key))
    },

    async *scan(prefix: string[]) {
      let cursor = "0"

      while (true) {
        let { cursor: next, keys } = await client.scan(cursor, {
          MATCH: `${joinKey(prefix)}*`,
        })

        for (const key of keys) {
          const value = await client.get(key)
          if (value !== null) {
            yield [splitKey(key), JSON.parse(value)]
          }
        }

        // Number(..) cant handle 64bit integer
        if (BigInt(next) === BigInt(0)) {
          break
        }

        cursor = next
      }
    },
  }
}