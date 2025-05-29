import { Fragment } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ContextProvider } from "@/components/contexts";
import {
	createRootRoute,
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
import { SidebarInset, SidebarTrigger } from "@auxarmory/ui/components/sidebar";

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

export const Route = createRootRoute({
	component: () => (
		<ContextProvider>
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
		</ContextProvider>
	),
});
