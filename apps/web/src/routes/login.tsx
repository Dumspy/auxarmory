import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Shield } from 'lucide-react';
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

import type { FormEvent } from 'react';
import { useState } from 'react';

import { authClient } from '../lib/auth-client';

export const Route = createFileRoute('/login')({
	beforeLoad: async () => {
		const session = await authClient.getSession();

		if (session.data?.session) {
			throw redirect({ to: '/' });
		}
	},
	component: LoginPage,
});

export function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		const result =
			mode === 'sign-in'
				? await authClient.signIn.email({
						email,
						password,
					})
				: await authClient.signUp.email({
						email,
						password,
						name,
					});

		setIsSubmitting(false);

		if (result.error) {
			setError(
				result.error.message ??
					(mode === 'sign-in'
						? 'Unable to sign in'
						: 'Unable to create account'),
			);
			return;
		}

		await navigate({ to: '/' });
	}

	return (
		<main className='from-background via-muted/40 to-background flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-10'>
			<div className='w-full max-w-md space-y-4'>
				<div className='text-center'>
					<div className='bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl'>
						<Shield className='text-primary h-6 w-6' />
					</div>
					<h1 className='text-foreground text-2xl font-semibold'>
						Sign in to AuxArmory
					</h1>
					<p className='text-muted-foreground text-sm'>
						Use your Better Auth account to access your dashboard.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>
							{mode === 'sign-in'
								? 'Welcome back'
								: 'Create your account'}
						</CardTitle>
						<CardDescription>
							{mode === 'sign-in'
								? 'Enter your credentials to continue.'
								: 'Create an account to access your dashboard.'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='mb-4 grid grid-cols-2 gap-2'>
							<Button
								type='button'
								variant={
									mode === 'sign-in' ? 'default' : 'outline'
								}
								onClick={() => {
									setMode('sign-in');
									setError(null);
								}}
							>
								Sign in mode
							</Button>
							<Button
								type='button'
								variant={
									mode === 'sign-up' ? 'default' : 'outline'
								}
								onClick={() => {
									setMode('sign-up');
									setError(null);
								}}
							>
								Sign up mode
							</Button>
						</div>

						<form onSubmit={onSubmit} className='space-y-4'>
							{mode === 'sign-up' ? (
								<div className='space-y-2'>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										type='text'
										value={name}
										onChange={(event) =>
											setName(event.target.value)
										}
										required
									/>
								</div>
							) : null}

							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={(event) =>
										setEmail(event.target.value)
									}
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={(event) =>
										setPassword(event.target.value)
									}
									required
								/>
							</div>

							{error ? (
								<p
									className='text-sm text-red-500'
									role='alert'
								>
									{error}
								</p>
							) : null}

							<Button
								type='submit'
								disabled={isSubmitting}
								className='w-full'
							>
								{isSubmitting
									? mode === 'sign-in'
										? 'Signing in...'
										: 'Creating account...'
									: mode === 'sign-in'
										? 'Sign in'
										: 'Create account'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
