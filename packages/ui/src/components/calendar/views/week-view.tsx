import { Fragment, useMemo } from 'react'
import { differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns'

import { useCalendar } from '../context'
import { EventChip } from '../parts/event-chip'
import { cn } from '../../../lib/utils'
import {
	formatHourLabelForCalendar,
	getDayKey,
	getHourForTimeZone,
	getWeekDays,
	getWeekdayLabels,
	isSameCalendarDay,
} from '../utils'

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MAX_VISIBLE_ALL_DAY_EVENTS = 2

export function WeekView({ className }: { className?: string }) {
	const {
		currentDate,
		visibleEvents,
		timeZone,
		timeFormat,
		weekStartsOn,
		slots,
		view,
		maxVisibleEventsPerDay,
		eventsByDay,
	} = useCalendar()

	const days = getWeekDays(currentDate, weekStartsOn)
	const weekdayLabels = getWeekdayLabels(weekStartsOn)
	const weekStart = days[0]
	const weekEnd = days[days.length - 1]
	const weekEndInclusive = weekEnd ? endOfDay(weekEnd) : undefined

	const allDayEvents = useMemo(() => {
		if (!weekStart || !weekEndInclusive) {
			return []
		}

		return visibleEvents.filter((event) => {
			if (!event.allDay) {
				return false
			}

			return (
				event.startDate <= weekEndInclusive &&
				event.endDate >= weekStart
			)
		})
	}, [visibleEvents, weekEndInclusive, weekStart])
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
				'grid min-h-0 flex-1 grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
				className,
			)}
		>
			<div className='border-r border-b border-border bg-background p-2 text-[11px] text-muted-foreground'>
				Time
			</div>
			{days.map((day, index) => (
				<div
					key={day.toISOString()}
					className='border-r border-b border-border p-2 text-center text-xs font-medium last:border-r-0'
				>
					<div>{weekdayLabels[index]}</div>
					<div
						className={cn(
							'mt-1 text-sm tabular-nums',
							isSameCalendarDay(day, new Date(), timeZone) &&
								'text-primary',
						)}
					>
						{day.getDate()}
					</div>
				</div>
			))}

			{allDayEvents.length > 0 ? (
				<>
					<div className='border-r border-b border-border bg-background px-2 py-2 text-[11px] text-muted-foreground'>
						All day
					</div>
					<div className='col-span-7 border-b border-border p-1'>
						<div className='space-y-1'>
							{visibleAllDayEvents.map((event) => {
								if (!weekStart || !weekEnd) {
									return null
								}

								const start =
									event.startDate > weekStart
										? startOfDay(event.startDate)
										: startOfDay(weekStart)
								const end =
									event.endDate < weekEnd
										? startOfDay(event.endDate)
										: startOfDay(weekEnd)

								const startIndex = Math.max(
									0,
									differenceInCalendarDays(
										start,
										startOfDay(weekStart),
									),
								)
								const endIndex = Math.min(
									6,
									differenceInCalendarDays(
										end,
										startOfDay(weekStart),
									),
								)

								return (
									<div
										key={event.id}
										className='grid grid-cols-7 gap-1'
									>
										<div
											className='min-w-0 rounded-none border px-2 py-1 text-xs/5'
											style={{
												gridColumn: `${startIndex + 1} / ${endIndex + 2}`,
												backgroundColor: event.color
													? `${event.color}22`
													: undefined,
												borderColor: event.color,
												color: event.color,
											}}
										>
											<div className='truncate font-medium'>
												{event.title}
											</div>
										</div>
									</div>
								)
							})}
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
				const hourLabel = formatHourLabelForCalendar(hour, timeFormat)
				return (
					<Fragment key={`row-${hour}`}>
						<div
							key={`hour-${hour}`}
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
						{days.map((day) => {
							const dayEvents =
								eventsByDay.get(getDayKey(day, timeZone)) ?? []
							const hourEvents = dayEvents
								.filter(
									(event) =>
										!event.allDay &&
										getHourForTimeZone(
											event.startDate,
											timeZone,
										) === hour,
								)
								.slice(0, maxVisibleEventsPerDay)

							return (
								<div
									key={`${day.toISOString()}-${hour}`}
									className='border-r border-b border-border p-1 align-top last:border-r-0'
								>
									<div className='flex min-h-12 flex-col gap-1 overflow-hidden [content-visibility:auto]'>
										{hourEvents.map((event) =>
											slots?.renderEvent ? (
												<div
													key={event.id}
													className='min-w-0'
												>
													{slots.renderEvent({
														event,
														date: day,
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
													compact
												/>
											),
										)}
									</div>
								</div>
							)
						})}
					</Fragment>
				)
			})}
		</div>
	)
}
