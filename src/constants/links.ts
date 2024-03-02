const _links = {
	definition: (word: string): string => `https://dexonline.ro/definitie/${word}`,
} as const;

/** This is a collection of links used internally by `dexonline-scraper` for resolving dictionary entries. */
const links: typeof _links = Object.freeze(_links);

export default links;
