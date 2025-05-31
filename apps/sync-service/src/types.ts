import { z } from "zod";

import { regions } from "@auxarmory/battlenet";

// Job type definitions
export const JobTypes = {
	SYNC_CHARACTER_DATA: "sync-character-data",
	SYNC_ACCOUNT_DATA: "sync-account-data",
} as const;

export type JobType = (typeof JobTypes)[keyof typeof JobTypes];

// Job payload schemas
export const SyncCharacterDataSchema = z.object({
	accountId: z.number(),
	region: z.enum(regions),
	realmSlug: z.string(),
	characterName: z.string(),
});

export const SyncAccountDataSchema = z.object({
	accountId: z.number(),
	region: z.enum(regions),
});

// Union type for all job payloads
export interface JobPayloads {
	[JobTypes.SYNC_CHARACTER_DATA]: z.infer<typeof SyncCharacterDataSchema>;
	[JobTypes.SYNC_ACCOUNT_DATA]: z.infer<typeof SyncAccountDataSchema>;
}

export const JobPayloadSchemas = {
	[JobTypes.SYNC_CHARACTER_DATA]: SyncCharacterDataSchema,
	[JobTypes.SYNC_ACCOUNT_DATA]: SyncAccountDataSchema,
} as const;
