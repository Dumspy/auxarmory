import type { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import type { IncomingMessage, ServerResponse } from "http";
import { createClient } from "@openauthjs/openauth/client";

import { subjects } from "@auxarmory/auth-subjects";

const client = createClient({
	clientID: "auxarmory-trpc-api",
	issuer: "http://localhost:3001",
});

export async function createContext({
	req,
}: NodeHTTPCreateContextFnOptions<
	IncomingMessage,
	ServerResponse<IncomingMessage>
>) {
	async function getAccountIdFromHeader() {
		const authHeader = req.headers.authorization;
		if (authHeader) {
			const token = authHeader.split(" ")[1] ?? "";
			const verified = await client.verify(subjects, token);

			if (verified.err) {
				console.error("Token verification failed:", verified.err);
				return null;
			}

			return verified.subject.properties.id;
		}
		return null;
	}

	const accountId = await getAccountIdFromHeader();

	return {
		accountId,
	};
}
export type Context = Awaited<ReturnType<typeof createContext>>;
