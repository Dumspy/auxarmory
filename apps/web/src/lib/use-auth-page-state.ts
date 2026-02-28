import { authClient } from './auth-client'

export function useAuthPageState() {
	const { data: session, isPending } = authClient.useSession()

	return {
		isPending,
		isAuthenticated: Boolean(session?.session),
	}
}
