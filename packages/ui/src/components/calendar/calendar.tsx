import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { CalendarProvider, useCalendar } from './context'
import type { CalendarRootProps } from './types'
import { CalendarHeader } from './parts/calendar-header'
import { AgendaView } from './views/agenda-view'
import { DayView } from './views/day-view'
import { MonthView } from './views/month-view'
import { WeekView } from './views/week-view'
import { YearView } from './views/year-view'

function CalendarViewport({ className }: { className?: string }) {
	const { view } = useCalendar()

	if (view === 'year') {
		return <YearView className={className} />
	}

	if (view === 'week') {
		return <WeekView className={className} />
	}

	if (view === 'day') {
		return <DayView className={className} />
	}

	if (view === 'agenda') {
		return <AgendaView className={className} />
	}

	return <MonthView className={className} />
}

function CalendarShell({
	children,
	className,
}: {
	children?: ReactNode
	className?: string
}) {
	return (
		<div
			data-slot='calendar'
			className={cn(
				'flex min-h-[28rem] w-full min-w-0 flex-col overflow-hidden rounded-none border border-border bg-card text-card-foreground',
				className,
			)}
		>
			{children}
		</div>
	)
}

function CalendarRoot({ className, ...props }: CalendarRootProps) {
	return (
		<CalendarProvider {...props}>
			<CalendarShell className={className}>
				{props.showHeader !== false ? <CalendarHeader /> : null}
				<CalendarViewport className='min-h-0 flex-1 overflow-auto' />
			</CalendarShell>
		</CalendarProvider>
	)
}

const Calendar = Object.assign(CalendarRoot, {
	Root: CalendarRoot,
	Header: CalendarHeader,
	Viewport: CalendarViewport,
	Shell: CalendarShell,
	YearView,
	MonthView,
	WeekView,
	DayView,
	AgendaView,
})

export {
	Calendar,
	CalendarRoot,
	CalendarHeader,
	CalendarViewport,
	CalendarShell,
}
