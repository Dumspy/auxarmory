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
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	errorComponent: RootErrorComponent,
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
					<Button asChild className='w-full'>
						<Link to='/'>Go to home</Link>
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
