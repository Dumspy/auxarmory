import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
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
import { Input } from '@auxarmory/ui/components/ui/input'

import { ensurePermissionOrRedirect } from '../../lib/route-auth'
import { useTRPC } from '../../lib/trpc'

interface JsonLine {
	line: string
	depth: number
	isContainerStart: boolean
	isContainerEnd: boolean
	startPath: string | null
	endPath: string | null
	hasChildren: boolean
}

const IS_STRUCTURAL_CLOSE_LINE = /^[\]}],?$/
const IS_CONTAINER_START = /(:\s*[[{]\s*|^[[{]\s*),?$/

export const Route = createFileRoute('/_auth/dev/failure-sink' as never)({
	beforeLoad: async ({ context }) => {
		const queryClient = (context as { queryClient: QueryClient })
			.queryClient

		await ensurePermissionOrRedirect({
			queryClient,
			permission: platformPermissions.adminDiagnosticsRead,
		})
	},
	component: FailureSinkPage,
})

function parseJsonLines(serialized: string): JsonLine[] {
	const lines = serialized.split('\n')
	const pathStack: string[] = []
	let depth = 0

	return lines.map((line, index) => {
		const trimmed = line.trim()
		const isContainerEnd = IS_STRUCTURAL_CLOSE_LINE.test(trimmed)

		if (isContainerEnd && depth > 0) {
			depth -= 1
		}

		const keyMatch = /^"([^"]+)":/.exec(trimmed)
		const key = keyMatch?.[1] ?? null
		const currentPath = key ? [...pathStack, key].join('.') : null

		const isContainerStart = IS_CONTAINER_START.test(trimmed)
		const hasChildren = isContainerStart

		const lineData: JsonLine = {
			line,
			depth,
			isContainerStart,
			isContainerEnd,
			startPath: isContainerStart ? currentPath : null,
			endPath:
				isContainerEnd && pathStack.length > 0
					? (pathStack[pathStack.length - 1] ?? null)
					: null,
			hasChildren,
		}

		if (isContainerStart) {
			pathStack.push(currentPath ?? `line-${index}`)
			depth += 1
		}

		if (isContainerEnd && pathStack.length > 0) {
			pathStack.pop()
		}

		return lineData
	})
}

function colorizeJsonLine(line: string) {
	const rendered: ReactNode[] = []
	const regex =
		/("(?:\\.|[^"])*")(?=\s*:)|(:\s*)("(?:\\.|[^"])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

	let last = 0
	let match: RegExpExecArray | null = regex.exec(line)

	while (match) {
		if (match.index > last) {
			rendered.push(line.slice(last, match.index))
		}

		if (match[1]) {
			rendered.push(
				<span key={`${match.index}-key`} className='text-[#88d1ff]'>
					{match[1]}
				</span>,
			)
		} else if (match[2] && match[3]) {
			rendered.push(match[2])
			rendered.push(
				<span key={`${match.index}-str`} className='text-[#99db7d]'>
					{match[3]}
				</span>,
			)
		} else if (match[4]) {
			rendered.push(
				<span key={`${match.index}-bool`} className='text-[#f7c46c]'>
					{match[4]}
				</span>,
			)
		} else if (match[5]) {
			rendered.push(
				<span key={`${match.index}-num`} className='text-[#d8a8ff]'>
					{match[5]}
				</span>,
			)
		}

		last = regex.lastIndex
		match = regex.exec(line)
	}

	if (last < line.length) {
		rendered.push(line.slice(last))
	}

	return rendered
}

function JsonViewer({ value }: { value: string }) {
	const lines = useMemo(() => parseJsonLines(value), [value])
	const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set())

	const visibleLines = useMemo(() => {
		const hiddenDepthByPath = new Map<string, number>()
		const result: JsonLine[] = []

		for (const line of lines) {
			const hiddenEntries = Array.from(hiddenDepthByPath.entries())
			const shouldHide = hiddenEntries.some(
				([, depth]) => line.depth > depth,
			)

			if (!shouldHide) {
				result.push(line)
			}

			if (line.isContainerStart && line.startPath) {
				if (collapsedPaths.has(line.startPath)) {
					hiddenDepthByPath.set(line.startPath, line.depth)
				}
			}

			if (line.isContainerEnd && line.endPath) {
				hiddenDepthByPath.delete(line.endPath)
			}
		}

		return result
	}, [lines, collapsedPaths])

	return (
		<div className='flex min-h-0 w-full min-w-0 flex-1 overflow-auto border bg-[#1e1e1e] p-3 font-mono text-xs text-[#d4d4d4]'>
			<div className='w-full min-w-0'>
				{visibleLines.map((line, index) => {
					const isCollapsed =
						line.startPath != null &&
						collapsedPaths.has(line.startPath)
					const canFold = line.hasChildren && line.startPath != null

					return (
						<div
							key={`${index}-${line.line}`}
							className='whitespace-pre-wrap break-words leading-5'
						>
							<span className='mr-2 inline-block w-4 text-center text-[#8b949e]'>
								{canFold ? (
									<button
										type='button'
										className='cursor-pointer'
										onClick={() => {
											if (!line.startPath) {
												return
											}

											setCollapsedPaths((current) => {
												const next = new Set(current)
												if (
													next.has(
														line.startPath as string,
													)
												) {
													next.delete(
														line.startPath as string,
													)
												} else {
													next.add(
														line.startPath as string,
													)
												}
												return next
											})
										}}
									>
										{isCollapsed ? '+' : '-'}
									</button>
								) : null}
							</span>
							{isCollapsed ? (
								<>
									{colorizeJsonLine(line.line)}
									<span className='ml-2 text-[#8b949e]'>
										...
									</span>
								</>
							) : (
								<>{colorizeJsonLine(line.line)}</>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

function FailureSinkPage() {
	const trpc = useTRPC()
	const [inputValue, setInputValue] = useState('')
	const [failureId, setFailureId] = useState('')
	const [copied, setCopied] = useState(false)

	const queryInput = useMemo(
		() => ({
			failureId,
		}),
		[failureId],
	)

	const lookupQuery = useQuery(
		trpc.admin.failures.getByFailureId.queryOptions(queryInput, {
			enabled: failureId.length > 0,
		}),
	)

	const foundDump =
		lookupQuery.data?.status === 'ok' && lookupQuery.data.dump.found
			? lookupQuery.data.dump
			: null

	const serializedDump = useMemo(() => {
		if (!foundDump) {
			return null
		}

		return JSON.stringify(foundDump.data, null, 2)
	}, [foundDump])

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmed = inputValue.trim()
		if (trimmed.length === 0) {
			return
		}

		setFailureId(trimmed)
	}

	async function handleCopyJson() {
		if (!serializedDump || typeof navigator === 'undefined') {
			return
		}

		try {
			await navigator.clipboard.writeText(serializedDump)
			setCopied(true)
			window.setTimeout(() => {
				setCopied(false)
			}, 1500)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className='flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-2 md:p-4'>
			<div>
				<h1 className='text-foreground text-2xl font-bold'>
					Failure Sink
				</h1>
				<p className='text-muted-foreground'>
					Paste one `failureRef` from Sentry and inspect its stored
					dump.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Lookup By Failure Ref</CardTitle>
					<CardDescription>
						This fetches one and only one sink record by id.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-3'>
					<form
						onSubmit={handleSubmit}
						className='flex flex-col gap-2 sm:flex-row'
					>
						<Input
							value={inputValue}
							onChange={(event) =>
								setInputValue(event.target.value)
							}
							placeholder='9c30f6ff-6e57-4de6-8a8e-4bfbb8d0fbd0'
						/>
						<Button type='submit' disabled={lookupQuery.isFetching}>
							{lookupQuery.isFetching
								? 'Looking up...'
								: 'Lookup'}
						</Button>
					</form>
					<p className='text-muted-foreground text-xs'>
						Use the `failureRef` value from{' '}
						`contexts.battlenet_response.failureRef` in Sentry.
					</p>
				</CardContent>
			</Card>

			{failureId.length > 0 ? (
				<Card className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
					<CardHeader>
						<div className='flex items-center justify-between gap-2'>
							<div>
								<CardTitle>Result</CardTitle>
								<CardDescription className='break-all'>
									Failure id: {failureId}
								</CardDescription>
							</div>
							<div className='flex items-center gap-2'>
								{serializedDump ? (
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => {
											void handleCopyJson()
										}}
									>
										{copied ? 'Copied' : 'Copy JSON'}
									</Button>
								) : null}
								{lookupQuery.data?.status ? (
									<Badge
										variant={
											lookupQuery.data.status === 'ok'
												? 'default'
												: 'outline'
										}
									>
										{lookupQuery.data.status}
									</Badge>
								) : null}
							</div>
						</div>
					</CardHeader>
					<CardContent className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden'>
						{lookupQuery.isError ? (
							<p className='text-destructive text-sm'>
								Unable to lookup this failure id right now.
							</p>
						) : null}

						{lookupQuery.data?.status === 'not_found' ? (
							<p className='text-muted-foreground text-sm'>
								No sink record found for this failure id.
							</p>
						) : null}

						{foundDump ? (
							<p className='text-muted-foreground text-xs'>
								Captured: {foundDump.createdAt}
							</p>
						) : null}

						{serializedDump ? (
							<JsonViewer value={serializedDump} />
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
