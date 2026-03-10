import { ArrowRight } from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@auxarmory/ui/components/ui/button'

import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({
	component: HomePage,
})

function HomePage() {
	const { data: session } = authClient.useSession()
	const isLoggedIn = Boolean(session?.session)

	return (
		<main className='relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_97%,white_3%)_0%,var(--background)_100%)]'>
			<div className='bg-primary/15 absolute top-20 left-[-5rem] h-56 w-56 rounded-full blur-3xl' />
			<div className='bg-chart-2/10 absolute right-[-4rem] bottom-12 h-48 w-48 rounded-full blur-3xl' />
			<div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_78%)] opacity-30' />

			<div className='relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12 sm:px-6'>
				<section className='animate-in fade-in slide-in-from-bottom-4 w-full max-w-3xl text-center duration-700'>
					<div className='mx-auto mb-8 flex justify-center'>
						<img
							src='/Auxera-A.svg'
							alt='AuxArmory logo'
							className='h-24 w-24 sm:h-28 sm:w-28'
						/>
					</div>

					<div className='space-y-4'>
						<h1 className='text-foreground text-5xl leading-none font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl'>
							AuxArmory
						</h1>
						<p className='text-muted-foreground mx-auto max-w-2xl text-base leading-7 sm:text-lg'>
							Built for teams that want clearer signals before
							launch day.
						</p>
					</div>

					<div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
						{isLoggedIn ? (
							<Button
								render={<Link to='/dashboard' search={{}} />}
								nativeButton={false}
								size='lg'
							>
								Go to dashboard
								<ArrowRight className='ml-1 h-4 w-4' />
							</Button>
						) : (
							<>
								<Button
									render={
										<Link to='/auth/signup' search={{}} />
									}
									nativeButton={false}
									size='lg'
								>
									Create account
									<ArrowRight className='ml-1 h-4 w-4' />
								</Button>
								<Button
									render={
										<Link to='/dashboard' search={{}} />
									}
									nativeButton={false}
									size='lg'
									variant='outline'
								>
									Go to dashboard
								</Button>
							</>
						)}
					</div>
				</section>
			</div>
		</main>
	)
}
