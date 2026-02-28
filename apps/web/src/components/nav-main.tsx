import type { LucideIcon } from 'lucide-react'
import { HomeIcon, UserRound } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@auxarmory/ui/components/ui/sidebar'

interface NavItem {
	title: string
	path: string
	icon: LucideIcon
}

const navItems: NavItem[] = [
	{
		title: 'Dashboard',
		path: '/dashboard',
		icon: HomeIcon,
	},
	{
		title: 'Account',
		path: '/account',
		icon: UserRound,
	},
]

export function NavMain() {
	const state = useRouterState()
	const currentPath = state.location.pathname

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Personal</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => {
					const isActive = currentPath === item.path

					return (
						<SidebarMenuItem key={item.path}>
							<SidebarMenuButton
								tooltip={item.title}
								isActive={isActive}
								asChild
							>
								<Link to={item.path}>
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
