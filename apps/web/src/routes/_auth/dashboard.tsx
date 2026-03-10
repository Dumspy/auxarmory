import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Server, Users } from 'lucide-react'

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
import { useTRPC } from '../../lib/trpc'

export const Route = createFileRoute('/_auth/dashboard')({
	component: DashboardPage,
})

const weeklyResets = {
	vault: '3 days',
	conquest: '3 days',
	mythicDungeons: '3 days',
	raid: '3 days',
}

const EMPTY_CHARACTERS: CharacterDetail[] = []

function DashboardPage() {
	const trpc = useTRPC()
	const dashboardQuery = useQuery(trpc.wow.dashboard.queryOptions())
	const [selectedCharacterId, setSelectedCharacterId] = useState<
		string | undefined
	>(undefined)
	const [currentPage, setCurrentPage] = useState(1)
	const characters = dashboardQuery.data?.characters ?? EMPTY_CHARACTERS

	useEffect(() => {
		if (characters.length === 0) {
			setSelectedCharacterId(undefined)
			return
		}

		setSelectedCharacterId((current) => {
			if (current && characters.some((item) => item.id === current)) {
				return current
			}

			return characters[0]?.id
		})
	}, [characters])

	const totalPages = Math.max(1, Math.ceil(characters.length / 6))
	const startIndex = (currentPage - 1) * 6
	const paginatedItems = characters.slice(startIndex, startIndex + 6)

	const selectedCharacter = useMemo(
		() => characters.find((item) => item.id === selectedCharacterId),
		[characters, selectedCharacterId],
	)

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

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
				{dashboardQuery.isLoading ? (
					<>
						<CharacterCardSkeleton />
						<CharacterCardSkeleton />
						<CharacterCardSkeleton />
					</>
				) : paginatedItems.length === 0 ? (
					<Card className='lg:col-span-3'>
						<CardContent className='py-10 text-center'>
							<p className='text-sm font-medium'>
								No synced characters yet
							</p>
							<p className='text-muted-foreground mt-1 text-sm'>
								Link a Battle.net account and run a sync from
								account settings to populate your roster.
							</p>
						</CardContent>
					</Card>
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
							{selectedCharacter?.guild ? (
								<>
									<div>
										<h3 className='text-foreground font-semibold'>
											{selectedCharacter.guild.name}
										</h3>
										<p className='text-muted-foreground text-sm'>
											{selectedCharacter.guild.realm}
										</p>
									</div>
									<div className='space-y-2'>
										<div className='flex justify-between text-sm'>
											<span className='text-muted-foreground'>
												Members
											</span>
											<span className='text-foreground'>
												{selectedCharacter.guild
													.memberCount ?? 'Unknown'}
											</span>
										</div>
									</div>
									<Button
										variant='outline'
										size='sm'
										className='w-full'
										disabled
									>
										<ExternalLink className='mr-2 h-4 w-4' />
										Guild profile soon
									</Button>
								</>
							) : (
								<p className='text-muted-foreground text-sm'>
									This character is not currently in a guild.
								</p>
							)}
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
