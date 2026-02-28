import { Check, Laptop, Moon, Sun } from 'lucide-react'

import {
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@auxarmory/ui/components/ui/dropdown-menu'

import { useTheme } from './theme-provider'

const themeDisplayName = {
	light: 'Light',
	dark: 'Dark',
	system: 'System',
} as const

export function ModeToggle() {
	const { theme, setTheme } = useTheme()

	return (
		<>
			<DropdownMenuSeparator />
			<DropdownMenuSub>
				<DropdownMenuSubTrigger>
					{theme === 'dark' ? <Moon /> : null}
					{theme === 'light' ? <Sun /> : null}
					{theme === 'system' ? <Laptop /> : null}
					Theme
					<span className='ml-auto text-xs text-muted-foreground'>
						{themeDisplayName[theme]}
					</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuItem onClick={() => setTheme('light')}>
						<Sun />
						Light
						{theme === 'light' ? (
							<Check className='ml-auto' />
						) : null}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('dark')}>
						<Moon />
						Dark
						{theme === 'dark' ? (
							<Check className='ml-auto' />
						) : null}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('system')}>
						<Laptop />
						System
						{theme === 'system' ? (
							<Check className='ml-auto' />
						) : null}
					</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		</>
	)
}
