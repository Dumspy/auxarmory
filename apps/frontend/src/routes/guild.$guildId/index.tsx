import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guild/$guildId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { guildId } = Route.useParams();

	return <div>Hello "/guild/{guildId}/"!</div>;
}
