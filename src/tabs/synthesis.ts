import { Cheerio, CheerioAPI, Element } from "cheerio";
import Expressions from "../constants/expressions.js";
import Selectors from "../constants/selectors.js";
import { ContentTabs, ParserOptions, SearchOptionsWithWord } from "../options.js";
import { zip } from "../utils.js";
import * as Row from "./synthesis/row.js";

/** Represents a dictionary entry as scraped directly from the entries on Dexonline. */
export interface DictionaryEntry extends Header, Body {}

/** Represents the body of a Dexonline dictionary entry. */
interface Header {
  /** The lemma's type; part of speech; word class. */
	readonly type: string;
  /** The lemma this dictionary entry is for. */
	readonly lemma: string;
}

/** Represents the type of "tree", a group of sections in a dictionary entry. */
export type TreeType = "example" | "definition" | "expression";

/** Represents a "tree", a group of sections in a dictionary entry. */
export interface Tree {
  /** A list of examples provided for the given lemma. */
	readonly examples: Example[];
  /** A list of definitions provided for the given lemma. */
	readonly definitions: Definition[];
  /** A list of expressions provided for the given lemma. */
	readonly expressions: Expression[];
}

/** Represents the body of a Dexonline dictionary entry. */
interface Body extends Tree {
  /** A list of etymologies provided for the dictionary entry. */
	readonly etymology: Etymology[];
}

/** An internal object mapping the names of Dexonline relations to their English counterparts. */
const _relationTypeNameToRelationType = Object.freeze({
	sinonime: "synonym",
	antonime: "antonym",
	diminutive: "diminutive",
	augmentative: "augmentative",
} as const satisfies Record<string, RelationType>);

/** Represents the type of relation between a given lemma and other lemmas. */
export type RelationType = "synonym" | "antonym" | "diminutive" | "augmentative";

/** An object containing the relations between a given lemma and other lemmas. */
export interface Relations {
  readonly synonyms: string[];
  readonly antonyms: string[];
  readonly diminutives: string[];
  readonly augmentatives: string[];
};

/** A row containing an example featuring a given lemma. */
export interface Example extends Row.Row {}

/** A row containing a definition for a given lemma. */
export interface Definition extends Row.Row {
	readonly definitions: Definition[];
	readonly examples: Example[];
	readonly expressions: Expression[];
	readonly relations: Relations;
}

/** A row containing an expression featuring a given lemma. */
export interface Expression extends Row.Row {
	readonly examples: Example[];
	readonly expressions: Expression[];
	readonly relations: Relations;
}

/** A row containing the etymology of a given lemma. */
export interface Etymology extends Row.Row {}

/**
 * Given a {@link $|Cheerio document handle} and additional {@link options} for scraping entries, scrapes the dictionary
 * entries on the page.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param options - Options for the scraper.
 * @returns An array of the scraped {@link DictionaryEntry|dictionary entries}.
 */
export function scrape($: CheerioAPI, options: SearchOptionsWithWord): DictionaryEntry[] {
	const synthesis = $(Selectors.contentTab(ContentTabs.Synthesis));

	const headerBodyTuples = zip(
		synthesis
			.children(Selectors.contentTabs.synthesis.header.element)
			.children(Selectors.contentTabs.synthesis.header.container)
			.toArray(),
		synthesis.children(Selectors.contentTabs.synthesis.body.element).toArray(),
	);

	const entries = [];
	for (const [headerElement, bodyElement] of headerBodyTuples) {
		const header = scrapeHeader($(headerElement));
		if (options.mode === "strict" && header.lemma !== options.word) {
			continue;
		}

		const body = scrapeBody($, $(bodyElement), options);

		entries.push({ ...header, ...body });
	}
	return entries;
}

/**
 * Given the {@link $header} of a dictionary entry, scrapes it and returns it.
 *
 * @param $header - A Cheerio document handle for the header of a dictionary entry.
 * @returns The scraped dictionary entry {@link Header|header}.
 */
export function scrapeHeader($header: Cheerio<Element>): Header {
	const typeElement = $header.children(Selectors.contentTabs.synthesis.header.type);
	const type = typeElement.text().trim().toLowerCase();
	typeElement.remove();

	const [singular, _] = $header.text().trim().split(", ") as [singular: string, plural: string];
	const lemma = singular;

	return { type, lemma };
}

/**
 * Given a {@link $|Cheerio document handle}, the {@link $body} of a dictionary entry, and additional {@link options},
 * scrapes it and returns it.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $body - A Cheerio document handle for the body of a dictionary entry.
 * @param options - Options for the scraper.
 * @returns The scraped dictionary entry {@link Body|body}.
 */
export function scrapeBody($: CheerioAPI, $body: Cheerio<Element>, options: ParserOptions): Body {
	const { examples, definitions, expressions } = scrapeTree($, $body, options);
	const etymology = scrapeEtymology($, $body, options);

	return { examples, definitions, expressions, etymology };
}

/**
 * Given a {@link $|Cheerio document handle}, a {@link $tree} (chunk of a dictionary entry or the dictionary entry itself),
 * and additional {@link options}, scrapes the {@link Tree|tree}, returning it.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $tree - A Cheerio document handle for the tree.
 * @param options - Options for the scraper.
 * @returns The scraped {@link Tree|tree}.
 */
export function scrapeTree($: CheerioAPI, $tree: Cheerio<Element>, options: ParserOptions): Tree {
	const section = $tree.children(Selectors.contentTabs.synthesis.body.tree.element);
	const subtrees = section.children().toArray();

	if (subtrees.length === 0) {
		return { examples: [], definitions: [], expressions: [] };
	}

	const subtreesSorted = subtrees.reduce<Record<keyof Tree, Element[]>>(
		(subtrees, subtree) => {
			const typeString = $(subtree)
				.attr("class")
				?.split(" ")
				.find((className) => Expressions.treeType.test(className));
			if (typeString === undefined) {
				return subtrees;
			}

			const match = Expressions.treeType.exec(typeString) ?? undefined;
			if (match === undefined) {
				throw "Failed to match type string to tree type regular expression.";
			}

			const [_, typeName] = match as unknown as [match: string, typeName: string];
			const type = ((): TreeType | undefined => {
				if (typeName === "example" || typeName === "expression") {
					return typeName;
				}

				if (typeName === "meaning") {
					return "definition";
				}

				return undefined;
			})();
			if (type === undefined) {
				throw "Failed to match type string to tree type.";
			}

			switch (type) {
				case "example": {
					subtrees.examples.push(subtree);
					break;
				}
				case "definition": {
					subtrees.definitions.push(subtree);
					break;
				}
				case "expression": {
					subtrees.expressions.push(subtree);
					break;
				}
			}

			return subtrees;
		},
		{ examples: [], definitions: [], expressions: [] },
	);

	const examples: Example[] = [];
	for (const exampleElement of subtreesSorted.examples) {
		const example: Example | undefined = scrapeBranch($, $(exampleElement), "example", options);
		if (example === undefined) {
			continue;
		}
		examples.push(example);
	}

	const definitions: Definition[] = [];
	for (const definitionElement of subtreesSorted.definitions) {
		const definition: Definition | undefined = scrapeBranch($, $(definitionElement), "definition", options);
		if (definition === undefined) {
			continue;
		}
		definitions.push(definition);
	}

	const expressions: Expression[] = [];
	for (const expressionElement of subtreesSorted.expressions) {
		const expression: Expression | undefined = scrapeBranch($, $(expressionElement), "expression", options);
		if (expression === undefined) {
			continue;
		}
		expressions.push(expression);
	}

	return { examples, definitions, expressions };
}

/**
 * Given a {@link $|Cheerio document handle}, a {@link $branch} in a dictionary entry, the {@link type} of the branch,
 * and additional {@link options}, scrapes the branch, returning a {@link R|row representation} of it.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $branch - A Cheerio document handle for the branch of a dictionary entry.
 * @param type - The {@link type|TreeTypes} of the branch.
 * @param options - Options for the scraper.
 * @returns The scraped {@link R|row}.
 */
function scrapeBranch<T extends TreeType, R extends Row.Row>(
	$: CheerioAPI,
	$branch: Cheerio<Element>,
	type: T,
	options: ParserOptions,
): R | undefined {
	const root = $($branch.children(Selectors.contentTabs.synthesis.body.row.element));
	const row = Row.scrape($, root, options);
	if (row === undefined) {
		return undefined;
	}

	if (type === "example") {
		return row as R;
	}

	const sharedProperties = { ...row, relations: scrapeRelations($, root) };
	const { examples, definitions, expressions } = scrapeTree($, $branch, options);

	if (type === "expression") {
		return { ...sharedProperties, examples, expressions } as unknown as R;
	}

	return { ...sharedProperties, examples, definitions, expressions } as unknown as R;
}

/**
 * Given a {@link $|Cheerio document handle} and a {@link $row} in a dictionary entry, scrapes the relations section.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $row - A Cheerio document handle for the row in a dictionary entry.
 * @returns The scraped {@link Relations} section.
 */
function scrapeRelations($: CheerioAPI, $row: Cheerio<Element>): Relations {
	const section = $row.children(Selectors.contentTabs.synthesis.body.row.relations.element);
	const groups = section.children().toArray();

	return groups.reduce<Relations>(
		(relations, group) => {
			if ((group.firstChild ?? undefined) === undefined) {
				return relations;
			}

			const typeElement = $(group).children().first().remove();
			const typeString = typeElement.text().trim().toLowerCase().replace(":", "");

			const type = _relationTypeNameToRelationType[typeString as keyof typeof _relationTypeNameToRelationType];
			if (type === undefined) {
				return relations;
			}

			const terms = $(group)
				.children()
				.toArray()
				.map((node) => $(node).text())
				.map((term) => term.trim())
				.filter((term) => term.length !== 0);

			relations[`${type}s`].push(...terms);

			return relations;
		},
		{ synonyms: [], antonyms: [], diminutives: [], augmentatives: [] },
	);
}

/**
 * Given a {@link $|Cheerio document handle} and the {@link $body} for a dictionary entry, scrapes the etymology section.
 *
 * @param $ - A Cheerio document handle for the webpage.
 * @param $body - A Cheerio document handle for the dictionary entry body.
 * @returns The scraped {@link Etymology} section.
 */
function scrapeEtymology($: CheerioAPI, $body: Cheerio<Element>, options: ParserOptions): Etymology[] {
	const section = $body.children(Selectors.contentTabs.synthesis.body.etymology.element);

	const entries = section.children(Selectors.contentTabs.synthesis.body.etymology.tree).children();
	const rows = entries.children(Selectors.contentTabs.synthesis.body.row.element);

	const etymologies: Etymology[] = [];
	for (const row of rows) {
		const etymology = Row.scrape($, $(row), options);
		if (etymology === undefined) {
			continue;
		}

		etymologies.push(etymology);
	}
	return etymologies;
}
