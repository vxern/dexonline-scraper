## A lightweight Dexonline.ro page scraper to fetch information about words in the Romanian language.

### Usage

To start using the scraper, first install it using the following command:

```ts
npm install dexonline-scraper
```

The simplest way of using the scraper is as follows:

```ts
import { Dexonline } from "dexonline-scraper";

const results = await Dexonline.get("word");
```

Alternatively, you can parse HTML of the website directly, bypassing the fetch
step as follows:

```ts
const results = Dexonline.parse(html);
```

You can configure the mode according to which the parser will match results to
the search term, ensuring that only terms identical to the search term are
returned:

```ts
import { Dexonline, MatchingModes } from "dexonline-scraper";

const results = await Dexonline.get("word", { mode: MatchingModes.Strict });
```

You can modify the results returned by Dexonline using flags:

```ts
import { Dexonline, DictionaryFlags } from 'dexonline-scraper';

const results = await Dexonline.get('word', {
  flags: 
    | DictionaryFlags.UseCedillas // Use 'ş' and 'ţ' instead of 'ș' and 'ț'.
    | DictionaryFlags.MatchDiacritics // Do not return words where the only difference is a diacritic.
    | DictionaryFlags.UsePreReformOrthography // Use 'î' instead of 'â' in all cases except for the word 'român' and its derivatives.
    | DictionaryFlags.SearchOnlyNormativeDictionaries // Return results obtained only from the DEX and/or the DOOM.
});
```
