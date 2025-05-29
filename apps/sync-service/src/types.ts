import { z } from "zod";

// Job type definitions
export const JobTypes = {
	SYNC_CHARACTER_DATA: "sync-character-data",
} as const;

export type JobType = typeof JobTypes[keyof typeof JobTypes];

// Job payload schemas
export const SyncCharacterDataSchema = z.object({
	characterId: z.string(),
	region: z.enum(["us", "eu", "kr", "tw", "cn"]),
	realm: z.string(),
	characterName: z.string(),
	priority: z.number().default(1),
});

// Union type for all job payloads
export type JobPayloads = {
	[JobTypes.SYNC_CHARACTER_DATA]: z.infer<typeof SyncCharacterDataSchema>;
};

export const JobPayloadSchemas = {
	[JobTypes.SYNC_CHARACTER_DATA]: SyncCharacterDataSchema,
} as const;
