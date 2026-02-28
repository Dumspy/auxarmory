export const JOB_PRIORITIES = {
	STANDARD: 5,
	RUSH: 3,
	CRITICAL: 1,
} as const;

export type JobPriority = (typeof JOB_PRIORITIES)[keyof typeof JOB_PRIORITIES];
