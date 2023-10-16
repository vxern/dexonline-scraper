import { Cheerio, CheerioAPI, Element } from "cheerio";
import Expressions from "../constants/expressions.js";
import Selectors from "../constants/selectors.js";
import { ContentTabs, SearchOptionsWithWord } from "../options.js";

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

	const tables: InflectionTable[] = [];
	for (const entry of entries) {
		const tableElement = $(entry).children(Selectors.contentTabs.inflection.entry.table.element).first();

		const header = parseHeader($, tableElement);
		if (options.mode === "strict" && header.lemma !== options.word) {
			continue;
		}

		const body = parseBody($, tableElement);
		if (body.table.length === 0) {
			continue;
		}

		tables.push({ ...header, ...body });
	}
	return tables;
}

function parseHeader($: CheerioAPI, header: Cheerio<Element>): Header {
	const section = header.children(Selectors.contentTabs.inflection.entry.table.header.element);

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

function parseBody($: CheerioAPI, body: Cheerio<Element>): Body {
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

			const text = getCellText($, column);

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

function getCellText($: CheerioAPI, cell: Cheerio<Element>): string {
	const listElements = cell
		.children("ul")
		.children("li")
		.map((_, element) => $(element));

	if (listElements.length === 0) {
		return cell.text().trim().replaceAll(/ +/g, " ");
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
