# 08-content-homepage — Content Homepage

Automated functional acceptance test suite (one parallel CI job: `SUITE=08-content-homepage`).

Run locally:

```bash
FEATURES="tests/features/08-content-homepage/**/*.feature" ddev yarn test:chromium
```

## Features

| Feature file | Description | Scenarios |
| --- | --- | --- |
| `08-01-homepage.feature` | Frontend Pages - Homepage | 8 |
| `08-02-homepage-live-feed.feature` | Frontend Pages - Homepage Live Feed | 11 |

**Total: 19 scenarios across 2 feature files.**

## 08-02 — what the Live Feed suite covers

The ticker used to carry hardcoded headlines and times typed into the Canvas page, so
publishing an article never reached it. It is now content-driven, and these scenarios
protect that chain end to end:

- entity queue `live_feed` (simple, max 10, `news` + `podcast`) — the editor's curation
- view `live_feed`, block display `block_1` — reads the queue through
  `entityqueue_relationship`, sorted in-queue first, then by queue position ascending, then
  by authored date descending, filtered to published, DISTINCT
- `live_feed` node view mode, whose Canvas content template binds `timestamp` to the node's
  `created` field with `time_format: 'g:i A'`, `title` to the node title and `url` to the
  node URL
- that views block placed in the Live Feed component's `items` slot on the Home Canvas page

The single most important assertion is
`every queued live feed entry time should match its node's authored time`: it reads each queued
node's "Authored on" value off its own edit form and compares it with the rendered
`.live-feed-item__time`. That is the binding that replaced the hardcoded strings.

### The shipped default: an empty queue

RightUp ships the `live_feed` queue **empty**, and that is deliberate. A simple queue's
subqueue cannot travel as recipe content: Entityqueue creates the subqueue itself on import
with a freshly generated UUID, so a shipped subqueue collides on the `entity_subqueue.name`
unique key and aborts the install. The view covers for it — queued items lead, then the
latest published `news` and `podcast` content fills the remaining rows, with a DISTINCT
query so nothing appears twice.

So a fresh install renders ten entries from the fallback, and
`Check that an empty Live feed queue falls back to the latest published content` is the
scenario that guards it.

### Fixtures the scenarios expect

Every scenario about curation seeds the queue itself, through the admin form at
`/admin/structure/entityqueue/live_feed/live_feed`, the way an editor would. It names
published nodes from the recipe's default content:

- `A Gallery With No Walls, Only Light`
- `Why More Studios Are Charging for the Pitch Itself`
- `The Chair Every Design School Still Teaches`
- `A Concrete Institute Built to Age on Purpose` — added by the "adding a node" scenario

The first three are among the **oldest** published news nodes on purpose: they are far
outside the ten the fallback would show, so their presence at the head of the ticker can
only come from the queue, and removing one really removes it from the ticker. The fallback
scenario instead names `The Architecture of Unease: How Brutalism Became Beautiful Again`,
the single newest published node. Re-seeding the recipe with different content means
updating those titles.

Nothing asserts the exact order of the fallback rows beyond the first: several default nodes
share a `created` timestamp, and the order among them is not stable.

### Reading the rendered ticker

`live-feed.js` clones the item group once for a seamless scroll loop and marks the clone
`aria-hidden="true"`, so the rendered `.live-feed-item` count is **double** the queued count.
Every assertion here is scoped to the authored group
(`.live-feed__group:not([aria-hidden="true"])`); only the seamless-loop and accessibility
scenarios look at the clone. Under `prefers-reduced-motion` the clone is never made, which
is why `the live feed should repeat its entries once for the seamless loop` and the
duplicate-clone assertion are the only two scenarios that depend on it.

### Timezone

`g:i A` renders in the viewing user's timezone. The authored-time scenario runs logged in as
`webmaster`, so the edit form it reads and the ticker it compares against use the same
timezone. A suite run against a site whose admin user has a timezone different from the site
default will still pass for that reason; an anonymous-vs-admin comparison would not.

### Scenarios that change state, and how they clean up

The scenarios tagged `@live-feed-restore` mutate the site (queue membership, queue order, a
node's moderation state). A tagged `After` hook in
`tests/step-definitions/live-feed.steps.js` puts the queue back the way the scenario found
it — an empty queue on a fresh install — and republishes anything it unpublished, re-logging
in first, since the unpublish scenario ends anonymous. The hook is defined after the
varbase-e2e hooks so it runs first, while the browser is still open, and it runs whether the
scenario passed or failed. A re-run is therefore deterministic.

Those are **not** tagged `@production`: they write to the site.

### Custom steps

`tests/step-definitions/live-feed.steps.js` — the queue's admin form (seed to an exact list,
add via the reference autocomplete, remove, reorder through the row-weight selects) and the
ticker readers. Every form control is addressed by `data-drupal-selector`, never by id:
Drupal randomises element ids on each AJAX form rebuild, so adding one queue row renames the
button used to add the next. The
built-ins cover navigation, login, visibility and text; only the queue journey and the
ticker-vs-node comparisons needed glue.
