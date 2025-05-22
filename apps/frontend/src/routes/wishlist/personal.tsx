import { Button } from '@auxarmory/ui/components/button'
import { createFileRoute } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { WishlistPersonalItem } from '@/components/wishlist/personal/item'

export const Route = createFileRoute('/wishlist/personal')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">Equipment</h2>
          <Button variant="ghost" size="sm" className='text-foreground'>
            <Info size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs text-foreground">
            ITEM SLOT
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            ENCOUNTER
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <WishlistPersonalItem item={{ name: 'Tempo', ilvl: 684, subheader: 'Boss/Slotname' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
