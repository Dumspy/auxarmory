import Redis from "ioredis";
import { env } from "./env.js";

export function createRedisConnection() {
	const redis = new Redis.Redis(env.REDIS_URL, {
		maxRetriesPerRequest: null,
		enableReadyCheck: false,
		maxLoadingRetryTime: 1,
		lazyConnect: true,
	});

	redis.on("error", (error) => {
		console.error("Redis connection error:", error);
	});

	redis.on("connect", () => {
		console.log("Connected to Redis");
	});

	return redis;
}
