const DEFAULT_TRACES_SAMPLE_RATE = 0.1

/**
 * @param {number | string | undefined} value
 * @param {number} [fallback]
 */
function resolveTracesSampleRate(value, fallback = DEFAULT_TRACES_SAMPLE_RATE) {
	const numeric = Number(value)

	if (Number.isNaN(numeric)) {
		return fallback
	}

	if (numeric < 0) {
		return 0
	}

	if (numeric > 1) {
		return 1
	}

	return numeric
}

/**
 * @param {{ service: string; prefix?: string; env?: Record<string, string | undefined> }} options
 */
export function createNodeSentryConfigFromEnv({
	service,
	prefix = 'SENTRY',
	env = process.env,
}) {
	const dsn = env[`${prefix}_DSN`]

	if (!dsn) {
		return null
	}

	return {
		dsn,
		environment: env.NODE_ENV || 'development',
		release: env[`${prefix}_RELEASE`],
		sendDefaultPii: true,
		enableLogs: true,
		tracesSampleRate: resolveTracesSampleRate(
			env[`${prefix}_TRACES_SAMPLE_RATE`],
		),
		initialScope: {
			tags: {
				service,
				runtime: 'node',
			},
		},
	}
}
