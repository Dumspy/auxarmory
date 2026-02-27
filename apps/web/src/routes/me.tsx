import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@auxarmory/ui/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card';

import { authClient } from '../lib/auth-client';
import { useTRPC } from '../lib/trpc';

export const Route = createFileRoute('/me')({
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
		return <main className='p-6 text-white'>Loading your profile...</main>;
	}

	if (meQuery.error) {
		return (
			<main className='space-y-4 p-6'>
				<h1 className='text-2xl font-bold text-white'>
					Protected route
				</h1>
				<p className='text-red-400'>
					Failed to load protected data: {meQuery.error.message}
				</p>
				<Link to='/login' className='text-cyan-400 underline'>
					Go to login
				</Link>
			</main>
		);
	}

	if (!meQuery.data) {
		return <main className='p-6 text-white'>No user data available.</main>;
	}

	const user = meQuery.data.user;

	return (
		<main className='space-y-4 p-6 text-white'>
			<Card>
				<CardHeader>
					<CardTitle>Protected route</CardTitle>
					<CardDescription>
						You are authenticated and this data came from a
						protected tRPC procedure.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-2'>
					<p>
						<span className='text-gray-400'>Name: </span>
						{user.name}
					</p>
					<p>
						<span className='text-gray-400'>Email: </span>
						{user.email}
					</p>
				</CardContent>
			</Card>
			<Button
				type='button'
				onClick={onSignOut}
				variant='outline'
			>
				Sign out
			</Button>
		</main>
	);
}
