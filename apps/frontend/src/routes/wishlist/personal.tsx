import { WishlistPersonalItem } from "@/components/wishlist/personal/item";
import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";

import { Button } from "@auxarmory/ui/components/button";

export const Route = createFileRoute("/wishlist/personal")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mt-8">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h2 className="text-foreground text-lg font-medium">
						Equipment
					</h2>
					<Button
						variant="ghost"
						size="sm"
						className="text-foreground"
					>
						<Info size={16} />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="text-foreground text-xs"
					>
						ITEM SLOT
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground text-xs"
					>
						ENCOUNTER
					</Button>
				</div>
			</div>

			<div className="space-y-6">
				<div className="space-y-2">
					<h3 className="text-foreground text-base font-medium">
						Category
					</h3>
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
						<WishlistPersonalItem
							item={{
								name: "Tempo",
								ilvl: 684,
								subheader: "Boss/Slotname",
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
