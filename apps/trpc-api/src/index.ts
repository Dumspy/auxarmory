import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

import { createContext } from "./context";
import { indexRouter } from "./routes";
import { protectedProcedure, publicProcedure, router } from "./trpc";

const appRouter = router({
	helloWorld: publicProcedure.query(() => {
		return "Hello world!";
	}),
	getAccountId: protectedProcedure.query(({ ctx }) => {
		return ctx.accountId;
	}),
	index: indexRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
	middleware: cors(),
	router: appRouter,
	createContext: createContext,
});

server.listen(3000);
