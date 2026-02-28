import { Building2, ChevronsUpDown } from 'lucide-react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@auxarmory/ui/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@auxarmory/ui/components/ui/sidebar'

import { useOrganizationSwitcher } from '../lib/use-organization-switcher'

export function OrgSwitcher() {
	const { isMobile } = useSidebar()
	const {
		organizations,
		isPending,
		activeOrganization,
		selectedOrganizationId,
		switchingOrganizationId,
		setActiveOrganization,
	} = useOrganizationSwitcher()

	const hasMultipleOrganizations = (organizations?.length ?? 0) > 1
	const buttonTitle = isPending
		? 'Loading guilds...'
		: (activeOrganization?.name ?? 'Select a guild')
	const buttonSubtitle = isPending
		? 'Checking organizations'
		: (activeOrganization?.slug ?? 'No active guild')

	if (!hasMultipleOrganizations) {
		return null
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
							<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
								<Building2 className='size-4' />
							</div>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>
									{buttonTitle}
								</span>
								<span className='truncate text-xs'>
									{buttonSubtitle}
								</span>
							</div>
							<ChevronsUpDown className='ml-auto' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						align='start'
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuLabel className='text-muted-foreground text-xs'>
							Guilds
						</DropdownMenuLabel>
						{organizations?.map((organization) => {
							const isActive =
								organization.id === selectedOrganizationId

							return (
								<DropdownMenuItem
									key={organization.id}
									onClick={() =>
										setActiveOrganization(organization.id)
									}
									disabled={
										isActive ||
										switchingOrganizationId ===
											organization.id
									}
									className='gap-2 p-2'
								>
									<div className='bg-muted flex size-6 items-center justify-center rounded-md'>
										<Building2 className='size-3.5 shrink-0' />
									</div>
									<div className='flex flex-1 items-center justify-between gap-2'>
										<span className='truncate'>
											{organization.name}
										</span>
										{isActive ? (
											<span className='text-muted-foreground text-xs'>
												Active
											</span>
										) : null}
									</div>
								</DropdownMenuItem>
							)
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
