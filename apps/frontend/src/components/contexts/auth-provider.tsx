import type { Challenge } from "@openauthjs/openauth/client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@openauthjs/openauth/client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "../../../../trpc-api/src/index";

const authClient = createClient({
	clientID: "auxarmory-frontend",
	issuer: "http://localhost:3001",
});

export interface AuthContext {
	accountId?: number;
	loaded: boolean;
	loggedIn: boolean;
	logout: () => void;
	login: () => Promise<void>;
	getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const initializing = useRef(true);
	const [loaded, setLoaded] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const token = useRef<string | undefined>(undefined);
	const [accountId, setAccountId] = useState<number | undefined>();

	useEffect(() => {
		const hash = new URLSearchParams(location.search.slice(1));
		const code = hash.get("code");
		const state = hash.get("state");

		if (!initializing.current) {
			return;
		}

		initializing.current = false;

		if (code && state) {
			void callback(code, state);
			return;
		}

		void auth();
	}, []);

	async function auth() {
		const token = await refreshTokens();

		if (token) {
			await account();
		}

		setLoaded(true);
	}

	async function refreshTokens() {
		const refresh = localStorage.getItem("refresh");
		if (!refresh) return;
		const next = await authClient.refresh(refresh, {
			access: token.current,
		});
		if (next.err) return;
		if (!next.tokens) return token.current;

		localStorage.setItem("refresh", next.tokens.refresh);
		token.current = next.tokens.access;

		return next.tokens.access;
	}

	async function getToken() {
		const token = await refreshTokens();

		if (!token) {
			await login();
			return;
		}

		return token;
	}

	async function login() {
		const { challenge, url } = await authClient.authorize(
			location.origin,
			"code",
			{
				pkce: true,
			},
		);
		sessionStorage.setItem("challenge", JSON.stringify(challenge));
		location.href = url;
	}

	async function callback(code: string, state: string) {
		const challenge = JSON.parse(
			sessionStorage.getItem("challenge") ?? "",
		) as Challenge | null;
		if (code) {
			if (state === challenge?.state && challenge.verifier) {
				const exchanged = await authClient.exchange(
					code,
					location.origin,
					challenge.verifier,
				);
				if (!exchanged.err) {
					token.current = exchanged.tokens.access;
					localStorage.setItem("refresh", exchanged.tokens.refresh);
				}
			}
			window.location.replace("/");
		}
	}

	async function account() {
		const client = createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "http://localhost:3000",
					headers: {
						Authorization: `Bearer ${token.current}`,
					},
				}),
			],
		});

		try {
			const id = await client.account.getAccountId.query();
			setAccountId(id);
			setLoggedIn(true);
		} catch {
			return;
		}
	}

	function logout() {
		localStorage.removeItem("refresh");
		token.current = undefined;

		window.location.replace("/");
	}

	return (
		<AuthContext.Provider
			value={{
				login,
				logout,
				accountId: accountId,
				loaded,
				loggedIn,
				getToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context)
		throw new Error("useAuth must be used within an AuthProvider");

	return context;
}
