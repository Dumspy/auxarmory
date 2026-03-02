import * as Sentry from '@sentry/node'
import { createNodeSentryConfigFromEnv } from '@auxarmory/observability/node-instrument'

const config = createNodeSentryConfigFromEnv({ service: 'api' })

if (config) {
	Sentry.init({
		...config,
		integrations: [
			Sentry.honoIntegration({
				shouldHandleError: () => false,
			}),
		],
	})
}
