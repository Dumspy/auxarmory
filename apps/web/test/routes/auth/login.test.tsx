import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginPage } from '../../../src/routes/auth/login'

const { assignMock, signInEmailMock, useSessionMock } = vi.hoisted(() => ({
	assignMock: vi.fn(),
	signInEmailMock: vi.fn(),
	useSessionMock: vi.fn(),
}))

const mockSearchState = {
	searchStr: '' as string,
}

vi.mock('@tanstack/react-router', () => ({
	createFileRoute: () => (config: unknown) => config,
	Navigate: ({ to }: { to: string }) => <span>Navigate:{to}</span>,
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
		assignMock.mockReset()
		signInEmailMock.mockReset()
		useSessionMock.mockReset()
		useSessionMock.mockReturnValue({ data: null, isPending: false })
		mockSearchState.searchStr = ''
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: {
				assign: assignMock,
			},
		})
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

		expect(assignMock).toHaveBeenCalledWith('/dashboard')
	})

	it('navigates to callback path after successful login', async () => {
		mockSearchState.searchStr = '?redirect=%2Faccount'
		signInEmailMock.mockResolvedValue({ error: null })

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

		expect(assignMock).toHaveBeenCalledWith('/account')
	})
})
