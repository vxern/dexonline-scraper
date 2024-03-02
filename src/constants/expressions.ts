export default Object.freeze({
	treeType: /^type-(\w+)$/,
	relationType: /^me-(\d+)$/,
	tableLemmaWithIndex: /((?:[a-zA-ZăĂâÂîÎșȘțȚ-]+))(<sup>(\d+)<\/sup>)?/,
} as const satisfies Record<string, RegExp>);
