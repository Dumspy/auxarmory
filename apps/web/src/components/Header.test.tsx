import { fireEvent, render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import Header from './Header';

vi.mock('@tanstack/react-router', () => ({
	Link: ({
		children,
		activeProps: _activeProps,
		...props
	}: PropsWithChildren<
		AnchorHTMLAttributes<HTMLAnchorElement> & { activeProps?: unknown }
	>) => <a {...props}>{children}</a>,
}));

describe('Header', () => {
	it('opens and closes the menu drawer', () => {
		const { container } = render(<Header />);

		const drawer = container.querySelector('aside');
		expect(drawer).not.toBeNull();
		expect(drawer?.className).toContain('-translate-x-full');

		fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
		expect(drawer?.className).toContain('translate-x-0');

		fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
		expect(drawer?.className).toContain('-translate-x-full');
	});
});
