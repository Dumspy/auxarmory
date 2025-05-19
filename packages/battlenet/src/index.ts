import { WoWClient } from "./wow";
import {
	AchievementCategoryIndexResponse,
	AchievementCategoryResponse,
	AchievementIndexResponse,
	AchievementMediaResponse,
	AchievementResponse,
	AchievementsIndex,
} from "./wow/game_data/achievements";

type Region = "us" | "eu" | "kr" | "tw"; // | "cn"

type Locale =
	| "en_US"
	| "es_MX"
	| "pt_BR"
	| "en_GB"
	| "es_ES"
	| "fr_FR"
	| "ru_RU"
	| "de_DE"
	| "pt_PT"
	| "it_IT"
	| "ko_KR"
	| "zh_TW"
	| "zh_CN";

export interface BattleNetClientOptions {
	region: Region;
	clientId: string;
	clientSecret: string;
}

interface BattleNetRequestOptions {
	endpoint: string;
	params?: URLSearchParams;
	method?: "POST" | "GET";
	namespace?: "static" | "dynamic" | "profile";
}

export class BattleNetClient {
	protected region: Region;

	private clientId: string;
	private clientSecret: string;

	private accessToken: string | null = null;
	private accessTokenExpiresAt: number | null = null;

	public wow: WoWClient;

	constructor(options: BattleNetClientOptions) {
		this.region = options.region;
		this.clientId = options.clientId;
		this.clientSecret = options.clientSecret;

		this.wow = new WoWClient(this);
	}

	private async authenticate() {
		if (
			this.accessToken &&
			this.accessTokenExpiresAt &&
			Date.now() < this.accessTokenExpiresAt
		) {
			return;
		}

		const url = `https://${this.region}.battle.net/oauth/token`;
		const params = new URLSearchParams({
			grant_type: "client_credentials",
		});

		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization:
					"Basic " + btoa(`${this.clientId}:${this.clientSecret}`),
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		});

		if (!res.ok) {
			throw new Error(
				`Failed to authenticate: ${res.status} ${res.statusText}`,
			);
		}
		const data = await res.json();

		this.accessToken = data.access_token;
		this.accessTokenExpiresAt = Date.now() + data.expires_in * 1000;
	}

	public async request(options: BattleNetRequestOptions) {
		const { endpoint, params, method = "GET", namespace } = options;

		await this.authenticate();

		const url = new URL(
			`https://${this.region}.api.blizzard.com/${endpoint}`,
		);

		if (params) {
			url.search = params.toString();
		}

		const headers: HeadersInit = {
			Authorization: `Bearer ${this.accessToken}`,
			"Content-Type": "application/json",
		};

		if (namespace) {
			headers["Battlenet-Namespace"] = `${namespace}-${this.region}`;
		}

		const res = await fetch(url, {
			method,
			headers,
		});

		if (res.ok) {
			return await res.json();
		}

		// TODO: error handling i guess
		console.log(res);
		throw new Error("Failed to fetch data from Battle.net API");
	}
}

// (async () => {
// 	const client = new BattleNetClient({
// 		region: "us",
// 		clientId: "3ea6ae45f23a44efbf4c6a55ac88b608",
// 		clientSecret: "zQ3jtQSy0RcRJnTOIAZYLbfL7ZxqlmGU",
// 	})

// 	const index = await client.wow.AchievementCategoryIndex()

// 	AchievementCategoryIndexResponse.parse(index)

// 	console.log("AchievementsIndex ok")

// 	for (const achievement of index.categories) {
// 		const data = await client.wow.AchievementCategory(achievement.id)
// 		try {
// 			AchievementCategoryResponse.parse(data)
// 		} catch (e) {
// 			console.error("Achievement parse error", e)
// 			console.log(data)
// 		}

// 		console.log("Achievement ok", data.id)
// 	}
// })()
