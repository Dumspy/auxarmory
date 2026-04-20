import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

const pluginPath = resolve(
	'tooling/oxlint-rules/no-literal-unsafe-assertions-plugin.mjs',
)

function runOxlint(code: string) {
	const dir = mkdtempSync(join(tmpdir(), 'oxlint-plugin-test-'))

	try {
		const sourcePath = join(dir, 'sample.ts')
		const configPath = join(dir, 'oxlintrc.json')

		writeFileSync(sourcePath, code)
		writeFileSync(
			configPath,
			JSON.stringify(
				{
					$schema: resolve(
						'node_modules/oxlint/configuration_schema.json',
					),
					jsPlugins: [pluginPath],
					rules: {
						'custom/no-literal-unsafe-assertions': 'error',
					},
				},
				null,
				2,
			),
		)

		return spawnSync('pnpm', ['oxlint', '-c', configPath, sourcePath], {
			encoding: 'utf8',
			cwd: resolve('.'),
		})
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
}

function runRepoOxlint() {
	return spawnSync(
		'pnpm',
		['oxlint', 'tooling/oxlint-rules/no-literal-unsafe-assertions.test.ts'],
		{
			encoding: 'utf8',
			cwd: resolve('.'),
		},
	)
}

describe('no-literal-unsafe-assertions oxlint plugin', () => {
	it("reports 'as any' assertions", () => {
		const result = runOxlint('const x = value as any;\n')
		expect(result.status).not.toBe(0)
		expect(result.stdout + result.stderr).toMatch(
			/custom\(no-literal-unsafe-assertions\)/,
		)
	})

	it("reports 'as never' assertions", () => {
		const result = runOxlint('const x = value as never;\n')
		expect(result.status).not.toBe(0)
		expect(result.stdout + result.stderr).toMatch(
			/custom\(no-literal-unsafe-assertions\)/,
		)
	})

	it('does not report other type assertions', () => {
		const result = runOxlint('const x = value as string;\n')
		expect(result.status).toBe(0)
	})

	it('repo oxlint config loads plugin successfully', () => {
		const result = runRepoOxlint()
		expect(result.status).toBe(0)
	})
})
