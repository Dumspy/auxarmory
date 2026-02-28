import type { ComponentProps } from 'react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@auxarmory/ui/components/ui/sidebar'

import { CharacterSwitcher } from './character-switcher'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

const characters = [
	{
		name: 'Dispy',
		logo: GalleryVerticalEnd,
		className: 'Paladin',
	},
	{
		name: 'Knap',
		logo: AudioWaveform,
		className: 'Death Knight',
	},
	{
		name: 'Anymus',
		logo: Command,
		className: 'Druid',
	},
]

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<CharacterSwitcher characters={characters} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
