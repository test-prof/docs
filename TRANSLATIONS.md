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

## Images / Assets

We recommend loading assets from the main documentation (and not copy them across translations).

However, Docsify tries to be smart and automatically update relative image sources in the markdown source. The only way to hack it around is to use plain html, e.g.:

```md
<!-- Original -->
![TagProf UI](../assets/tag-prof.gif)

<!-- Translation -->
<img alt="TagProf UI" data-origin="/assets/tag-prof.gif" src="/assets/tag-prof.gif">
```
