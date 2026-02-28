import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '@auxarmory/api/routers'

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>()
