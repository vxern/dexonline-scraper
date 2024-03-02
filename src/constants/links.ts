export default Object.freeze({
	definition: (word: string): string => `https://dexonline.ro/definitie/${word}`,
} as const satisfies Record<string, unknown>);
