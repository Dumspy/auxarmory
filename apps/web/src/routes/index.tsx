import { createFileRoute, Link } from '@tanstack/react-router';

import { Button } from '@auxarmory/ui/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card';

export const Route = createFileRoute('/')({
	component: HomePage,
});

function HomePage() {
	return (
		<main className='from-background via-muted/40 to-background flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-10'>
			<Card className='w-full max-w-xl'>
				<CardHeader>
					<CardTitle className='text-2xl'>AuxArmory</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<p className='text-muted-foreground text-sm'>
						Track your characters, vault progress, and weekly goals.
					</p>
					<div className='flex flex-wrap gap-2'>
						<Button asChild>
							<Link to='/dashboard'>Go to dashboard</Link>
						</Button>
						<Button asChild variant='outline'>
							<Link to='/auth/login'>Log in</Link>
						</Button>
						<Button asChild variant='outline'>
							<Link to='/auth/signup'>Sign up</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
