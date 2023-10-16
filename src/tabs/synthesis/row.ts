import { Cheerio, CheerioAPI, Element } from "cheerio";
import copyrightedDictionaries from "../../constants/copyright.js";
import Selectors from "../../constants/selectors.js";
import { ParserOptions } from "../../options.js";

interface WithMetadata<T> {
	tags: string[];
	sources: string[];
	value: T;
}

interface Contents extends WithMetadata<string> {}

export interface Row extends Contents {}

export function parse($: CheerioAPI, row: Cheerio<Element>, options: ParserOptions): Row | undefined {
	const contents = getContents($, row, options);
	if (contents === undefined) {
		return undefined;
	}

	return { ...contents };
}

function getContents(
	$: CheerioAPI,
	row: Cheerio<Element>,
	{ excludeCopyrighted }: ParserOptions,
): Contents | undefined {
	const section = row.children(Selectors.contentTabs.synthesis.body.row.contents.element);

	const sources = section
		.children(Selectors.contentTabs.synthesis.body.row.contents.sources)
		.children()
		.map((_, tag) => $(tag).text().trim())
		.toArray();
	if (excludeCopyrighted) {
		const isCopyrighted = sources.every((source) => copyrightedDictionaries.includes(source));
		// If every source is copyrighted, reject the entry.
		if (isCopyrighted) {
			return undefined;
		}
	}

	const tags = section
		.children(Selectors.contentTabs.synthesis.body.row.contents.tags)
		.children()
		.map((_, tag) => $(tag).text())
		.toArray();
	const text = section.children(Selectors.contentTabs.synthesis.body.row.contents.text).text().trim();

	return { tags, value: text, sources };
}
