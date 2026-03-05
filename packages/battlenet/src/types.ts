import type { z, ZodError } from 'zod/v4'

import type { BattlenetError } from './validators'

export * from './validators'

export interface ClientRequestContext {
	endpoint: string
	method: 'POST' | 'GET'
	namespace?: 'static' | 'dynamic' | 'profile'
	url: string
	params: Record<string, string | string[]>
}

export type ClientReturn<T> =
	| {
			success: true
			data: T
			raw_data: T
			request_context: ClientRequestContext
			error?: never
			error_type?: never
	  }
	| {
			success: false
			error: ZodError<T>
			error_type: 'zod'
			raw_data: T
			request_context: ClientRequestContext
			data?: never
	  }
	| {
			success: false
			error: Response
			error_type: 'auth'
			raw_data: T
			request_context: ClientRequestContext
			data?: never
	  }
	| {
			success: false
			error: z.infer<typeof BattlenetError>
			error_type: 'battlenet'
			raw_data: T
			request_context: ClientRequestContext
			data?: never
	  }
	| {
			success: false
			error: Error
			error_type: 'unknown'
			raw_data: T
			request_context: ClientRequestContext
			data?: never
	  }
