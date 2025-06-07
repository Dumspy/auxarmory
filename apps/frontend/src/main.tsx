import { StrictMode } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import "@auxarmory/ui/globals.css";

import { ContextProvider } from "./components/contexts";
import { useAuth } from "./components/contexts/auth-provider";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		auth: undefined,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();

	return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
	return (
		<ContextProvider>
			<InnerApp />
		</ContextProvider>
	);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
