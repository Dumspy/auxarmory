import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from './login';

const { navigateMock, signInEmailMock, signUpEmailMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	signInEmailMock: vi.fn(),
	signUpEmailMock: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
	createFileRoute: () => (config: unknown) => config,
	useNavigate: () => navigateMock,
}));

vi.mock('../lib/auth-client', () => ({
	authClient: {
		signIn: {
			email: signInEmailMock,
		},
		signUp: {
			email: signUpEmailMock,
		},
	},
}));

describe('LoginPage', () => {
	beforeEach(() => {
		navigateMock.mockReset();
		signInEmailMock.mockReset();
		signUpEmailMock.mockReset();
	});

	it('submits credentials and navigates to / on success', async () => {
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

		expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
	});

	it('shows an error when sign in fails', async () => {
		signInEmailMock.mockResolvedValue({
			error: { message: 'Invalid credentials' },
		});

		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'wrong-password' },
		});
		fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Invalid credentials',
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it('supports sign up from the same screen', async () => {
		signUpEmailMock.mockResolvedValue({ error: null });
		navigateMock.mockResolvedValue(undefined);

		render(<LoginPage />);

		fireEvent.click(screen.getByRole('button', { name: /sign up mode/i }));
		fireEvent.change(screen.getByLabelText(/name/i), {
			target: { value: 'Demo User' },
		});
		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'demo@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(
			screen.getByRole('button', { name: /create account/i }),
		);

		await waitFor(() => {
			expect(signUpEmailMock).toHaveBeenCalledWith({
				name: 'Demo User',
				email: 'demo@example.com',
				password: 'Password123!',
			});
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
	});
});
