import type { z } from "zod/v4";

import { ApplicationAuthResponse } from "./types";
import { WoWGameDataClient, WoWProfileClient } from "./wow";

export * from "./util";

export const regions = ["us", "eu", "kr", "tw", "cn"] as const;
type Region = (typeof regions)[number];

interface BaseClientOptions {
	region: Region;
	locale?: string;
}

interface BaseRequestOptions<T> {
	endpoint: string;
	params?: URLSearchParams;
	method?: "POST" | "GET";
	namespace?: "static" | "dynamic" | "profile";
	authorization: string;
	zod: z.Schema<T>;
}

class BaseClient {
	protected region: Region;
	protected baseUrl: string;
	protected locale?: string;

	constructor(options: BaseClientOptions) {
		this.region = options.region;
		this.locale = options.locale;

		this.baseUrl =
			this.region === "cn"
				? "https://gateway.battlenet.com.cn"
				: `https://${this.region}.api.blizzard.com`;
	}

	public async request<T>(opt: BaseRequestOptions<T>): Promise<T> {
		const {
			endpoint,
			params = new URLSearchParams(),
			method = "GET",
			namespace,
			zod,
		} = opt;

		const url = new URL(`${this.baseUrl}/${endpoint}`);

		if (this.locale) {
			params.set("locale", this.locale);
		}

		if (params.size > 0) {
			url.search = params.toString();
		}

		const headers: Record<string, string> = {
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
			const json = await res.json();
			const { data, success, error } = zod.safeParse(json);
			if (!success) {
				throw new Error(
					`Failed to parse api response with zod validator.
					This usually means the API response has changed or the zod schema is incorrect.
					${error.message || "Unknown zod error"}
					`,
				);
			}
			return data;
		}

		// TODO: error handling i guess
		console.log(res);
		throw new Error(
			`Failed to fetch data from Battle.net API: ${res.status} ${res.statusText}`,
		);
	}
}

interface ApplicationOptions {
	region: Region;
	clientId: string;
	clientSecret: string;
}

type ApplicationRequestOptions<T> = Omit<
	BaseRequestOptions<T>,
	"authorization"
>;

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
				Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		});

		if (!res.ok) {
			throw new Error(
				`Failed to authenticate: ${res.status} ${res.statusText}`,
			);
		}
		const json = await res.json();
		const { error, data, success } =
			ApplicationAuthResponse.safeParse(json);

		if (!success) {
			throw new Error(
				`Failed to parse authentication response: ${error.message || "Unknown error"}`,
			);
		}

		this.accessToken = data.access_token;
		this.accessTokenExpiresAt = Date.now() + data.expires_in * 1000;
	}

	public async request<T>(opt: ApplicationRequestOptions<T>): Promise<T> {
		await this.authenticate();
		const authorization = this.accessToken ?? "";
		return super.request({
			...opt,
			authorization,
		});
	}
}

interface AccountOptions {
	region: Region;
	accessToken: string;
}

type AccountRequestOptions<T> = Omit<
	BaseRequestOptions<T>,
	"authorization" | "namespace"
>;

export class AccountClient extends BaseClient {
	protected accessToken: string;
	public wow: WoWProfileClient;

	constructor(options: AccountOptions) {
		super(options);
		this.accessToken = options.accessToken;
		this.wow = new WoWProfileClient(this);
	}

	public async request<T>(opt: AccountRequestOptions<T>): Promise<T> {
		return super.request({
			...opt,
			authorization: this.accessToken,
			namespace: "profile",
		});
	}
}
