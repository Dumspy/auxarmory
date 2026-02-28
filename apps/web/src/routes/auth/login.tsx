import type { FormEvent } from 'react'
import { useState } from 'react'
import {
	Navigate,
	createFileRoute,
	useNavigate,
	useRouterState,
} from '@tanstack/react-router'

import { AuthFormCard } from '../../components/auth/auth-form-card'
import { authClient } from '../../lib/auth-client'
import { useAuthPageState } from '../../lib/use-auth-page-state'
import {
	getRedirectFromSearchStr,
	normalizeRedirectPath,
	redirectAuthenticatedUser,
} from '../../lib/require-auth'

export const Route = createFileRoute('/auth/login')({
	beforeLoad: async () => {
		await redirectAuthenticatedUser()
	},
	component: LoginPage,
})

export function LoginPage() {
	const navigate = useNavigate()
	const { location } = useRouterState()
	const { isPending: isSessionPending, isAuthenticated } = useAuthPageState()
	const redirectTo = getRedirectFromSearchStr(location.searchStr)
	const normalizedRedirectTo = normalizeRedirectPath(redirectTo, '/dashboard')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	if (isSessionPending) {
		return null
	}

	if (isAuthenticated) {
		return <Navigate to='/dashboard' />
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null)
		setIsSubmitting(true)

		const result = await authClient.signIn.email({
			email,
			password,
		})

		setIsSubmitting(false)

		if (result.error) {
			setError(result.error.message ?? 'Unable to sign in')
			return
		}

		await navigate({ to: normalizedRedirectTo })
	}

	const safeRedirect = encodeURIComponent(normalizedRedirectTo)

	return (
		<AuthFormCard
			mode='login'
			error={error}
			isSubmitting={isSubmitting}
			onSubmit={onSubmit}
			name=''
			email={email}
			password={password}
			onNameChange={() => undefined}
			onEmailChange={setEmail}
			onPasswordChange={setPassword}
			switchHref={`/auth/signup?redirect=${safeRedirect}`}
			switchLabel='Need an account? Sign up'
		/>
	)
}
