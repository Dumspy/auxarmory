import { queryClient } from '@/utils/trpc';
import { SidebarProvider } from '@auxarmory/ui/components/sidebar';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';

export function ContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}