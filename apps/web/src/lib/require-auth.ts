import { redirect } from '@tanstack/react-router';

import { authClient } from './auth-client';

export async function requireAuth() {
	const session = await authClient.getSession();

	if (!session.data?.session) {
		throw redirect({ to: '/login' });
	}
}
