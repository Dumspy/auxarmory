/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StrictMode } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import "@auxarmory/ui/globals.css";

import { AuthProvider, useAuth } from "@/components/contexts/auth-provider";
import { routeTree } from "@/routeTree.gen";

import { ApiProvider } from "./components/contexts/api-provider";
import { GuildProvider, useGuild } from "./components/contexts/guild-provider";
import { ThemeProvider } from "./components/contexts/theme-provider";

const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
		guild: undefined!,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();
	const guild = useGuild();

	return <RouterProvider router={router} context={{ auth, guild }} />;
}

function App() {
	return (
		<AuthProvider>
			<GuildProvider>
				<ApiProvider>
					<ThemeProvider>
						<InnerApp />
					</ThemeProvider>
				</ApiProvider>
			</GuildProvider>
		</AuthProvider>
	);
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
