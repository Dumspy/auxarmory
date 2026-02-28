import { auth } from '@auxarmory/auth'

export async function createContext({ headers }: { headers: Headers }) {
	const session = await auth.api.getSession({ headers })

	return {
		session,
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
