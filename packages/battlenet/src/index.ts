import { WoWGameDataClient, WoWProfileClient } from "./wow";

export * from "./util";

export const regions = ["us", "eu", "kr", "tw", "cn"] as const;
type Region = typeof regions[number];

interface BaseClientOptions {
	region: Region;
	locale?: string;
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
	protected locale?: string;

	constructor(options: BaseClientOptions) {
		this.region = options.region;
		this.locale = options.locale

		this.baseUrl =
			this.region === "cn"
				? "https://gateway.battlenet.com.cn"
				: `https://${this.region}.api.blizzard.com`;
	}

	public async request<T>(opt: BaseRequestOptions): Promise<T> {
		const { endpoint, params = new URLSearchParams(), method = "GET", namespace } = opt;

		const url = new URL(`${this.baseUrl}/${endpoint}`);

		if (this.locale) {
			params.set("locale", this.locale);
		}

		if (params.size > 0) {
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

