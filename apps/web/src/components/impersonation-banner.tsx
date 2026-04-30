import { useState } from 'react'
import { X, UserX } from 'lucide-react'

import { Button } from '@auxarmory/ui/components/ui/button'

import { authClient } from '../lib/auth-client'

export function ImpersonationBanner() {
	const { data: session } = authClient.useSession()
	const [dismissed, setDismissed] = useState(false)

	const isImpersonating = !!session?.session?.impersonatedBy
	const impersonatedName = session?.user?.name

	if (!isImpersonating || dismissed) {
		return null
	}

	async function handleStopImpersonating() {
		await authClient.admin.stopImpersonating()
		window.location.assign('/dashboard')
	}

	return (
		<div className='flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-amber-950'>
			<div className='flex items-center gap-2 text-sm font-medium'>
				<UserX className='h-4 w-4' />
				<span>
					You are impersonating <strong>{impersonatedName}</strong>
				</span>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					variant='secondary'
					size='sm'
					onClick={() => void handleStopImpersonating()}
				>
					Stop Impersonating
				</Button>
				<Button
					variant='ghost'
					size='sm'
					className='text-amber-950 hover:bg-amber-600 hover:text-amber-950'
					onClick={() => setDismissed(true)}
				>
					<X className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}
