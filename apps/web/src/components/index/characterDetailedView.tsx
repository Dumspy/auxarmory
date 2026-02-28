import {
	Activity,
	ChevronRight,
	Clock,
	Crown,
	Shield,
	Sword,
	Target,
	TrendingUp,
	Trophy,
	Zap,
} from 'lucide-react';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@auxarmory/ui/components/ui/avatar';
import { Badge } from '@auxarmory/ui/components/ui/badge';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card';
import { Progress } from '@auxarmory/ui/components/ui/progress';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@auxarmory/ui/components/ui/tabs';

import type { CharacterDetail } from './types';

const recentActivity = [
	{
		title: 'Ahead of the Curve: Queen Ansurek',
		character: 'Anymus',
		timestamp: '2 hours ago',
		icon: Trophy,
	},
	{
		title: 'Completed The Stonevault +15',
		character: 'Knap',
		timestamp: '5 hours ago',
		icon: Zap,
	},
	{
		title: 'Defeated Sikran (Mythic)',
		character: 'Anymus',
		timestamp: '1 day ago',
		icon: Crown,
	},
	{
		title: 'Reached 1850 rating in 3v3 Arena',
		character: 'Anymus',
		timestamp: '2 days ago',
		icon: Target,
	},
];

export function CharacterDetailedView({
	character,
}: {
	character: CharacterDetail | undefined;
}) {
	if (!character) {
		return null;
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
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='progression'>
								Progression
							</TabsTrigger>
							<TabsTrigger value='weekly'>Weekly</TabsTrigger>
							<TabsTrigger value='stats'>Stats</TabsTrigger>
						</TabsList>

						<TabsContent
							value='progression'
							className='mt-4 space-y-4'
						>
							<div className='space-y-3'>
								<h4 className='text-foreground flex items-center gap-2 font-medium'>
									<Crown className='h-4 w-4' />
									Raid Progress - Nerub-ar Palace
								</h4>
								<div className='grid grid-cols-3 gap-4'>
									<div className='bg-muted rounded-lg p-3 text-center'>
										<div className='text-lg font-bold'>
											{character.raidProgress.normal}
										</div>
										<div className='text-muted-foreground text-xs'>
											Normal
										</div>
									</div>
									<div className='bg-muted rounded-lg p-3 text-center'>
										<div className='text-lg font-bold'>
											{character.raidProgress.heroic}
										</div>
										<div className='text-muted-foreground text-xs'>
											Heroic
										</div>
									</div>
									<div className='bg-muted rounded-lg p-3 text-center'>
										<div className='text-lg font-bold'>
											{character.raidProgress.mythic}
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
									Mythic+ Score: {character.mythicScore}
								</h4>
								<div className='bg-muted rounded-lg p-3'>
									<div className='mb-2 flex items-center justify-between'>
										<span className='text-foreground text-sm'>
											Season Progress
										</span>
										<span className='text-muted-foreground text-sm'>
											{character.mythicScore} / 3000
										</span>
									</div>
									<Progress
										value={
											(character.mythicScore / 3000) * 100
										}
										className='h-2'
									/>
								</div>
							</div>

							<div className='space-y-3'>
								<h4 className='text-foreground flex items-center gap-2 font-medium'>
									<Target className='h-4 w-4' />
									PvP Rating: {character.pvpRating}
								</h4>
								<div className='bg-muted rounded-lg p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-foreground text-sm'>
											3v3 Arena
										</span>
										<Badge variant='outline'>Rival</Badge>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='weekly' className='mt-4 space-y-4'>
							<div className='bg-muted rounded-lg p-4'>
								<h4 className='text-foreground mb-3 font-medium'>
									Great Vault Progress
								</h4>
								<div className='space-y-3'>
									<div>
										<div className='mb-1 flex justify-between text-sm'>
											<span>Raid</span>
											<span>
												{character.weeklyVault.raid} / 3
											</span>
										</div>
										<Progress
											value={
												(character.weeklyVault.raid /
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
												{character.weeklyVault.pvp} / 3
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
							<div className='bg-muted rounded-lg p-4'>
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
						</TabsContent>

						<TabsContent value='stats' className='mt-4 space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='bg-muted rounded-lg p-4'>
									<div className='mb-2 flex items-center gap-2'>
										<Sword className='h-4 w-4' />
										<span className='text-foreground text-sm font-medium'>
											DPS
										</span>
									</div>
									<div className='text-foreground text-2xl font-bold'>
										847,392
									</div>
								</div>
								<div className='bg-muted rounded-lg p-4'>
									<div className='mb-2 flex items-center gap-2'>
										<Shield className='h-4 w-4' />
										<span className='text-foreground text-sm font-medium'>
											HPS
										</span>
									</div>
									<div className='text-foreground text-2xl font-bold'>
										234,567
									</div>
								</div>
								<div className='bg-muted rounded-lg p-4'>
									<div className='mb-2 flex items-center gap-2'>
										<Activity className='h-4 w-4' />
										<span className='text-foreground text-sm font-medium'>
											Survivability
										</span>
									</div>
									<div className='text-foreground text-2xl font-bold'>
										92%
									</div>
								</div>
								<div className='bg-muted rounded-lg p-4'>
									<div className='mb-2 flex items-center gap-2'>
										<TrendingUp className='h-4 w-4' />
										<span className='text-foreground text-sm font-medium'>
											Performance
										</span>
									</div>
									<div className='text-foreground text-2xl font-bold'>
										87
									</div>
								</div>
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
					<div className='space-y-3'>
						{recentActivity.map((activity) => (
							<div
								key={activity.title}
								className='bg-muted flex items-center gap-3 rounded-lg p-3'
							>
								<div className='bg-muted flex h-8 w-8 items-center justify-center rounded-lg'>
									<activity.icon className='text-muted-foreground h-4 w-4' />
								</div>
								<div className='flex-1'>
									<div className='text-foreground text-sm font-medium'>
										{activity.title}
									</div>
									<div className='text-muted-foreground text-xs'>
										{activity.character} -{' '}
										{activity.timestamp}
									</div>
								</div>
								<ChevronRight className='text-muted-foreground h-4 w-4' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
