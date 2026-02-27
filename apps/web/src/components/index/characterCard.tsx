import { Star } from 'lucide-react';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@auxarmory/ui/components/ui/avatar';
import {
	Card,
	CardContent,
} from '@auxarmory/ui/components/ui/card';
import { Separator } from '@auxarmory/ui/components/ui/separator';
import { Skeleton } from '@auxarmory/ui/components/ui/skeleton';

import type { CharacterSummary } from './types';

function relativeTime(value: string) {
	const diffMs = Date.now() - new Date(value).getTime();
	const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

	if (hours < 24) {
		return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	}

	const days = Math.floor(hours / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function CharacterCardSkeleton() {
	return (
		<Card className='hover:border-muted cursor-pointer transition-colors'>
			<CardContent>
				<div className='mb-3 flex items-center gap-3'>
					<div className='relative'>
						<Skeleton className='h-12 w-12 rounded-full' />
					</div>
					<div className='flex-1'>
						<div className='flex items-center gap-2'>
							<Skeleton className='h-5 w-24' />
							<Skeleton className='h-3 w-3 rounded-full' />
						</div>
						<Skeleton className='mt-1 h-4 w-32' />
					</div>
				</div>

				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-12' />
					</div>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-12' />
					</div>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-4 w-16' />
					</div>
				</div>

				<Separator className='my-3' />
				<Skeleton className='h-2 w-full rounded-full' />
			</CardContent>
		</Card>
	);
}

export function CharacterCard({
	character,
	isSelected,
	onClickCallback,
}: {
	character: CharacterSummary;
	isSelected: boolean;
	onClickCallback: () => void;
}) {
	return (
		<Card
			className={`hover:border-muted cursor-pointer transition-colors ${isSelected ? 'ring-primary/20 ring-2' : ''}`}
			onClick={onClickCallback}
		>
			<CardContent>
				<div className='mb-3 flex items-center gap-3'>
					<div className='relative'>
						<Avatar className='bg-muted h-12 w-12'>
							<AvatarImage src={character.avatarUrl ?? ''} />
							<AvatarFallback>
								{character.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						{character.favorite ? (
							<div className='bg-primary absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full'>
								<Star className='text-primary-foreground h-2 w-2' />
							</div>
						) : null}
					</div>
					<div className='flex-1'>
						<div className='flex items-center gap-2'>
							<h3 className='text-foreground font-semibold'>
								{character.name}
							</h3>
						</div>
						<p className='text-muted-foreground text-sm'>
							Level {character.level} {character.activeSpec}{' '}
							{character.className}
						</p>
					</div>
				</div>

				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<span className='text-muted-foreground text-sm'>
							Item Level
						</span>
						<span className='text-foreground text-sm font-medium'>
							{character.equippedItemLevel}
						</span>
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-muted-foreground text-sm'>
							M+ Score
						</span>
						{character.mythicRating ? (
							<span
								style={{
									color: character.mythicRatingColor,
								}}
								className='text-sm font-medium'
							>
								{character.mythicRating.toFixed(0)}
							</span>
						) : (
							<span className='text-foreground text-sm font-medium'>
								N/A
							</span>
						)}
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-muted-foreground text-sm'>
							Last Played
						</span>
						<span className='text-muted-foreground text-sm'>
							{relativeTime(character.lastLogin)}
						</span>
					</div>
				</div>

				<Separator className='my-3' />
			</CardContent>
		</Card>
	);
}
