import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@auxarmory/ui/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@auxarmory/ui/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@auxarmory/ui/components/ui/sidebar'

import { authClient } from '../lib/auth-client'

export function NavUser() {
	const { isMobile } = useSidebar()
	const navigate = useNavigate()
	const { data: session } = authClient.useSession()
	const loggedIn = !!session?.session

	const user = {
		name: session?.user?.name ?? 'Guest',
		email: session?.user?.email ?? 'Not signed in',
		avatar: session?.user?.image ?? '',
	}

	async function handleAuthClick() {
		if (loggedIn) {
			await authClient.signOut()
			await navigate({ to: '/auth/login' })
			return
		}

		await navigate({ to: '/auth/login' })
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage
									src={user.avatar}
									alt={user.name}
								/>
								<AvatarFallback className='rounded-lg'>
									{user.name.slice(0, 1).toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>
									{user.name}
								</span>
								<span className='truncate text-xs'>
									{user.email}
								</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}
					>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded-lg'>
									<AvatarImage
										src={user.avatar}
										alt={user.name}
									/>
									<AvatarFallback className='rounded-lg'>
										{user.name.slice(0, 1).toUpperCase() ||
											'U'}
									</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>
										{user.name}
									</span>
									<span className='truncate text-xs'>
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles />
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleAuthClick}>
							<LogOut />
							{loggedIn ? 'Log out' : 'Log in'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
