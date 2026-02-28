import { Shield } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import { Input } from '@auxarmory/ui/components/ui/input'
import { Label } from '@auxarmory/ui/components/ui/label'

export function AuthFormCard({
	mode,
	error,
	isSubmitting,
	onSubmit,
	name,
	email,
	password,
	onNameChange,
	onEmailChange,
	onPasswordChange,
	switchHref,
	switchLabel,
}: {
	mode: 'login' | 'signup'
	error: string | null
	isSubmitting: boolean
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	name: string
	email: string
	password: string
	onNameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	switchHref: string
	switchLabel: string
}) {
	const isSignup = mode === 'signup'

	return (
		<main className='from-background via-muted/40 to-background flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-10'>
			<div className='w-full max-w-md space-y-4'>
				<div className='text-center'>
					<div className='bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl'>
						<Shield className='text-primary h-6 w-6' />
					</div>
					<h1 className='text-foreground text-2xl font-semibold'>
						{isSignup
							? 'Create your account'
							: 'Sign in to AuxArmory'}
					</h1>
					<p className='text-muted-foreground text-sm'>
						{isSignup
							? 'Join and start tracking your characters.'
							: 'Use your Better Auth account to access your dashboard.'}
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>
							{isSignup ? 'Sign up' : 'Welcome back'}
						</CardTitle>
						<CardDescription>
							{isSignup
								? 'Create an account to continue.'
								: 'Enter your credentials to continue.'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={onSubmit} className='space-y-4'>
							{isSignup ? (
								<div className='space-y-2'>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										type='text'
										value={name}
										onChange={(event) =>
											onNameChange(event.target.value)
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
										onEmailChange(event.target.value)
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
										onPasswordChange(event.target.value)
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
									? isSignup
										? 'Creating account...'
										: 'Signing in...'
									: isSignup
										? 'Create account'
										: 'Sign in'}
							</Button>
							<Button asChild variant='ghost' className='w-full'>
								<a href={switchHref}>{switchLabel}</a>
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
