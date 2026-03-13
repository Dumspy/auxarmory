import {
	BattlenetApiError,
	BattlenetAuthError,
	BattlenetUnknownError,
	BattlenetZodError,
} from '../errors'
import type {
	BattlenetMiddleware,
	BattlenetMiddlewareContext,
	ClientAnyFailureReturn,
	ClientHandledFailureReturn,
} from '../types'
import { isClientErrorReturn } from '../types'

type ClientFailureReturn<T> = ClientHandledFailureReturn<T>

function normalizeFailureResponse<T>(
	context: BattlenetMiddlewareContext<T>,
	response: ClientAnyFailureReturn<T>,
): ClientFailureReturn<T> {
	if (isClientErrorReturn(response)) {
		return {
			...response,
			normalized: true,
		}
	}

	switch (response.error_type) {
		case 'zod':
			return {
				success: false,
				error_type: 'zod',
				error: BattlenetZodError.from(
					context.request_context,
					response.raw_data,
					response.error,
				),
				raw_data: response.raw_data as T,
				request_context: context.request_context,
				normalized: true,
			}
		case 'auth':
			return {
				success: false,
				error_type: 'auth',
				error: BattlenetAuthError.from(
					context.request_context,
					response.raw_data,
					response.error,
				),
				raw_data: response.raw_data,
				request_context: context.request_context,
				normalized: true,
			}
		case 'battlenet':
			return {
				success: false,
				error_type: 'battlenet',
				error: BattlenetApiError.from(
					context.request_context,
					response.raw_data,
					response.error,
				),
				raw_data: response.raw_data,
				request_context: context.request_context,
				normalized: true,
			}
		case 'unknown':
			return {
				success: false,
				error_type: 'unknown',
				error: BattlenetUnknownError.from(
					context.request_context,
					response.raw_data,
					response.error,
				),
				raw_data: response.raw_data,
				request_context: context.request_context,
				normalized: true,
			}
	}
}

export const normalizeBattlenetErrorsMiddleware: BattlenetMiddleware = async <
	T,
>(
	context: BattlenetMiddlewareContext<T>,
	next: () => Promise<void>,
) => {
	await next()

	if (!context.response || context.response.success) {
		return
	}

	context.response = normalizeFailureResponse(
		context,
		context.response,
	) as typeof context.response
}

export function normalizeFailureAsHandled<T>(
	context: BattlenetMiddlewareContext<T>,
	response: ClientAnyFailureReturn<T>,
): ClientFailureReturn<T> {
	return normalizeFailureResponse(context, response)
}
