import { Axe } from "lucide-react";

import { Card, CardContent } from "@auxarmory/ui/components/card";

// TODO: Wishlist item typed based on the backend
// - Success color for damage increase
// - figure out how to handle icons
export function WishlistPersonalItem({
	item,
}: {
	item: {
		name: string;
		ilvl: number;
		subheader: string;
		dmgIncrease?: number;
	};
}) {
	return (
		<Card className="p-0">
			<CardContent className="flex items-center gap-3 p-3">
				<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
					<Axe size={20} className="text-muted-foreground" />
				</div>
				<div className="flex w-full items-center justify-between">
					<div>
						<div className="flex items-center gap-1">
							<span className="text-foreground text-sm font-medium">
								{item.name}
							</span>
						</div>
						<div className="text-muted-foreground flex items-center gap-1 text-xs">
							<span className="text-primary">{item.ilvl}</span>
							<span>{item.subheader}</span>
						</div>
					</div>
					{item.dmgIncrease && (
						<div className="text-success text-sm">
							{item.dmgIncrease}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
