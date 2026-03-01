import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
	children: ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

interface ThemeProviderState {
	theme: Theme
	setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
	undefined,
)

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === 'undefined') {
			return defaultTheme
		}

		const storedTheme = window.localStorage.getItem(
			storageKey,
		) as Theme | null
		return storedTheme ?? defaultTheme
	})

	useEffect(() => {
		const root = window.document.documentElement

		const applyTheme = () => {
			root.classList.remove('light', 'dark')

			if (theme === 'system') {
				const systemTheme = window.matchMedia(
					'(prefers-color-scheme: dark)',
				).matches
					? 'dark'
					: 'light'
				root.classList.add(systemTheme)
				return
			}

			root.classList.add(theme)
		}

		applyTheme()

		if (theme !== 'system') {
			return
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => applyTheme()
		mediaQuery.addEventListener('change', handleChange)

		return () => {
			mediaQuery.removeEventListener('change', handleChange)
		}
	}, [theme])

	const value = useMemo(
		() => ({
			theme,
			setTheme: (nextTheme: Theme) => {
				window.localStorage.setItem(storageKey, nextTheme)
				setTheme(nextTheme)
			},
		}),
		[theme, storageKey],
	)

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}

	return context
}
