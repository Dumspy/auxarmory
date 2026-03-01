import * as Sentry from '@sentry/node'
import { createNodeSentryConfigFromEnv } from '@auxarmory/observability/node-instrument'

const config = createNodeSentryConfigFromEnv({ service: 'auth' })

if (config) {
	Sentry.init(config)
}
