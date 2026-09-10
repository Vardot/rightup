# 09-drupal-canvas — Drupal Canvas

Automated functional acceptance test suite (one parallel CI job: `SUITE=09-drupal-canvas`).

Run locally:

```bash
FEATURES="tests/features/09-drupal-canvas/**/*.feature" ddev yarn test:chromium
```

## Features

| Feature file | Description | Scenarios |
| --- | --- | --- |
| `09-01-canvas-pages-permissions.feature` | Content Structure - Canvas Pages permissions | 6 |
| `09-02-canvas-editor.feature` | Content Structure - Drupal Canvas Editor | 5 |
| `09-03-canvas-menus.feature` | Content Structure - Menus in Drupal Canvas (system menus offered in the component library) | 1 |
| `09-04-canvas-hero-cards.feature` | Content Structure - Hero Cards in Drupal Canvas (added via the real editor drag-and-drop, options matrix: heading, background, alignment, button, border, container) | 2 |
| `09-05-canvas-hero-slider.feature` | Content Structure - Hero Slider in Drupal Canvas (Bootstrap 5 carousel: homepage slider, slides/overlay/button, editor add) | 3 |
| `09-06-canvas-default-patterns.feature` | Drupal Canvas - default Canvas patterns (library listing, insert, publish, render) | 4 |
| `09-07-canvas-page-translations.feature` | Drupal Canvas - translating a Canvas page (translation setup, translations overview, language + direction) | 3 |

**Total: 24 scenarios across 7 feature files.**

Two of the `09-07` scenarios are tagged `@wip`: they need a site with a second
language and a translated Canvas page, which a fresh single-language install does
not have. Run them against a multilingual site with `--tags "@multilingual"`.
