import { Cheerio, CheerioAPI, Element } from "cheerio";
import Expressions from "../constants/expressions.js";
import Selectors from "../constants/selectors.js";
import { ContentTabs, ParserOptions, SearchOptionsWithWord } from "../options.js";
import { zip } from "../utils.js";
import * as Row from "./synthesis/row.js";

export interface Lemma extends Header, Body {}

interface Header {
	type: string;
	lemma: string;
}

interface Tree {
	examples: Example[];
	definitions: Definition[];
	expressions: Expression[];
}

interface Body extends Tree {
	etymology: Etymology[];
}

export type RelationTypes = "synonym" | "antonym" | "diminutive" | "augmentative";

const relationTypeNameToRelationType: Record<string, RelationTypes> = {
	sinonime: "synonym",
	antonime: "antonym",
	diminutive: "diminutive",
	augmentative: "augmentative",
};

export type Relations = Record<`${RelationTypes}s`, string[]>;

export interface Example extends Row.Row {}
export interface Definition extends Row.Row {
	definitions: Definition[];
	examples: Example[];
	expressions: Expression[];
	relations: Relations;
}
export interface Expression extends Row.Row {
	examples: Example[];
	expressions: Expression[];
	relations: Relations;
}
export interface Etymology extends Row.Row {}

export function parse($: CheerioAPI, options: SearchOptionsWithWord): Lemma[] {
	const synthesis = $(Selectors.contentTab(ContentTabs.Synthesis));

	const headerBodyTuples = zip(
		synthesis
			.children(Selectors.contentTabs.synthesis.header.element)
			.children(Selectors.contentTabs.synthesis.header.container)
			.toArray(),
		synthesis.children(Selectors.contentTabs.synthesis.body.element).toArray(),
	);

	const lemmas = [];
	for (const [headerElement, bodyElement] of headerBodyTuples) {
		const header = parseHeader($(headerElement));
		if (options.mode === "strict" && header.lemma !== options.word) {
			continue;
		}

		const body = parseBody($, $(bodyElement), options);

		lemmas.push({ ...header, ...body });
	}
	return lemmas;
}

export function parseHeader(header: Cheerio<Element>): Header {
	const typeElement = header.children(Selectors.contentTabs.synthesis.header.type);
	const type = typeElement.text().trim().toLowerCase();
	typeElement.remove();

	const [singular, _] = header.text().trim().split(", ") as [singular: string, plural: string];
	const lemma = singular;

	return { type, lemma };
}

export function parseBody($: CheerioAPI, body: Cheerio<Element>, options: ParserOptions): Body {
	const { examples, definitions, expressions } = getTree($, body, options);
	const etymology = getEtymology($, body, options);

	return { examples, definitions, expressions, etymology };
}

type TreeTypes = "example" | "definition" | "expression";

export function getTree($: CheerioAPI, body: Cheerio<Element>, options: ParserOptions): Tree {
	const section = body.children(Selectors.contentTabs.synthesis.body.tree.element);
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
			const type = ((): TreeTypes | undefined => {
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
		const example: Example | undefined = getBranch($, $(exampleElement), "example", options);
		if (example === undefined) {
			continue;
		}
		examples.push(example);
	}

	const definitions: Definition[] = [];
	for (const definitionElement of subtreesSorted.definitions) {
		const definition: Definition | undefined = getBranch($, $(definitionElement), "definition", options);
		if (definition === undefined) {
			continue;
		}
		definitions.push(definition);
	}

	const expressions: Expression[] = [];
	for (const expressionElement of subtreesSorted.expressions) {
		const expression: Expression | undefined = getBranch($, $(expressionElement), "expression", options);
		if (expression === undefined) {
			continue;
		}
		expressions.push(expression);
	}

	return { examples, definitions, expressions };
}

function getBranch<T extends TreeTypes, R extends Row.Row>(
	$: CheerioAPI,
	branch: Cheerio<Element>,
	type: T,
	options: ParserOptions,
): R | undefined {
	const root = $(branch.children(Selectors.contentTabs.synthesis.body.row.element));
	const row = Row.parse($, root, options);
	if (row === undefined) {
		return undefined;
	}

	if (type === "example") {
		return row as R;
	}

	const sharedProperties = { ...row, relations: getRelations($, root) };
	const { examples, definitions, expressions } = getTree($, branch, options);

	if (type === "expression") {
		return { ...sharedProperties, examples, expressions } as unknown as R;
	}

	return { ...sharedProperties, examples, definitions, expressions } as unknown as R;
}

function getRelations($: CheerioAPI, row: Cheerio<Element>): Relations {
	const section = row.children(Selectors.contentTabs.synthesis.body.row.relations.element);
	const groups = section.children().toArray();

	return groups.reduce<Relations>(
		(relations, group) => {
			if ((group.firstChild ?? undefined) === undefined) {
				return relations;
			}

			const typeElement = $(group).children().first().remove();
			const typeString = typeElement.text().trim().toLowerCase().replace(":", "");

			const type = relationTypeNameToRelationType[typeString];
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

function getEtymology($: CheerioAPI, body: Cheerio<Element>, options: ParserOptions): Etymology[] {
	const section = body.children(Selectors.contentTabs.synthesis.body.etymology.element);

	const entries = section.children(Selectors.contentTabs.synthesis.body.etymology.tree).children();
	const rows = entries.children(Selectors.contentTabs.synthesis.body.row.element);

	const etymologies: Etymology[] = [];
	for (const row of rows) {
		const etymology = Row.parse($, $(row), options);
		if (etymology === undefined) {
			continue;
		}

		etymologies.push(etymology);
	}
	return etymologies;
}
