import * as Sentry from '@sentry/node'
import { createNodeSentryConfigFromEnv } from '@auxarmory/observability/node-instrument'

const config = createNodeSentryConfigFromEnv({ service: 'worker' })

if (config) {
	Sentry.init(config)
}
