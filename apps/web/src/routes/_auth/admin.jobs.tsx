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

import { ensurePermissionOrRedirect } from '../../lib/route-auth'
import { useTRPC } from '../../lib/trpc'

const PAGE_SIZE = 20

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
	const [status, setStatus] = useState<
		'waiting' | 'active' | 'delayed' | 'failed' | 'completed'
	>('waiting')
	const [offset, setOffset] = useState(0)
	const [jobName, setJobName] = useState('')
	const [payloadInput, setPayloadInput] = useState('{}')

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
				<h1 className='text-foreground text-2xl font-bold'>
					Admin Jobs
				</h1>
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
							className='bg-background h-9 w-full rounded-md border px-2 text-sm'
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
							className='bg-background min-h-40 w-full rounded-md border p-3 text-sm font-mono'
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
						overviewQuery.data.schedulers.map((scheduler) => (
							<div
								key={scheduler.id}
								className='flex items-center justify-between rounded-md border p-2 text-sm'
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
								<Badge variant='outline'>
									next: {scheduler.next ?? 'n/a'}
								</Badge>
							</div>
						))
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
					<div className='flex gap-2'>
						<select
							className='bg-background h-9 rounded-md border px-2 text-sm'
							value={status}
							onChange={(event) => {
								setOffset(0)
								setStatus(
									event.target.value as
										| 'waiting'
										| 'active'
										| 'delayed'
										| 'failed'
										| 'completed',
								)
							}}
						>
							<option value='waiting'>waiting</option>
							<option value='active'>active</option>
							<option value='delayed'>delayed</option>
							<option value='failed'>failed</option>
							<option value='completed'>completed</option>
						</select>
					</div>

					{jobs.map((job) => (
						<div
							key={job.id}
							className='flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between'
						>
							<div className='min-w-0'>
								<p className='truncate text-sm font-medium'>
									{job.name}
								</p>
								<p className='text-muted-foreground truncate text-xs'>
									id: {job.id}
								</p>
							</div>

							<div className='flex items-center gap-2'>
								<Badge variant='outline'>{job.status}</Badge>
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
