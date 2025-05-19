import { publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const appRouter = router({
    helloWorld: publicProcedure.query(() => {
        return "Hello world!";
    })
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
    router: appRouter
});

server.listen(3000);