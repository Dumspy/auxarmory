import { WoWGameDataClient, WoWProfileClient } from "./wow";

type Region = "us" | "eu" | "kr" | "tw" | "cn";

interface BaseClientOptions {
	region: Region;
}

interface BaseRequestOptions {
	endpoint: string;
	params?: URLSearchParams;
	method?: "POST" | "GET";
	namespace?: "static" | "dynamic" | "profile";
	authorization: string;
}

class BaseClient {
	protected region: Region;

	protected baseUrl: string;

	constructor(options: BaseClientOptions) {
		this.region = options.region;

		this.baseUrl =
			this.region === "cn"
				? "https://gateway.battlenet.com.cn"
				: `https://${this.region}.api.blizzard.com`;
	}

	public async request<T>(opt: BaseRequestOptions): Promise<T> {
		const { endpoint, params, method = "GET", namespace } = opt;

		const url = new URL(`${this.baseUrl}/${endpoint}`);

		if (params) {
			url.search = params.toString();
		}

		const headers: HeadersInit = {
			Authorization: `Bearer ${opt.authorization}`,
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

interface ApplicationOptions {
	region: Region;
	clientId: string;
	clientSecret: string;
}

type ApplicationRequestOptions = Omit<BaseRequestOptions, "authorization">;

export class ApplicationClient extends BaseClient {
	protected clientId: string;
	protected clientSecret: string;

	protected accessToken: string | null = null;
	protected accessTokenExpiresAt: number | null = null;

	protected authUrl: string;

	public wow: WoWGameDataClient;

	constructor(options: ApplicationOptions) {
		super(options);
		this.clientId = options.clientId;
		this.clientSecret = options.clientSecret;

		this.authUrl =
			this.region === "cn"
				? "https://www.battlenet.com.cn/oauth/token"
				: `https://${this.region}.battle.net/oauth/token`;

		this.wow = new WoWGameDataClient(this);
	}

	private async authenticate() {
		if (
			this.accessToken &&
			this.accessTokenExpiresAt &&
			Date.now() < this.accessTokenExpiresAt
		) {
			return;
		}

		const url = this.authUrl;
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

	public async request<T>(opt: ApplicationRequestOptions): Promise<T> {
		await this.authenticate();

		const authorization = this.accessToken || "";
		return super.request<T>({
			...opt,
			authorization,
			namespace: opt.namespace,
		});
	}
}

interface AccountOptions {
	region: Region;
	accessToken: string;
}

type AccountRequestOptions = Omit<BaseRequestOptions, "authorization" | "namespace">

export class AccountClient extends BaseClient {
	protected accessToken: string;

	public wow: WoWProfileClient;

	constructor(options: AccountOptions) {
		super(options);
		this.accessToken = options.accessToken;

		this.wow = new WoWProfileClient(this);
	}

	public async request<T>(opt: AccountRequestOptions): Promise<T> {
		return super.request<T>({
			...opt,
			authorization: this.accessToken,
			namespace: "profile",
		});
	}
}

import fs from "fs";
import { CharacterStatisticsSummaryResponse } from "./wow/profile/character_statistics";

(async () => {
	const client = new ApplicationClient({
		region: "eu",
		clientId: process.env.BATTLENET_CLIENT_ID || "",
		clientSecret: process.env.BATTLENET_CLIENT_SECRET || "",
	});

	const index = await client.wow.CharacterStatisticsSummary("azjolnerub", "dispy");

	const res = CharacterStatisticsSummaryResponse.safeParse(index);
	if (res.success) {
		console.log("index ok");
	} else {
		console.error("Heirloom parse error", res.error);
		console.log(index);

		const errorFile = `./out/error.txt`;
		const dataFile = `./out/data.json`;
		fs.writeFileSync(errorFile, res.error.message);
		fs.writeFileSync(dataFile, JSON.stringify(index, null, 2));
		console.error(`Heirloom parse error, saved to ${errorFile} and ${dataFile}`);
	}

	// for (const obj of index.seasons) {
	// 	const data = await client.wow.CharacterMythicKeystoneSeason("azjolnerub", "dispy", obj.id);
	// 	const id = data.season.id
	// 	const res = CharacterMythicKeystoneSeasonResponse.safeParse(data);
	// 	if (res.success) {
	// 		console.log("index ok", id);
	// 	} else {
	// 		//console.error("Heirloom parse error", res.error);
	// 		//console.dir(data, { depth: null });

	// 		const errorFile = `./out/error-${id}.txt`;
	// 		const dataFile = `./out/data-${id}.json`;
	// 		fs.writeFileSync(errorFile, res.error.message);
	// 		fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

	// 		console.error(`Heirloom parse error for ID ${id}, saved to ${errorFile} and ${dataFile}`);
	// 	}
	// }
})();
