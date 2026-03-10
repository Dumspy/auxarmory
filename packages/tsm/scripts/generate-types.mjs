import { execSync } from 'node:child_process'

const commands = [
	'openapi-typescript .cache/openapi/realm.json --output src/types/realm.gen.d.ts',
	'openapi-typescript .cache/openapi/pricing.json --output src/types/pricing.gen.d.ts',
]

for (const command of commands) {
	console.log(`Running: ${command}`)
	execSync(command, { stdio: 'inherit' })
}
