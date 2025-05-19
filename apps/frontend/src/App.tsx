import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/trpc';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <div>
          <h1>Aux Armory</h1>
          <p>Welcome to the Aux Armory!</p>
        </div>
    </QueryClientProvider>
  )
}
