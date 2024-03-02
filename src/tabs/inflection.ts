import { Cheerio, CheerioAPI, Element } from "cheerio";
import Expressions from "../constants/expressions.js";
import Selectors from "../constants/selectors.js";
import { ContentTabs, SearchOptionsWithWord } from "../options.js";

/** Represents an inflection model as scraped directly from the models on Dexonline. */
export interface InflectionModel extends Heading, Table {}

/** Represents the heading of a Dexonline inflection model. */
interface Heading {
  /** The tags for a given inflection model. */
	readonly tags: string[];
  /** The index of the inflection model as shown on the webpage. */
	readonly index: number;
  /** The lemma this inflection model applies to */
	readonly lemma: string;
}

/** Represents the body (table) of a Dexonline inflection model. */
interface Table {
  /** The HTML table represented as a 2D array of rows and columns. */
	readonly table: string[][];
}

/**
 * Given a {@link $|Cheerio document handle} and additional {@link options} for scraping entries, scrapes the
 * inflection models on the page.
 * 
 * @param $ - A Cheerio document handle for the webpage.
 * @param options - Options for the scraper.
 * @returns An array of the scraped {@link InflectionModel}s.
 */
export function scrape($: CheerioAPI, options: SearchOptionsWithWord): InflectionModel[] {
	const inflection = $(Selectors.contentTab(ContentTabs.Inflection));

	const entries = inflection.find(Selectors.contentTabs.inflection.entry.element).toArray();

	const tables: InflectionModel[] = [];
	for (const entry of entries) {
		const tableElement = $(entry).children(Selectors.contentTabs.inflection.entry.table.element).first();

		const heading = scrapeHeading($, tableElement);
		if (options.mode === "strict" && heading.lemma !== options.word) {
			continue;
		}

		const body = scrapeTable($, tableElement);
		if (body.table.length === 0) {
			continue;
		}

		tables.push({ ...heading, ...body });
	}
	return tables;
}

/**
 * Given a {@link $|Cheerio document handle} for the inflection model on the webpage, scrapes its heading.
 * 
 * @param $ - A Cheerio document handle for the webpage.
 * @param $heading - A Cheerio document handle for the heading of the inflection model.
 * @returns The scraped inflection model {@link Heading}.
 */
function scrapeHeading($: CheerioAPI, $heading: Cheerio<Element>): Heading {
	const section = $heading.children(Selectors.contentTabs.inflection.entry.table.header.element);

	const lemmaString = section.children(Selectors.contentTabs.inflection.entry.table.header.lemma).html() ?? undefined;
	if (lemmaString === undefined) {
		throw "Failed to locate the lemma element in the inflection tab.";
	}

	const match = Expressions.tableLemmaWithIndex.exec(lemmaString) ?? undefined;
	if (match === undefined) {
		throw "Failed to match lemma string to lemma regular expression.";
	}

	const [_, lemma, __, indexString] = match as unknown as [
		match: string,
		lemma: string,
		superscriptHtml: string,
		indexString: string,
	];
	const index = indexString ? Number(indexString) - 1 : 0;

	const tags = section
		.children(Selectors.contentTabs.inflection.entry.table.header.tag)
		.children()
		.map((_, tag) => $(tag).text())
		.toArray();

	return { tags, lemma, index };
}

/**
 * Given a {@link $|Cheerio document handle} for the inflection model on the webpage, scrapes its table.
 * 
 * @param $ - A Cheerio document handle for the webpage.
 * @param $heading - A Cheerio document handle for the table of the inflection model.
 * @returns The scraped inflection model {@link Table}.
 */
function scrapeTable($: CheerioAPI, body: Cheerio<Element>): Table {
	const section = body.children(Selectors.contentTabs.inflection.entry.table.body.element);

	// Certain words are listed in the inflection tab but do not show up with a table.
	if (section.length === 0) {
		return { table: [] };
	}

	const rows = section
		.find("tbody")
		.children("tr")
		.map((_, row) => $(row))
		.toArray()
		.map((row) =>
			row
				.children("td")
				.map((_, column) => $(column))
				.toArray(),
		);

	const columnCount = Math.max(...rows.map((row) => row.length));

	const table: string[][] = Array.from({ length: rows.length }, () => []);

	const extendedRows = Array.from({ length: columnCount }, () => 0);
	for (const [row, i] of rows.map<[Cheerio<Element>[], number]>((row, index) => [row, index])) {
		const tableRow = table[i];
		if (tableRow === undefined) {
			throw "Unexpected unassigned table row.";
		}

		for (const [remaining, j] of extendedRows.map<[number, number]>((remaining, index) => [remaining, index])) {
			if (remaining === 0) {
				continue;
			}

			const previousText = table[i - 1]?.[j];
			if (previousText === undefined) {
				throw "Unexpected unassigned table cell.";
			}

			tableRow[j] = previousText;
		}

		const freeCells = extendedRows
			.map<[number, number]>((remaining, index) => [remaining, index])
			.filter(([remaining, _]) => remaining === 0)
			.map(([_, index]) => index);

		for (const [remaining, j] of extendedRows.map<[number, number]>((remaining, index) => [remaining, index])) {
			if (remaining === 0) {
				continue;
			}

			extendedRows[j]--;
		}

		for (const column of row) {
			const rowSpan = Number(column.attr("rowspan") ?? "1");
			const columnSpan = Number(column.attr("colspan") ?? "1");

			const text = scrapeCellContents($, column);

			for (const _ of Array(columnSpan).keys()) {
				const index = freeCells.shift() ?? extendedRows.length;

				tableRow[index] = text;

				if (rowSpan !== 1) {
					extendedRows[index] = rowSpan - 1;
				}
			}
		}

		if (freeCells.length !== 0) {
			throw "There were fewer cells filled in than expected.";
		}
	}

	return { table };
}

/**
 * Given a {@link $|Cheerio document handle} for a cell inside the table for an inflection model, gets the
 * contents of the cell.
 * 
 * @param $ - A Cheerio document handle for the webpage.
 * @param $heading - A Cheerio document handle for the cell element.
 * @returns The scraped contents of the cell.
 */
function scrapeCellContents($: CheerioAPI, $cell: Cheerio<Element>): string {
	const listElements = $cell
		.children("ul")
		.children("li")
		.map((_, element) => $(element));

	if (listElements.length === 0) {
		return $cell.text().trim().replaceAll(/ +/g, " ");
	}

	const parts: string[] = [];
	for (const element of listElements) {
		if (element.hasClass("elisionHidden")) {
			continue;
		}
		parts.push(element.text().trim());
	}
	return parts.join(", ");
}
