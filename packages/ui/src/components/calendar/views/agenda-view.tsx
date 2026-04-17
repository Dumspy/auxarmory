import { format, startOfDay } from 'date-fns'

import { useCalendar } from '../context'
import { EventChip } from '../parts/event-chip'
import { cn } from '../../../lib/utils'

function groupKey(date: Date, timeZone?: string): string {
	if (!timeZone) {
		return format(startOfDay(date), 'yyyy-MM-dd')
	}

	return new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date)
}

function formatDayLabel(date: Date, timeZone?: string): string {
	if (!timeZone) {
		return format(date, 'EEE, d MMM yyyy')
	}

	return new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone,
	}).format(date)
}

export function AgendaView({ className }: { className?: string }) {
	const { visibleEvents, slots, timeZone, timeFormat, view } = useCalendar()

	const upcoming = visibleEvents
		.filter((event) => event.endDate >= new Date())
		.sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf())

	const grouped = new Map<string, typeof upcoming>()
	for (const event of upcoming) {
		const key = groupKey(event.startDate, timeZone)
		const existing = grouped.get(key)
		if (existing) {
			existing.push(event)
		} else {
			grouped.set(key, [event])
		}
	}

	return (
		<div className={cn('min-h-0 flex-1 overflow-auto', className)}>
			{grouped.size === 0 ? (
				<div className='p-4 text-sm text-muted-foreground'>
					No upcoming events.
				</div>
			) : (
				<div className='divide-y divide-border'>
					{Array.from(grouped.entries()).map(([key, events]) => {
						const day = events[0]?.startDate
						if (!day) {
							return null
						}

						return (
							<section
								key={key}
								className='grid grid-cols-[10rem_minmax(0,1fr)]'
							>
								<div className='border-r border-border px-3 py-3 text-xs font-medium text-muted-foreground'>
									{formatDayLabel(day, timeZone)}
								</div>
								<div className='space-y-2 px-3 py-3'>
									{events.map((event) =>
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
											/>
										),
									)}
								</div>
							</section>
						)
					})}
				</div>
			)}
		</div>
	)
}
