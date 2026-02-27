import { createTRPCClient, httpBatchLink } from '@trpc/client';
import setCookieParser from 'set-cookie-parser';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { AppRouter } from '@auxarmory/api/routers';

interface HonoApp {
	request: (
		input: string | URL | Request,
		init?: RequestInit,
	) => Promise<Response>;
}

const TEST_PASSWORD = 'S3cure!Passw0rd123';

function setTestEnv() {
	process.env.NODE_ENV = 'test';
	process.env.AUTH_SERVICE_ORIGIN = 'http://auth.localhost';
	process.env.API_SERVICE_ORIGIN = 'http://api.localhost';
	process.env.WEB_ORIGIN = 'http://localhost:3000';
	process.env.BETTER_AUTH_URL = 'http://auth.localhost';
	process.env.AUTH_COOKIE_DOMAIN = 'localhost';
	process.env.AUTH_TRUSTED_ORIGINS = 'http://localhost:3000';
	process.env.BETTER_AUTH_SECRET ??=
		'test-secret-value-should-be-at-least-thirty-two-chars';
	process.env.DATABASE_URL =
		process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

	if (!process.env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL (or DATABASE_URL_TEST) is required for @auxarmory/e2e tests.',
		);
	}
}

function getResponseCookies(response: Response): string[] {
	const withGetSetCookie = response.headers as Headers & {
		getSetCookie?: () => string[];
	};

	if (typeof withGetSetCookie.getSetCookie === 'function') {
		return withGetSetCookie.getSetCookie();
	}

	const header = response.headers.get('set-cookie');
	return header ? [header] : [];
}

function mergeCookieJar(
	existingCookieHeader: string,
	response: Response,
): string {
	const jar = new Map<string, string>();

	for (const cookie of existingCookieHeader.split(';')) {
		const trimmed = cookie.trim();
		if (!trimmed) continue;
		const index = trimmed.indexOf('=');
		if (index <= 0) continue;
		jar.set(trimmed.slice(0, index), trimmed.slice(index + 1));
	}

	const parsed = setCookieParser.parse(getResponseCookies(response), {
		decodeValues: false,
	});

	for (const cookie of parsed) {
		jar.set(cookie.name, cookie.value);
	}

	return [...jar.entries()]
		.map(([name, value]) => `${name}=${value}`)
		.join('; ');
}

async function createApps() {
	setTestEnv();
	vi.resetModules();

	const { createAuthApp } = await import('@auxarmory/auth-service/app');
	const { createApiApp } = await import('@auxarmory/api-service/app');

	return {
		authApp: createAuthApp() as HonoApp,
		apiApp: createApiApp() as HonoApp,
	};
}

describe('auth + trpc integration flow', () => {
	let authApp: HonoApp;
	let apiApp: HonoApp;

	beforeAll(async () => {
		const apps = await createApps();
		authApp = apps.authApp;
		apiApp = apps.apiApp;
	});

	it('returns service health responses', async () => {
		const authHealth = await authApp.request(
			'http://auth.localhost/health',
		);
		const apiHealth = await apiApp.request('http://api.localhost/health');

		expect(authHealth.status).toBe(200);
		expect(await authHealth.json()).toMatchObject({ service: 'auth' });

		expect(apiHealth.status).toBe(200);
		expect(await apiHealth.json()).toMatchObject({ service: 'api' });
	});

	it('rejects privateData without a session cookie', async () => {
		const trpc = createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: 'http://api.localhost/trpc',
					fetch: (input, init) => apiApp.request(input, init),
				}),
			],
		});

		await expect(trpc.privateData.query()).rejects.toMatchObject({
			data: { code: 'UNAUTHORIZED' },
		});
	});

	it('allows privateData with a real Better Auth session cookie', async () => {
		const email = `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
		let cookieHeader = '';

		const signUpResponse = await authApp.request(
			'http://auth.localhost/api/auth/sign-up/email',
			{
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					origin: 'http://localhost:3000',
				},
				body: JSON.stringify({
					email,
					password: TEST_PASSWORD,
					name: 'E2E User',
				}),
			},
		);

		expect(signUpResponse.status).toBe(200);
		cookieHeader = mergeCookieJar(cookieHeader, signUpResponse);

		const getSessionResponse = await authApp.request(
			'http://auth.localhost/api/auth/get-session',
			{
				headers: {
					cookie: cookieHeader,
				},
			},
		);

		expect(getSessionResponse.status).toBe(200);
		const session = (await getSessionResponse.json()) as {
			user?: { email?: string };
		};
		expect(session?.user?.email).toBe(email);

		const trpc = createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: 'http://api.localhost/trpc',
					fetch: (input, init) => {
						const headers = new Headers(init?.headers);
						headers.set('cookie', cookieHeader);

						return apiApp.request(input, {
							...init,
							headers,
						});
					},
				}),
			],
		});

		const privateData = await trpc.privateData.query();
		expect(privateData.message).toBe('This is private');
		expect(privateData.user.email).toBe(email);
	});
});
