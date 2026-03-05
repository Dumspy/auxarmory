import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { HomeIcon, Shield, UserRound } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'

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
	path: '/dashboard' | '/account' | '/admin/users'
	icon: LucideIcon
	section: 'personal' | 'admin'
	requiredPermission?: PermissionCheckInput
}

const navItems: NavItem[] = [
	{
		title: 'Dashboard',
		path: '/dashboard',
		icon: HomeIcon,
		section: 'personal',
	},
	{
		title: 'Account',
		path: '/account',
		icon: UserRound,
		section: 'personal',
	},
	{
		title: 'Users',
		path: '/admin/users',
		icon: Shield,
		section: 'admin',
		requiredPermission: {
			scope: 'platform',
			permissions: {
				user: ['list'],
			},
		},
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

	const personalItems = visibleItems.filter(
		(item) => item.section === 'personal',
	)
	const adminItems = visibleItems.filter((item) => item.section === 'admin')

	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Personal</SidebarGroupLabel>
				<SidebarMenu>
					{personalItems.map((item) => {
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

			{adminItems.length > 0 ? (
				<SidebarGroup>
					<SidebarGroupLabel>Admin</SidebarGroupLabel>
					<SidebarMenu>
						{adminItems.map((item) => {
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
			) : null}
		</>
	)
}
