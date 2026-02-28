import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

import { env } from '../env'

export const authClient = createAuthClient({
	baseURL: env.VITE_AUTH_URL,
	fetchOptions: {
		credentials: 'include',
	},
	plugins: [organizationClient()],
})
