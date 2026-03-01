#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_SOURCES = [
	{
		name: 'wow-game-data',
		url: 'https://community.developer.battle.net/api/pages/content/documentation/world-of-warcraft/game-data-apis.json',
	},
	{
		name: 'wow-profile',
		url: 'https://community.developer.battle.net/api/pages/content/documentation/world-of-warcraft/profile-apis.json',
	},
]

const args = new Map()
for (let i = 2; i < process.argv.length; i += 2) {
	args.set(process.argv[i], process.argv[i + 1])
}

const previousPath = args.get('--previous')
const outputPath = args.get('--output')
const reportPath = args.get('--report')
const summaryPath = args.get('--summary')

if (!outputPath || !reportPath || !summaryPath) {
	console.error(
		'Missing required arguments. Use --output, --report, --summary.',
	)
	process.exit(2)
}

async function readJsonFile(filePath) {
	if (!filePath) {
		return null
	}
	try {
		const contents = await fs.readFile(filePath, 'utf8')
		return JSON.parse(contents)
	} catch (error) {
		if (error && error.code === 'ENOENT') {
			return null
		}
		throw error
	}
}

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: {
			'user-agent': 'auxarmory-wow-api-watch',
			accept: 'application/json',
		},
	})
	if (!response.ok) {
		throw new Error(
			`Failed to fetch ${url}: ${response.status} ${response.statusText}`,
		)
	}
	return response.json()
}

function normalizeParams(method) {
	if (!Array.isArray(method.parameters)) {
		return []
	}
	return method.parameters
		.filter((param) => param && typeof param.name === 'string')
		.map((param) => ({
			name: param.name,
			type: param.type ?? null,
			required: Boolean(param.required),
		}))
		.sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeEndpoint({ source, resourceName, method }) {
	const httpMethod = method.httpMethod || 'GET'
	return {
		source,
		group: resourceName,
		name: method.name || null,
		path: method.path,
		httpMethod,
		params: normalizeParams(method),
	}
}

function uniqueEndpoints(entries) {
	const map = new Map()
	for (const entry of entries) {
		const key = `${entry.source}|${entry.httpMethod}|${entry.path}`
		if (!map.has(key)) {
			map.set(key, entry)
		}
	}
	return Array.from(map.values()).sort((a, b) => {
		const keyA = `${a.source}|${a.httpMethod}|${a.path}`
		const keyB = `${b.source}|${b.httpMethod}|${b.path}`
		return keyA.localeCompare(keyB)
	})
}

function diffEndpoints(previous, current) {
	const previousMap = new Map()
	const currentMap = new Map()
	for (const entry of previous) {
		previousMap.set(
			`${entry.source}|${entry.httpMethod}|${entry.path}`,
			entry,
		)
	}
	for (const entry of current) {
		currentMap.set(
			`${entry.source}|${entry.httpMethod}|${entry.path}`,
			entry,
		)
	}

	const added = []
	const removed = []
	const changed = []

	for (const [key, entry] of currentMap) {
		if (!previousMap.has(key)) {
			added.push(entry)
		} else {
			const previousEntry = previousMap.get(key)
			const previousParams = JSON.stringify(previousEntry.params ?? [])
			const currentParams = JSON.stringify(entry.params ?? [])
			if (previousParams !== currentParams) {
				changed.push({ before: previousEntry, after: entry })
			}
		}
	}

	for (const [key, entry] of previousMap) {
		if (!currentMap.has(key)) {
			removed.push(entry)
		}
	}

	const sortKey = (entry) =>
		`${entry.source}|${entry.httpMethod}|${entry.path}`
	added.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
	removed.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
	changed.sort((a, b) => sortKey(a.after).localeCompare(sortKey(b.after)))

	return { added, removed, changed }
}

function formatEndpoint(entry) {
	return `- \`${entry.httpMethod} ${entry.path}\` [${entry.source}]`
}

function formatParamList(params) {
	if (!params || params.length === 0) {
		return '(none)'
	}
	return params.map((param) => {
		const requiredLabel = param.required ? 'required' : 'optional'
		return `param: ${param.name}: ${param.type ?? 'unknown'} (${requiredLabel})`
	})
}

function diffParams(before, after) {
	const beforeList = Array.isArray(before) ? before : []
	const afterList = Array.isArray(after) ? after : []
	const beforeMap = new Map(beforeList.map((param) => [param.name, param]))
	const afterMap = new Map(afterList.map((param) => [param.name, param]))
	const beforeNames = new Set(beforeList.map((param) => param.name))
	const afterNames = new Set(afterList.map((param) => param.name))
	const added = []
	const removed = []
	const changed = []
	for (const name of afterNames) {
		if (!beforeNames.has(name)) {
			added.push(afterMap.get(name))
		} else {
			const beforeParam = beforeMap.get(name)
			const afterParam = afterMap.get(name)
			const typeChanged =
				(beforeParam?.type ?? null) !== (afterParam?.type ?? null)
			const requiredChanged =
				Boolean(beforeParam?.required) !== Boolean(afterParam?.required)
			if (typeChanged || requiredChanged) {
				changed.push({
					name,
					before: beforeParam,
					after: afterParam,
					typeChanged,
					requiredChanged,
				})
			}
		}
	}
	for (const name of beforeNames) {
		if (!afterNames.has(name)) {
			removed.push(beforeMap.get(name))
		}
	}
	added.sort((a, b) => a.name.localeCompare(b.name))
	removed.sort((a, b) => a.name.localeCompare(b.name))
	changed.sort((a, b) => a.name.localeCompare(b.name))
	return { added, removed, changed }
}

function buildReport({ added, removed, changed, generatedAt, isBaseline }) {
	const lines = []
	lines.push('# WoW API docs change report')
	lines.push('')
	lines.push(`Generated: ${generatedAt}`)
	lines.push('')

	if (isBaseline) {
		lines.push('No previous snapshot found. Created baseline snapshot.')
		return lines.join('\n')
	}

	if (added.length === 0 && removed.length === 0 && changed.length === 0) {
		lines.push('No endpoint changes detected.')
		return lines.join('\n')
	}

	lines.push('| Change type | Count |')
	lines.push('| --- | --- |')
	lines.push(`| Added | ${added.length} |`)
	lines.push(`| Removed | ${removed.length} |`)
	lines.push(`| Params changed | ${changed.length} |`)
	lines.push('')

	if (added.length > 0) {
		lines.push(`<details>`)
		lines.push(`<summary>Added (${added.length})</summary>`)
		lines.push('')
		for (const entry of added) {
			lines.push(formatEndpoint(entry))
			lines.push(`  - group: ${entry.group ?? 'unknown'}`)
			lines.push(`  - name: ${entry.name ?? 'unknown'}`)
			const paramLines = formatParamList(entry.params)
			if (paramLines.length === 0) {
				lines.push('  - params: (none)')
			} else {
				for (const paramLine of paramLines) {
					lines.push(`  - ${paramLine}`)
				}
			}
			lines.push('')
		}
		lines.push('')
		lines.push(`</details>`)
		lines.push('')
	}

	if (removed.length > 0) {
		lines.push(`<details>`)
		lines.push(`<summary>Removed (${removed.length})</summary>`)
		lines.push('')
		for (const entry of removed) {
			lines.push(formatEndpoint(entry))
			lines.push(`  - group: ${entry.group ?? 'unknown'}`)
			lines.push(`  - name: ${entry.name ?? 'unknown'}`)
			const paramLines = formatParamList(entry.params)
			if (paramLines.length === 0) {
				lines.push('  - params: (none)')
			} else {
				for (const paramLine of paramLines) {
					lines.push(`  - ${paramLine}`)
				}
			}
			lines.push('')
		}
		lines.push('')
		lines.push(`</details>`)
		lines.push('')
	}

	if (changed.length > 0) {
		lines.push(`<details>`)
		lines.push(`<summary>Changed Params (${changed.length})</summary>`)
		lines.push('')
		for (const entry of changed) {
			const paramDiff = diffParams(
				entry.before.params,
				entry.after.params,
			)
			const beforeParams = Array.isArray(entry.before.params)
				? entry.before.params
				: []
			const afterParams = Array.isArray(entry.after.params)
				? entry.after.params
				: []
			const beforeMap = new Map(
				beforeParams.map((param) => [param.name, param]),
			)
			const afterMap = new Map(
				afterParams.map((param) => [param.name, param]),
			)
			const changedMap = new Map(
				paramDiff.changed.map((change) => [change.name, change]),
			)
			lines.push(`${formatEndpoint(entry.after)}`)
			lines.push(`  - group: ${entry.after.group ?? 'unknown'}`)
			lines.push(`  - name: ${entry.after.name ?? 'unknown'}`)
			if (afterParams.length === 0 && beforeParams.length === 0) {
				lines.push('  - params: (none)')
			} else {
				for (const param of afterParams) {
					const change = changedMap.get(param.name)
					const isAdded = !beforeMap.has(param.name)
					const requiredLabel = param.required
						? 'required'
						: 'optional'
					const requiredDetail = change?.requiredChanged
						? `${change.before?.required ? 'required' : 'optional'} -> ${requiredLabel}`
						: requiredLabel
					const typeDetail = change?.typeChanged
						? `{${change.before?.type ?? 'unknown'} -> ${param.type ?? 'unknown'}}`
						: (param.type ?? 'unknown')
					const addSuffix = isAdded ? ' [+]' : ''
					lines.push(
						`  - param: ${param.name}: ${typeDetail} (${requiredDetail})${addSuffix}`,
					)
				}
				for (const param of paramDiff.removed) {
					lines.push(
						`  - param: ${param.name}: ${param.type ?? 'unknown'} [-]`,
					)
				}
			}
			lines.push('')
		}
		lines.push('')
		lines.push(`</details>`)
		lines.push('')
	}

	return lines.join('\n').trimEnd()
}

function buildSummary({ added, removed, changed }) {
	const addCount = added.length
	const removeCount = removed.length
	const changeCount = changed.length
	const hasChanges = addCount > 0 || removeCount > 0
	const titleParts = []
	if (addCount > 0) {
		titleParts.push(`+${addCount}`)
	}
	if (removeCount > 0) {
		titleParts.push(`-${removeCount}`)
	}
	if (changeCount > 0) {
		titleParts.push(`~${changeCount}`)
	}
	const titleSuffix =
		titleParts.length > 0 ? ` (${titleParts.join(' / ')})` : ''
	return {
		hasChanges: hasChanges || changeCount > 0,
		title: `WoW API docs changed${titleSuffix}`,
	}
}

async function ensureDir(filePath) {
	const dir = path.dirname(filePath)
	await fs.mkdir(dir, { recursive: true })
}

async function main() {
	const sources = DEFAULT_SOURCES
	const entries = []
	for (const source of sources) {
		const payload = await fetchJson(source.url)
		if (!payload || !Array.isArray(payload.resources)) {
			throw new Error(`Unexpected payload for ${source.url}`)
		}
		for (const resource of payload.resources) {
			const resourceName = resource.name || 'unknown'
			if (!Array.isArray(resource.methods)) {
				continue
			}
			for (const method of resource.methods) {
				if (!method || !method.path) {
					continue
				}
				entries.push(
					normalizeEndpoint({
						source: source.name,
						resourceName,
						method,
					}),
				)
			}
		}
	}

	const current = uniqueEndpoints(entries)
	const previousSnapshot = await readJsonFile(previousPath)
	const hasPrevious = Array.isArray(previousSnapshot?.endpoints)
	const previous = hasPrevious ? previousSnapshot.endpoints : []
	const diff = hasPrevious
		? diffEndpoints(previous, current)
		: { added: [], removed: [], changed: [] }
	const generatedAt = new Date().toISOString()
	const report = buildReport({
		...diff,
		generatedAt,
		isBaseline: !hasPrevious,
	})
	const summary = buildSummary(diff)

	await ensureDir(outputPath)
	await fs.writeFile(
		outputPath,
		JSON.stringify({ generatedAt, endpoints: current }, null, 2),
	)
	await ensureDir(reportPath)
	await fs.writeFile(reportPath, report)
	await ensureDir(summaryPath)
	await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
}

try {
	await main()
} catch (error) {
	console.error(error instanceof Error ? error.message : error)
	process.exit(1)
}
