import '../instrument.server.mjs'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

export default createServerEntry({
	fetch: (request, opts) => {
		const wrappedFetch = wrapFetchWithSentry({
			fetch: (req: Request) => handler.fetch(req, opts),
		})
		return wrappedFetch.fetch(request)
	},
})
