import { useState } from "react";
import {
	CharacterCard,
	CharacterCardSkeleton,
} from "@/components/index/characterCard";
import { CharacterDetailedView } from "@/components/index/characterDetailedView";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ExternalLink, Server, Users } from "lucide-react";

import { Badge } from "@auxarmory/ui/components/badge";
import { Button } from "@auxarmory/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@auxarmory/ui/components/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@auxarmory/ui/components/pagination";

export const Route = createFileRoute("/")({
	component: Index,
});

const guildInfo = {
	name: "Average Pillagers",
	realm: "Argent Dawn",
	level: 25,
	members: 127,
	raidProgress: "8/8 H, 3/8 M",
	nextRaid: "Tonight 8:00 PM",
	recentKills: [
		{ boss: "Queen Ansurek", difficulty: "Heroic", date: "2 days ago" },
		{
			boss: "Nexus-Princess Ky'veza",
			difficulty: "Mythic",
			date: "1 week ago",
		},
	],
};

const weeklyResets = {
	vault: "3 days",
	conquest: "3 days",
	mythicDungeons: "3 days",
	raid: "3 days",
};

export default function Index() {
	const trpc = useTRPC();

	const characterQuery = useQuery(trpc.index.listCharacters.queryOptions());
	const [selectedCharacterId, setSelectedCharacterId] = useState(
		characterQuery.data?.[0]?.id ?? undefined,
	);
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = characterQuery.data
		? Math.ceil(characterQuery.data.length / 6)
		: 1;
	const startIndex = (currentPage - 1) * 6;
	const paginatedItems = characterQuery.data
		? characterQuery.data.slice(startIndex, startIndex + 6)
		: [];

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-foreground text-2xl font-bold">
						Dashboard
					</h1>
					<p className="text-muted-foreground">
						Welcome back! Here's what's happening with your
						characters.
					</p>
				</div>
			</div>

			{/* Character Overview Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{characterQuery.isLoading || !characterQuery.data ? (
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

			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() => handlePageChange(currentPage - 1)}
							className={
								currentPage === 1
									? "pointer-events-none opacity-50"
									: ""
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
									? "pointer-events-none opacity-50"
									: ""
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Character Details */}
				<CharacterDetailedView characterId={selectedCharacterId} />

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Guild Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Guild Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="text-foreground font-semibold">
									{guildInfo.name}
								</h3>
								<p className="text-muted-foreground text-sm">
									{guildInfo.realm}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">
										Members
									</span>
									<span className="text-foreground text-sm">
										{guildInfo.members}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">
										Progress
									</span>
									<span className="text-foreground text-sm">
										{guildInfo.raidProgress}
									</span>
								</div>
							</div>

							<div className="border-t border-gray-800 pt-3">
								<div className="mb-2 flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									<span className="text-foreground text-sm font-medium">
										Next Raid
									</span>
								</div>
								<p className="text-muted-foreground text-sm">
									{guildInfo.nextRaid}
								</p>
							</div>

							<Button
								variant="outline"
								size="sm"
								className="w-full"
							>
								<ExternalLink className="mr-2 h-4 w-4" />
								View Guild Profile
							</Button>
						</CardContent>
					</Card>

					{/* Weekly Resets */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Server className="h-5 w-5" />
								Weekly Resets
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm">Great Vault</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.vault}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Conquest Cap
									</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.conquest}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">M+ Dungeons</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.mythicDungeons}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Raid Lockouts
									</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.raid}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Server className="h-5 w-5" />
								Weekly Resets
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm">Great Vault</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.vault}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Conquest Cap
									</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.conquest}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">M+ Dungeons</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.mythicDungeons}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Raid Lockouts
									</span>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{weeklyResets.raid}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
