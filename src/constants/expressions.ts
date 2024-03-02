const _expressions = {
	treeType: /^type-(\w+)$/,
	relationType: /^me-(\d+)$/,
	tableLemmaWithIndex: /((?:[a-zA-ZăĂâÂîÎșȘțȚ-]+))(<sup>(\d+)<\/sup>)?/,
} as const;

/**
 * This is a collection of regular expressions used internally by `dexonline-scraper` for resolving
 * dictionary entries.
 */
const expressions: typeof _expressions = Object.freeze(_expressions);

export default expressions;
