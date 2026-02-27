import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import type { AppRouter } from '@auxarmory/api/routers';

import { env } from './env';
import { TRPCProvider } from './lib/trpc';
import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
		},
	},
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${env.VITE_API_URL}/trpc`,
			fetch(url: string | URL, options?: RequestInit) {
				return fetch(url, {
					...options,
					credentials: 'include',
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		context: {
			trpc,
			queryClient,
		},

		scrollRestoration: true,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		Wrap: ({ children }) => (
			<QueryClientProvider client={queryClient}>
				<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
					{children}
				</TRPCProvider>
			</QueryClientProvider>
		),
	});

	return router;
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
