import { createContext, useContext, useRef } from "react"
import type { AppRouter } from '../../../../trpc-api/src/index.js';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './auth-provider';

interface ApiContextType {
  trpc: ReturnType<typeof createTRPCOptionsProxy<AppRouter>>
}

const ApiContext = createContext({} as ApiContextType)

// Create the QueryClient instance
const queryClient = new QueryClient();

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  // Create the tRPC client
  const trpcClient = useRef(createTRPCClient<AppRouter>({
    links: [httpBatchLink({
      url: 'http://localhost:3000',
      async headers() {
        const token = await getToken();
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
    })],
  }));

  // Create the tRPC proxy that components will use
  const trpc = useRef(createTRPCOptionsProxy<AppRouter>({
    client: trpcClient.current,
    queryClient,
  })).current;

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ trpc }}>
        {children}
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
