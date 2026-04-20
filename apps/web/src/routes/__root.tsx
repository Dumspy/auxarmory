import { useEffect } from 'react'
import * as Sentry from '@sentry/tanstackstart-react'
import type { QueryClient } from '@tanstack/react-query'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { Link } from '@tanstack/react-router'

import type { AppRouter } from '@auxarmory/api/routers'

import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'

import { env } from '../env'

import appCss from '../styles.css?url'

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: env.VITE_APP_NAME,
			},
		],
		links: [
			{
				rel: 'icon',
				type: 'image/svg+xml',
				href: '/Auxera-A.svg',
			},
			{
				rel: 'manifest',
				href: '/manifest.json',
			},
			{
				rel: 'preconnect',
				href: 'https://fonts.googleapis.com',
			},
			{
				rel: 'preconnect',
				href: 'https://fonts.gstatic.com',
				crossOrigin: 'anonymous',
			},
			{
				rel: 'stylesheet',
				href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap',
			},
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	errorComponent: RootErrorComponent,
	notFoundComponent: RootNotFoundComponent,
})

function RootErrorComponent({ error }: { error: Error }) {
	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/40 px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-destructive'>
						Something went wrong
					</CardTitle>
					<CardDescription>
						{error.message || 'An unexpected error occurred'}
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-2'>
					<Button
						render={<Link to='/' search={{}} />}
						nativeButton={false}
						className='w-full'
					>
						Go to home
					</Button>
					<Button
						variant='outline'
						className='w-full'
						onClick={() => window.location.reload()}
					>
						Try again
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

function RootNotFoundComponent() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/40 px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle>Page not found</CardTitle>
					<CardDescription>
						The page you requested does not exist.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						render={<Link to='/' />}
						nativeButton={false}
						className='w-full'
					>
						Go to home
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: 'bottom-right',
						openHotkey: [],
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
