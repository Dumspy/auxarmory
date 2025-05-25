import { publicProcedure, protectedProcedure, router } from "./trpc.js";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createContext } from "./context.js";
import cors from 'cors';

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