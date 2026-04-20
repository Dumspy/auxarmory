import type * as React from 'react'

export type CalendarView = 'year' | 'month' | 'week' | 'day' | 'agenda'

export type CalendarDateInput = Date | string | number

export type CalendarTimeZone = 'local' | 'UTC' | string

export type CalendarTimeFormat = 'locale' | '12h' | '24h'

export interface CalendarEvent {
	id: string
	title: string
	startUtc: CalendarDateInput
	endUtc: CalendarDateInput
	allDay?: boolean
	color?: string
	category?: string
	metadata?: Record<string, unknown>
}

export interface CalendarResolvedEvent extends CalendarEvent {
	startDate: Date
	endDate: Date
}

export interface CalendarVisibleRange {
	start: Date
	end: Date
}

export interface CalendarDayCellRenderProps {
	date: Date
	isOutsideCurrentMonth: boolean
	view: CalendarView
	events: CalendarResolvedEvent[]
	calendarDate: Date
}

export interface CalendarEventRenderProps {
	event: CalendarResolvedEvent
	date: Date
	view: CalendarView
	timeZone: string | undefined
	timeFormat: CalendarTimeFormat
}

export interface CalendarHourLabelRenderProps {
	hour: number
	label: string
	view: CalendarView
	timeFormat: CalendarTimeFormat
}

export interface CalendarMoreEventsRenderProps {
	date: Date
	hiddenCount: number
	view: CalendarView
}

export interface CalendarHeaderRenderProps {
	view: CalendarView
	date: Date
	range: CalendarVisibleRange
	headerLabel: React.ReactNode
	availableViews: CalendarView[]
	canNavigate: boolean
	setView: (view: CalendarView) => void
	goToDate: (date: Date) => void
	next: () => void
	prev: () => void
	today: () => void
}

export interface CalendarSlots {
	renderHeader?: (props: CalendarHeaderRenderProps) => React.ReactNode
	renderDayCell?: (props: CalendarDayCellRenderProps) => React.ReactNode
	renderEvent?: (props: CalendarEventRenderProps) => React.ReactNode
	renderHourLabel?: (props: CalendarHourLabelRenderProps) => React.ReactNode
	renderMoreEvents?: (props: CalendarMoreEventsRenderProps) => React.ReactNode
}

export interface CalendarRootProps {
	events: CalendarEvent[]
	date?: Date
	defaultDate?: Date
	onDateChange?: (date: Date) => void
	view?: CalendarView
	defaultView?: CalendarView
	onViewChange?: (view: CalendarView) => void
	availableViews?: CalendarView[]
	timeZone?: CalendarTimeZone
	timeFormat?: CalendarTimeFormat
	showHeader?: boolean
	headerTitle?: React.ReactNode
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	maxVisibleEventsPerDay?: number
	showOutsideDays?: boolean
	slots?: CalendarSlots
	className?: string
}
