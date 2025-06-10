import { dbClient } from "@auxarmory/db";

import { protectedProcedure, router } from "../trpc";

export const accountRouter = router({
	getAccountId: protectedProcedure.query(({ ctx }) => {
		return ctx.accountId;
	}),
	getGuilds: protectedProcedure.query(async ({ ctx }) => {
		const guilds = await dbClient.guildMember.findMany({
			where: {
				character: {
					accountId: ctx.accountId,
				},
			},
			select: {
				guild: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		const uniqueGuilds = guilds.reduce(
			(acc, guild) => {
				if (!acc.some((g) => g.id === guild.guild.id)) {
					acc.push(guild.guild);
				}
				return acc;
			},
			[] as (typeof guilds)[0]["guild"][],
		);

		return uniqueGuilds;
	}),
});
