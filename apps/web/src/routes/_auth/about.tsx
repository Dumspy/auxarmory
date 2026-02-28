import { createFileRoute } from '@tanstack/react-router';

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@auxarmory/ui/components/ui/tabs';

export const Route = createFileRoute('/_auth/about')({
	component: About,
});

function About() {
	return (
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
	);
}
