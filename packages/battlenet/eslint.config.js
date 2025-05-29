import baseConfig from "@auxarmory/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
	{
		ignores: ["dist/**", "out/**", "src/dev.ts"],
	},
	...baseConfig,
];
