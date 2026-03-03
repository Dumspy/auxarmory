import { AccountClient, ApplicationClient } from '..'

export function createApplicationClient() {
	const clientId = process.env.BATTLENET_CLIENT_ID
	const clientSecret = process.env.BATTLENET_CLIENT_SECRET
	if (!clientId || !clientSecret) {
		throw new Error(
			'Missing BATTLENET_CLIENT_ID or BATTLENET_CLIENT_SECRET in environment.',
		)
	}
	return new ApplicationClient({
		region: 'eu',
		clientId,
		clientSecret,
		suppressZodErrors: false,
	})
}

export function createAccountClient() {
	const accessToken = process.env.BATTLE_NET_ACCOUNT_TOKEN
	if (!accessToken) {
		throw new Error(
			'Missing BATTLE_NET_ACCOUNT_TOKEN for account profile tests.',
		)
	}

	return new AccountClient({
		region: 'eu',
		accessToken,
		suppressZodErrors: false,
	})
}
