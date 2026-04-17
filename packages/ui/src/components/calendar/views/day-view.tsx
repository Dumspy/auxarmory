import { Fragment } from 'react'
import { addHours, startOfDay } from 'date-fns'

import { useCalendar } from '../context'
import { EventChip } from '../parts/event-chip'
import { cn } from '../../../lib/utils'
import { getDayKey, getHourForTimeZone } from '../utils'

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MAX_VISIBLE_ALL_DAY_EVENTS = 2

function formatHourLabel(
	hour: number,
	timeZone?: string,
	timeFormat: 'locale' | '12h' | '24h' = 'locale',
) {
	const date = addHours(startOfDay(new Date()), hour)
	return new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		timeZone,
		hour12: timeFormat === 'locale' ? undefined : timeFormat === '12h',
	}).format(date)
}

export function DayView({ className }: { className?: string }) {
	const {
		currentDate,
		timeZone,
		timeFormat,
		slots,
		view,
		maxVisibleEventsPerDay,
		eventsByDay,
	} = useCalendar()

	const dayEvents = eventsByDay.get(getDayKey(currentDate, timeZone)) ?? []
	const allDayEvents = dayEvents.filter((event) => event.allDay)
	const visibleAllDayEvents = allDayEvents.slice(
		0,
		MAX_VISIBLE_ALL_DAY_EVENTS,
	)
	const hiddenAllDayEventsCount = Math.max(
		0,
		allDayEvents.length - visibleAllDayEvents.length,
	)

	return (
		<div
			className={cn(
				'grid min-h-0 flex-1 grid-cols-[4rem_minmax(0,1fr)]',
				className,
			)}
		>
			{allDayEvents.length > 0 ? (
				<>
					<div className='border-r border-b border-border bg-background px-2 py-2 text-[11px] text-muted-foreground'>
						All day
					</div>
					<div className='border-b border-border p-1'>
						<div className='space-y-1'>
							{visibleAllDayEvents.map((event) =>
								slots?.renderEvent ? (
									<div key={event.id} className='min-w-0'>
										{slots.renderEvent({
											event,
											date: currentDate,
											view,
											timeZone,
											timeFormat,
										})}
									</div>
								) : (
									<EventChip
										key={event.id}
										event={event}
										timeZone={timeZone}
										timeFormat={timeFormat}
									/>
								),
							)}
							{hiddenAllDayEventsCount > 0 ? (
								<div className='px-1 text-[11px] text-muted-foreground'>
									+{hiddenAllDayEventsCount} more all-day
								</div>
							) : null}
						</div>
					</div>
				</>
			) : null}

			{HOURS.map((hour) => {
				const hourLabel = formatHourLabel(hour, timeZone, timeFormat)
				const hourEvents = dayEvents
					.filter(
						(event) =>
							!event.allDay &&
							getHourForTimeZone(event.startDate, timeZone) ===
								hour,
					)
					.slice(0, maxVisibleEventsPerDay)

				return (
					<Fragment key={`row-${hour}`}>
						<div
							key={`label-${hour}`}
							className='sticky left-0 z-10 border-r border-b border-border bg-background px-2 py-3 text-[11px] text-muted-foreground'
						>
							{slots?.renderHourLabel
								? slots.renderHourLabel({
										hour,
										label: hourLabel,
										view,
										timeFormat,
									})
								: hourLabel}
						</div>
						<div
							key={`cell-${hour}`}
							className='border-b border-border p-2 [content-visibility:auto]'
						>
							<div className='flex min-h-12 flex-col gap-1'>
								{hourEvents.map((event) =>
									slots?.renderEvent ? (
										<div key={event.id} className='min-w-0'>
											{slots.renderEvent({
												event,
												date: currentDate,
												view,
												timeZone,
												timeFormat,
											})}
										</div>
									) : (
										<EventChip
											key={event.id}
											event={event}
											timeZone={timeZone}
											timeFormat={timeFormat}
										/>
									),
								)}
							</div>
						</div>
					</Fragment>
				)
			})}
		</div>
	)
}
