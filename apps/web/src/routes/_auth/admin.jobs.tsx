import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { platformPermissions } from '@auxarmory/auth/permissions'
import { Badge } from '@auxarmory/ui/components/ui/badge'
import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemHeader,
} from '@auxarmory/ui/components/ui/item'
import {
	NativeSelect,
	NativeSelectOption,
} from '@auxarmory/ui/components/ui/native-select'
import { Tabs, TabsList, TabsTrigger } from '@auxarmory/ui/components/ui/tabs'
import { Textarea } from '@auxarmory/ui/components/ui/textarea'

import { ensurePermissionOrRedirect } from '../../lib/route-auth'
import { useTRPC } from '../../lib/trpc'

const PAGE_SIZE = 20
const JOB_STATUSES = [
	'waiting',
	'waiting-children',
	'active',
	'delayed',
	'failed',
	'completed',
] as const

type JobStatus = (typeof JOB_STATUSES)[number]

const nextRunDateFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
})

const nextRunRelativeFormatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto',
})

function formatSchedulerNextRun(next: number | null | undefined) {
	if (next == null) {
		return { label: 'n/a', title: 'No next run scheduled' }
	}

	const date = new Date(next)
	if (Number.isNaN(date.getTime())) {
		return { label: 'n/a', title: 'Invalid next run time' }
	}

	const diffMinutes = Math.round((date.getTime() - Date.now()) / 60_000)
	const absDiffMinutes = Math.abs(diffMinutes)

	const relativeLabel =
		absDiffMinutes < 60
			? nextRunRelativeFormatter.format(diffMinutes, 'minute')
			: absDiffMinutes < 1_440
				? nextRunRelativeFormatter.format(
						Math.round(diffMinutes / 60),
						'hour',
					)
				: nextRunRelativeFormatter.format(
						Math.round(diffMinutes / 1_440),
						'day',
					)

	return {
		label: `${relativeLabel} (${nextRunDateFormatter.format(date)})`,
		title: date.toLocaleString(),
	}
}

function formatJobTimestamp(timestamp: number | null | undefined) {
	if (timestamp == null) {
		return 'n/a'
	}

	const date = new Date(timestamp)
	if (Number.isNaN(date.getTime())) {
		return 'n/a'
	}

	return date.toLocaleString()
}

function formatJobStatusLabel(status: string) {
	return status
		.split('-')
		.map((part) =>
			part.length > 0
				? `${part[0]?.toUpperCase()}${part.slice(1)}`
				: part,
		)
		.join(' ')
}

function WaitingChildrenDependencyDetails({
	jobId,
	enabled,
}: {
	jobId: string
	enabled: boolean
}) {
	const trpc = useTRPC()
	const dependenciesQuery = useQuery(
		trpc.admin.jobs.dependencies.queryOptions(
			{ jobId },
			{
				enabled,
				refetchInterval: enabled ? 5_000 : false,
			},
		),
	)

	if (!enabled) {
		return null
	}

	if (dependenciesQuery.isLoading) {
		return <p className='text-muted-foreground'>loading dependencies...</p>
	}

	if (dependenciesQuery.isError) {
		return (
			<p className='text-destructive'>
				unable to load dependency details:{' '}
				{dependenciesQuery.error.message}
			</p>
		)
	}

	const details = dependenciesQuery.data
	if (!details) {
		return null
	}

	return (
		<div className='space-y-2 border-t border-dashed pt-2'>
			<p>
				dependencies: processed {details.counts.processed} | unprocessed{' '}
				{details.counts.unprocessed} | failed {details.counts.failed} |
				ignored {details.counts.ignored}
			</p>
			{details.waitingOn.length > 0 ? (
				<div className='space-y-2'>
					<p>waiting on {details.waitingOn.length} child jobs:</p>
					{details.waitingOn.map((child) => (
						<div
							key={child.id}
							className='space-y-1 border border-dashed p-2'
						>
							<p>
								{child.name} | id: {child.id}
							</p>
							<p>
								status: {formatJobStatusLabel(child.state)} |
								attempts: {child.attemptsMade}
							</p>
							<p>queued: {formatJobTimestamp(child.timestamp)}</p>
							{child.processedOn ? (
								<p>
									started:{' '}
									{formatJobTimestamp(child.processedOn)}
								</p>
							) : null}
							{child.finishedOn ? (
								<p>
									finished:{' '}
									{formatJobTimestamp(child.finishedOn)}
								</p>
							) : null}
							{child.failedReason ? (
								<p className='text-destructive'>
									failure: {child.failedReason}
								</p>
							) : null}
						</div>
					))}
				</div>
			) : (
				<p className='text-muted-foreground'>
					no unresolved child jobs found.
				</p>
			)}
		</div>
	)
}

export const Route = createFileRoute('/_auth/admin/jobs')({
	beforeLoad: async ({ context }) => {
		const queryClient = (context as { queryClient: QueryClient })
			.queryClient

		await ensurePermissionOrRedirect({
			queryClient,
			permission: platformPermissions.adminJobsRead,
		})
	},
	component: AdminJobsPage,
})

function AdminJobsPage() {
	const trpc = useTRPC()
	const [status, setStatus] = useState<JobStatus>('waiting')
	const [offset, setOffset] = useState(0)
	const [jobName, setJobName] = useState('')
	const [payloadInput, setPayloadInput] = useState('{}')
	const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

	const listInput = useMemo(
		() => ({
			status,
			limit: PAGE_SIZE,
			offset,
			jobName: jobName.length > 0 ? jobName : undefined,
		}),
		[status, offset, jobName],
	)

	const overviewQuery = useQuery(
		trpc.admin.jobs.overview.queryOptions(undefined, {
			refetchInterval: 5_000,
		}),
	)
	const definitionsQuery = useQuery(
		trpc.admin.jobs.definitions.queryOptions(),
	)
	const listQuery = useQuery(
		trpc.admin.jobs.list.queryOptions(listInput, {
			refetchInterval: 5_000,
		}),
	)

	const enqueueMutation = useMutation(
		trpc.admin.jobs.enqueue.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					overviewQuery.refetch(),
					listQuery.refetch(),
				])
			},
		}),
	)

	const retryMutation = useMutation(
		trpc.admin.jobs.retry.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					overviewQuery.refetch(),
					listQuery.refetch(),
				])
			},
		}),
	)

	function handleDefinitionChange(nextName: string) {
		setJobName(nextName)
		const definition = definitionsQuery.data?.jobs.find(
			(item) => item.name === nextName,
		)
		if (definition) {
			setPayloadInput(JSON.stringify(definition.examplePayload, null, 2))
		}
	}

	async function handleEnqueue(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!jobName) {
			return
		}

		let parsedPayload: unknown
		try {
			parsedPayload = JSON.parse(payloadInput)
		} catch {
			return
		}

		await enqueueMutation.mutateAsync({
			name: jobName,
			payload: parsedPayload,
			priority: 'STANDARD',
		})
	}

	const counts = overviewQuery.data?.counts
	const jobs = listQuery.data?.items ?? []
	const hasNextPage = listQuery.data?.nextOffset != null

	return (
		<div className='space-y-6 p-2 md:p-4'>
			<div>
				<h1 className='text-foreground text-2xl font-bold'>Jobs</h1>
				<p className='text-muted-foreground'>
					Monitor queue activity, run jobs on demand, and inspect
					recurring schedules.
				</p>
			</div>

			<div className='grid grid-cols-2 gap-3 md:grid-cols-6'>
				{[
					{ label: 'Waiting', value: counts?.waiting ?? 0 },
					{
						label: 'Waiting Children',
						value: counts?.['waiting-children'] ?? 0,
					},
					{ label: 'Active', value: counts?.active ?? 0 },
					{ label: 'Delayed', value: counts?.delayed ?? 0 },
					{ label: 'Failed', value: counts?.failed ?? 0 },
					{ label: 'Completed', value: counts?.completed ?? 0 },
				].map((item) => (
					<Card key={item.label}>
						<CardHeader className='pb-2'>
							<CardDescription>{item.label}</CardDescription>
							<CardTitle className='text-2xl'>
								{item.value}
							</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Run Job Now</CardTitle>
					<CardDescription>
						Use a typed job definition and provide payload JSON.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className='space-y-3' onSubmit={handleEnqueue}>
						<NativeSelect
							className='w-full'
							value={jobName}
							onChange={(event) =>
								handleDefinitionChange(event.target.value)
							}
						>
							<NativeSelectOption value=''>
								Select a job
							</NativeSelectOption>
							{definitionsQuery.data?.jobs.map((job) => (
								<NativeSelectOption
									key={job.name}
									value={job.name}
								>
									{job.name}
								</NativeSelectOption>
							))}
						</NativeSelect>

						<Textarea
							className='min-h-40 font-mono'
							value={payloadInput}
							onChange={(event) =>
								setPayloadInput(event.target.value)
							}
						/>

						{enqueueMutation.isError ? (
							<p className='text-destructive text-sm'>
								Unable to enqueue job:{' '}
								{enqueueMutation.error.message}
							</p>
						) : null}

						<div className='flex justify-end'>
							<Button
								type='submit'
								disabled={enqueueMutation.isPending || !jobName}
							>
								{enqueueMutation.isPending
									? 'Enqueuing...'
									: 'Run job'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recurring Schedules</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2'>
					{overviewQuery.data?.schedulers.length ? (
						overviewQuery.data.schedulers.map((scheduler) => {
							const nextRun = formatSchedulerNextRun(
								scheduler.next,
							)

							return (
								<Item
									key={scheduler.id}
									variant='outline'
									size='xs'
									className='justify-between'
								>
									<ItemContent>
										<p className='font-medium'>
											{scheduler.name}
										</p>
										<p className='text-muted-foreground text-xs'>
											{scheduler.pattern
												? scheduler.pattern
												: `every ${Math.round((scheduler.every ?? 0) / 1000)}s`}
										</p>
									</ItemContent>
									<ItemActions className='justify-end'>
										<Badge
											variant='outline'
											title={nextRun.title}
										>
											next: {nextRun.label}
										</Badge>
									</ItemActions>
								</Item>
							)
						})
					) : (
						<p className='text-muted-foreground text-sm'>
							No recurring schedulers found.
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recent Jobs</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<Tabs
						value={status}
						onValueChange={(value) => {
							setOffset(0)
							setExpandedJobId(null)
							setStatus(value as JobStatus)
						}}
					>
						<TabsList className='grid w-full grid-cols-2 sm:grid-cols-6'>
							{JOB_STATUSES.map((item) => (
								<TabsTrigger key={item} value={item}>
									{formatJobStatusLabel(item)}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>

					{jobs.length === 0 ? (
						<p className='text-muted-foreground text-sm'>
							No jobs in this status.
						</p>
					) : null}

					{jobs.map((job) => (
						<Item
							key={job.id}
							variant='outline'
							className='flex-col items-stretch gap-3'
						>
							<ItemHeader className='flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
								<ItemContent className='min-w-0'>
									<p className='truncate text-sm font-medium'>
										{job.name}
									</p>
									<p className='text-muted-foreground truncate text-xs'>
										id: {job.id}
									</p>
								</ItemContent>

								<ItemActions className='w-full justify-start sm:w-auto sm:justify-end'>
									<Button
										variant='outline'
										onClick={() =>
											setExpandedJobId((current) =>
												current === job.id
													? null
													: job.id,
											)
										}
									>
										{expandedJobId === job.id
											? 'Hide details'
											: 'Show details'}
									</Button>
									{status === 'failed' ? (
										<Button
											variant='outline'
											disabled={retryMutation.isPending}
											onClick={() =>
												void retryMutation.mutateAsync({
													jobId: job.id,
												})
											}
										>
											Retry
										</Button>
									) : null}
								</ItemActions>
							</ItemHeader>

							{expandedJobId === job.id ? (
								<div className='bg-muted/30 space-y-2 rounded-none border border-dashed p-3 text-xs'>
									<p>
										attempts: {job.attemptsMade} | priority:{' '}
										{job.priority ?? 'n/a'}
									</p>
									<p>
										queued:{' '}
										{formatJobTimestamp(job.timestamp)}
									</p>
									<p>
										started:{' '}
										{formatJobTimestamp(job.processedOn)}
									</p>
									<p>
										finished:{' '}
										{formatJobTimestamp(job.finishedOn)}
									</p>
									{job.failedReason ? (
										<p className='text-destructive'>
											failure: {job.failedReason}
										</p>
									) : null}
									<Textarea
										readOnly
										value={JSON.stringify(
											job.data,
											null,
											2,
										)}
										className='min-h-40 max-h-48 overflow-auto font-mono'
									/>
									<WaitingChildrenDependencyDetails
										jobId={job.id}
										enabled={status === 'waiting-children'}
									/>
								</div>
							) : null}
						</Item>
					))}

					<div className='flex items-center justify-end gap-2'>
						<Button
							variant='outline'
							disabled={offset === 0 || listQuery.isFetching}
							onClick={() =>
								setOffset((current) =>
									Math.max(0, current - PAGE_SIZE),
								)
							}
						>
							Previous
						</Button>
						<Button
							variant='outline'
							disabled={!hasNextPage || listQuery.isFetching}
							onClick={() =>
								setOffset((current) => current + PAGE_SIZE)
							}
						>
							Next
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
