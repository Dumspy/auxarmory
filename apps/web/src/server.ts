import '../instrument.server.mjs'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

const wrappedHandler = wrapFetchWithSentry({
	fetch: (request: Request) => handler.fetch(request),
})

export default createServerEntry(wrappedHandler)
