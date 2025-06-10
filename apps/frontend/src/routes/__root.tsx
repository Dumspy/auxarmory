import type { useGuild } from "@/components/contexts/guild-provider";
import { Fragment, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/components/contexts/auth-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@auxarmory/ui/components/breadcrumb";
import { Separator } from "@auxarmory/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@auxarmory/ui/components/sidebar";

function BreadcrumbNav() {
	const state = useRouterState();
	const path = state.location.pathname;
	const segments: string[] =
		path === "/" ? [] : path.split("/").filter(Boolean);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link to="/">Home</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{segments.map((segment, index) => {
					const segmentPath =
						"/" + segments.slice(0, index + 1).join("/");
					const isLast = index === segments.length - 1;

					return (
						<Fragment key={segmentPath}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>
										{segment.charAt(0).toUpperCase() +
											segment.slice(1)}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={segmentPath}>
											{segment.charAt(0).toUpperCase() +
												segment.slice(1)}
										</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function RootLayout() {
	const { loggedIn, login, loaded } = useAuth();

	useEffect(() => {
		if (!loggedIn && loaded) {
			void login();
		}
	}, [loggedIn, loaded, login]);

	if (!loggedIn) {
		return (
			<div className="bg-background flex h-screen w-screen flex-col items-center justify-center">
				<div className="mb-6 flex flex-col items-center">
					{/* Spinner */}
					<div className="border-muted-foreground border-t-primary mb-4 h-12 w-12 animate-spin rounded-full border-4" />
					<p className="text-primary mb-1 text-xl font-semibold">
						Just a moment...
					</p>
					<p className="text-muted-foreground text-base">
						We’re getting things ready for you.
					</p>
				</div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="text-foreground">
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<BreadcrumbNav />
					</div>
				</header>
				<Separator />
				<main className="p-4">
					<Outlet />
				</main>
			</SidebarInset>
			<TanStackRouterDevtools position="bottom-right" />
			<ReactQueryDevtools />
		</SidebarProvider>
	);
}

interface RootRouterContext {
	auth: ReturnType<typeof useAuth>;
	guild: ReturnType<typeof useGuild>;
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
	component: RootLayout,
});
