import { createFileRoute } from '@tanstack/react-router';

import { DashboardLayout } from '../../components/dashboard-layout';
import { requireAuth } from '../../lib/require-auth';

export const Route = createFileRoute('/wishlist/overview')({
	beforeLoad: requireAuth,
	component: WishlistOverview,
});

function WishlistOverview() {
	return (
		<DashboardLayout>
			<div className='p-2 md:p-4'>
				<h2 className='text-xl font-semibold'>Wishlist Overview</h2>
				<p className='text-muted-foreground mt-2 text-sm'>
					Overview widgets are UI-only placeholders on v3 for now.
				</p>
			</div>
		</DashboardLayout>
	);
}
