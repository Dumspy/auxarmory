import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider, useTheme } from '../../src/components/theme-provider'

function ThemeControls() {
	const { setTheme } = useTheme()

	return (
		<div>
			<button type='button' onClick={() => setTheme('dark')}>
				Set dark
			</button>
			<button type='button' onClick={() => setTheme('light')}>
				Set light
			</button>
		</div>
	)
}

describe('ThemeProvider', () => {
	beforeEach(() => {
		window.localStorage.clear()
		document.documentElement.classList.remove('light', 'dark')
	})

	it('applies stored theme from localStorage', async () => {
		window.localStorage.setItem('vite-ui-theme', 'dark')

		render(
			<ThemeProvider>
				<div>content</div>
			</ThemeProvider>,
		)

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('dark')
		})
		expect(document.documentElement).not.toHaveClass('light')
	})

	it('updates theme class and persists when setTheme is called', async () => {
		render(
			<ThemeProvider>
				<ThemeControls />
			</ThemeProvider>,
		)

		fireEvent.click(screen.getByRole('button', { name: /set dark/i }))

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('dark')
		})
		expect(window.localStorage.getItem('vite-ui-theme')).toBe('dark')

		fireEvent.click(screen.getByRole('button', { name: /set light/i }))

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('light')
		})
		expect(document.documentElement).not.toHaveClass('dark')
		expect(window.localStorage.getItem('vite-ui-theme')).toBe('light')
	})

	it('uses system preference and reacts to system theme changes', async () => {
		let prefersDark = true
		let changeHandler: ((event: MediaQueryListEvent) => void) | undefined

		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn(() => ({
				get matches() {
					return prefersDark
				},
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: () => undefined,
				removeListener: () => undefined,
				addEventListener: (_: string, handler: EventListener) => {
					changeHandler = handler as unknown as (
						event: MediaQueryListEvent,
					) => void
				},
				removeEventListener: () => {
					changeHandler = undefined
				},
				dispatchEvent: () => true,
			})),
		})

		render(
			<ThemeProvider defaultTheme='system'>
				<div>content</div>
			</ThemeProvider>,
		)

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('dark')
		})

		prefersDark = false
		changeHandler?.({ matches: false } as MediaQueryListEvent)

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('light')
		})
		expect(document.documentElement).not.toHaveClass('dark')
	})
})
