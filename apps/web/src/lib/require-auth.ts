import { redirect } from '@tanstack/react-router';

import { authClient } from './auth-client';

export function normalizeRedirectPath(
	value: string | undefined,
	fallback = '/',
) {
	if (!value || !value.startsWith('/') || value.startsWith('//')) {
		return fallback;
	}

	return value;
}

export function getRedirectFromSearchStr(searchStr?: string) {
	const params = new URLSearchParams(searchStr ?? '');
	return params.get('redirect') ?? undefined;
}

export async function requireAuth({
	location,
}: {
	location: { pathname: string; searchStr?: string };
}) {
	if (typeof window === 'undefined') {
		return;
	}

	const session = await authClient.getSession();

	if (!session.data?.session) {
		const redirectPath = `${location.pathname}${location.searchStr ?? ''}`;
		throw redirect({
			to: '/auth/login',
			search: {
				redirect: normalizeRedirectPath(redirectPath),
			},
		});
	}
}

export async function redirectAuthenticatedUser({
	location,
}: {
	location: { searchStr?: string };
}) {
	if (typeof window === 'undefined') {
		return;
	}

	const session = await authClient.getSession();

	if (session.data?.session) {
		throw redirect({
			to: normalizeRedirectPath(
				getRedirectFromSearchStr(location.searchStr),
				'/dashboard',
			),
		});
	}
}
