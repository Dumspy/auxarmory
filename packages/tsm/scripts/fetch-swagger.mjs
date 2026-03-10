import { mkdirSync, writeFileSync } from 'node:fs'

const SWAGGER_URLS = {
	realm: 'https://realm-api.tradeskillmaster.com/public/swagger-ui-init.js',
	pricing:
		'https://pricing-api.tradeskillmaster.com/public/swagger-ui-init.js',
}

const OUT_DIR = '.cache/openapi'

function extractSwaggerDoc(scriptText) {
	const match = scriptText.match(
		/let options = (\{[\s\S]*?\});\s*url = options\.swaggerUrl/,
	)
	if (!match?.[1]) {
		throw new Error('Unable to locate options object in swagger-ui-init.js')
	}

	const options = JSON.parse(match[1])
	if (!options?.swaggerDoc) {
		throw new Error(
			'Unable to locate options.swaggerDoc in swagger-ui-init.js',
		)
	}

	return options.swaggerDoc
}

async function fetchAndWriteSpec(name, url) {
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch ${name} swagger init: ${res.status} ${res.statusText}`,
		)
	}

	const scriptText = await res.text()
	const swaggerDoc = extractSwaggerDoc(scriptText)
	const outFile = `${OUT_DIR}/${name}.json`
	writeFileSync(outFile, `${JSON.stringify(swaggerDoc, null, 2)}\n`, 'utf-8')
	console.log(`Wrote ${outFile}`)
}

async function main() {
	mkdirSync(OUT_DIR, { recursive: true })
	await Promise.all(
		Object.entries(SWAGGER_URLS).map(([name, url]) =>
			fetchAndWriteSpec(name, url),
		),
	)
}

await main()
