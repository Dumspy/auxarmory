import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@auxarmory/trpc-api";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

// infer the types for your router
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
