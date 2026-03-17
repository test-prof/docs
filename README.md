# TestProf documentation

TestProf docs website driven by [`docsify`](https://docsify.js.org/#/).

This repo only contains assets and general docs (not related to a particular TestProf library).

Most of the documentation lives in [the main repo](https://github.com/test-prof/test-prof/master/docs).

## Contributing

The quickest way to fix a typo or propose a small change is to use GitHub web interface (open a file, click on "Edit", create a PR).

If you want to propose a bigger change, you might want to use a common flow:

1. Fork it.
1. Create a new branch (`git checkout -b feat/my-proposal`).
1. Commit and push changes.
1. Open new Pull Request.

## Translations

Each localization lives in its own repository:

- Russian: [https://github.com/test-prof/docs-ru](https://github.com/test-prof/docs-ru)
- Chinese: [https://github.com/test-prof/docs-zh-cn](https://github.com/test-prof/docs-zh-cn)
- Japanese: [https://github.com/test-prof/docs-ja](https://github.com/test-prof/docs-ja)

See [the guide on working on translations](TRANSLATIONS.md).

### Linters

We try to keep our documentation both correct and _stylish_ using the following tools:

- [mdl](https://github.com/markdownlint/markdownlint)—Markdown linter, Ruby edition.
- [liche](https://github.com/raviqqe/liche)—links linter.
- [forspell](https://github.com/kkuprikov/forspell)—spelling checker.
- RuboCop with [rubocop-md](https://github.com/rubocop-hq/rubocop-md) and [standard](https://github.com/testdouble/standard)—Ruby code snippets style checking.

To run these tools locally we use [Lefthook](https://github.com/Arkweid/lefthook) (runs linters automatically for every commit).

To sum up:

- Install `mdl`:

```sh
gem install mdl
```

- Install `liche`:

```sh
go get -u github.com/raviqqe/liche
```

- Install Hunspell and Forspell:

```sh
# for MacOS (for other OS see Forspell documentation)
brew install hunspell

gem install forspell
```

- Install StandardRB and `rubocop-md`:

```sh
gem install standard
gem install rubocop-md
```

- Install `lefthook`:

```sh
# for MacOS (for other OS see Lefthook documentation)
brew install lefthook
```

- Initialize `lefthook`:

```sh
lefthook install
```

Or you can skip all of these and rely on our CI, which can do all the checks for you!
