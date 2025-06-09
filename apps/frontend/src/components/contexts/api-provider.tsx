import React, { useEffect, useState } from "react";
import { TRPCProvider } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink  } from "@trpc/client";
import type {HTTPHeaders} from "@trpc/client";

import type { AppRouter } from "@auxarmory/trpc-api";

import { useAuth } from "./auth-provider";
import { useGuild } from "./guild-provider";

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const { getToken } = useAuth();
	const { activeGuildId } = useGuild();

	const activeGuildIdRef = React.useRef<number | undefined>(activeGuildId);

	useEffect(() => {
		activeGuildIdRef.current = activeGuildId;
	}, [activeGuildId]);

	const queryClient = new QueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "http://localhost:3000",
					async headers() {
						const token = await getToken();
						const guildId = activeGuildIdRef.current;

						const headers: HTTPHeaders = {};

						if (token) headers.Authorization = `Bearer ${token}`;

						if (guildId) headers.GuildId = guildId.toString();

						return headers;
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
