import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@auxarmory/ui/components/ui/dialog'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemHeader,
} from '@auxarmory/ui/components/ui/item'
import { Separator } from '@auxarmory/ui/components/ui/separator'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@auxarmory/ui/components/ui/tabs'

import { authClient } from '../../lib/auth-client'
import { useTRPC } from '../../lib/trpc'
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

const warcraftLogsRegions = [
	{ providerId: 'warcraftlogs-us', label: 'US' },
	{ providerId: 'warcraftlogs-eu', label: 'EU' },
	{ providerId: 'warcraftlogs-kr', label: 'KR' },
	{ providerId: 'warcraftlogs-tw', label: 'TW' },
] as const

type BattlenetProviderId = (typeof battlenetRegions)[number]['providerId']
type WarcraftLogsProviderId = (typeof warcraftLogsRegions)[number]['providerId']
type LinkProviderTab = 'battlenet' | 'warcraftlogs'
type LinkableProviderId = BattlenetProviderId | WarcraftLogsProviderId

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
	const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])
	const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
	const [activeLinkTab, setActiveLinkTab] =
		useState<LinkProviderTab>('battlenet')
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
	const [wowSyncFeedback, setWowSyncFeedback] = useState<string | null>(null)
	const trpc = useTRPC()

	const loadLinkedAccounts = useCallback(async () => {
		if (!user?.id) {
			setLinkedAccounts([])
			return
		}

		setIsLoadingLinkedAccounts(true)

		try {
			const result = await authClient.listAccounts()

			if (result.error) {
				setLinkedAccountError(
					result.error.message ?? 'Unable to load linked accounts.',
				)
				return
			}

			setLinkedAccounts((result.data ?? []) as LinkedAccount[])
		} finally {
			setIsLoadingLinkedAccounts(false)
		}
	}, [user?.id])

	useEffect(() => {
		void loadLinkedAccounts()
	}, [loadLinkedAccounts])

	const battlenetAccountsByProvider = useMemo(() => {
		return battlenetRegions.map((region) => ({
			...region,
			accounts: linkedAccounts.filter(
				(account) => account.providerId === region.providerId,
			),
		}))
	}, [linkedAccounts])

	const warcraftLogsAccountsByProvider = useMemo(() => {
		return warcraftLogsRegions.map((region) => ({
			...region,
			accounts: linkedAccounts.filter(
				(account) => account.providerId === region.providerId,
			),
		}))
	}, [linkedAccounts])

	const linkedAccountSections = useMemo(() => {
		const sections = [
			{
				providerLabel: 'Battle.net',
				regions: battlenetAccountsByProvider,
			},
			{
				providerLabel: 'Warcraft Logs',
				regions: warcraftLogsAccountsByProvider,
			},
		].map((section) => {
			const linkedRegions = section.regions.filter(
				(region) => region.accounts.length > 0,
			)

			return {
				...section,
				regions: linkedRegions,
				totalLinked: linkedRegions.reduce(
					(total, region) => total + region.accounts.length,
					0,
				),
			}
		})

		return sections.filter((section) => section.totalLinked > 0)
	}, [battlenetAccountsByProvider, warcraftLogsAccountsByProvider])

	const totalLinkedAccounts = useMemo(() => {
		return linkedAccountSections.reduce(
			(total, section) => total + section.totalLinked,
			0,
		)
	}, [linkedAccountSections])

	const wowSyncStatusQuery = useQuery(
		trpc.wow.syncStatus.queryOptions(undefined, {
			enabled: !!user?.id,
			refetchInterval: (query) =>
				query.state.data?.status === 'running' ||
				query.state.data?.status === 'queued'
					? 5_000
					: false,
		}),
	)

	const triggerWowSyncMutation = useMutation(
		trpc.wow.triggerSync.mutationOptions({
			onSuccess: async (result) => {
				if (result.status === 'queued') {
					setWowSyncFeedback('WoW sync queued just now.')
				} else if (result.status === 'already_queued') {
					setWowSyncFeedback('A WoW sync is already queued.')
				} else if (result.status === 'already_running') {
					setWowSyncFeedback('A WoW sync is already running.')
				} else if (result.status === 'not_linked') {
					setWowSyncFeedback(
						'Link a Battle.net account before syncing.',
					)
				}

				await Promise.all([
					wowSyncStatusQuery.refetch(),
					loadLinkedAccounts(),
				])
			},
		}),
	)

	const wowSyncStatus = wowSyncStatusQuery.data
	const battlenetLinkedCount = battlenetAccountsByProvider.reduce(
		(total, region) => total + region.accounts.length,
		0,
	)
	const isWowSyncRunning =
		triggerWowSyncMutation.isPending ||
		wowSyncStatus?.status === 'running' ||
		wowSyncStatus?.status === 'queued'
	const wowSyncButtonLabel = (() => {
		if (triggerWowSyncMutation.isPending) {
			return 'Queueing...'
		}

		if (wowSyncStatus?.status === 'queued') {
			return 'Sync queued...'
		}

		if (wowSyncStatus?.status === 'running') {
			return 'Sync in progress...'
		}

		if (battlenetLinkedCount === 0) {
			return 'Link a Battle.net account first'
		}

		return 'Sync now'
	})()
	const wowSyncStatusLabel = (() => {
		switch (wowSyncStatus?.status) {
			case 'queued':
				return 'Queued'
			case 'running':
				return 'Syncing'
			case 'ready':
				return 'Ready'
			case 'failed':
				return 'Failed'
			case 'partial_failure':
				return 'Partial failure'
			case 'never_synced':
				return 'Never synced'
			case 'not_linked':
			default:
				return 'Not linked'
		}
	})()

	async function handleLinkAccount(providerId: LinkableProviderId) {
		if (typeof window === 'undefined') {
			return
		}

		setLinkedAccountError(null)
		setWowSyncFeedback(null)
		setLinkingProviderId(providerId)

		const callbackURL = `${window.location.origin}/account`

		try {
			const result = await authClient.oauth2.link({
				providerId,
				callbackURL,
				errorCallbackURL: callbackURL,
			})

			if (result.error) {
				setLinkedAccountError(
					result.error.message ??
						'Unable to start account linking flow.',
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

			await loadLinkedAccounts()
			await wowSyncStatusQuery.refetch()
		} finally {
			setLinkingProviderId(null)
		}
	}

	async function handleUnlinkAccount(account: LinkedAccount) {
		setLinkedAccountError(null)
		setWowSyncFeedback(null)
		setUnlinkingAccountId(account.id)

		try {
			const result = await authClient.unlinkAccount({
				providerId: account.providerId,
				accountId: account.accountId,
			})

			if (result.error) {
				setLinkedAccountError(
					result.error.message ??
						'Unable to unlink this account right now.',
				)
				return
			}

			await loadLinkedAccounts()
			await wowSyncStatusQuery.refetch()
		} finally {
			setUnlinkingAccountId(null)
		}
	}

	async function handleTriggerWowSync() {
		setLinkedAccountError(null)
		setWowSyncFeedback(null)

		try {
			await triggerWowSyncMutation.mutateAsync()
		} catch {
			setWowSyncFeedback(null)
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
				<Item
					key={organization.id}
					variant='outline'
					className='justify-between gap-3'
				>
					<ItemContent className='min-w-0'>
						<p className='truncate text-sm font-medium'>
							{organization.name}
						</p>
						<p className='text-muted-foreground truncate text-xs'>
							{organization.slug}
						</p>
					</ItemContent>
					<ItemActions className='justify-end'>
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
					</ItemActions>
				</Item>
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
								<Link2 className='h-5 w-5' />
								Warcraft Sync
							</CardTitle>
							<CardDescription>
								Queue a manual sync for all linked Battle.net
								accounts.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
								<div className='space-y-1'>
									<p className='text-sm font-medium'>
										{battlenetLinkedCount} Battle.net linked
										account
										{battlenetLinkedCount === 1 ? '' : 's'}
									</p>
									<p className='text-muted-foreground text-xs'>
										{wowSyncStatus?.lastSuccessAt
											? `Last successful sync ${new Date(wowSyncStatus.lastSuccessAt).toLocaleString()}`
											: 'No successful sync yet.'}
									</p>
								</div>
								<div className='flex items-center gap-2'>
									<Badge variant='outline'>
										{wowSyncStatusLabel}
									</Badge>
									<Button
										onClick={handleTriggerWowSync}
										disabled={
											!user?.id ||
											battlenetLinkedCount === 0 ||
											isWowSyncRunning
										}
									>
										{wowSyncButtonLabel}
									</Button>
								</div>
							</div>

							{wowSyncFeedback ? (
								<p className='text-muted-foreground text-sm'>
									{wowSyncFeedback}
								</p>
							) : null}
						</CardContent>
					</Card>

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
								Link Battle.net and Warcraft Logs accounts
								across supported regions.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
								<div>
									<p className='text-sm font-medium'>
										{totalLinkedAccounts} linked account
										{totalLinkedAccounts === 1 ? '' : 's'}
									</p>
									<p className='text-muted-foreground text-xs'>
										Use the link flow to connect any
										provider and region.
									</p>
								</div>
								<Button
									onClick={() => setIsLinkDialogOpen(true)}
									disabled={!user?.id || !!linkingProviderId}
								>
									Link account
								</Button>
							</div>

							{linkedAccountError ? (
								<p className='text-destructive text-sm'>
									{linkedAccountError}
								</p>
							) : null}

							{isLoadingLinkedAccounts ? (
								<p className='text-muted-foreground text-sm'>
									Loading linked accounts...
								</p>
							) : null}

							{!isLoadingLinkedAccounts &&
							totalLinkedAccounts === 0 ? (
								<Item
									variant='outline'
									className='border-dashed py-6 text-center'
								>
									<ItemContent className='w-full space-y-1'>
										<p className='text-sm font-medium'>
											No linked accounts yet
										</p>
										<p className='text-muted-foreground text-xs'>
											Link Battle.net and Warcraft Logs
											accounts to unlock cross-region data
											in AuxArmory.
										</p>
									</ItemContent>
								</Item>
							) : null}

							{!isLoadingLinkedAccounts
								? linkedAccountSections.map((section) => (
										<Item
											key={section.providerLabel}
											variant='outline'
											className='flex-col items-stretch gap-2'
										>
											<ItemHeader>
												<div>
													<p className='text-sm font-medium'>
														{section.providerLabel}
													</p>
													<p className='text-muted-foreground text-xs'>
														{section.totalLinked}{' '}
														linked account
														{section.totalLinked ===
														1
															? ''
															: 's'}
													</p>
												</div>
												<Badge>
													{section.totalLinked} linked
												</Badge>
											</ItemHeader>

											{section.regions.map((region) => (
												<Item
													key={region.providerId}
													variant='outline'
													className='flex-col items-stretch gap-2'
												>
													<ItemHeader>
														<div>
															<p className='text-sm font-medium'>
																Region{' '}
																{region.label}
															</p>
															<p className='text-muted-foreground text-xs'>
																{
																	region
																		.accounts
																		.length
																}{' '}
																linked
															</p>
														</div>
													</ItemHeader>

													{region.accounts.map(
														(account) => (
															<Item
																key={account.id}
																variant='outline'
																size='xs'
																className='justify-between gap-2'
															>
																<ItemContent className='min-w-0'>
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
																</ItemContent>
																<ItemActions className='justify-end'>
																	<Button
																		variant='outline'
																		size='sm'
																		onClick={() =>
																			handleUnlinkAccount(
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
																</ItemActions>
															</Item>
														),
													)}
												</Item>
											))}
										</Item>
									))
								: null}

							<Dialog
								open={isLinkDialogOpen}
								onOpenChange={setIsLinkDialogOpen}
							>
								<DialogContent className='max-w-[calc(100%-1.5rem)] space-y-3 sm:max-w-xl'>
									<DialogHeader>
										<DialogTitle>
											Link external account
										</DialogTitle>
										<DialogDescription>
											Choose a provider and region to
											start the OAuth linking flow.
										</DialogDescription>
									</DialogHeader>

									<Tabs
										value={activeLinkTab}
										onValueChange={(value) =>
											setActiveLinkTab(
												value as LinkProviderTab,
											)
										}
										className='space-y-3'
									>
										<TabsList className='w-full sm:w-fit'>
											<TabsTrigger value='battlenet'>
												Battle.net
											</TabsTrigger>
											<TabsTrigger value='warcraftlogs'>
												Warcraft Logs
											</TabsTrigger>
										</TabsList>

										<TabsContent
											value='battlenet'
											className='space-y-2'
										>
											{battlenetAccountsByProvider.map(
												(region) => (
													<Item
														key={region.providerId}
														variant='outline'
														className='justify-between gap-3'
													>
														<ItemContent>
															<p className='text-sm font-medium'>
																Region{' '}
																{region.label}
															</p>
															<p className='text-muted-foreground text-xs'>
																{region.accounts
																	.length > 0
																	? `${region.accounts.length} linked account${region.accounts.length === 1 ? '' : 's'}`
																	: 'No linked account'}
															</p>
														</ItemContent>
														<ItemActions className='justify-end gap-2'>
															<Badge
																variant={
																	region
																		.accounts
																		.length >
																	0
																		? 'default'
																		: 'outline'
																}
															>
																{region.accounts
																	.length > 0
																	? 'Linked'
																	: 'Ready'}
															</Badge>
															<Button
																size='sm'
																onClick={() =>
																	handleLinkAccount(
																		region.providerId,
																	)
																}
																disabled={
																	!user?.id ||
																	!!linkingProviderId
																}
															>
																{linkingProviderId ===
																region.providerId
																	? 'Redirecting...'
																	: region
																				.accounts
																				.length >
																		  0
																		? 'Link another'
																		: 'Link'}
															</Button>
														</ItemActions>
													</Item>
												),
											)}
										</TabsContent>

										<TabsContent
											value='warcraftlogs'
											className='space-y-2'
										>
											{warcraftLogsAccountsByProvider.map(
												(region) => (
													<Item
														key={region.providerId}
														variant='outline'
														className='justify-between gap-3'
													>
														<ItemContent>
															<p className='text-sm font-medium'>
																Region{' '}
																{region.label}
															</p>
															<p className='text-muted-foreground text-xs'>
																{region.accounts
																	.length > 0
																	? `${region.accounts.length} linked account${region.accounts.length === 1 ? '' : 's'}`
																	: 'No linked account'}
															</p>
														</ItemContent>
														<ItemActions className='justify-end gap-2'>
															<Badge
																variant={
																	region
																		.accounts
																		.length >
																	0
																		? 'default'
																		: 'outline'
																}
															>
																{region.accounts
																	.length > 0
																	? 'Linked'
																	: 'Ready'}
															</Badge>
															<Button
																size='sm'
																onClick={() =>
																	handleLinkAccount(
																		region.providerId,
																	)
																}
																disabled={
																	!user?.id ||
																	!!linkingProviderId
																}
															>
																{linkingProviderId ===
																region.providerId
																	? 'Redirecting...'
																	: region
																				.accounts
																				.length >
																		  0
																		? 'Link another'
																		: 'Link'}
															</Button>
														</ItemActions>
													</Item>
												),
											)}
										</TabsContent>
									</Tabs>

									<DialogFooter showCloseButton />
								</DialogContent>
							</Dialog>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
