import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

import { authClient } from '../../lib/auth-client'
import { getUserInitial } from '../../lib/user'
import { useOrganizationSwitcher } from '../../lib/use-organization-switcher'

export const Route = createFileRoute('/_auth/account')({
	component: AccountPage,
})

const battlenetRegions = [
	{ providerId: 'battlenet-us', label: 'US' },
	{ providerId: 'battlenet-eu', label: 'EU' },
	{ providerId: 'battlenet-kr', label: 'KR' },
	{ providerId: 'battlenet-tw', label: 'TW' },
] as const

type BattlenetProviderId = (typeof battlenetRegions)[number]['providerId']

interface LinkedAccount {
	id: string
	providerId: string
	accountId: string
}

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
	const [selectedBattlenetProvider, setSelectedBattlenetProvider] =
		useState<BattlenetProviderId>('battlenet-us')
	const [linkedBattlenetAccounts, setLinkedBattlenetAccounts] = useState<
		LinkedAccount[]
	>([])
	const [isLoadingLinkedAccounts, setIsLoadingLinkedAccounts] =
		useState(false)
	const [linkingProviderId, setLinkingProviderId] = useState<string | null>(
		null,
	)
	const [unlinkingAccountId, setUnlinkingAccountId] = useState<string | null>(
		null,
	)
	const [linkedAccountError, setLinkedAccountError] = useState<string | null>(
		null,
	)

	const loadLinkedBattlenetAccounts = useCallback(async () => {
		if (!user?.id) {
			setLinkedBattlenetAccounts([])
			return
		}

		setIsLoadingLinkedAccounts(true)

		try {
			const result = await authClient.listAccounts()

			if (result.error) {
				setLinkedAccountError(
					result.error.message ??
						'Unable to load linked Battle.net accounts.',
				)
				return
			}

			const accounts = (result.data ?? []) as LinkedAccount[]
			setLinkedBattlenetAccounts(
				accounts.filter((account) =>
					account.providerId.startsWith('battlenet-'),
				),
			)
		} finally {
			setIsLoadingLinkedAccounts(false)
		}
	}, [user?.id])

	useEffect(() => {
		void loadLinkedBattlenetAccounts()
	}, [loadLinkedBattlenetAccounts])

	const battlenetAccountsByProvider = useMemo(() => {
		return battlenetRegions.map((region) => ({
			...region,
			accounts: linkedBattlenetAccounts.filter(
				(account) => account.providerId === region.providerId,
			),
		}))
	}, [linkedBattlenetAccounts])

	async function handleLinkBattlenetAccount() {
		if (typeof window === 'undefined') {
			return
		}

		setLinkedAccountError(null)
		setLinkingProviderId(selectedBattlenetProvider)

		const callbackURL = `${window.location.origin}/account`

		try {
			const result = await authClient.oauth2.link({
				providerId: selectedBattlenetProvider,
				callbackURL,
				errorCallbackURL: callbackURL,
			})

			if (result.error) {
				setLinkedAccountError(
					result.error.message ??
						'Unable to start Battle.net linking flow.',
				)
				return
			}

			const shouldRedirect = result.data?.redirect !== false
			const redirectUrl =
				typeof result.data?.url === 'string' ? result.data.url : null

			if (shouldRedirect && redirectUrl) {
				window.location.assign(redirectUrl)
				return
			}

			await loadLinkedBattlenetAccounts()
		} finally {
			setLinkingProviderId(null)
		}
	}

	async function handleUnlinkBattlenetAccount(account: LinkedAccount) {
		setLinkedAccountError(null)
		setUnlinkingAccountId(account.id)

		try {
			const result = await authClient.unlinkAccount({
				providerId: account.providerId,
				accountId: account.accountId,
			})

			if (result.error) {
				setLinkedAccountError(
					result.error.message ??
						'Unable to unlink Battle.net account right now.',
				)
				return
			}

			await loadLinkedBattlenetAccounts()
		} finally {
			setUnlinkingAccountId(null)
		}
	}

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
								Link one or more Battle.net accounts by region.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div className='flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end'>
								<div className='space-y-1'>
									<p className='text-xs font-medium uppercase'>
										Battle.net region
									</p>
									<select
										className='bg-background h-9 min-w-36 rounded-md border px-2 text-sm'
										value={selectedBattlenetProvider}
										onChange={(event) =>
											setSelectedBattlenetProvider(
												event.target
													.value as BattlenetProviderId,
											)
										}
									>
										{battlenetRegions.map((region) => (
											<option
												key={region.providerId}
												value={region.providerId}
											>
												{region.label}
											</option>
										))}
									</select>
								</div>
								<Button
									onClick={handleLinkBattlenetAccount}
									disabled={
										!user?.id ||
										!!linkingProviderId ||
										isLoadingLinkedAccounts
									}
								>
									{linkingProviderId ===
									selectedBattlenetProvider
										? 'Redirecting...'
										: 'Link Battle.net account'}
								</Button>
							</div>

							{linkedAccountError ? (
								<p className='text-destructive text-sm'>
									{linkedAccountError}
								</p>
							) : null}

							{isLoadingLinkedAccounts ? (
								<p className='text-muted-foreground text-sm'>
									Loading linked Battle.net accounts...
								</p>
							) : null}

							{!isLoadingLinkedAccounts
								? battlenetAccountsByProvider.map((region) => (
										<div
											key={region.providerId}
											className='space-y-2 rounded-lg border p-3'
										>
											<div className='flex items-center justify-between'>
												<div>
													<p className='text-sm font-medium'>
														Battle.net{' '}
														{region.label}
													</p>
													<p className='text-muted-foreground text-xs'>
														{region.accounts.length}{' '}
														linked account
														{region.accounts
															.length === 1
															? ''
															: 's'}
													</p>
												</div>
												<Badge
													variant={
														region.accounts.length >
														0
															? 'default'
															: 'outline'
													}
												>
													{region.accounts.length > 0
														? 'Linked'
														: 'Not linked'}
												</Badge>
											</div>

											{region.accounts.length > 0 ? (
												region.accounts.map(
													(account) => (
														<div
															key={account.id}
															className='flex items-center justify-between gap-2 rounded-md border p-2'
														>
															<div className='min-w-0'>
																<p className='truncate text-sm font-medium'>
																	{
																		account.accountId
																	}
																</p>
																<p className='text-muted-foreground truncate text-xs'>
																	{
																		account.providerId
																	}
																</p>
															</div>
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	handleUnlinkBattlenetAccount(
																		account,
																	)
																}
																disabled={
																	unlinkingAccountId ===
																	account.id
																}
															>
																{unlinkingAccountId ===
																account.id
																	? 'Unlinking...'
																	: 'Unlink'}
															</Button>
														</div>
													),
												)
											) : (
												<p className='text-muted-foreground text-xs'>
													No linked accounts for this
													region.
												</p>
											)}
										</div>
									))
								: null}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
