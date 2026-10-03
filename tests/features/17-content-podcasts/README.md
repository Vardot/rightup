# 17-content-podcasts — Podcasts section

Automated functional acceptance test suite (one parallel CI job: `SUITE=17-content-podcasts`).

Covers the Podcasts section and its two content types: **Podcast** (a show) and
**Podcast episode**. It runs against the demo content The Rightup installs: six
shows (Last Call, Field Notes, Office Hours, The Long Table, Material World,
Small Practice) and their published episodes.

Run locally:

```bash
FEATURES="tests/features/17-content-podcasts/**/*.feature" ddev yarn test:chromium
```

## Features

| Feature file | Description | Scenarios |
| --- | --- | --- |
| `17-01-podcast-permissions.feature` | Content Structure - Podcast and Podcast episode permissions | 16 |
| `17-02-podcast-content-type.feature` | Content Structure - Podcast content type | 5 |
| `17-03-podcast-episode-content-type.feature` | Content Structure - Podcast episode content type | 5 |
| `17-04-podcasts-page.feature` | Frontend Pages - Podcasts page | 8 |
| `17-05-podcast-show-page.feature` | Frontend Pages - Podcast show page | 8 |
| `17-06-podcast-episode-page.feature` | Frontend Pages - Podcast episode page | 10 |
| `17-07-podcasts-accessibility.feature` | Quality - Podcasts accessibility | 8 |
| `17-08-podcasts-responsive.feature` | Frontend Pages - Podcasts on a phone | 3 |

**Total: 63 scenarios across 8 feature files** (4 of them `@wip`, see below).

## Notes

- **Order on the Podcasts page.** The page sorts by the Podcasts entity queue, then
  newest show first. A fresh install leaves the queue empty, so the expected order
  is newest show first. An editor who fills the queue changes it.
- **Scenarios that save content** (17-02, 17-03) are tagged out of `@production`.
  They delete what they saved when they finish, pass or fail.
- **`@wip` scenarios** pin known site defects and stay out of CI (`not @wip`) until fixed:
  - "Check that the cover art of a podcast can only be an image" (17-02) and "… of a
    podcast episode …" (17-03): the Cover art field accepts every media type and its
    picker opens on Audio (varbase_podcasts_base).
  - "The episode rows announce their titles as written" (17-07): the link covering
    each episode row has a double-escaped apostrophe in its `aria-label`, so a screen
    reader reads "Won&#039;t" (vartheme_bs5_rightup).
  - "The View Show links are announced by their label alone" (17-07): the button's
    icon is not hidden from assistive technology, so its glyph is part of the link
    name (vartheme_bs5_rightup).
- **Hosts, summaries and Listen on links come from the demo content.** The steps read
  them from `content/node/*.yml` at run time, so changing that copy needs no test
  change. Show titles, episode titles, counts and paths are fixed in the scenarios.
- No scenario needs network access: the Listen on and Share links are checked by
  their address, never followed.
