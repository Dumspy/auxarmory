const MESSAGE_ID = 'noLiteralUnsafeAssertion'

const noLiteralUnsafeAssertionsRule = {
	meta: {
		type: 'problem',
		docs: {
			description: "Disallow literal 'as any' and 'as never' assertions",
			recommended: false,
		},
		schema: [],
		messages: {
			[MESSAGE_ID]:
				"Avoid '{{assertion}}'. Use a safer narrowing strategy instead.",
		},
	},
	create(context) {
		return {
			TSAsExpression(node) {
				const typeAnnotation = node.typeAnnotation

				if (
					!typeAnnotation ||
					(typeAnnotation.type !== 'TSAnyKeyword' &&
						typeAnnotation.type !== 'TSNeverKeyword')
				) {
					return
				}

				const assertion =
					typeAnnotation.type === 'TSAnyKeyword'
						? 'as any'
						: 'as never'

				context.report({
					node,
					messageId: MESSAGE_ID,
					data: { assertion },
				})
			},
		}
	},
}

const plugin = {
	meta: {
		name: 'custom',
	},
	rules: {
		'no-literal-unsafe-assertions': noLiteralUnsafeAssertionsRule,
	},
}

export default plugin
