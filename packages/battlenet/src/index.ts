import type { z, ZodError } from "zod/v4";

import type { RegionsEnum } from "./types";
import { ApplicationAuthResponse, BattlenetError } from "./types";
import { WoWGameDataClient, WoWProfileClient } from "./wow";

export * from "./util";

type Regions = z.infer<typeof RegionsEnum>;

interface BaseClientOptions {
	region: Regions;
	locale?: string;
	suppressZodErrors?: boolean;
}

interface BaseRequestOptions<T> {
	endpoint: string;
	params?: URLSearchParams;
	method?: "POST" | "GET";
	namespace?: "static" | "dynamic" | "profile";
	authorization: string;
	zod: z.Schema<T>;
}

type ClientReturn<T> =
	| { success: true; data: T; raw_data: T; error?: never; error_type?: never }
	| {
			success: false;
			error: ZodError<T>;
			error_type: "zod";
			raw_data: T;
			data?: never;
	  }
	| {
			success: false;
			error: Response;
			error_type: "auth";
			raw_data: T;
			data?: never;
	  }
	| {
			success: false;
			error: z.infer<typeof BattlenetError>;
			error_type: "battlenet";
			raw_data: T;
			data?: never;
	  }
	| {
			success: false;
			error: Error;
			error_type: "unknown";
			raw_data: T;
			data?: never;
	  };

class BaseClient {
	protected region: Regions;
	protected baseUrl: string;
	protected locale?: string;
	protected suppressZodErrors: boolean;

	constructor(options: BaseClientOptions) {
		this.region = options.region;
		this.locale = options.locale;
		this.suppressZodErrors = options.suppressZodErrors ?? false;

		this.baseUrl =
			this.region === "cn"
				? "https://gateway.battlenet.com.cn"
				: `https://${this.region}.api.blizzard.com`;
	}

	public async request<T>({
		endpoint,
		params = new URLSearchParams(),
		method = "GET",
		namespace,
		zod,
		authorization,
	}: BaseRequestOptions<T>): Promise<ClientReturn<T>> {
		const url = new URL(`${this.baseUrl}/${endpoint}`);

		if (this.locale) {
			params.set("locale", this.locale);
		}

		if (params.size > 0) {
			url.search = params.toString();
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${authorization}`,
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
				if (this.suppressZodErrors) {
					return {
						success: true,
						data: json as T,
						raw_data: json as T,
					};
				}

				console.error(
					"Failed to parse api response with zod validator." +
						"This usually means the API response has changed or the zod schema is incorrect." +
						(error.message || "Unknown zod error"),
				);
				return {
					success: false,
					error: error,
					error_type: "zod",
					raw_data: json as T,
				};
			}
			return {
				success: true,
				data,
				raw_data: json as T,
			};
		}

		if (res.status === 401) {
			return {
				success: false,
				error_type: "auth",
				error: res,
				raw_data: {} as T,
			};
		}

		try {
			const json = await res.json();
			const { data, success } = BattlenetError.safeParse(json);
			if (success) {
				return {
					success: false,
					error_type: "battlenet",
					error: data,
					raw_data: json as T,
				};
			} else {
				return {
					success: false,
					error_type: "unknown",
					error: new Error(
						`Unknown error: ${res.status} ${res.statusText}`,
					),
					raw_data: json as T,
				};
			}
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			return {
				success: false,
				error_type: "unknown",
				error: new Error(errorMessage),
				raw_data: {} as T,
			};
		}
	}
}

interface ApplicationOptions extends BaseClientOptions {
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

	public async request<T>(opt: ApplicationRequestOptions<T>) {
		await this.authenticate();
		const authorization = this.accessToken ?? "";
		return super.request({
			...opt,
			authorization,
		});
	}
}

interface AccountOptions extends BaseClientOptions {
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

	public async request<T>(opt: AccountRequestOptions<T>) {
		return super.request({
			...opt,
			authorization: this.accessToken,
			namespace: "profile",
		});
	}
}
