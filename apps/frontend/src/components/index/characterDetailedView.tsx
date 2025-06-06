import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@auxarmory/ui/components/avatar";
import { Badge } from "@auxarmory/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@auxarmory/ui/components/card";
import { Progress } from "@auxarmory/ui/components/progress";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@auxarmory/ui/components/tabs";

export function CharacterDetailedViewSkeleton() {
	return (
		<div className="space-y-6 lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Avatar className="bg-muted h-8 w-8 animate-pulse">
							<AvatarFallback />
						</Avatar>
						<div className="bg-muted h-4 w-48 animate-pulse rounded" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-3">
						<div className="bg-muted flex h-5 w-full animate-pulse items-center gap-2 rounded" />
						<div className="grid grid-cols-3 gap-4">
							{Array(3)
								.fill(undefined)
								.map((_, i) => (
									<div
										key={i}
										className="bg-muted/50 animate-pulse rounded-lg p-3"
									>
										<div className="space-y-2 text-center">
											<div className="bg-muted mx-auto h-6 w-12 rounded" />
											<div className="bg-muted mx-auto h-3 w-16 rounded" />
										</div>
									</div>
								))}
						</div>
					</div>

					<div className="space-y-3">
						<div className="bg-muted flex h-5 w-48 animate-pulse items-center gap-2 rounded" />
						<div className="bg-muted/50 rounded-lg p-3">
							<div className="mb-2 flex items-center justify-between">
								<div className="bg-muted h-4 w-24 animate-pulse rounded" />
								<div className="bg-muted h-4 w-24 animate-pulse rounded" />
							</div>
							<Progress value={0} className="h-2" />
						</div>
					</div>

					<div className="space-y-3">
						<div className="bg-muted flex h-5 w-40 animate-pulse items-center gap-2 rounded" />
						<div className="bg-muted/50 rounded-lg p-3">
							<div className="flex items-center justify-between">
								<div className="bg-muted h-4 w-20 animate-pulse rounded" />
								<div className="bg-muted h-5 w-16 animate-pulse rounded" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array(4)
							.fill(undefined)
							.map((_, i) => (
								<div
									key={i}
									className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
								>
									<div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
									<div className="flex-1">
										<div className="bg-muted mb-1 h-4 w-48 animate-pulse rounded" />
										<div className="bg-muted h-3 w-32 animate-pulse rounded" />
									</div>
									<ChevronRight className="text-muted-foreground h-4 w-4" />
								</div>
							))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

const recentActivity = [
	{
		type: "achievement",
		title: "Ahead of the Curve: Queen Ansurek",
		character: "Anymus",
		timestamp: "2 hours ago",
		icon: Trophy,
	},
	{
		type: "mythic",
		title: "Completed The Stonevault +15",
		character: "Knap",
		timestamp: "5 hours ago",
		icon: Zap,
	},
	{
		type: "raid",
		title: "Defeated Sikran (Mythic)",
		character: "Anymus",
		timestamp: "1 day ago",
		icon: Crown,
	},
	{
		type: "pvp",
		title: "Reached 1850 rating in 3v3 Arena",
		character: "Anymus",
		timestamp: "2 days ago",
		icon: Target,
	},
];

export function CharacterDetailedView({
	characterId,
}: {
	characterId: number | undefined;
}) {
	if (!characterId) {
		return <CharacterDetailedViewSkeleton />;
	}

	const trpc = useTRPC();
	const character = useQuery(
		trpc.index.getCharacterDetailedView.queryOptions({ characterId }),
	);

	if (character.isLoading || !character.data) {
		return <CharacterDetailedViewSkeleton />;
	}

	return (
		<div className="space-y-6 lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Avatar className="bg-muted h-8 w-8">
							<AvatarImage src={character.data.avatarUrl ?? ""} />
							<AvatarFallback>
								{character.data.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						{character.data.name} - Detailed View
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="progression" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="progression">
								Progression
							</TabsTrigger>
							<TabsTrigger value="weekly">Weekly</TabsTrigger>
							<TabsTrigger value="stats">Stats</TabsTrigger>
						</TabsList>

						<TabsContent
							value="progression"
							className="mt-4 space-y-4"
						>
							<div className="space-y-3">
								<h4 className="text-foreground flex items-center gap-2 font-medium">
									<Crown className="h-4 w-4" />
									Raid Progress - Nerub-ar Palace
								</h4>
								<div className="grid grid-cols-3 gap-4">
									<div className="bg-muted rounded-lg p-3">
										<div className="text-center">
											<div className="text-lg font-bold">
												{8}/8
											</div>
											<div className="text-muted-foreground text-xs">
												Normal
											</div>
										</div>
									</div>
									<div className="bg-muted rounded-lg p-3">
										<div className="text-center">
											<div className="text-lg font-bold">
												{8}/8
											</div>
											<div className="text-muted-foreground text-xs">
												Heroic
											</div>
										</div>
									</div>
									<div className="bg-muted rounded-lg p-3">
										<div className="text-center">
											<div className="text-lg font-bold">
												{8}/8
											</div>
											<div className="text-muted-foreground text-xs">
												Mythic
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<h4 className="text-foreground flex items-center gap-2 font-medium">
									<Zap className="h-4 w-4" />
									Mythic+ Score: {1500}{" "}
									{/* TODO: Mock Data */}
								</h4>
								<div className="bg-muted rounded-lg p-3">
									<div className="mb-2 flex items-center justify-between">
										<span className="text-foreground text-sm">
											Season Progress
										</span>
										<span className="text-muted-foreground text-sm">
											1500 / 3000
										</span>
									</div>
									<Progress
										value={(1500 / 3000) * 100}
										className="h-2"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<h4 className="text-foreground flex items-center gap-2 font-medium">
									<Target className="h-4 w-4" />
									PvP Rating: {1000} {/* TODO: Mock Data */}
								</h4>
								<div className="bg-muted rounded-lg p-3">
									<div className="flex items-center justify-between">
										<span className="text-foreground text-sm">
											3v3 Arena
										</span>
										<Badge
											variant="outline"
											className="bg-warning/20 text-warning border-warning/20"
										>
											Rival
										</Badge>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="weekly" className="mt-4 space-y-4">
							<div className="space-y-4">
								<div className="bg-muted rounded-lg p-4">
									<h4 className="text-foreground mb-3 font-medium">
										Great Vault Progress
									</h4>
									<div className="space-y-3">
										<div>
											<div className="mb-1 flex justify-between">
												<span className="text-foreground text-sm">
													Raid (0/3)
												</span>
												<span className="text-muted-foreground text-sm">
													0 bosses killed
												</span>
											</div>
											<Progress
												value={0}
												className="h-2"
											/>
										</div>
										<div>
											<div className="mb-1 flex justify-between">
												<span className="text-foreground text-sm">
													Mythic+ (0/3)
												</span>
												<span className="text-muted-foreground text-sm">
													Complete +15 dungeons
												</span>
											</div>
											<Progress
												value={0}
												className="h-2"
											/>
										</div>
										<div>
											<div className="mb-1 flex justify-between">
												<span className="text-foreground text-sm">
													PvP (0/3)
												</span>
												<span className="text-muted-foreground text-sm">
													Win rated matches
												</span>
											</div>
											<Progress
												value={0}
												className="h-2"
											/>
										</div>
									</div>
								</div>

								<div className="bg-muted rounded-lg p-4">
									<h4 className="text-foreground mb-3 font-medium">
										Conquest Progress
									</h4>
									<div className="mb-2 flex justify-between">
										<span className="text-sm">
											Weekly Conquest
										</span>
										<span className="text-sm">
											{100} {"/"} {1000}{" "}
											{/* TODO: Mock Data */}
										</span>
									</div>
									<Progress
										value={(100 / 1000) * 100}
										className="h-2"
									/>
								</div>

								<div className="bg-muted rounded-lg p-4">
									<h4 className="text-foreground mb-3 font-medium">
										Renown Progress
									</h4>
									<div className="mb-2 flex justify-between">
										<span className="text-sm">
											Council of Dornogal
										</span>
										<span className="text-sm">
											{0} {"/"} {10}
										</span>
									</div>
									<Progress
										value={(0 / 10) * 100}
										className="h-2"
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="stats" className="mt-4 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-muted rounded-lg p-4">
									{" "}
									<div className="mb-2 flex items-center gap-2">
										<Sword className="text-destructive h-4 w-4" />
										<span className="text-foreground text-sm font-medium">
											DPS
										</span>
									</div>
									<div className="text-foreground text-2xl font-bold">
										847,392
									</div>
									<div className="text-muted-foreground text-xs">
										Single Target
									</div>
								</div>
								<div className="bg-muted rounded-lg p-4">
									<div className="mb-2 flex items-center gap-2">
										<Shield className="text-primary h-4 w-4" />
										<span className="text-foreground text-sm font-medium">
											HPS
										</span>
									</div>
									<div className="text-foreground text-2xl font-bold">
										234,567
									</div>
									<div className="text-muted-foreground text-xs">
										Raid Healing
									</div>
								</div>
								<div className="bg-muted rounded-lg p-4">
									<div className="mb-2 flex items-center gap-2">
										<Activity className="text-success h-4 w-4" />
										<span className="text-foreground text-sm font-medium">
											Survivability
										</span>
									</div>
									<div className="text-foreground text-2xl font-bold">
										92%
									</div>
									<div className="text-muted-foreground text-xs">
										Damage Avoided
									</div>
								</div>
								<div className="bg-muted rounded-lg p-4">
									<div className="mb-2 flex items-center gap-2">
										<TrendingUp className="text-secondary h-4 w-4" />
										<span className="text-foreground text-sm font-medium">
											Performance
										</span>
									</div>
									<div className="text-foreground text-2xl font-bold">
										87
									</div>
									<div className="text-muted-foreground text-xs">
										Avg Parse %
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{recentActivity.map((activity, index) => (
							<div
								key={index}
								className="bg-muted flex items-center gap-3 rounded-lg p-3"
							>
								<div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
									<activity.icon className="text-muted-foreground h-4 w-4" />
								</div>
								<div className="flex-1">
									{" "}
									<div className="text-foreground text-sm font-medium">
										{activity.title}
									</div>
									<div className="text-muted-foreground text-xs">
										{activity.character} •{" "}
										{activity.timestamp}
									</div>
								</div>
								<ChevronRight className="text-muted-foreground h-4 w-4" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
