import { SidebarProvider } from "@auxarmory/ui/components/sidebar";

import { ApiProvider } from "./api-provider";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

export function ContextProvider({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<ApiProvider>
				<ThemeProvider>
					<SidebarProvider>{children}</SidebarProvider>
				</ThemeProvider>
			</ApiProvider>
		</AuthProvider>
	);
}
