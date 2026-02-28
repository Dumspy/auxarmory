import type { ReactNode } from 'react'
import { Building2, Link2, UserRound } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@auxarmory/ui/components/ui/avatar'
import { Badge } from '@auxarmory/ui/components/ui/badge'
import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import { Separator } from '@auxarmory/ui/components/ui/separator'

import { getUserInitial } from '../../lib/user'
import { useOrganizationSwitcher } from '../../lib/use-organization-switcher'

export const Route = createFileRoute('/_auth/account')({
	component: AccountPage,
})

const linkedAccountProviders = ['Battle.net', 'Discord', 'GitHub']

function getGuildActionLabel({
	isActive,
	isSwitching,
}: {
	isActive: boolean
	isSwitching: boolean
}) {
	if (isSwitching) {
		return 'Switching...'
	}

	if (isActive) {
		return 'Current'
	}

	return 'Set active'
}

function AccountPage() {
	const {
		session,
		organizations,
		isPending,
		activeOrganization,
		selectedOrganizationId,
		switchingOrganizationId,
		setActiveOrganization,
	} = useOrganizationSwitcher()
	const user = session?.user

	let guildsContent: ReactNode = null

	if (isPending) {
		guildsContent = (
			<p className='text-muted-foreground text-sm'>Loading guilds...</p>
		)
	} else if ((organizations?.length ?? 0) === 0) {
		guildsContent = (
			<p className='text-muted-foreground text-sm'>
				You are not in any guilds yet.
			</p>
		)
	} else {
		guildsContent = organizations?.map((organization) => {
			const isActive = organization.id === selectedOrganizationId
			const isSwitching = switchingOrganizationId === organization.id

			return (
				<div
					key={organization.id}
					className='flex items-center justify-between gap-3 rounded-lg border p-3'
				>
					<div className='min-w-0'>
						<p className='truncate text-sm font-medium'>
							{organization.name}
						</p>
						<p className='text-muted-foreground truncate text-xs'>
							{organization.slug}
						</p>
					</div>
					<div className='flex items-center gap-2'>
						{isActive ? <Badge>Active</Badge> : null}
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								setActiveOrganization(organization.id)
							}
							disabled={isActive || isSwitching}
						>
							{getGuildActionLabel({
								isActive,
								isSwitching,
							})}
						</Button>
					</div>
				</div>
			)
		})
	}

	return (
		<div className='space-y-6 p-2 md:p-4'>
			<div>
				<h1 className='text-foreground text-2xl font-bold'>Account</h1>
				<p className='text-muted-foreground'>
					Manage your profile, guild selection, and connected
					providers.
				</p>
			</div>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<Card className='lg:col-span-1'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<UserRound className='h-5 w-5' />
							Profile
						</CardTitle>
						<CardDescription>
							Your primary account information.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center gap-3'>
							<Avatar className='h-12 w-12'>
								<AvatarImage
									src={user?.image ?? ''}
									alt={user?.name}
								/>
								<AvatarFallback>
									{getUserInitial(user?.name)}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='font-medium'>
									{user?.name ?? 'Guest user'}
								</p>
								<p className='text-muted-foreground text-sm'>
									{user?.email ?? 'Not signed in'}
								</p>
							</div>
						</div>
						<Separator />
						<div className='space-y-2'>
							<p className='text-muted-foreground text-xs uppercase'>
								Active guild
							</p>
							<p className='text-sm font-medium'>
								{activeOrganization?.name ?? 'No active guild'}
							</p>
						</div>
					</CardContent>
				</Card>

				<div className='space-y-6 lg:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Building2 className='h-5 w-5' />
								Guilds
							</CardTitle>
							<CardDescription>
								Switch the organization context used by your
								account.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							{guildsContent}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Link2 className='h-5 w-5' />
								Linked Accounts
							</CardTitle>
							<CardDescription>
								Reserved for provider linking UI (not
								implemented yet).
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							{linkedAccountProviders.map((provider) => (
								<div
									key={provider}
									className='flex items-center justify-between rounded-lg border p-3'
								>
									<div>
										<p className='text-sm font-medium'>
											{provider}
										</p>
										<p className='text-muted-foreground text-xs'>
											Connect this provider from here in a
											future update.
										</p>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline'>
											Not linked
										</Badge>
										<Button
											variant='outline'
											size='sm'
											disabled
										>
											Coming soon
										</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
