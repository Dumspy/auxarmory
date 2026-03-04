import { readFileSync, writeFileSync } from 'node:fs'

const content = readFileSync('src/types.gen.d.ts', 'utf-8')
const fixed = content
	.replace(/x-alt-definitions\["\w*"\] \| /g, '')
	.replace(/ \| x-alt-definitions\["\w*"\]/g, '')
writeFileSync('src/types.d.ts', fixed)
