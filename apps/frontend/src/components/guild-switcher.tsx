import * as React from "react";
import { useGuild } from "@/components/contexts/guild-provider";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@auxarmory/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@auxarmory/ui/components/sidebar";

export function GuildSwitcher() {
	const trpc = useTRPC();
	const guildQuery = useQuery(trpc.account.getGuilds.queryOptions());
	const guilds = guildQuery.data ?? [];
	const isGuildLoading = guildQuery.isLoading;

	const { activeGuildId, setActiveGuildId } = useGuild();
	const { isMobile } = useSidebar();

	const activeGuild = React.useMemo(() => {
		return guilds.find((g) => g.id === activeGuildId);
	}, [guilds, activeGuildId]);

	// Set initial active guild if not set
	React.useEffect(() => {
		if (
			guilds.length > 0 &&
			(!activeGuildId || !guilds.some((g) => g.id === activeGuildId))
		) {
			setActiveGuildId(guilds[0].id);
		}
	}, [guilds, activeGuildId, setActiveGuildId]);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							disabled={isGuildLoading || !activeGuild}
						>
							<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								{activeGuild?.name.charAt(0).toUpperCase()}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{isGuildLoading || !activeGuild
										? "Loading..."
										: activeGuild.name}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Guilds
						</DropdownMenuLabel>
						{isGuildLoading && (
							<div className="text-muted-foreground p-2 text-xs">
								Loading...
							</div>
						)}
						{!isGuildLoading && guilds.length === 0 && (
							<div className="text-muted-foreground p-2 text-xs">
								No guilds found
							</div>
						)}
						{guilds.map((guild, index) => (
							<DropdownMenuItem
								key={guild.id}
								onClick={() => setActiveGuildId(guild.id)}
								className={`gap-2 p-2 ${activeGuildId === guild.id ? "bg-sidebar-accent/30" : ""}`}
								disabled={isGuildLoading}
							>
								<div className="flex size-6 items-center justify-center rounded-md border">
									{guild.name.charAt(0).toUpperCase()}
								</div>
								{guild.name}
								<DropdownMenuShortcut>
									⌘{index + 1}
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
