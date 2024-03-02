import { Cheerio, CheerioAPI, Element } from "cheerio";
import copyrightedDictionaries from "../../constants/copyright.js";
import Selectors from "../../constants/selectors.js";
import { ParserOptions } from "../../options.js";

/** The contents of a row. */
interface Contents {
	readonly tags: string[];
	readonly sources: string[];
	readonly value: string;
}

/** Represents a row of text in a dictionary entry, be it a definition, expression, example, etc. */
export interface Row extends Contents {}

/**
 * Given a {@link $|Cheerio document handle}, a {@link $row} in a dictionary entry, and additional {@link options},
 * scrapes the {@link Row|row} and returns it.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $row - A Cheerio document handle for a row in a dictionary entry.
 * @param options - Options for the scraper.
 * @returns The scraped {@link Row|row}, or {@link undefined} if unsuccessful.
 */
export function scrape($: CheerioAPI, $row: Cheerio<Element>, options: ParserOptions): Row | undefined {
	const contents = scrapeContents($, $row, options);
	if (contents === undefined) {
		return undefined;
	}

	return contents;
}

/**
 * Given a {@link $|Cheerio document handle}, a {@link $row} in a dictionary entry, and additional {@link options},
 * scrapes the {@link Contents|contents} of the row and returns them.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $row - A Cheerio document handle for a row in a dictionary entry.
 * @param options - Options for the scraper.
 * @returns The scraped {@link Contents|contents} of the row, or {@link undefined} if unsuccessful.
 */
export function scrapeContents(
	$: CheerioAPI,
	$row: Cheerio<Element>,
	{ excludeCopyrighted }: ParserOptions,
): Contents | undefined {
	const section = $row.children(Selectors.contentTabs.synthesis.body.row.contents.element);

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
