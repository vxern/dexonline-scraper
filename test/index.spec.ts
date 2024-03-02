import { describe, it } from "mocha";
import * as Dexonline from "../src/index.js";
import { DictionaryFlags, Links } from "../src/index.js";
import { expect } from "chai";

describe("The parser", () => {
	it("returns `undefined` for inexistent terms.", async () => {
		const results = await Dexonline.get("dexonline");

		expect(results).to.be.undefined;
	});

	it("parses terms without definitions (without the synthesis tab being populated).", async () => {
		const results = await Dexonline.get("ade");

		expect(results).to.not.be.undefined;
		expect(results?.synthesis).to.be.empty;
		expect(results?.inflection).to.not.be.empty;
	});

	it("parses terms with one entry.", async () => {
		const results = await Dexonline.get("întregime");

		expect(results).to.not.be.undefined;

		expect(results?.synthesis).to.be.of.length(1);
		expect(results?.synthesis.at(0)).to.deep.equal({
			type: "substantiv feminin",
			lemma: "întregime",
			examples: [],
			definitions: [
				{
					tags: [],
					sources: [`DEX '09`, `DEX '98`, "DLRLC"],
					value: "Calitatea de a fi întreg.",
					examples: [],
					definitions: [
						{
							tags: ["concretizat"],
							sources: [`DEX '09`, `DEX '98`, "DLRLC"],
							value: "Ansamblul elementelor care constituie un tot.",
							examples: [],
							definitions: [],
							expressions: [],
							relations: {
								synonyms: [],
								antonyms: [],
								diminutives: [],
								augmentatives: [],
							},
						},
					],
					expressions: [
						{
							tags: ["locuțiune adverbială"],
							sources: [`DEX '09`, `DEX '98`, "DLRLC"],
							value: "În întregime = de tot.",
							examples: [],
							expressions: [],
							relations: {
								synonyms: ["complet"],
								antonyms: [],
								diminutives: [],
								augmentatives: [],
							},
						},
					],
					relations: {
						synonyms: ["deplinătate", "integritate", "plenitudine", "totalitate"],
						antonyms: [],
						diminutives: [],
						augmentatives: [],
					},
				},
			],
			expressions: [],
			etymology: [
				{
					tags: [],
					sources: [`DEX '09`, `DEX '98`],
					value: "Întreg + sufix -ime.",
				},
			],
		});

		expect(results?.inflection).to.be.of.length(1);
		expect(results?.inflection.at(0)).to.deep.equal({
			tags: ["substantiv feminin"],
			index: 0,
			lemma: "întregime",
			table: [
				[
					"substantiv feminin (F107) Surse flexiune: DOR",
					"substantiv feminin (F107) Surse flexiune: DOR",
					"nearticulat",
					"articulat",
				],
				["nominativ-acuzativ", "singular", "întregime", "întregimea"],
				["nominativ-acuzativ", "plural", "întregimi", "întregimile"],
				["genitiv-dativ", "singular", "întregimi", "întregimii"],
				["genitiv-dativ", "plural", "întregimi", "întregimilor"],
				["vocativ", "singular", "—", "—"],
				["vocativ", "plural", "—", "—"],
			],
		});
	});

	it("parses terms with multiple entries.", async () => {
		const results = await Dexonline.get("da", { mode: "strict" });

		expect(results).to.not.be.undefined;

		const shallowEntries = results?.synthesis.map((entry) => ({
			...entry,
			expressions: [],
			examples: [],
			definitions: [],
		}));

		expect(results?.synthesis).to.be.of.length(2);
		expect(results?.synthesis.at(0)).to.deep.equal({
			type: "adverb",
			lemma: "da",
			examples: [],
			definitions: [
				{
					tags: [],
					sources: [`DEX '09`, "MDA2", `DEX '98`, "DLRLC"],
					value:
						"Cuvânt care se folosește pentru a răspunde afirmativ la o întrebare sau pentru a exprima o afirmație, un consimțământ.",
					examples: [],
					definitions: [],
					expressions: [
						{
							tags: ["locuțiune adverbială"],
							sources: [`DEX '09`, "MDA2", `DEX '98`, "DLRLC"],
							value: "Ba da, exprimă răspunsul afirmativ la o întrebare negativă.",
							examples: [],
							expressions: [],
							relations: {
								synonyms: [],
								antonyms: [],
								diminutives: [],
								augmentatives: [],
							},
						},
					],
					relations: {
						synonyms: [],
						antonyms: ["nu"],
						diminutives: [],
						augmentatives: [],
					},
				},
			],
			expressions: [],
			etymology: [
				{
					tags: ["limba rusă", "limba sârbă, croată"],
					sources: [`DEX '09`, "MDA2", `DEX '98`, "NODEX"],
					value: "da",
				},
				{
					tags: ["limba bulgară", "limba slavă (veche)"],
					sources: [`DEX '09`, "MDA2", `DEX '98`, "NODEX"],
					value: "da, да",
				},
			],
		});

		expect(shallowEntries).to.include.deep.equal([
			{
				type: "adverb",
				lemma: "da",
				examples: [],
				definitions: [],
				expressions: [],
				etymology: [
					{
						tags: ["limba rusă", "limba sârbă, croată"],
						sources: [`DEX '09`, "MDA2", `DEX '98`, "NODEX"],
						value: "da",
					},
					{
						tags: ["limba bulgară", "limba slavă (veche)"],
						sources: [`DEX '09`, "MDA2", `DEX '98`, "NODEX"],
						value: "da, да",
					},
				],
			},
			{
				type: "verb",
				lemma: "da",
				examples: [],
				definitions: [],
				expressions: [],
				etymology: [
					{
						tags: ["limba latină"],
						sources: [`DEX '09`, `DEX '98`, "NODEX"],
						value: "dare",
					},
				],
			},
		]);

		expect(results?.inflection).to.be.of.length(2);
		expect(results?.inflection).to.deep.equal([
			{
				tags: ["adverb"],
				index: 0,
				lemma: "da",
				table: [["adverb (I8) Surse flexiune: DOR", "da"]],
			},
			{
				tags: ["verb", "grupa I", "conjugarea I"],
				index: 1,
				lemma: "da",
				table: [
					[
						"verb (VT93) Surse flexiune: DOR",
						"verb (VT93) Surse flexiune: DOR",
						"infinitiv",
						"infinitiv lung",
						"participiu",
						"gerunziu",
						"imperativ pers. a II-a",
						"imperativ pers. a II-a",
					],
					[
						"verb (VT93) Surse flexiune: DOR",
						"verb (VT93) Surse flexiune: DOR",
						"da",
						"dare",
						"dat",
						"dând",
						"singular",
						"plural",
					],
					[
						"verb (VT93) Surse flexiune: DOR",
						"verb (VT93) Surse flexiune: DOR",
						"da",
						"dare",
						"dat",
						"dând",
						"dă",
						"dați",
					],
					["", "", "", "", "", "", "", ""],
					[
						"numărul",
						"persoana",
						"prezent",
						"conjunctiv prezent",
						"imperfect",
						"perfect simplu",
						"mai mult ca perfect",
						"mai mult ca perfect",
					],
					[
						"singular",
						"I (eu)",
						"dau",
						"dau",
						"dădeam, dam, dedeam",
						"dădui, dedei, detei",
						"dădusem, dasem, dedesem, detesem",
						"dădusem, dasem, dedesem, detesem",
					],
					[
						"singular",
						"a II-a (tu)",
						"dai",
						"dai",
						"dădeai, dai, dedeai",
						"dăduși, dedeși, deteși",
						"dăduseși, daseși, dedeseși, deteseși",
						"dăduseși, daseși, dedeseși, deteseși",
					],
					[
						"singular",
						"a III-a (el, ea)",
						"dă",
						"dea, deie",
						"dădea, da, dedea",
						"dădu, dede, dete",
						"dăduse, dase, dedese, detese",
						"dăduse, dase, dedese, detese",
					],
					[
						"plural",
						"I (noi)",
						"dăm",
						"dăm",
						"dădeam, dam, dedeam",
						"dădurăm, dederăm, deterăm",
						"dăduserăm, dădusem, daserăm, dasem, dedeserăm, dedesem, deteserăm, detesem",
						"dăduserăm, dădusem, daserăm, dasem, dedeserăm, dedesem, deteserăm, detesem",
					],
					[
						"plural",
						"a II-a (voi)",
						"dați",
						"dați",
						"dădeați, dați, dedeați",
						"dădurăți, dederăți, deterăți",
						"dăduserăți, dăduseți, daserăți, daseți, dedeserăți, dedeseți, deteserăți, deteseți",
						"dăduserăți, dăduseți, daserăți, daseți, dedeserăți, dedeseți, deteserăți, deteseți",
					],
					[
						"plural",
						"a III-a (ei, ele)",
						"dau",
						"dea, deie",
						"dădeau, dau, dedeau",
						"dădură, dederă, deteră",
						"dăduseră, daseră, dedeseră, deteseră",
						"dăduseră, daseră, dedeseră, deteseră",
					],
				],
			},
		]);
	});

	describe("respects", () => {
		it("the parser mode.", async () => {
			const response = await fetch(Links.definition("a"));

			expect(response).to.be.ok;

			const body = await response.text();

			const entriesLax = Dexonline.parse(body, { mode: "lax" });
			const entriesStrict = Dexonline.parse(body, { mode: "strict", word: "a" });

			expect(entriesLax.synthesis.every((entry) => entry.lemma === "a")).to.be.false;
			expect(entriesLax.inflection.every((entry) => entry.lemma === "a")).to.be.false;

			expect(entriesStrict.synthesis.every((entry) => entry.lemma === "a")).to.be.true;
			expect(entriesStrict.inflection.every((entry) => entry.lemma === "a")).to.be.true;
		});

		describe("the dictionary flags:", () => {
			it("cedilla", async () => {
				const results = await Dexonline.get("și", { flags: DictionaryFlags.UseCedillas });

				expect(results).to.not.be.undefined;

				const resultsStringified = JSON.stringify(results);

				expect(resultsStringified).to.not.include("ș");
				expect(resultsStringified).to.not.include("Ș");
				expect(resultsStringified).to.not.include("ț");
				expect(resultsStringified).to.not.include("Ț");
			});
      
			it("match diacritics", async () => {
				const results = await Dexonline.get("ca", { flags: DictionaryFlags.MatchDiacritics });

				expect(results).to.not.be.undefined;

				expect(results?.synthesis.map((entry) => entry.lemma)).to.not.include("că");
			});
      
			it("use pre-reform orthography", async () => {
				const results = await Dexonline.get("și", { flags: DictionaryFlags.UsePreReformOrthography });

				expect(results).to.not.be.undefined;

				const resultsStringified = JSON.stringify(results);

				expect(resultsStringified).to.not.include("â");
				expect(resultsStringified).to.not.include("Â");
			});

			it("search only normative dictionaries", async () => {
				const results = await Dexonline.get("bengos", { flags: DictionaryFlags.SearchOnlyNormativeDictionaries });

				expect(results?.synthesis).to.be.empty;
			});
		});
	});
});
