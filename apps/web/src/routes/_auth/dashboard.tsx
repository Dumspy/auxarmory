import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, ExternalLink, Server, Users } from 'lucide-react'

import { Badge } from '@auxarmory/ui/components/ui/badge'
import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@auxarmory/ui/components/ui/pagination'

import {
	CharacterCard,
	CharacterCardSkeleton,
} from '../../components/index/characterCard'
import { CharacterDetailedView } from '../../components/index/characterDetailedView'
import type { CharacterDetail } from '../../components/index/types'

export const Route = createFileRoute('/_auth/dashboard')({
	component: DashboardPage,
})

const mockCharacters: CharacterDetail[] = [
	{
		id: 1,
		name: 'Anymus',
		level: 80,
		activeSpec: 'Restoration',
		className: 'Druid',
		equippedItemLevel: 684,
		mythicRating: 2843,
		mythicRatingColor: 'rgb(196, 181, 253)',
		lastLogin: '2026-02-26T14:00:00.000Z',
		avatarUrl: '',
		favorite: true,
		raidProgress: { normal: '8/8', heroic: '8/8', mythic: '3/8' },
		mythicScore: 2843,
		pvpRating: 1850,
		weeklyVault: { raid: 1, mythicPlus: 2, pvp: 0 },
		conquest: { current: 540, max: 1000 },
	},
	{
		id: 2,
		name: 'Knap',
		level: 80,
		activeSpec: 'Blood',
		className: 'Death Knight',
		equippedItemLevel: 678,
		mythicRating: 2610,
		mythicRatingColor: 'rgb(147, 197, 253)',
		lastLogin: '2026-02-25T18:30:00.000Z',
		avatarUrl: '',
		raidProgress: { normal: '8/8', heroic: '6/8', mythic: '0/8' },
		mythicScore: 2610,
		pvpRating: 1320,
		weeklyVault: { raid: 0, mythicPlus: 3, pvp: 1 },
		conquest: { current: 220, max: 1000 },
	},
	{
		id: 3,
		name: 'Dispy',
		level: 80,
		activeSpec: 'Retribution',
		className: 'Paladin',
		equippedItemLevel: 671,
		mythicRating: 2041,
		mythicRatingColor: 'rgb(110, 231, 183)',
		lastLogin: '2026-02-24T20:00:00.000Z',
		avatarUrl: '',
		raidProgress: { normal: '8/8', heroic: '4/8', mythic: '0/8' },
		mythicScore: 2041,
		pvpRating: 990,
		weeklyVault: { raid: 2, mythicPlus: 1, pvp: 0 },
		conquest: { current: 100, max: 1000 },
	},
]

const guildInfo = {
	name: 'Average Pillagers',
	realm: 'Argent Dawn',
	members: 127,
	raidProgress: '8/8 H, 3/8 M',
	nextRaid: 'Tonight 8:00 PM',
}

const weeklyResets = {
	vault: '3 days',
	conquest: '3 days',
	mythicDungeons: '3 days',
	raid: '3 days',
}

function DashboardPage() {
	const [selectedCharacterId, setSelectedCharacterId] = useState<
		number | undefined
	>(mockCharacters[0]?.id)
	const [currentPage, setCurrentPage] = useState(1)

	const totalPages = Math.max(1, Math.ceil(mockCharacters.length / 6))
	const startIndex = (currentPage - 1) * 6
	const paginatedItems = mockCharacters.slice(startIndex, startIndex + 6)

	const selectedCharacter = useMemo(
		() => mockCharacters.find((item) => item.id === selectedCharacterId),
		[selectedCharacterId],
	)

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	return (
		<div className='space-y-6 p-2 md:p-4'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-foreground text-2xl font-bold'>
						Dashboard
					</h1>
					<p className='text-muted-foreground'>
						Welcome back! Here is what is happening with your
						characters.
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{paginatedItems.length === 0 ? (
					<>
						<CharacterCardSkeleton />
						<CharacterCardSkeleton />
						<CharacterCardSkeleton />
					</>
				) : (
					paginatedItems.map((character) => (
						<CharacterCard
							key={`character-${character.id}`}
							character={character}
							isSelected={selectedCharacterId === character.id}
							onClickCallback={() =>
								setSelectedCharacterId(character.id)
							}
						/>
					))
				)}
			</div>

			<Pagination className='mt-4'>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() => handlePageChange(currentPage - 1)}
							className={
								currentPage === 1
									? 'pointer-events-none opacity-50'
									: ''
							}
						/>
					</PaginationItem>

					{Array.from({ length: totalPages }, (_, i) => (
						<PaginationItem key={i}>
							<PaginationLink
								isActive={currentPage === i + 1}
								onClick={() => handlePageChange(i + 1)}
							>
								{i + 1}
							</PaginationLink>
						</PaginationItem>
					))}

					<PaginationItem>
						<PaginationNext
							onClick={() => handlePageChange(currentPage + 1)}
							className={
								currentPage === totalPages
									? 'pointer-events-none opacity-50'
									: ''
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<CharacterDetailedView character={selectedCharacter} />

				<div className='space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Users className='h-5 w-5' />
								Guild Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<h3 className='text-foreground font-semibold'>
									{guildInfo.name}
								</h3>
								<p className='text-muted-foreground text-sm'>
									{guildInfo.realm}
								</p>
							</div>
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>
										Members
									</span>
									<span className='text-foreground'>
										{guildInfo.members}
									</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>
										Progress
									</span>
									<span className='text-foreground'>
										{guildInfo.raidProgress}
									</span>
								</div>
							</div>
							<div className='border-border border-t pt-3'>
								<div className='mb-2 flex items-center gap-2'>
									<Calendar className='h-4 w-4' />
									<span className='text-foreground text-sm font-medium'>
										Next Raid
									</span>
								</div>
								<p className='text-muted-foreground text-sm'>
									{guildInfo.nextRaid}
								</p>
							</div>
							<Button
								variant='outline'
								size='sm'
								className='w-full'
							>
								<ExternalLink className='mr-2 h-4 w-4' />
								View Guild Profile
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Server className='h-5 w-5' />
								Weekly Resets
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								{Object.entries(weeklyResets).map(
									([key, value]) => (
										<div
											key={key}
											className='flex items-center justify-between'
										>
											<span className='text-sm capitalize'>
												{key.replace(/([A-Z])/g, ' $1')}
											</span>
											<Badge
												variant='outline'
												className='text-xs'
											>
												{value}
											</Badge>
										</div>
									),
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
