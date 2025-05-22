import { Axe } from "lucide-react"
import { Card, CardContent } from "@auxarmory/ui/components/card"

// TODO: Wishlist item typed based on the backend
// - Success color for damage increase
// - figure out how to handle icons
export function WishlistPersonalItem({ item }: {
    item: {
        name: string
        ilvl: number
        subheader: string
        dmgIncrease?: number
    }
}) {
    return (
        <Card className="p-0">
            <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                    <Axe size={20} className="text-muted-foreground" />
                </div>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-primary">{item.ilvl}</span>
                            <span>{item.subheader}</span>
                        </div>
                    </div>
                    {item.dmgIncrease && (
                        <div className="text-sm text-success">
                            {item.dmgIncrease}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}