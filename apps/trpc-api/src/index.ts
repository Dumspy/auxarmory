import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

import { createContext } from "./context";
import { accountRouter } from "./routes/account";
import { indexRouter } from "./routes/index";
import { router } from "./trpc";

const appRouter = router({
	index: indexRouter,
	account: accountRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
	middleware: cors(),
	router: appRouter,
	createContext: createContext,
});

server.listen(3000);
