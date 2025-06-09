import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { dbClient } from "@auxarmory/db";

interface Meta {
	scopeRequired?: string;
}
const t = initTRPC.context<Context>().meta<Meta>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
	async ({ ctx, meta, next }) => {
		if (!ctx.accountId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		if (meta?.scopeRequired) {
			console.log(
				`Checking scopes for account ${ctx.accountId} on guild ${ctx.guildId}`,
			);

			if (!ctx.guildId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "guildId header is required for this request",
				});
			}

			const accountRank = (await dbClient.guildMember.findFirst({
				where: {
					character: {
						accountId: ctx.accountId,
					},
					guildId: ctx.guildId,
				},
				orderBy: {
					guildRank: {
						order: "asc",
					}
				},
				select: {
					guildRankId: true,
				}
			}))?.guildRankId

			if (!accountRank) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have any ranks in this guild",
				});
			}

			const accountScopes = (await dbClient.guildPermission.findMany({
				where: {
					guildId: ctx.guildId,
					OR: [
						{
							targetGuildRank: {
								order: {
									gte: accountRank,
								}
							}
						},
						{
							targetAccountId: ctx.accountId,
						}
					]
				},
				select: {
					scope: true,
				},
			})).map((p) => p.scope);

			if (!accountScopes.includes(meta.scopeRequired)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `You do not have the required scope: ${meta.scopeRequired}`,
				});
			}
		}

		return next({
			ctx: {
				accountId: ctx.accountId,
			},
		});
	},
);
