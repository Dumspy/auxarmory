import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, UserRound } from 'lucide-react';
import { Button } from '@auxarmory/ui/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card';

import { DashboardLayout } from '../components/dashboard-layout';
import { authClient } from '../lib/auth-client';
import { requireAuth } from '../lib/require-auth';
import { useTRPC } from '../lib/trpc';

export const Route = createFileRoute('/me')({
	beforeLoad: requireAuth,
	component: MePage,
});

export function MePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const meQuery = useQuery(trpc.privateData.queryOptions());

	async function onSignOut() {
		await authClient.signOut();
		queryClient.clear();
		await navigate({ to: '/login' });
	}

	if (meQuery.isLoading) {
		return (
			<DashboardLayout>
				<main className='p-6'>Loading your profile...</main>
			</DashboardLayout>
		);
	}

	if (meQuery.error) {
		return (
			<DashboardLayout>
				<main className='p-6'>
					<Card className='max-w-2xl'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5 text-red-500' />
								Unable to load profile
							</CardTitle>
							<CardDescription>
								Failed to load protected data: {meQuery.error.message}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link to='/login' className='text-primary underline'>
								Go to login
							</Link>
						</CardContent>
					</Card>
				</main>
			</DashboardLayout>
		);
	}

	if (!meQuery.data) {
		return (
			<DashboardLayout>
				<main className='p-6'>No user data available.</main>
			</DashboardLayout>
		);
	}

	const user = meQuery.data.user;

	return (
		<DashboardLayout>
			<main className='space-y-4 p-6'>
				<Card className='max-w-2xl'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<UserRound className='h-5 w-5' />
							Profile
						</CardTitle>
						<CardDescription>
							Authenticated via Better Auth with protected tRPC data.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-2'>
						<p>
							<span className='text-muted-foreground'>Name: </span>
							{user.name}
						</p>
						<p>
							<span className='text-muted-foreground'>Email: </span>
							{user.email}
						</p>
					</CardContent>
				</Card>
				<Button type='button' onClick={onSignOut} variant='outline'>
					Sign out
				</Button>
			</main>
		</DashboardLayout>
	);
}
