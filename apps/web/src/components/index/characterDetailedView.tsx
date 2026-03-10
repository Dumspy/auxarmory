import { Clock, Crown, Target, Zap } from 'lucide-react'

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@auxarmory/ui/components/ui/avatar'
import { Badge } from '@auxarmory/ui/components/ui/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import { Progress } from '@auxarmory/ui/components/ui/progress'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@auxarmory/ui/components/ui/tabs'

import type { CharacterDetail } from './types'

function formatCount(value: string | null) {
	return value ?? '--'
}

export function CharacterDetailedView({
	character,
}: {
	character: CharacterDetail | undefined
}) {
	if (!character) {
		return null
	}

	return (
		<div className='space-y-6 lg:col-span-2'>
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Avatar className='bg-muted h-8 w-8'>
							<AvatarImage src={character.avatarUrl ?? ''} />
							<AvatarFallback>
								{character.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						{character.name} - Detailed View
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue='progression' className='w-full'>
						<TabsList className='grid h-8 w-full grid-cols-3 p-0.5'>
							<TabsTrigger
								value='progression'
								className='h-7 text-xs'
							>
								Progression
							</TabsTrigger>
							<TabsTrigger value='weekly' className='h-7 text-xs'>
								Weekly
							</TabsTrigger>
							<TabsTrigger value='stats' className='h-7 text-xs'>
								Stats
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value='progression'
							className='mt-4 space-y-4'
						>
							<div className='space-y-3'>
								<h4 className='text-foreground flex items-center gap-2 font-medium'>
									<Crown className='h-4 w-4' />
									Raid Progress
								</h4>
								{character.raidProgress?.instanceName ? (
									<p className='text-muted-foreground text-sm'>
										{character.raidProgress.instanceName}
									</p>
								) : null}
								<div className='grid grid-cols-3 gap-4'>
									<div className='bg-muted rounded-none p-3 text-center'>
										<div className='text-lg font-bold'>
											{formatCount(
												character.raidProgress
													?.normal ?? null,
											)}
										</div>
										<div className='text-muted-foreground text-xs'>
											Normal
										</div>
									</div>
									<div className='bg-muted rounded-none p-3 text-center'>
										<div className='text-lg font-bold'>
											{formatCount(
												character.raidProgress
													?.heroic ?? null,
											)}
										</div>
										<div className='text-muted-foreground text-xs'>
											Heroic
										</div>
									</div>
									<div className='bg-muted rounded-none p-3 text-center'>
										<div className='text-lg font-bold'>
											{formatCount(
												character.raidProgress
													?.mythic ?? null,
											)}
										</div>
										<div className='text-muted-foreground text-xs'>
											Mythic
										</div>
									</div>
								</div>
							</div>

							<div className='space-y-3'>
								<h4 className='text-foreground flex items-center gap-2 font-medium'>
									<Zap className='h-4 w-4' />
									Mythic+ Score:{' '}
									{character.mythicScore ?? 'N/A'}
								</h4>
								<div className='bg-muted rounded-none p-3'>
									<div className='mb-2 flex items-center justify-between'>
										<span className='text-foreground text-sm'>
											Season Progress
										</span>
										<span className='text-muted-foreground text-sm'>
											{character.mythicScore ?? 0} / 3000
										</span>
									</div>
									<Progress
										value={
											((character.mythicScore ?? 0) /
												3000) *
											100
										}
										className='h-2'
									/>
								</div>
							</div>

							<div className='space-y-3'>
								<h4 className='text-foreground flex items-center gap-2 font-medium'>
									<Target className='h-4 w-4' />
									PvP Rating: {character.pvpRating ?? 'N/A'}
								</h4>
								<div className='bg-muted rounded-none p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-foreground text-sm'>
											3v3 Arena
										</span>
										<Badge variant='outline'>Pending</Badge>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='weekly' className='mt-4 space-y-4'>
							{character.weeklyVault ? (
								<div className='bg-muted rounded-none p-4'>
									<h4 className='text-foreground mb-3 font-medium'>
										Great Vault Progress
									</h4>
									<div className='space-y-3'>
										<div>
											<div className='mb-1 flex justify-between text-sm'>
												<span>Raid</span>
												<span>
													{character.weeklyVault.raid}{' '}
													/ 3
												</span>
											</div>
											<Progress
												value={
													(character.weeklyVault
														.raid /
														3) *
													100
												}
												className='h-2'
											/>
										</div>
										<div>
											<div className='mb-1 flex justify-between text-sm'>
												<span>Mythic+</span>
												<span>
													{
														character.weeklyVault
															.mythicPlus
													}{' '}
													/ 3
												</span>
											</div>
											<Progress
												value={
													(character.weeklyVault
														.mythicPlus /
														3) *
													100
												}
												className='h-2'
											/>
										</div>
										<div>
											<div className='mb-1 flex justify-between text-sm'>
												<span>PvP</span>
												<span>
													{character.weeklyVault.pvp}{' '}
													/ 3
												</span>
											</div>
											<Progress
												value={
													(character.weeklyVault.pvp /
														3) *
													100
												}
												className='h-2'
											/>
										</div>
									</div>
								</div>
							) : (
								<div className='bg-muted rounded-none p-4 text-sm'>
									Weekly vault data is not available yet.
								</div>
							)}

							{character.conquest ? (
								<div className='bg-muted rounded-none p-4'>
									<div className='mb-2 flex justify-between text-sm'>
										<span>Weekly Conquest</span>
										<span>
											{character.conquest.current} /{' '}
											{character.conquest.max}
										</span>
									</div>
									<Progress
										value={
											(character.conquest.current /
												character.conquest.max) *
											100
										}
										className='h-2'
									/>
								</div>
							) : null}
						</TabsContent>

						<TabsContent value='stats' className='mt-4 space-y-4'>
							<div className='bg-muted rounded-none p-4 text-sm'>
								Detailed combat stats are not wired yet.
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Clock className='h-5 w-5' />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-muted-foreground text-sm'>
						Recent activity is not wired yet.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
