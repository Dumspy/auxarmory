import { format, isSameMonth } from 'date-fns'

import { useCalendar } from '../context'
import { cn } from '../../../lib/utils'
import { getDayKey, getMonthGridDays, getYearMonths } from '../utils'

export function YearView({ className }: { className?: string }) {
	const { currentDate, weekStartsOn, timeZone, eventsByDay } = useCalendar()
	const months = getYearMonths(currentDate)

	return (
		<div
			className={cn(
				'grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-auto p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
				className,
			)}
		>
			{months.map((monthDate) => {
				const monthDays = getMonthGridDays(monthDate, weekStartsOn)

				return (
					<div
						key={monthDate.toISOString()}
						className='flex min-h-40 min-w-0 flex-col rounded-none border border-border bg-card [content-visibility:auto]'
					>
						<div className='border-b border-border px-2 py-1 text-xs font-medium'>
							{format(monthDate, 'MMMM')}
						</div>
						<div className='grid grid-cols-7 gap-px p-1'>
							{monthDays.map((day) => {
								const dayEvents =
									eventsByDay.get(getDayKey(day, timeZone)) ??
									[]
								const hasEvents = dayEvents.length > 0
								const indicatorColor = dayEvents[0]?.color

								return (
									<div
										key={day.toISOString()}
										title={
											hasEvents
												? `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`
												: undefined
										}
										className={cn(
											'relative flex h-6 items-center justify-center text-[10px] tabular-nums',
											isSameMonth(day, monthDate)
												? 'text-foreground'
												: 'text-muted-foreground',
										)}
									>
										{day.getDate()}
										{hasEvents ? (
											<span
												className='absolute right-0.5 bottom-0.5 size-1 rounded-full bg-primary'
												style={
													indicatorColor
														? {
																backgroundColor:
																	indicatorColor,
															}
														: undefined
												}
											/>
										) : null}
									</div>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
