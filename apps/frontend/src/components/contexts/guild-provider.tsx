import type { RouterOutputs } from "@/utils/trpc";
import React, { createContext, useContext, useState } from "react";

export type Guild = RouterOutputs["account"]["getGuilds"][number];

interface GuildContextType {
	setActiveGuildId: (guildId: number) => void;
	activeGuildId: number | undefined;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export function GuildProvider({ children }: { children: React.ReactNode }) {
	const [activeGuildId, setActiveGuildId] = useState<number | undefined>(undefined);


	return (
		<GuildContext.Provider value={{ activeGuildId, setActiveGuildId }}>
			{children}
		</GuildContext.Provider>
	);
}

export function useGuild() {
	const ctx = useContext(GuildContext);

	if (!ctx) throw new Error("useGuild must be used within a GuildProvider");

	return ctx;
}
