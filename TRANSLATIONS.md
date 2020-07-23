# Translations Guide

This document describes how to keep translated documentation.

## Structure

The documentation website "proxies" namespaced pages (i.e. starting with `/:locale/*`) to the corresponding repo contents.

Thus, the structure of the `docs/` folder should be the same as in the [main repo](https://github.com/test-prof/test-prof):

```txt
docs-<locale>/
  docs/
    _sidebar.md
    getting_started.md
    README.md
    profilers/...
    recipes/...
    misc/...
```

Note that the translated documentation should include pages not only from the `test-prof` repo but from the `docs` repo as well (such as `README.md`). Thus, each translation combines all the documentation while English version could be spread across multiple repos.

## Fallbacks

The documentation website is configured to fallback to the default translation (English) in case a document for the specified locale is missing.
Thus, it's possible to gradually introduce a localization.
