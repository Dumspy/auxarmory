import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from '../../../src/routes/auth/login';

const { navigateMock, signInEmailMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	signInEmailMock: vi.fn(),
}));

const mockSearchState = {
	searchStr: '' as string,
};

vi.mock('@tanstack/react-router', () => ({
	createFileRoute: () => (config: unknown) => config,
	useNavigate: () => navigateMock,
	useRouterState: () => ({ location: mockSearchState }),
}));

vi.mock('../../../src/lib/auth-client', () => ({
	authClient: {
		signIn: {
			email: signInEmailMock,
		},
	},
}));

describe('LoginPage', () => {
	beforeEach(() => {
		navigateMock.mockReset();
		signInEmailMock.mockReset();
		mockSearchState.searchStr = '';
	});

	it('submits credentials and navigates to /dashboard on success', async () => {
		signInEmailMock.mockResolvedValue({ error: null });
		navigateMock.mockResolvedValue(undefined);

		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

		await waitFor(() => {
			expect(signInEmailMock).toHaveBeenCalledWith({
				email: 'demo@example.com',
				password: 'Password123!',
			});
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: '/dashboard' });
	});

	it('navigates to callback path after successful login', async () => {
		mockSearchState.searchStr = '?redirect=%2Fabout';
		signInEmailMock.mockResolvedValue({ error: null });
		navigateMock.mockResolvedValue(undefined);

		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

		await waitFor(() => {
			expect(signInEmailMock).toHaveBeenCalled();
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: '/about' });
	});
});
