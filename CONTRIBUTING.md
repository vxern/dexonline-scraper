## Contribute to `dexonline-scraper`

> Before you start, make sure you have the latest version of Node.js and NPM installed on your system.

To start contributing, first create your own working copy of `dexonline-scraper` that you can freely make changes to. You can do this by going to the [dexonline-scraper](https://github.com/vxern/dexonline-scraper) and forking the repository.

Once you have forked the repository, `git clone` it to download it locally:
```
git clone https://github.com/your-username-here/dexonline-scraper.git
```

Once you have your local copy of `dexonline-scraper` ready, run the following command to download all the necessary dependencies:
```
npm run setup
```

Afterwards, just to ensure the setup ran smoothly and the repository is ready to go, run the test suite:
```
npm test
```

> Optional: If you are contributing to the original project, feel free to skip this step.
>
> If you intend to publish your fork of `dexonline-scraper`, there is an additional step of installing JSR as a global dependency:
> ```
> npm install --global jsr
> ```

And just like that, you're ready to develop!

Once you've made your changes, create a pull request to merge them into `dexonline-scraper`, but before you do that, make sure of the following:
- Run the formatter.
  - Ideally, you should have your IDE set up in such a way where it would re-format the file on every change. However, just to make sure it complies with Biome and the linter ruleset in `biome.json`, run `npm run format` before you commit your changes.
- Write tests for your changes, using the existing tests as a guideline for how they should look.
  - If you can't write a test and the reason for that isn't immediately obvious, state why they couldn't be written.
- Keep your pull requests small, ideally up to 200 lines of code. This makes it easier for potential reviewers of your PR to not get discouraged reading a massive PR with tons of changes, and increases your chances of having your PR merged quickly.

Happy contributing!
