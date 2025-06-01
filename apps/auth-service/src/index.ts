import type { Oauth2Token } from "@openauthjs/openauth/provider/oauth2";
import { serve } from "@hono/node-server";
import { issuer } from "@openauthjs/openauth";
import { Oauth2Provider } from "@openauthjs/openauth/provider/oauth2";
import { cors } from "hono/cors";

import { subjects } from "@auxarmory/auth-subjects";
import { dbClient } from "@auxarmory/db";
import { SyncServiceClient } from "@auxarmory/sync-service/client";

import { RedisStorage } from "./adapter/redis";
import { env } from "./env";

interface UserInfoResponse {
	sub: string;
	id: number;
	battletag: string;
}

async function upsertAccount(oauth: Oauth2Token) {
	const res = await fetch("https://eu.battle.net/oauth/userinfo", {
		headers: {
			Authorization: `Bearer ${oauth.access}`,
		},
	});

	if (!res.ok) {
		throw new Error("Failed to fetch user info from Battle.net");
	}

	const userInfo = (await res.json()) as UserInfoResponse;

	const account = await dbClient.account.upsert({
		where: { id: userInfo.id },
		update: {
			battletag: userInfo.battletag,
			bnetAccessToken: oauth.access,
			bnetExpiresAt: new Date(Date.now() + oauth.expiry * 1000),
		},
		create: {
			id: userInfo.id,
			battletag: userInfo.battletag,
			bnetAccessToken: oauth.access,
			bnetExpiresAt: new Date(Date.now() + oauth.expiry * 1000),
		},
	});

	return {
		id: account.id,
		battletag: account.battletag,
	};
}

const syncServiceClient = new SyncServiceClient();

const app = issuer({
	subjects,
	storage: RedisStorage(),
	providers: {
		battlenet: Oauth2Provider({
			clientID: env.BATTLENET_CLIENT_ID,
			clientSecret: env.BATTLENET_CLIENT_SECRET,
			endpoint: {
				authorization: "https://eu.battle.net/oauth/authorize ",
				token: "https://eu.battle.net/oauth/token",
			},
			scopes: ["openid", "wow.profile"],
			query: {
				grant_type: "authorization_code",
				response_type: "code",
			},
		}),
	},
	success: async (ctx, value) => {
		switch (value.provider) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			case "battlenet": {
				const upserted = await upsertAccount(value.tokenset);

				void syncServiceClient.addJob("sync-account-data", {
					accountId: upserted.id,
					region: "eu",
				});

				return await ctx.subject("account", {
					id: upserted.id.toString(),
					battletag: upserted.battletag,
				});
			}
			default:
				throw new Error("Invalid provider");
		}
	},
});

app.use(
	"*",
	cors({
		origin: ["http://localhost:5173"],
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

serve({
	...app,
	port: 3001,
});
