import { z } from "zod";

import { regions } from "@auxarmory/battlenet";

// Job type definitions
export const JobTypes = {
	SYNC_CHARACTER_DATA: "sync-character-data",
	SYNC_ACCOUNT_DATA: "sync-account-data",
	SYNC_GAMEDATA: "sync-gamedata",
	SYNC_GUILD_DATA: "sync-guild-data",
} as const;

export type JobType = (typeof JobTypes)[keyof typeof JobTypes];

// Job payload schemas
export const SyncCharacterDataSchema = z.object({
	accountId: z.number(),
	region: z.enum(regions),
	realmSlug: z.string(),
	characterName: z.string(),
});

export const SyncGuildDataSchema = z.object({
	guild: z.object({
		id: z.number(),
		slug: z.string(),
	}),
	realm: z.object({
		id: z.number(),
		slug: z.string(),
	}),
	region: z.enum(regions),
});

export const SyncAccountDataSchema = z.object({
	accountId: z.number(),
	region: z.enum(regions),
});

export const SyncGamedataSchema = z.object({});

// Union type for all job payloads
export interface JobPayloads {
	[JobTypes.SYNC_CHARACTER_DATA]: z.infer<typeof SyncCharacterDataSchema>;
	[JobTypes.SYNC_ACCOUNT_DATA]: z.infer<typeof SyncAccountDataSchema>;
	[JobTypes.SYNC_GAMEDATA]: z.infer<typeof SyncGamedataSchema>;
	[JobTypes.SYNC_GUILD_DATA]: z.infer<typeof SyncGuildDataSchema>;
}

export const JobPayloadSchemas = {
	[JobTypes.SYNC_CHARACTER_DATA]: SyncCharacterDataSchema,
	[JobTypes.SYNC_ACCOUNT_DATA]: SyncAccountDataSchema,
	[JobTypes.SYNC_GAMEDATA]: SyncGamedataSchema,
	[JobTypes.SYNC_GUILD_DATA]: SyncGuildDataSchema,
} as const;
