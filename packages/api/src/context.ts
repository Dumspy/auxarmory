import { auth } from '@auxarmory/auth'

export async function createContext({
	headers,
	session: existingSession,
}: {
	headers: Headers
	session?: Awaited<ReturnType<typeof auth.api.getSession>>
}) {
	const session =
		existingSession === undefined
			? await auth.api.getSession({ headers })
			: existingSession

	return {
		session,
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
