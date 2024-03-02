const _copyright = [
	"Petro-Sedim",
	"Legislație",
	"DLR",
	"DEX-școlar",
	"DRAM 2021",
	"DIN",
	"CADE",
	"DGL",
	"DLRLC",
	"Onomastic",
	"GER",
	"Sinonime82",
	"GAER",
	"Etnobotanic",
	"DELLR",
	"psi",
	"Enigmistică",
	"DELRIE",
	"DTLALL",
	"DEI",
	"DFL",
	"DTM",
	"DE",
	"DA",
	"MEO",
	"DMG",
	"DRAM 2015",
	"D.Religios",
	"DEXI",
	"MDTL",
	"Ortografic '01",
	"Antonime",
	"NODEX",
	"DOR",
	"Sinonime",
	"DCR2",
	"GTA",
	"DSL",
	"DS5",
	"DFLR",
	"DAR",
	"DGSSL",
	"DELR",
	"CECC",
	"DFS",
	"DifSem",
	"DAS",
	"DS",
	"DETS",
	"DTL",
	"MDA",
	"MDA2",
	"DOOM 3",
	"Epitete",
	"DGS",
	"DEXLRA",
	"DAN",
	"Șăineanu, ed. I",
	"DASLR",
];

/**
 * This is a list of dictionary identifiers that are under copyright, and cannot be queried without explicit permission.
 *
 * `dexonline-scraper` filters entries out from them by default, however this can be overriden in the case of
 * having obtained explicit permission for a given dictionary.
 */
const copyright: readonly string[] = Object.freeze(_copyright);

export default copyright;
