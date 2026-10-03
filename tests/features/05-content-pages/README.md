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

**Total: 18 scenarios across 3 feature files.**
