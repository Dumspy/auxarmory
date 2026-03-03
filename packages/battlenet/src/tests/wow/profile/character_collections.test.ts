import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character collections', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let indexFailures: unknown[]
	let heirloomsFailures: unknown[]
	let mountsFailures: unknown[]
	let petsFailures: unknown[]
	let toysFailures: unknown[]
	let transmogsFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: indexEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-index',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterCollectionIndex(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		indexFailures = indexEndpointFailures

		const { failures: heirloomEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-heirlooms',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterHeirloomsCollectionSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		heirloomsFailures = heirloomEndpointFailures

		const { failures: mountEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-mounts',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterMountsCollectionSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		mountsFailures = mountEndpointFailures

		const { failures: petEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-pets',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterPetsCollectionSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		petsFailures = petEndpointFailures

		const { failures: toyEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-toys',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterToysCollectionSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		toysFailures = toyEndpointFailures

		const { failures: transmogEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-collections-transmogs',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterTransmogCollectionSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		transmogsFailures = transmogEndpointFailures
	})

	it('validates character collections index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates character collections heirlooms endpoint', () => {
		expect(heirloomsFailures).toHaveLength(0)
	})

	it('validates character collections mounts endpoint', () => {
		expect(mountsFailures).toHaveLength(0)
	})

	it('validates character collections pets endpoint', () => {
		expect(petsFailures).toHaveLength(0)
	})

	it('validates character collections toys endpoint', () => {
		expect(toysFailures).toHaveLength(0)
	})

	it('validates character collections transmogs endpoint', () => {
		expect(transmogsFailures).toHaveLength(0)
	})
})
