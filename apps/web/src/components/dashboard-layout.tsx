import type { MouseEvent, ReactNode } from 'react'
import { Fragment } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@auxarmory/ui/components/ui/breadcrumb'
import { Separator } from '@auxarmory/ui/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@auxarmory/ui/components/ui/sidebar'

import { AppSidebar } from './app-sidebar'

function BreadcrumbNav() {
	const router = useRouter()
	const state = useRouterState()
	const path = state.location.pathname
	const allSegments: string[] =
		path === '/' ? [] : path.split('/').filter(Boolean)
	const segments =
		allSegments[0] === 'dashboard' ? allSegments.slice(1) : allSegments

	function handleBreadcrumbClick(
		event: MouseEvent<HTMLAnchorElement>,
		href: string,
	) {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return
		}

		event.preventDefault()
		router.history.push(href)
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink
						render={
							<a
								href='/dashboard'
								onClick={(event) =>
									handleBreadcrumbClick(event, '/dashboard')
								}
							/>
						}
					>
						Home
					</BreadcrumbLink>
				</BreadcrumbItem>
				{segments.map((segment, index) => {
					const segmentPath = `/${segments.slice(0, index + 1).join('/')}`
					const isLast = index === segments.length - 1
					const title =
						segment.charAt(0).toUpperCase() + segment.slice(1)

					return (
						<Fragment key={segmentPath}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{title}</BreadcrumbPage>
								) : (
									<BreadcrumbLink
										render={
											<a
												href={segmentPath}
												onClick={(event) =>
													handleBreadcrumbClick(
														event,
														segmentPath,
													)
												}
											/>
										}
									>
										{title}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='text-foreground'>
				<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator
							orientation='vertical'
							className='mr-2 data-[orientation=vertical]:h-4'
						/>
						<BreadcrumbNav />
					</div>
				</header>
				<Separator />
				<main className='p-4'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
