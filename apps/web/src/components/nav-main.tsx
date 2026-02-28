import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight, HomeIcon, InfoIcon } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@auxarmory/ui/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@auxarmory/ui/components/ui/sidebar'

const routeIcons: Record<string, LucideIcon> = {
	'/dashboard': HomeIcon,
	'/about': InfoIcon,
}

interface NavItem {
	title: string
	path: string
	icon?: LucideIcon
	items?: NavItem[]
}

export function NavMain() {
	const state = useRouterState()
	const currentPath = state.location.pathname

	const navItems = useMemo(() => {
		const items: NavItem[] = []
		const allRoutes = ['/dashboard', '/about']

		allRoutes.forEach((route) => {
			const segments = route.split('/').filter(Boolean)
			const first = segments[0] ?? ''
			const second = segments[1] ?? ''

			if (segments.length === 1) {
				items.push({
					title: first.charAt(0).toUpperCase() + first.slice(1),
					path: `/${first}`,
					icon: routeIcons[`/${first}`],
				})
				return
			}

			const parentPath = `/${first}`
			const parent = items.find((item) => item.path === parentPath)

			if (parent) {
				parent.items ??= []
				parent.items.push({
					title: second.charAt(0).toUpperCase() + second.slice(1),
					path: route,
				})
				return
			}

			items.push({
				title: first.charAt(0).toUpperCase() + first.slice(1),
				path: parentPath,
				icon: routeIcons[parentPath],
				items: [
					{
						title: second.charAt(0).toUpperCase() + second.slice(1),
						path: route,
					},
				],
			})
		})

		return items
	}, [])

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Personal</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => {
					const isActive =
						currentPath === item.path ||
						(item.items?.some(
							(subItem) => currentPath === subItem.path,
						) ??
							false)

					const hasChildren = !!item.items?.length

					return (
						<Collapsible
							key={item.path}
							asChild
							defaultOpen={isActive}
							className='group/collapsible'
						>
							<SidebarMenuItem>
								{hasChildren ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												tooltip={item.title}
											>
												{item.icon ? (
													<item.icon />
												) : null}
												<span>{item.title}</span>
												<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items?.map((subItem) => (
													<SidebarMenuSubItem
														key={subItem.path}
													>
														<SidebarMenuSubButton
															asChild
														>
															<Link
																to={
																	subItem.path
																}
															>
																<span>
																	{
																		subItem.title
																	}
																</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : (
									<SidebarMenuButton asChild>
										<Link to={item.path}>
											{item.icon ? <item.icon /> : null}
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						</Collapsible>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
