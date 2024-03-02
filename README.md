## A tiny, battle-tested, performant and documented scraper for dexonline.ro.

### Usage

To start using the scraper, first install it using the following command:

```ts
npm install dexonline-scraper
```

The simplest way of using the scraper is as follows:

```ts
import * as Dexonline from "dexonline-scraper";

const results = await Dexonline.get("word");
```

Alternatively, you can parse HTML of the website directly, bypassing the fetch
step as follows. Notice that, as opposed to `get()`, `parse()` is synchronous as
opposed to:

```ts
import * as Dexonline from "dexonline-scraper";

const results = Dexonline.parse(html);
```

You can configure the mode according to which the parser will match results to
the search term, ensuring that only terms identical to the search term are
returned:

```ts
import * as Dexonline from "dexonline-scraper";

const results = await Dexonline.get("word", { mode: "strict" });
```

You can modify the results returned by Dexonline using flags:

```ts
import * as Dexonline from 'dexonline-scraper';
import { DictionaryFlags } from 'dexonline-scraper';

const results = await Dexonline.get('word', {
  flags: 
    | DictionaryFlags.UseCedillas // Use 'ş' and 'ţ' instead of 'ș' and 'ț'.
    | DictionaryFlags.MatchDiacritics // Do not return words where the only difference is a diacritic.
    | DictionaryFlags.UsePreReformOrthography // Use 'î' instead of 'â' in all cases except for the word 'român' and its derivatives.
    | DictionaryFlags.SearchOnlyNormativeDictionaries // Return results obtained only from the DEX and/or the DOOM.
});
```
