import type { FormEvent, ReactElement } from 'react'

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
	username,
	email,
	password,
	onUsernameChange,
	onEmailChange,
	onPasswordChange,
	switchRender,
	switchLabel,
}: {
	mode: 'login' | 'signup'
	error: string | null
	isSubmitting: boolean
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	username: string
	email: string
	password: string
	onUsernameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	switchRender: ReactElement
	switchLabel: string
}) {
	const isSignup = mode === 'signup'

	return (
		<main className='relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_97%,white_3%)_0%,var(--background)_100%)] px-4'>
			<div className='bg-primary/15 absolute top-20 left-[-5rem] h-56 w-56 rounded-full blur-3xl' />
			<div className='bg-chart-2/10 absolute right-[-4rem] bottom-12 h-48 w-48 rounded-full blur-3xl' />
			<div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_78%)] opacity-30' />

			<div className='relative mx-auto flex h-screen max-w-5xl items-center justify-center px-4 sm:px-6'>
				<section className='animate-in fade-in slide-in-from-bottom-4 w-full max-w-md text-center duration-700'>
					<div className='mx-auto mb-8 flex justify-center'>
						<img
							src='/Auxera-A.svg'
							alt='AuxArmory logo'
							className='h-20 w-20 sm:h-24 sm:w-24'
						/>
					</div>

					<div className='mb-8 space-y-3'>
						<h1 className='text-foreground text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl'>
							{isSignup ? 'Create your account' : 'Welcome back'}
						</h1>
						<p className='text-muted-foreground mx-auto max-w-sm text-sm leading-6 sm:text-base'>
							{isSignup
								? 'Set up your account and get into AuxArmory.'
								: 'Sign in to continue to your dashboard.'}
						</p>
					</div>

					<Card className='border-border/60 bg-card/85 py-0 shadow-[0_28px_90px_color-mix(in_oklab,var(--foreground)_10%,transparent)] backdrop-blur'>
						<CardHeader className='space-y-2 px-6 pt-6 pb-0 text-left'>
							<CardTitle className='text-lg font-semibold tracking-tight'>
								{isSignup ? 'Account details' : 'Sign in'}
							</CardTitle>
							<CardDescription className='text-sm leading-6'>
								{isSignup
									? 'Use a username, email, and password to get started.'
									: 'Enter your email and password.'}
							</CardDescription>
						</CardHeader>
						<CardContent className='px-6 pt-6 pb-6'>
							<form
								onSubmit={onSubmit}
								className='space-y-4 text-left'
							>
								{isSignup ? (
									<div className='space-y-2'>
										<Label htmlFor='username'>
											Username
										</Label>
										<Input
											id='username'
											type='text'
											value={username}
											onChange={(event) =>
												onUsernameChange(
													event.target.value,
												)
											}
											placeholder='yourname'
											className='h-11 border-border/70 bg-background/80 px-4 text-sm'
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
										placeholder='you@example.com'
										className='h-11 border-border/70 bg-background/80 px-4 text-sm'
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
										placeholder='Enter your password'
										className='h-11 border-border/70 bg-background/80 px-4 text-sm'
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
									className='h-11 w-full text-sm'
								>
									{isSubmitting
										? isSignup
											? 'Creating account...'
											: 'Signing in...'
										: isSignup
											? 'Create account'
											: 'Sign in'}
								</Button>

								<Button
									render={switchRender}
									nativeButton={false}
									variant='ghost'
									className='h-11 w-full text-sm'
								>
									{switchLabel}
								</Button>
							</form>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	)
}
