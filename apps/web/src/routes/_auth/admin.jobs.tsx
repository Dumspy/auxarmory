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
import { Tabs, TabsList, TabsTrigger } from '@auxarmory/ui/components/ui/tabs'

import { ensurePermissionOrRedirect } from '../../lib/route-auth'
import { useTRPC } from '../../lib/trpc'

const PAGE_SIZE = 20
const JOB_STATUSES = [
	'waiting',
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

export const Route = createFileRoute('/_auth/admin/jobs' as never)({
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
			jobName: jobName.length > 0 ? (jobName as never) : undefined,
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
			name: jobName as never,
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

			<div className='grid grid-cols-2 gap-3 md:grid-cols-5'>
				{[
					{ label: 'Waiting', value: counts?.waiting ?? 0 },
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
						<select
							className='dark:bg-input/30 border-input h-8 w-full rounded-none border bg-transparent px-2.5 text-xs'
							value={jobName}
							onChange={(event) =>
								handleDefinitionChange(event.target.value)
							}
						>
							<option value=''>Select a job</option>
							{definitionsQuery.data?.jobs.map((job) => (
								<option key={job.name} value={job.name}>
									{job.name}
								</option>
							))}
						</select>

						<textarea
							className='dark:bg-input/30 border-input min-h-40 w-full rounded-none border bg-transparent p-2.5 font-mono text-xs'
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
								<div
									key={scheduler.id}
									className='flex items-center justify-between rounded-none border p-2 text-xs'
								>
									<div>
										<p className='font-medium'>
											{scheduler.name}
										</p>
										<p className='text-muted-foreground text-xs'>
											{scheduler.pattern
												? scheduler.pattern
												: `every ${Math.round((scheduler.every ?? 0) / 1000)}s`}
										</p>
									</div>
									<Badge
										variant='outline'
										title={nextRun.title}
									>
										next: {nextRun.label}
									</Badge>
								</div>
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
						<TabsList className='grid w-full grid-cols-2 sm:grid-cols-5'>
							{JOB_STATUSES.map((item) => (
								<TabsTrigger key={item} value={item}>
									{item[0]?.toUpperCase()}
									{item.slice(1)}
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
						<div
							key={job.id}
							className='space-y-3 rounded-none border p-3'
						>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
								<div className='min-w-0'>
									<p className='truncate text-sm font-medium'>
										{job.name}
									</p>
									<p className='text-muted-foreground truncate text-xs'>
										id: {job.id}
									</p>
								</div>

								<div className='flex items-center gap-2'>
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
								</div>
							</div>

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
									<pre className='bg-background max-h-48 overflow-auto rounded-none border p-2 font-mono text-xs'>
										{JSON.stringify(job.data, null, 2)}
									</pre>
								</div>
							) : null}
						</div>
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
