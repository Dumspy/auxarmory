import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookmarkIcon, ChevronRight, HomeIcon, InfoIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@auxarmory/ui/components/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@auxarmory/ui/components/sidebar";

// Map icons to parent routes
const routeIcons: Record<string, LucideIcon> = {
	"/": HomeIcon,
	"/about": InfoIcon,
	"/wishlist": BookmarkIcon,
};

type NavItem = {
	title: string;
	path: string;
	icon?: LucideIcon;
	items?: NavItem[];
};

export function NavMain() {
	const state = useRouterState();
	const currentPath = state.location.pathname;

	const navItems = useMemo(() => {
		const items: NavItem[] = [];
		const allRoutes = [
			"/",
			"/about",
			"/wishlist/overview",
			"/wishlist/personal",
		];

		allRoutes.forEach((route) => {
			const segments = route.split("/").filter(Boolean);

			if (segments.length === 0) {
				items.push({
					title: "Home",
					path: "/",
					icon: routeIcons["/"],
				});
			} else if (segments.length === 1) {
				items.push({
					title:
						segments[0].charAt(0).toUpperCase() +
						segments[0].slice(1),
					path: `/${segments[0]}`,
					icon: routeIcons[`/${segments[0]}`],
				});
			} else {
				const parentPath = `/${segments[0]}`;
				const parent = items.find((item) => item.path === parentPath);

				if (parent) {
					if (!parent.items) parent.items = [];
					parent.items.push({
						title:
							segments[1].charAt(0).toUpperCase() +
							segments[1].slice(1),
						path: route,
					});
				} else {
					items.push({
						title:
							segments[0].charAt(0).toUpperCase() +
							segments[0].slice(1),
						path: parentPath,
						icon: routeIcons[parentPath],
						items: [
							{
								title:
									segments[1].charAt(0).toUpperCase() +
									segments[1].slice(1),
								path: route,
							},
						],
					});
				}
			}
		});

		return items;
	}, []);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => {
					const isActive =
						currentPath === item.path ||
						(item.items?.some(
							(subItem) => currentPath === subItem.path,
						) ??
							false);

					const hasChildren = item.items && item.items.length > 0;

					return (
						<Collapsible
							key={item.path}
							asChild
							defaultOpen={isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								{hasChildren ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												tooltip={item.title}
											>
												{item.icon && <item.icon />}
												<span>{item.title}</span>
												<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items?.map((subItem) => (
													<SidebarMenuSubItem
														key={subItem.path}
													>
														<SidebarMenuSubButton
															asChild
														>
															<Link
																to={
																	subItem.path
																}
															>
																<span>
																	{
																		subItem.title
																	}
																</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : (
									<SidebarMenuButton asChild>
										<Link to={item.path}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
