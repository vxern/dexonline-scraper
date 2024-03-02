import * as cheerio from "cheerio";
import Links from "./constants/links.js";
import { DictionaryFlags, MatchingModes, ParserOptions, SearchOptionsWithWord } from "./options.js";
import * as Inflection from "./tabs/inflection.js";
import * as Synthesis from "./tabs/synthesis.js";

/** The default search options. */
const defaultSearchOptions = Object.freeze({
	mode: "lax",
	excludeCopyrighted: true,
	flags: DictionaryFlags.None,
} as const satisfies ParserOptions);

/** The default search options with a pre-filled value for the `word` property. */
const defaultSearchOptionsWithWord = Object.freeze({
	...defaultSearchOptions,
	word: "",
} as const satisfies SearchOptionsWithWord);

/** Represents the results of a word search using `dexonline-scraper`. */
export interface Results {
	readonly synthesis: Synthesis.DictionaryEntry[];
	readonly inflection: Inflection.InflectionModel[];
}

/**
 * Taking a {@link word} and (optionally) a set of {@link ParserOptions}, searches
 * for the word on dexonline, returning a {@link Results} object or {@link undefined}
 * if not found.
 *
 * In practical terms, this function acts as an abstraction for {@link parse()},
 * first fetching the website contents, and then running it through {@link parse()}.
 *
 * @param word - The word to search for.
 * @param options - Options for searching.
 * @returns A {@link Results} object or {@link undefined} if not found.
 */
export async function get(
	word: string,
	options: Partial<ParserOptions> = defaultSearchOptions,
): Promise<Results | undefined> {
	const response = await fetch(Links.definition(word), {
		headers: { Cookie: `prefs[anonymousPrefs]=${options.flags}` },
	});
	if (!response.ok) {
		await response.body?.cancel();
		return undefined;
	}

	const body = await response.text();
	return parse(body, { ...defaultSearchOptions, word, ...options });
}

/**
 * Taking page {@link contents} and (optionally) a set of {@link SearchOptionsWithWord},
 * scrapes the contents, returning a {@link Results} object if successful or
 * {@link undefined} otherwise.
 *
 * @param contents - The contents of a dexonline.ro definition page.
 * @param options - Options for searching.
 * @returns A {@link Results} object or {@link undefined} if unable to parse.
 */
export function parse(contents: string, options: SearchOptionsWithWord<true> = defaultSearchOptionsWithWord): Results {
	const $ = cheerio.load(contents);

	const optionsFilled: SearchOptionsWithWord<false> = {
		...defaultSearchOptions,
		...options,
	};

	const synthesis = Synthesis.scrape($, optionsFilled);
	const inflection = Inflection.scrape($, optionsFilled);

	return { synthesis, inflection };
}

export { DictionaryFlags, MatchingModes, Synthesis, Inflection, Links };
export type { ParserOptions };
