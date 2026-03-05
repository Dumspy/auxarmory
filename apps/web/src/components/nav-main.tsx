import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Activity, HomeIcon, Shield, UserRound } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'

import { platformPermissions } from '@auxarmory/auth/permissions'

import type { FileRoutesByTo } from '../routeTree.gen'

import { permissionQueryOptions } from '../lib/auth-client'
import type { PermissionCheckInput } from '../lib/auth-client'

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@auxarmory/ui/components/ui/sidebar'

interface NavItem {
	title: string
	path: keyof FileRoutesByTo
	icon: LucideIcon
	requiredPermission?: PermissionCheckInput
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
	{
		title: 'Admin Users',
		path: '/admin/users',
		icon: Shield,
		requiredPermission: platformPermissions.adminUsersList,
	},
	{
		title: 'Admin Jobs',
		path: '/admin/jobs',
		icon: Activity,
		requiredPermission: platformPermissions.adminJobsRead,
	},
]

export function NavMain() {
	const state = useRouterState()
	const currentPath = state.location.pathname

	const protectedItems = useMemo(
		() =>
			navItems.filter(
				(
					item,
				): item is NavItem & {
					requiredPermission: PermissionCheckInput
				} => item.requiredPermission !== undefined,
			),
		[],
	)

	const permissionQueries = useQueries({
		queries: protectedItems.map((item) =>
			permissionQueryOptions(item.requiredPermission),
		),
	})

	const visibilityByPath = new Map(
		protectedItems.map((item, index) => [
			item.path,
			permissionQueries[index]?.data === true,
		]),
	)

	const visibleItems = navItems.filter((item) => {
		if (!item.requiredPermission) {
			return true
		}

		return visibilityByPath.get(item.path) === true
	})

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Personal</SidebarGroupLabel>
			<SidebarMenu>
				{visibleItems.map((item) => {
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
