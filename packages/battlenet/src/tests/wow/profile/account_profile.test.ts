import { beforeAll, describe, expect, it } from 'vitest'

import { createAccountClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow profile account', () => {
	const client = createAccountClient()
	let profileFailures: unknown[]
	let collectionsFailures: unknown[]
	let mountsFailures: unknown[]
	let petsFailures: unknown[]
	let heirloomsFailures: unknown[]
	let toysFailures: unknown[]
	let transmogsFailures: unknown[]

	beforeAll(async () => {
		const { results: profileResults, failures } = await runEndpoint({
			name: 'wow-profile-account-summary',
			inputs: [null],
			call: async () => client.wow.AccountProfileSummary(),
			saveId: () => 'root',
		})
		profileFailures = failures

		const profileResult = profileResults[0]
		if (!profileResult?.output) {
			throw new Error('AccountProfileSummary did not return data')
		}

		const { failures: collectionsEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-collections-index',
			inputs: [null],
			call: async () => client.wow.AccountCollectionIndex(),
			saveId: () => 'root',
		})
		collectionsFailures = collectionsEndpointFailures

		const { failures: mountsEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-mounts',
			inputs: [null],
			call: async () => client.wow.AccountMountsCollectionSummary(),
			saveId: () => 'root',
		})
		mountsFailures = mountsEndpointFailures

		const { failures: petsEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-pets',
			inputs: [null],
			call: async () => client.wow.AccountPetsCollectionSummary(),
			saveId: () => 'root',
		})
		petsFailures = petsEndpointFailures

		const { failures: heirloomEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-heirlooms',
			inputs: [null],
			call: async () => client.wow.AccountHeirloomsCollectionSummary(),
			saveId: () => 'root',
		})
		heirloomsFailures = heirloomEndpointFailures

		const { failures: toyEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-toys',
			inputs: [null],
			call: async () => client.wow.AccountToysCollectionSummary(),
			saveId: () => 'root',
		})
		toysFailures = toyEndpointFailures

		const { failures: transmogEndpointFailures } = await runEndpoint({
			name: 'wow-profile-account-transmogs',
			inputs: [null],
			call: async () => client.wow.AccountTransmogCollectionSummary(),
			saveId: () => 'root',
		})
		transmogsFailures = transmogEndpointFailures
	})

	it('validates account profile summary endpoint', () => {
		expect(profileFailures).toHaveLength(0)
	})

	it('validates account collections index endpoint', () => {
		expect(collectionsFailures).toHaveLength(0)
	})

	it('validates account mounts collection endpoint', () => {
		expect(mountsFailures).toHaveLength(0)
	})

	it('validates account pets collection endpoint', () => {
		expect(petsFailures).toHaveLength(0)
	})

	it('validates account heirlooms collection endpoint', () => {
		expect(heirloomsFailures).toHaveLength(0)
	})

	it('validates account toys collection endpoint', () => {
		expect(toysFailures).toHaveLength(0)
	})

	it('validates account transmogs collection endpoint', () => {
		expect(transmogsFailures).toHaveLength(0)
	})
})
