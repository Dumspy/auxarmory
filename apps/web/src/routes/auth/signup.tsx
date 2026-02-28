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

export const Route = createFileRoute('/auth/signup')({
	beforeLoad: async () => {
		await redirectAuthenticatedUser()
	},
	component: SignupPage,
})

function SignupPage() {
	const navigate = useNavigate()
	const { location } = useRouterState()
	const { isPending: isSessionPending, isAuthenticated } = useAuthPageState()
	const redirectTo = getRedirectFromSearchStr(location.searchStr)
	const normalizedRedirectTo = normalizeRedirectPath(redirectTo, '/dashboard')
	const [name, setName] = useState('')
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

		const result = await authClient.signUp.email({
			name,
			email,
			password,
		})

		setIsSubmitting(false)

		if (result.error) {
			setError(result.error.message ?? 'Unable to create account')
			return
		}

		await navigate({ to: normalizedRedirectTo })
	}

	const safeRedirect = encodeURIComponent(normalizedRedirectTo)

	return (
		<AuthFormCard
			mode='signup'
			error={error}
			isSubmitting={isSubmitting}
			onSubmit={onSubmit}
			name={name}
			email={email}
			password={password}
			onNameChange={setName}
			onEmailChange={setEmail}
			onPasswordChange={setPassword}
			switchHref={`/auth/login?redirect=${safeRedirect}`}
			switchLabel='Already have an account? Log in'
		/>
	)
}
