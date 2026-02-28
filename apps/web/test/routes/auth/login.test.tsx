import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginPage } from '../../../src/routes/auth/login'

const { navigateMock, signInEmailMock, useSessionMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	signInEmailMock: vi.fn(),
	useSessionMock: vi.fn(),
}))

const mockSearchState = {
	searchStr: '' as string,
}

vi.mock('@tanstack/react-router', () => ({
	createFileRoute: () => (config: unknown) => config,
	Navigate: ({ to }: { to: string }) => <span>Navigate:{to}</span>,
	useNavigate: () => navigateMock,
	useRouterState: () => ({ location: mockSearchState }),
}))

vi.mock('../../../src/lib/auth-client', () => ({
	authClient: {
		useSession: () => useSessionMock(),
		signIn: {
			email: signInEmailMock,
		},
	},
}))

describe('LoginPage', () => {
	beforeEach(() => {
		navigateMock.mockReset()
		signInEmailMock.mockReset()
		useSessionMock.mockReset()
		useSessionMock.mockReturnValue({ data: null, isPending: false })
		mockSearchState.searchStr = ''
	})

	it('redirects authenticated users to /dashboard', () => {
		useSessionMock.mockReturnValue({
			data: { session: { id: 'session-id' } },
			isPending: false,
		})

		render(<LoginPage />)

		expect(screen.getByText('Navigate:/dashboard')).toBeInTheDocument()
	})

	it('submits credentials and navigates to /dashboard on success', async () => {
		signInEmailMock.mockResolvedValue({ error: null })
		navigateMock.mockResolvedValue(undefined)

		render(<LoginPage />)

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		})
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		})
		fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

		await waitFor(() => {
			expect(signInEmailMock).toHaveBeenCalledWith({
				email: 'demo@example.com',
				password: 'Password123!',
			})
		})

		expect(navigateMock).toHaveBeenCalledWith({ to: '/dashboard' })
	})

	it('navigates to callback path after successful login', async () => {
		mockSearchState.searchStr = '?redirect=%2Faccount'
		signInEmailMock.mockResolvedValue({ error: null })
		navigateMock.mockResolvedValue(undefined)

		render(<LoginPage />)

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		})
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		})
		fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

		await waitFor(() => {
			expect(signInEmailMock).toHaveBeenCalled()
		})

		expect(navigateMock).toHaveBeenCalledWith({ to: '/account' })
	})
})
