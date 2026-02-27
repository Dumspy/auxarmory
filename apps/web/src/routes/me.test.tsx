import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MePage } from './me';

const { useQueryMock, signOutMock, queryClientClearMock, navigateMock } =
	vi.hoisted(() => ({
		useQueryMock: vi.fn(),
		signOutMock: vi.fn(),
		queryClientClearMock: vi.fn(),
		navigateMock: vi.fn(),
	}));

vi.mock('@tanstack/react-router', () => ({
	createFileRoute: () => (config: unknown) => config,
	useNavigate: () => navigateMock,
	Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<a {...props}>{children}</a>
	),
}));

vi.mock('@tanstack/react-query', () => ({
	useQuery: (...args: unknown[]) => useQueryMock(...args),
	useQueryClient: () => ({
		clear: queryClientClearMock,
	}),
}));

vi.mock('../lib/trpc', () => ({
	useTRPC: () => ({
		privateData: {
			queryOptions: () => ({}),
		},
	}),
}));

vi.mock('../lib/auth-client', () => ({
	authClient: {
		signOut: signOutMock,
	},
}));

describe('MePage', () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		signOutMock.mockReset();
		queryClientClearMock.mockReset();
		navigateMock.mockReset();
		signOutMock.mockResolvedValue(undefined);
		navigateMock.mockResolvedValue(undefined);
	});

	it('renders user information from protected query', async () => {
		useQueryMock.mockReturnValue({
			isLoading: false,
			error: null,
			data: {
				user: {
					name: 'Demo User',
					email: 'demo@example.com',
				},
			},
		});

		render(<MePage />);

		expect(screen.getByText(/Protected route/i)).toBeInTheDocument();
		expect(screen.getByText('Demo User')).toBeInTheDocument();
		expect(screen.getByText('demo@example.com')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

		await waitFor(() => {
			expect(signOutMock).toHaveBeenCalled();
			expect(queryClientClearMock).toHaveBeenCalled();
			expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
		});
	});
});
