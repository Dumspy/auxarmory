import fs from 'node:fs'
import path from 'node:path'

import type { ClientReturn } from '../types'

export interface EndpointResult<TInput, TOutput> {
	input: TInput
	output?: TOutput
	zodError?: unknown
}

export interface EndpointFailure<TInput> {
	name: string
	input: TInput
	caseId: string
	errorType: string
	zodError?: unknown
	message: string
}

interface RunEndpointParams<TInput, TOutput> {
	name: string
	inputs: TInput[]
	call: (input: TInput) => Promise<ClientReturn<TOutput>>
	saveId: (input: TInput) => string | number
}

const OUT_ROOT = path.join(process.cwd(), '.out', 'battlenet')

function safeStringify(value: unknown) {
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return JSON.stringify(String(value), null, 2)
	}
}

function errorToString(error: unknown) {
	if (error instanceof Error) {
		return error.stack ?? error.message
	}
	if (
		error &&
		typeof error === 'object' &&
		'status' in error &&
		'statusText' in error &&
		typeof (error as { status?: unknown }).status === 'number' &&
		typeof (error as { statusText?: unknown }).statusText === 'string'
	) {
		const res = error as { status: number; statusText: string }
		return `Response ${res.status} ${res.statusText}`
	}
	return String(error)
}

function isIgnoredErrorMessage(message: string) {
	return (
		message.includes('Response 403') ||
		message.includes('Response 404') ||
		message.includes('Response 408') ||
		message.includes('Response 429')
	)
}

function safeCaseId(id: string | number) {
	return String(id).replace(/[^a-zA-Z0-9._-]+/g, '_')
}

function writeFailureArtifacts<TInput, TOutput>(
	name: string,
	caseId: string,
	input: TInput,
	output: TOutput,
	error: unknown,
) {
	const dir = path.join(OUT_ROOT, name, caseId)
	fs.mkdirSync(dir, { recursive: true })
	fs.writeFileSync(path.join(dir, 'input.json'), safeStringify(input))
	fs.writeFileSync(path.join(dir, 'output.json'), safeStringify(output))
	fs.writeFileSync(path.join(dir, 'error.txt'), errorToString(error))
}

export async function runEndpoint<TInput, TOutput>({
	name,
	inputs,
	call,
	saveId,
}: RunEndpointParams<TInput, TOutput>) {
	const results: EndpointResult<TInput, TOutput>[] = []
	const failures: EndpointFailure<TInput>[] = []

	for (const input of inputs) {
		const caseId = safeCaseId(saveId(input))
		try {
			const res = await call(input)
			if (res.success) {
				results.push({ input, output: res.data })
				continue
			}

			const battlenetError = res.error_type === 'battlenet'
			const battlenetCode =
				battlenetError &&
				typeof (res.error as { code?: number }).code === 'number'
					? (res.error as { code?: number }).code
					: null
			const errorMessage = errorToString(res.error)
			const ignoredBattlenetCode =
				battlenetCode === 403 || battlenetCode === 404
			const ignoredBattlenetMessage =
				battlenetError && isIgnoredErrorMessage(errorMessage)
			if (ignoredBattlenetCode) {
				results.push({ input, output: res.raw_data })
				continue
			}
			if (ignoredBattlenetMessage) {
				results.push({ input, output: res.raw_data })
				continue
			}

			const message =
				res.error_type === 'zod'
					? 'Zod validation failed'
					: `Request failed with ${res.error_type}`
			writeFailureArtifacts(name, caseId, input, res.raw_data, res.error)
			failures.push({
				name,
				input,
				caseId,
				errorType: res.error_type,
				zodError: res.error_type === 'zod' ? res.error : undefined,
				message,
			})
			results.push({
				input,
				output: res.raw_data,
				zodError: res.error_type === 'zod' ? res.error : undefined,
			})
		} catch (error) {
			const errorMessage = errorToString(error)
			if (isIgnoredErrorMessage(errorMessage)) {
				results.push({ input, zodError: error })
				continue
			}
			writeFailureArtifacts(name, caseId, input, {} as TOutput, error)
			failures.push({
				name,
				input,
				caseId,
				errorType: 'unknown',
				message: errorMessage,
			})
			results.push({ input, zodError: error })
		}
	}

	return { results, failures }
}

export function extractNumericId(href?: string) {
	if (!href) return null
	const match = href.match(/\/(\d+)(?:[/?]|$)/)
	if (!match) return null
	return Number(match[1])
}
