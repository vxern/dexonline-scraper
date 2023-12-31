import * as cheerio from "cheerio";
import Links from "./constants/links.js";
import { DictionaryFlags, MatchingModes, ParserOptions, SearchOptionsWithWord } from "./options.js";
import * as Inflection from "./tabs/inflection.js";
import * as Synthesis from "./tabs/synthesis.js";

/** The default search options. */
const defaultSearchOptions: ParserOptions = {
	mode: "lax",
	excludeCopyrighted: true,
	flags: DictionaryFlags.None,
} as const;

export interface Results {
	synthesis: Synthesis.Lemma[];
	inflection: Inflection.InflectionTable[];
}

/**
 * Taking a {@link word} and (optionally) a set of {@link ParseOptions}, searches
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
export function parse(
	contents: string,
	options: SearchOptionsWithWord<true> = { ...defaultSearchOptions, word: "" },
): Results {
	const $ = cheerio.load(contents);

	const optionsFilled: SearchOptionsWithWord<false> = {
		...defaultSearchOptions,
		...options,
	};

	const synthesis = Synthesis.parse($, optionsFilled);
	const inflection = Inflection.parse($, optionsFilled);

	return { synthesis, inflection };
}

export * from "./tabs/inflection.js";
export * from "./tabs/synthesis.js";
export { DictionaryFlags, MatchingModes, Synthesis, Inflection, Links };
export type { ParserOptions };
