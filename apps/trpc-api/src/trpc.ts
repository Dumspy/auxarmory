import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

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

			const scopes: string[] = []; // Replace with actual logic to get scopes for the account on x guildId

			if (!scopes.includes(meta.scopeRequired)) {
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
