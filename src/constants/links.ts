type LinkGenerator = (...args: any[]) => string;

const linkGenerators = Object.freeze({
	definition: (word: string): string => `https://dexonline.ro/definitie/${word}`,
} as const satisfies Record<string, LinkGenerator>) as Record<"definition", LinkGenerator>;

export default linkGenerators;
