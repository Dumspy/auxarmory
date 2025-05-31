import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

import { createContext } from "./context";
import { protectedProcedure, publicProcedure, router } from "./trpc";

const appRouter = router({
	helloWorld: publicProcedure.query(() => {
		return "Hello world!";
	}),
	getUserId: protectedProcedure.query(({ ctx }) => {
		return ctx.userId;
	}),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
	middleware: cors(),
	router: appRouter,
	createContext: createContext,
});

server.listen(3000);
