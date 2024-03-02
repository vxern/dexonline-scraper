## 0.2.1

- Add documentation for the remaining, undocumented API members.
- Rename `MatchingModes` to `MatchingMode` as a union type.

## 0.2.0

- Document all API members, export them as well.
- Use better naming:
  - Rename "lemma" to "dictionary entry".
  - Rename "inflection table" to "inflection model".
    - Rename "header" and "body" to "heading" and "table" for inflection models.
  - Use "scrape" instead of "parse". 
- Make returned objects read-only.

## 0.1.2

- Bumped dependency versions in `package.json`, added an explicit import for `ts-node`.
- Bumped the year in the `LICENCE` copyright notice to 2024.
- Added a contributing guide in `CONTRIBUTING.md`.
- Added `jsr.json` for publishing to JSR.
- Updated `biome.json`.

## 0.1.1

- Switched from `rome` to `biome`.
- Added missing exports.

## 0.1.0

- Migrated package from Deno to Node.
- Added option to exclude copyrighted dictionaries, set to `true` by default.
