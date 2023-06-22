import { CheerioAPI, Cheerio, Element } from "cheerio";
import Selectors from "../../constants/selectors.js";

interface WithMetadata<T> {
	tags: string[];
	sources: string[];
	value: T;
}

interface Contents extends WithMetadata<string> {}

export interface Row extends Contents {}

export function parse($: CheerioAPI, row: Cheerio<Element>): Row {
	const contents = getContents($, row);

	return { ...contents };
}

function getContents($: CheerioAPI, row: Cheerio<Element>): Contents {
	const section = row.children(Selectors.contentTabs.synthesis.body.row.contents.element);

	const tags = section
		.children(Selectors.contentTabs.synthesis.body.row.contents.tags)
		.children()
		.map((_index, tag) => $(tag).text())
		.toArray();
	const text = section.children(Selectors.contentTabs.synthesis.body.row.contents.text).text().trim();
	const sources = section
		.children(Selectors.contentTabs.synthesis.body.row.contents.sources)
		.children()
		.map((_index, tag) => $(tag).text().trim())
		.toArray();

	return { tags, value: text, sources };
}
