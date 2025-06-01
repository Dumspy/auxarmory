import { createFileRoute } from "@tanstack/react-router";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@auxarmory/ui/components/tabs";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<Tabs defaultValue="account" className="w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				Make changes to your account here.
			</TabsContent>
			<TabsContent value="password">
				Change your password here.
			</TabsContent>
		</Tabs>
	);
}
