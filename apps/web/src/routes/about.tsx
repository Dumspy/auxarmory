import { createFileRoute } from '@tanstack/react-router';

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@auxarmory/ui/components/ui/tabs';

import { DashboardLayout } from '../components/dashboard-layout';
import { requireAuth } from '../lib/require-auth';

export const Route = createFileRoute('/about')({
	beforeLoad: requireAuth,
	component: About,
});

function About() {
	return (
		<DashboardLayout>
			<div className='p-2 md:p-4'>
				<Tabs defaultValue='account' className='w-full max-w-lg'>
					<TabsList>
						<TabsTrigger value='account'>Account</TabsTrigger>
						<TabsTrigger value='password'>Password</TabsTrigger>
					</TabsList>
					<TabsContent value='account'>
						Make changes to your account here.
					</TabsContent>
					<TabsContent value='password'>
						Change your password here.
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}
