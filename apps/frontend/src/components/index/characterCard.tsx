import type { RouterOutputs } from "@/utils/trpc";
import { Star } from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@auxarmory/ui/components/avatar";
import { Card, CardContent } from "@auxarmory/ui/components/card";
// import { Progress } from "@auxarmory/ui/components/progress";
import { Separator } from "@auxarmory/ui/components/separator";
import { Skeleton } from "@auxarmory/ui/components/skeleton";

export function CharacterCardSkeleton() {
	return (
		<Card className="hover:border-muted cursor-pointer transition-colors">
			<CardContent>
				<div className="mb-3 flex items-center gap-3">
					<div className="relative">
						<Skeleton className="h-12 w-12 rounded-full" />
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-3 w-3 rounded-full" />
						</div>
						<Skeleton className="mt-1 h-4 w-32" />
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>

				<Separator className="my-3" />

				<div>
					<div className="mb-1 flex items-center justify-between">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-3 w-8" />
					</div>
					<Skeleton className="h-2 w-full rounded-full" />
				</div>
			</CardContent>
		</Card>
	);
}

export function CharacterCard({
	character,
	isSelected,
	onClickCallback,
}: {
	character: RouterOutputs["index"]["listCharacters"][number];
	isSelected: boolean;
	onClickCallback: () => void;
}) {
	return (
		<Card
			className={`hover:border-muted cursor-pointer transition-colors ${isSelected ? "ring-primary/20 ring-2" : ""}`}
			onClick={() => onClickCallback()}
		>
			<CardContent>
				<div className="mb-3 flex items-center gap-3">
					<div className="relative">
						<Avatar className="bg-muted h-12 w-12">
							<AvatarImage src={character.avatarUrl ?? ""} />
							<AvatarFallback>
								{character.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						{character.favorite && (
							<div className="bg-primary absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full">
								<Star className="text-primary-foreground h-2 w-2" />
							</div>
						)}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<h3 className="text-foreground font-semibold">
								{character.name}
							</h3>
							<div className={`bg-class-${character.class.name.toLowerCase().replace(/\s+/g, "")} h-3 w-3 rounded-full`} />
						</div>
						<p className="text-muted-foreground text-sm">
							Level {character.level} {character.activeSpec} {character.class.name}
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							Item Level
						</span>
						<span className="text-foreground text-sm font-medium">
							{character.equippedItemLevel}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							M+ Score
						</span>
						{
							character.mythicRating ? (
								<span style={{color: `rgba(${character.mythicRatingColor})`}} className="text-sm font-medium">
									{character.mythicRating.toFixed(0)}
								</span>
							) : (
								<span className="text-sm font-medium text-foreground">
									N/A
								</span>
							)
						}
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							Last Played
						</span>
						<span className="text-muted-foreground text-sm">
							{character.lastLogin}
						</span>
					</div>
				</div>

				<Separator className="my-3" />

				{/* Weekly Progress */}
				{/* <div>
					<div className="flex justify-between items-center mb-1">
						<span className="text-xs text-muted-foreground">Vault Progress</span>
						<span className="text-xs text-muted-foreground">
							{character.weeklyProgress.vault.completed}/{character.weeklyProgress.vault.total}
						</span>
					</div>
					<Progress
						value={(character.weeklyProgress.vault.completed / character.weeklyProgress.vault.total) * 100}
						className="h-2"
					/>
				</div> */}
			</CardContent>
		</Card>
	);
}
