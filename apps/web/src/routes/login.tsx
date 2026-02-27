import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@auxarmory/ui/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card';
import { Input } from '@auxarmory/ui/components/ui/input';
import { Label } from '@auxarmory/ui/components/ui/label';

import { FormEvent, useState } from 'react';

import { authClient } from '../lib/auth-client';

export const Route = createFileRoute('/login')({
	component: LoginPage,
});

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		const { error: signInError } = await authClient.signIn.email({
			email,
			password,
		});

		setIsSubmitting(false);

		if (signInError) {
			setError(signInError.message ?? 'Unable to sign in');
			return;
		}

		await navigate({ to: '/me' });
	}

	return (
		<main className='mx-auto max-w-md px-6 py-10'>
			<Card>
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
					<CardDescription>
						Use your Better Auth account to access protected data.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
						</div>

						{error ? (
							<p className='text-sm text-red-400' role='alert'>
								{error}
							</p>
						) : null}

						<Button type='submit' disabled={isSubmitting} className='w-full'>
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
