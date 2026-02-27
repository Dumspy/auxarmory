import { createFileRoute } from '@tanstack/react-router';
import { Info } from 'lucide-react';

import { Button } from '@auxarmory/ui/components/ui/button';

import { DashboardLayout } from '../../components/dashboard-layout';
import { WishlistPersonalItem } from '../../components/wishlist/personal/item';
import { requireAuth } from '../../lib/require-auth';

export const Route = createFileRoute('/wishlist/personal')({
	beforeLoad: requireAuth,
	component: WishlistPersonal,
});

const items = [
	{
		name: 'Tempo',
		ilvl: 684,
		subheader: 'Queen Ansurek / Weapon',
		dmgIncrease: 4.1,
	},
	{
		name: 'Signet of the Priory',
		ilvl: 678,
		subheader: 'Dungeon / Ring',
		dmgIncrease: 2.8,
	},
];

function WishlistPersonal() {
	return (
		<DashboardLayout>
			<div className='mt-2 p-2 md:p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<h2 className='text-foreground text-lg font-medium'>
							Equipment
						</h2>
						<Button
							variant='ghost'
							size='sm'
							className='text-foreground'
						>
							<Info size={16} />
						</Button>
					</div>
					<div className='flex items-center gap-2'>
						<Button variant='outline' size='sm' className='text-xs'>
							ITEM SLOT
						</Button>
						<Button
							variant='ghost'
							size='sm'
							className='text-muted-foreground text-xs'
						>
							ENCOUNTER
						</Button>
					</div>
				</div>

				<div className='space-y-6'>
					<div className='space-y-2'>
						<h3 className='text-foreground text-base font-medium'>
							Category
						</h3>
						<div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
							{items.map((item) => (
								<WishlistPersonalItem
									key={item.name}
									item={item}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
