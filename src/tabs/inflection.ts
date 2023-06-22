import { CheerioAPI, Cheerio, Element } from "cheerio";
import Expressions from "../constants/expressions.js";
import Selectors from "../constants/selectors.js";
import { ContentTabs, MatchingModes, SearchOptionsWithWord } from "../options.js";

export interface InflectionTable extends Header, Body {}

interface Header {
	tags: string[];
	index: number;
	lemma: string;
}

interface Body {
	table: string[][];
}

export function parse($: CheerioAPI, options: SearchOptionsWithWord): InflectionTable[] {
	const inflection = $(Selectors.contentTab(ContentTabs.Inflection));

	const entries = inflection.find(Selectors.contentTabs.inflection.entry.element).toArray();

	return <InflectionTable[]>entries
		.map<InflectionTable | undefined>((entryElement) => {
			const tableElement = $(entryElement).children(Selectors.contentTabs.inflection.entry.table.element).first();

			const header = parseHeader($, tableElement);
			if (options.mode === MatchingModes.Strict && header.lemma !== options.word) {
				return undefined;
			}

			const body = parseBody(tableElement);
			if (body.table.length === 0) {
				return undefined;
			}

			return { ...header, ...body };
		})
		.filter((entryOrUndefined) => !!entryOrUndefined);
}

function parseHeader($: CheerioAPI, header: Cheerio<Element>): Header {
	const section = header.children(Selectors.contentTabs.inflection.entry.table.header.element);

	// rome-ignore lint/style/noNonNullAssertion: <explanation>
	const lemmaString = section.children(Selectors.contentTabs.inflection.entry.table.header.lemma).html()!;
	// rome-ignore lint/style/noNonNullAssertion: <explanation>
	const [_match, lemma, _superscriptHtml, indexString] = Expressions.tableLemmaWithIndex.exec(lemmaString)!;
	const index = indexString ? Number(indexString) - 1 : 0;

	const tags = section
		.children(Selectors.contentTabs.inflection.entry.table.header.tag)
		.children()
		.map((_index, tag) => $(tag).text())
		.toArray();

	// rome-ignore lint/style/noNonNullAssertion: <explanation>
	return { tags, lemma: lemma!, index };
}

function parseBody(body: Cheerio<Element>): Body {
	const section = body.children(Selectors.contentTabs.inflection.entry.table.body.element);

	// Certain words are listed in the inflection tab but do not show up with a table.
	if (section.length === 0) {
		return { table: [] };
	}

	// TODO(vxern): Parse tables.

	return { table: [] };
}
