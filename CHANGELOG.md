## 0.2.2

- Bumped dependencies to address security risks.
- Fixed tests that were failing due to updated information on Dexonline.
- Updated the list of copyrighted sources.
- Updated the changelog to retire the conventional commit style of messages.

## 0.2.1

- Added documentation for the remaining, undocumented API members.
- Renamed `MatchingModes` to `MatchingMode` as a union type.

## 0.2.0

- Documented all API members, exported them as well.
- Used better naming:
  - Renamed "lemma" to "dictionary entry".
  - Renamed "inflection table" to "inflection model".
    - Renamed "header" and "body" to "heading" and "table" for inflection models.
  - Used "scrape" instead of "parse". 
- Made returned objects read-only.

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
