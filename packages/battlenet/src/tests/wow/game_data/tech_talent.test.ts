import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { extractNumericId, runEndpoint } from '../../harness'

function resolveId(entry?: { id?: number; key?: { href?: string } }) {
	if (!entry) return null
	if (typeof entry.id === 'number') return entry.id
	return extractNumericId(entry.key?.href)
}

describe('battlenet wow game data tech talent', () => {
	const client = createApplicationClient()
	let treeId: number
	let talentId: number
	let treeIndexFailures: unknown[]
	let talentIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: treeIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-tech-talent-tree-index',
			inputs: [null],
			call: async () => client.wow.TechTalentTreeIndex(),
			saveId: () => 'root',
		})
		treeIndexFailures = failures

		const treeIndexResult = treeIndexResults[0]?.output
		if (!treeIndexResult || typeof treeIndexResult !== 'object') {
			throw new Error('TechTalentTreeIndex did not return any ids')
		}
		const talentTrees =
			'talent_trees' in treeIndexResult
				? treeIndexResult.talent_trees
				: null
		if (!Array.isArray(talentTrees)) {
			throw new Error('TechTalentTreeIndex did not return any ids')
		}
		const firstTree = talentTrees[0]
		const resolvedTreeId = resolveId(
			firstTree && typeof firstTree === 'object' ? firstTree : undefined,
		)
		if (!resolvedTreeId) {
			throw new Error('TechTalentTreeIndex did not return any ids')
		}
		treeId = resolvedTreeId

		const { results: talentIndexResults, failures: indexFailures } =
			await runEndpoint({
				name: 'wow-game-data-tech-talent-index',
				inputs: [null],
				call: async () => client.wow.TechTalentIndex(),
				saveId: () => 'root',
			})
		talentIndexFailures = indexFailures

		const talentIndexResult = talentIndexResults[0]?.output
		if (!talentIndexResult || typeof talentIndexResult !== 'object') {
			throw new Error('TechTalentIndex did not return any ids')
		}
		const talents =
			'talents' in talentIndexResult ? talentIndexResult.talents : null
		if (!Array.isArray(talents)) {
			throw new Error('TechTalentIndex did not return any ids')
		}
		const firstTalent = talents[0]
		if (
			!firstTalent ||
			typeof firstTalent !== 'object' ||
			!('id' in firstTalent)
		) {
			throw new Error('TechTalentIndex did not return any ids')
		}
		const firstTalentId = firstTalent.id
		if (typeof firstTalentId !== 'number' || !firstTalentId) {
			throw new Error('TechTalentIndex did not return any ids')
		}
		talentId = firstTalentId
	})

	it('validates tech talent tree index endpoint', () => {
		expect(treeIndexFailures).toHaveLength(0)
	})

	it('validates tech talent tree endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-tech-talent-tree',
			inputs: [treeId],
			call: async (id) => client.wow.TechTalentTree(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates tech talent index endpoint', () => {
		expect(talentIndexFailures).toHaveLength(0)
	})

	it('validates tech talent endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-tech-talent',
			inputs: [talentId],
			call: async (id) => client.wow.TechTalent(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates tech talent media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-tech-talent-media',
			inputs: [talentId],
			call: async (id) => client.wow.TechTalentMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
