import { Outlet, createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '../components/dashboard-layout'
import { requireAuth } from '../lib/require-auth'

export const Route = createFileRoute('/_auth')({
	beforeLoad: requireAuth,
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	return (
		<DashboardLayout>
			<Outlet />
		</DashboardLayout>
	)
}
