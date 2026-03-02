import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { extractNumericId, runEndpoint } from '../../harness'

describe('battlenet wow game data talent', () => {
	const client = createApplicationClient()
	let specializationId: number
	let talentTreeId: number
	let talentId: number
	let pvpTalentId: number
	let treeIndexFailures: unknown[]
	let talentIndexFailures: unknown[]
	let pvpIndexFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-talent-tree-index',
			inputs: [null],
			call: async () => client.wow.TalentTreeIndex(),
			saveId: () => 'root',
		})
		treeIndexFailures = failures

		const specializationIndex =
			await client.wow.PlayableSpecializationIndex()
		if (!specializationIndex.success) {
			throw new Error('PlayableSpecializationIndex failed')
		}
		const firstSpecialization =
			specializationIndex.data.character_specializations?.[0] ?? null
		if (!firstSpecialization?.id) {
			throw new Error(
				'PlayableSpecializationIndex did not return any ids',
			)
		}
		specializationId = firstSpecialization.id

		const specialization =
			await client.wow.PlayableSpecialization(specializationId)
		if (!specialization.success) {
			throw new Error('PlayableSpecialization failed')
		}
		if (!('spec_talent_tree' in specialization.data)) {
			throw new Error(
				'PlayableSpecialization did not include talent tree id',
			)
		}
		const talentTreeHref = specialization.data.spec_talent_tree?.key?.href
		const extractedTreeId = extractNumericId(talentTreeHref)
		if (!extractedTreeId) {
			throw new Error(
				'PlayableSpecialization did not include talent tree id',
			)
		}
		talentTreeId = extractedTreeId

		const { results: talentIndexResults, failures: indexFailures } =
			await runEndpoint({
				name: 'wow-game-data-talent-index',
				inputs: [null],
				call: async () => client.wow.TalentIndex(),
				saveId: () => 'root',
			})
		talentIndexFailures = indexFailures

		const talentIndexResult = talentIndexResults[0]?.output
		if (!talentIndexResult || typeof talentIndexResult !== 'object') {
			throw new Error('TalentIndex did not return any ids')
		}
		const talents =
			'talents' in talentIndexResult ? talentIndexResult.talents : null
		if (!Array.isArray(talents)) {
			throw new Error('TalentIndex did not return any ids')
		}
		const firstTalent = talents[0]
		if (
			!firstTalent ||
			typeof firstTalent !== 'object' ||
			!('id' in firstTalent)
		) {
			throw new Error('TalentIndex did not return any ids')
		}
		const firstTalentId = firstTalent.id
		if (typeof firstTalentId !== 'number' || !firstTalentId) {
			throw new Error('TalentIndex did not return any ids')
		}
		talentId = firstTalentId

		const { results: pvpIndexResults, failures: pvpFailures } =
			await runEndpoint({
				name: 'wow-game-data-pvp-talent-index',
				inputs: [null],
				call: async () => client.wow.PvPTalentIndex(),
				saveId: () => 'root',
			})
		pvpIndexFailures = pvpFailures

		const pvpIndexResult = pvpIndexResults[0]?.output
		if (!pvpIndexResult || typeof pvpIndexResult !== 'object') {
			throw new Error('PvPTalentIndex did not return any ids')
		}
		const pvpTalents =
			'pvp_talents' in pvpIndexResult ? pvpIndexResult.pvp_talents : null
		if (!Array.isArray(pvpTalents)) {
			throw new Error('PvPTalentIndex did not return any ids')
		}
		const firstPvPTalent = pvpTalents[0]
		if (
			!firstPvPTalent ||
			typeof firstPvPTalent !== 'object' ||
			!('id' in firstPvPTalent)
		) {
			throw new Error('PvPTalentIndex did not return any ids')
		}
		const firstPvPTalentId = firstPvPTalent.id
		if (typeof firstPvPTalentId !== 'number' || !firstPvPTalentId) {
			throw new Error('PvPTalentIndex did not return any ids')
		}
		pvpTalentId = firstPvPTalentId
	})

	it('validates talent tree index endpoint', () => {
		expect(treeIndexFailures).toHaveLength(0)
	})

	it('validates talent tree nodes endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-talent-tree-nodes',
			inputs: [talentTreeId],
			call: async (id) => client.wow.TalentTreeNodes(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates talent tree endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-talent-tree',
			inputs: [{ talentTreeId, specializationId }],
			call: async ({ talentTreeId, specializationId }) =>
				client.wow.TalentTree(talentTreeId, specializationId),
			saveId: ({ talentTreeId, specializationId }) =>
				`${talentTreeId}-${specializationId}`,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates talent index endpoint', () => {
		expect(talentIndexFailures).toHaveLength(0)
	})

	it('validates talent endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-talent',
			inputs: [talentId],
			call: async (id) => client.wow.Talent(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pvp talent index endpoint', () => {
		expect(pvpIndexFailures).toHaveLength(0)
	})

	it('validates pvp talent endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pvp-talent',
			inputs: [pvpTalentId],
			call: async (id) => client.wow.PvPTalent(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
