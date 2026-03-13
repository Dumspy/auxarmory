import type { z, ZodError } from 'zod/v4'

import type {
	BattlenetApiError,
	BattlenetAuthError,
	BattlenetUnknownError,
	BattlenetZodError,
} from './errors'
import { BattlenetError } from './validators'

import { RegionsEnum } from './validators'
export * from './validators'

export type Regions = z.infer<typeof RegionsEnum>

export interface ClientRequestContext {
	endpoint: string
	method: 'POST' | 'GET'
	namespace?: 'static' | 'dynamic' | 'profile'
	url: string
	params: Record<string, string | string[]>
}

export interface ClientSuccess<T> {
	success: true
	data: T
	raw_data: T
	request_context: ClientRequestContext
	error?: never
	error_type?: never
	normalized?: never
}

export interface ClientFailure<TErrorType extends string, TError, TRawData> {
	success: false
	error: TError
	error_type: TErrorType
	raw_data: TRawData
	request_context: ClientRequestContext
	normalized?: boolean
	data?: never
}

type RawDataOf<TFailure extends ClientFailure<string, unknown, unknown>> =
	TFailure extends ClientFailure<string, unknown, infer TRawData>
		? TRawData
		: never

type WithRawData<
	TFailure extends ClientFailure<string, unknown, unknown>,
	TRawData,
> =
	TFailure extends ClientFailure<infer TErrorType, infer TError, unknown>
		? ClientFailure<TErrorType, TError, TRawData>
		: never

export type ClientRawReturn<T> =
	| ClientSuccess<T>
	| ClientFailure<'zod', ZodError<T>, unknown>
	| ClientFailure<'auth', Response, unknown>
	| ClientFailure<'battlenet', z.infer<typeof BattlenetError>, unknown>
	| ClientFailure<'unknown', Error, unknown>

export type ClientReturn<T> =
	| ClientSuccess<T>
	| ClientFailure<'zod', BattlenetZodError, T>
	| ClientFailure<
			'auth',
			BattlenetAuthError,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'auth' }>>
	  >
	| ClientFailure<
			'battlenet',
			BattlenetApiError,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'battlenet' }>>
	  >
	| ClientFailure<
			'unknown',
			BattlenetUnknownError,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'unknown' }>>
	  >

export type ClientAnyFailureReturn<T> =
	| Extract<ClientRawReturn<T>, { success: false }>
	| Extract<ClientReturn<T>, { success: false }>

export type ClientHandledFailureReturn<T> =
	| WithRawData<Extract<ClientReturn<T>, { error_type: 'zod' }>, T>
	| WithRawData<
			Extract<ClientReturn<T>, { error_type: 'auth' }>,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'auth' }>>
	  >
	| WithRawData<
			Extract<ClientReturn<T>, { error_type: 'battlenet' }>,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'battlenet' }>>
	  >
	| WithRawData<
			Extract<ClientReturn<T>, { error_type: 'unknown' }>,
			RawDataOf<Extract<ClientRawReturn<T>, { error_type: 'unknown' }>>
	  >

export interface BattlenetMiddlewareContext<T> {
	request_context: ClientRequestContext
	response?: ClientRawReturn<T>
}

export type BattlenetMiddleware = <T>(
	context: BattlenetMiddlewareContext<T>,
	next: () => Promise<void>,
) => Promise<void>

export function isClientErrorReturn<T>(
	response: ClientRawReturn<T> | ClientReturn<T>,
): response is Extract<ClientReturn<T>, { success: false }> {
	if (response.success) {
		return false
	}

	return (
		response.error instanceof Error &&
		'context' in response.error &&
		'errorType' in response.error
	)
}
