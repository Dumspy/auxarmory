import { fileURLToPath } from "node:url";

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */

/** @type { PrettierConfig | TailwindConfig } */
const config = {
	plugins: [
		"@ianvs/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
	],
	tailwindStylesheet: fileURLToPath(
		new URL("../../packages/ui/src/styles/global.css", import.meta.url),
	),
	tailwindFunctions: ["cn", "cva"],
	importOrder: [
		"<TYPES>",
		"^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
		"<THIRD_PARTY_MODULES>",
		"",
		"<TYPES>^@auxarmory",
		"^@auxarmory/(.*)$",
		"",
		"<TYPES>^[.|..|~]",
		"^~/",
		"^[../]",
		"^[./]",
	],
	importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
	importOrderTypeScriptVersion: "4.4.0",
	overrides: [
		{
			files: "*.json.hbs",
			options: {
				parser: "json",
			},
		},
		{
			files: "*.js.hbs",
			options: {
				parser: "babel",
			},
		},
	],
};

export default config;
