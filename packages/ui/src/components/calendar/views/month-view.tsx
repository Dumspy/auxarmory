import { isSameMonth } from 'date-fns'

import { useCalendar } from '../context'
import { cn } from '../../../lib/utils'
import {
	getDayKey,
	getMonthGridDays,
	getWeekdayLabels,
	isSameCalendarDay,
} from '../utils'

export function MonthView({ className }: { className?: string }) {
	const {
		currentDate,
		timeZone,
		weekStartsOn,
		maxVisibleEventsPerDay,
		showOutsideDays,
		slots,
		view,
		eventsByDay,
	} = useCalendar()

	const days = getMonthGridDays(currentDate, weekStartsOn)
	const weekdayLabels = getWeekdayLabels(weekStartsOn)

	return (
		<div className={cn('flex min-h-0 flex-1 flex-col', className)}>
			<div className='grid grid-cols-7 border-b border-border'>
				{weekdayLabels.map((label) => (
					<div
						key={label}
						className='border-r border-border px-2 py-1 text-[11px] font-medium text-muted-foreground last:border-r-0'
					>
						{label}
					</div>
				))}
			</div>

			<div className='grid flex-1 grid-cols-7 auto-rows-fr'>
				{days.map((day) => {
					const outsideMonth = !isSameMonth(day, currentDate)
					if (!showOutsideDays && outsideMonth) {
						return (
							<div
								key={day.toISOString()}
								className='border-r border-b border-border/50'
							/>
						)
					}

					const dayEvents =
						eventsByDay.get(getDayKey(day, timeZone)) ?? []
					const visibleDayEvents = dayEvents.slice(
						0,
						maxVisibleEventsPerDay,
					)
					const hiddenCount = Math.max(
						dayEvents.length - visibleDayEvents.length,
						0,
					)

					return (
						<div
							key={day.toISOString()}
							className={cn(
								'flex min-h-28 min-w-0 flex-col gap-1 border-r border-b border-border p-1.5 [content-visibility:auto]',
								outsideMonth &&
									'bg-muted/30 text-muted-foreground',
							)}
						>
							<div
								className={cn(
									'flex h-6 w-6 items-center justify-center rounded-none text-xs tabular-nums',
									isSameCalendarDay(
										day,
										new Date(),
										timeZone,
									) && 'bg-primary text-primary-foreground',
								)}
							>
								{day.getDate()}
							</div>

							{slots?.renderDayCell ? (
								slots.renderDayCell({
									date: day,
									isOutsideCurrentMonth: outsideMonth,
									view,
									events: dayEvents,
									calendarDate: currentDate,
								})
							) : (
								<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
									<div className='flex flex-wrap gap-1'>
										{visibleDayEvents.map((event) => (
											<span
												key={event.id}
												title={event.title}
												className='size-1.5 rounded-full bg-muted-foreground/40'
												style={
													event.color
														? {
																backgroundColor:
																	event.color,
															}
														: undefined
												}
											/>
										))}
									</div>
									{dayEvents.length > 0 ? (
										<div className='mt-1 px-0.5 text-[10px] text-muted-foreground'>
											{dayEvents.length} event
											{dayEvents.length === 1 ? '' : 's'}
										</div>
									) : null}
									{hiddenCount > 0 &&
										(slots?.renderMoreEvents ? (
											slots.renderMoreEvents({
												date: day,
												hiddenCount,
												view,
											})
										) : (
											<div className='px-1 text-[11px] text-muted-foreground'>
												+{hiddenCount} more
											</div>
										))}
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
