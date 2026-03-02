import * as Sentry from '@sentry/tanstackstart-react'
import { createNodeSentryConfigFromEnv } from '@auxarmory/observability/node-instrument'

const config = createNodeSentryConfigFromEnv({
	service: 'web',
	prefix: 'VITE_SENTRY',
})

if (config) {
	Sentry.init(config)
}
