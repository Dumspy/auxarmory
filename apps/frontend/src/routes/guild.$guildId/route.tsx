import { useEffect } from "react";
import { useGuild } from "@/components/contexts/guild-provider";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useParams,
	useRouter,
} from "@tanstack/react-router";

export const Route = createFileRoute("/guild/$guildId")({
	component: RouteComponent,
	beforeLoad: ({ context, params }) => {
		const activeGuildId = String(context.guild.activeGuildId);
		if (activeGuildId === params.guildId) {
			return;
		}

		if (!context.guild.activeGuildId) {
			context.guild.setActiveGuildId(Number(params.guildId));
		}
	},
});

function RouteComponent() {
	const { activeGuildId } = useGuild();

	const navigate = useNavigate();
	const { guildId: routeId } = useParams({ strict: false }); // current ID in URL
	const router = useRouter();

	const currentPath = router.state.location.pathname; // e.g., /guild/123/channels

	useEffect(() => {
		if (activeGuildId && String(activeGuildId) !== routeId) {
			const newPath = currentPath.replace(
				`/guild/${routeId}`,
				`/guild/${String(activeGuildId)}`,
			);
			void navigate({ to: newPath, replace: true });
		}
	}, [activeGuildId, routeId, currentPath, navigate]);

	return <Outlet />;
}
