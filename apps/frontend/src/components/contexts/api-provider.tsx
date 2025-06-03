import { useState } from "react";
import { TRPCProvider } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "@auxarmory/trpc-api";

import { useAuth } from "./auth-provider";

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const { getToken } = useAuth();

	const queryClient = new QueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "http://localhost:3000",
					async headers() {
						const token = await getToken();
						return {
							Authorization: token ? `Bearer ${token}` : "",
						};
					},
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
