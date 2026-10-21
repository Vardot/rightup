# 05-content-pages — Content Pages

Automated functional acceptance test suite (one parallel CI job: `SUITE=05-content-pages`).

Run locally:

```bash
FEATURES="tests/features/05-content-pages/**/*.feature" ddev yarn test:chromium
```

## Features

| Feature file | Description | Scenarios |
| --- | --- | --- |
| `05-01-utility-page-permissions.feature` | Content Structure - Utility Page | 7 |
| `05-02-standard-breadcrumbs.feature` | Content Structure - Standard Breadcrumbs | 2 |
| `05-03-category-landing-pages.feature` | Frontend Pages - Category landing pages | 9 |
| `05-04-search-page.feature` | Frontend Pages - Search page | 9 |
| `05-05-search-page-accessibility.feature` | Quality - Search page accessibility | 7 |

**Total: 34 scenarios across 5 feature files** (1 of them `@wip`, see below).

## Notes

- **The search scenarios search for "client".** In the demo content it matches six
  categories, so the four Category tabs are known: Architecture, Branding, Process and
  Studios. Culture and Product match once each and show in the Category list only.
- **Fill the search index first.** CI runs `drush search-api:index` after the install;
  on a local site run `ddev drush search-api:index` once.
- **Active and selected are read the way assistive technology reads them**: the active
  tab and the chosen sort by `aria-current`, the Category list by its checked box.
- **`@wip` scenarios** pin known site defects and stay out of CI (`not @wip`) until fixed:
  - "Check that a Date Published choice keeps the chosen category" (05-04): the Date
    Published filter is a form of its own, so choosing an option drops the chosen category.
