import type { CalendarResolvedEvent, CalendarTimeFormat } from '../types'
import { cn } from '../../../lib/utils'

function formatEventTime(
	date: Date,
	timeZone?: string,
	timeFormat: CalendarTimeFormat = 'locale',
) {
	return new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit',
		timeZone,
		hour12: timeFormat === 'locale' ? undefined : timeFormat === '12h',
	}).format(date)
}

interface EventChipProps {
	event: CalendarResolvedEvent
	timeZone?: string
	timeFormat?: CalendarTimeFormat
	compact?: boolean
	className?: string
}

export function EventChip({
	event,
	timeZone,
	timeFormat = 'locale',
	compact = false,
	className,
}: EventChipProps) {
	const colorClass = event.color
		? undefined
		: 'border-border bg-muted/60 text-foreground'

	return (
		<div
			className={cn(
				'min-w-0 rounded-none border px-2 py-1 text-xs/5',
				compact ? 'py-0.5' : 'py-1',
				colorClass,
				className,
			)}
			style={
				event.color
					? {
							backgroundColor: `${event.color}22`,
							borderColor: event.color,
							color: event.color,
						}
					: undefined
			}
		>
			<div className='min-w-0 truncate font-medium'>{event.title}</div>
			{event.allDay ? (
				<div className='mt-0.5 text-[10px] text-muted-foreground'>
					All day
				</div>
			) : (
				<div className='mt-0.5 text-[10px] text-muted-foreground'>
					{formatEventTime(event.startDate, timeZone, timeFormat)} -{' '}
					{formatEventTime(event.endDate, timeZone, timeFormat)}
				</div>
			)}
		</div>
	)
}
