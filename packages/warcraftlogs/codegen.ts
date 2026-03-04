import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	overwrite: true,
	schema: [
		{
			'https://www.warcraftlogs.com/api/v2/client': {
				headers: {
					Authorization: `Bearer ${process.env.WARCRAFTLOGS_ACCESS_TOKEN}`,
				},
			},
		},
		{
			'https://www.warcraftlogs.com/api/v2/user': {
				headers: {
					Authorization: `Bearer ${process.env.WARCRAFTLOGS_ACCESS_TOKEN}`,
				},
			},
		},
	],
	generates: {
		'src/types.gen.d.ts': {
			plugins: ['typescript', 'typescript-operations'],
			config: {
				useTypeScriptImportTypes: true,
				defaultScalarType: 'unknown',
				avoidOptionals: true,
			},
		},
	},
}

export default config
