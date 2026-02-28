import type { z } from 'zod/v4'

import type { CompleteLocaleResponse, LocaleResponse } from './types'

type ActualLocaleObjectKey = keyof z.infer<typeof CompleteLocaleResponse>

export function localeToString(
	localeData: z.infer<typeof LocaleResponse>,
	localeKey: ActualLocaleObjectKey = 'en_US',
): string | null {
	if (localeData === null) {
		return null
	}

	if (typeof localeData === 'string') {
		return localeData
	}

	if (
		typeof localeData === 'object' &&
		Object.keys(localeData).length === 0
	) {
		return null
	}

	if (typeof localeData === 'object' && localeKey in localeData) {
		const potentialLocaleDataObject = localeData
		const value = potentialLocaleDataObject[localeKey]
		if (typeof value === 'string') {
			return value
		}
	}

	return null
}
