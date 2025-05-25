import { SidebarProvider } from '@auxarmory/ui/components/sidebar';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { ApiProvider } from './api-provider';

export function ContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ApiProvider>
                <ThemeProvider>
                    <SidebarProvider>
                        {children}
                    </SidebarProvider>
                </ThemeProvider>
            </ApiProvider>
        </AuthProvider>
    );
}