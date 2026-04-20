import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { useCalendar } from '../context'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'

function toLabel(view: string) {
	return `${view.slice(0, 1).toUpperCase()}${view.slice(1)}`
}

export function CalendarHeader({ className }: { className?: string }) {
	const {
		view,
		setView,
		rangeLabel,
		prev,
		next,
		today,
		slots,
		range,
		currentDate,
		goToDate,
		availableViews,
		headerTitle,
	} = useCalendar()

	const headerLabel = headerTitle ?? rangeLabel
	const disableNavigation = view === 'agenda'

	if (slots?.renderHeader) {
		return slots.renderHeader({
			view,
			date: currentDate,
			range,
			headerLabel,
			availableViews,
			canNavigate: !disableNavigation,
			setView,
			goToDate,
			next,
			prev,
			today,
		})
	}

	return (
		<div
			className={cn(
				'flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2',
				className,
			)}
		>
			<div className='flex items-center gap-1'>
				<Button
					variant='outline'
					size='icon-sm'
					onClick={prev}
					disabled={disableNavigation}
					aria-label='Previous period'
				>
					<ChevronLeftIcon />
				</Button>
				<Button
					variant='outline'
					size='icon-sm'
					onClick={next}
					disabled={disableNavigation}
					aria-label='Next period'
				>
					<ChevronRightIcon />
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={today}
					disabled={disableNavigation}
				>
					Today
				</Button>
			</div>

			<div className='text-sm font-medium text-foreground text-pretty'>
				{headerLabel}
			</div>

			{availableViews.length > 1 ? (
				<div className='inline-flex rounded-none border border-border bg-background p-0.5'>
					{availableViews.map((option) => (
						<Button
							key={option}
							variant={option === view ? 'default' : 'ghost'}
							size='sm'
							onClick={() => setView(option)}
							className='h-7 rounded-none px-2'
						>
							{toLabel(option)}
						</Button>
					))}
				</div>
			) : null}
		</div>
	)
}
