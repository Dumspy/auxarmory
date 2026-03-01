import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import type { AppRouter } from '@auxarmory/api/routers'

import { env } from './env'
import { TRPCProvider } from './lib/trpc'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './components/theme-provider'

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
	if (typeof window === 'undefined') {
		return makeQueryClient()
	}

	browserQueryClient ??= makeQueryClient()
	return browserQueryClient
}

export function getRouter() {
	const queryClient = getQueryClient()
	const trpcClient = createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${env.VITE_API_URL}/trpc`,
				fetch(url: RequestInfo | URL, options?: RequestInit) {
					return fetch(url, {
						...options,
						credentials: 'include',
					})
				},
			}),
		],
	})

	const trpc = createTRPCOptionsProxy<AppRouter>({
		client: trpcClient,
		queryClient,
	})

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
			<ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
				<QueryClientProvider client={queryClient}>
					<TRPCProvider
						trpcClient={trpcClient}
						queryClient={queryClient}
					>
						{children}
					</TRPCProvider>
				</QueryClientProvider>
			</ThemeProvider>
		),
	})

	return router
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>
	}
}
