const fs = require("fs");
const path = require("path");

// Correct input and output paths
const inputPath = path.join(__dirname, "schema.prisma");
const outputPath = path.join(__dirname, "schema.generated");

// Read the base schema
let schema = fs.readFileSync(inputPath, "utf-8");

// Define the common fields (without extra leading newlines)
const commonFields = `  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt`;

// Regex to match each model block
schema = schema.replace(
	/(model\s+\w+\s+\{)([^}]*)(\})/g,
	(match, start, body, end) => {
		// Skip if already contains createdAt or updatedAt
		if (body.includes("createdAt") || body.includes("updatedAt"))
			return match;

		// Remove trailing whitespace (including newlines) from body
		const cleanedBody = body.replace(/\s*$/, "");

		// Add exactly one newline before commonFields
		return `${start}${cleanedBody}\n\n${commonFields}\n${end}`;
	},
);

// Write the modified schema to output
fs.writeFileSync(outputPath, schema, "utf-8");

console.log(
	`✅ Prisma schema generated with createdAt and updatedAt fields in "${outputPath}"`,
);
