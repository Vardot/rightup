'use strict';

// Custom steps for the news lists on the home and category pages. Each list is
// a block of the `rightup_news` view placed in Canvas; regions are named
// selectors in tests/selectors/default-theme.json. Queue steps curate an entity
// queue through its admin form, and the After hook empties every queue a
// scenario touched, which is how a fresh install ships them.

const assert = require('assert');
const { Given, Then, After } = require('@cucumber/cucumber');
const {
  smartSettle,
  friendly,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

/** Queue labels used in feature files, mapped to their machine names. */
const QUEUES = {
  'Top stories': 'rightup_top_stories',
  Featured: 'rightup_featured',
  "Editors' picks": 'rightup_editors_picks',
};

const QUEUE_TABLE = 'table[id^="items-values"]';
const sel = (name) => `[data-drupal-selector="${name}"]`;
const budget = (world) => (world.minWaitTime && world.minWaitTime.page) || 8000;
const squash = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/** The region of a named news list. */
function region(world, name) {
  const css = (world.__selectorsCss || {})[name];
  if (!css) {
    throw friendly({
      action: 'find the news list',
      target: name,
      hint: 'Register it in tests/selectors/default-theme.json.',
    });
  }
  return world.page.locator(css).first();
}

/** The story titles a list shows, in order: one heading per story. */
async function storyTitles(world, name) {
  const loc = region(world, name);
  await loc.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  return loc
    .locator('.view-content :is(h1, h2, h3):not(.card-slider__label)')
    .evaluateAll((nodes) => nodes.map((n) => n.textContent.replace(/\s+/g, ' ').trim()))
    .catch(() => []);
}

/** The queue machine name for a label used in a feature file. */
function queueId(label) {
  const id = QUEUES[label];
  if (!id) {
    throw friendly({
      action: 'find the queue',
      target: label,
      hint: `Known queues: ${Object.keys(QUEUES).join(', ')}.`,
    });
  }
  return id;
}

/** Open a subqueue form, asking twice in case the login has not landed yet. */
async function openQueue(world, id) {
  const path = `/admin/structure/entityqueue/${id}/${id}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await world.page.goto(world.launchUrl + path, { waitUntil: 'domcontentloaded' });
    await smartSettle(world.page, budget(world));
    if ((await world.page.locator(sel('edit-items-add-more-new-item-target-id')).count()) > 0) return;
  }
  throw friendly({
    action: 'open the queue form',
    target: path,
    hint: 'Log in as a user who may administer entity queues before this step.',
  });
}

/** Click a form control clear of Gin's sticky bars. */
async function click(world, locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await locator.click({ timeout: 15000 });
  await smartSettle(world.page, budget(world));
}

/** Fill a queue with exactly these titles, in order, and save it. */
async function fillQueue(world, id, titles) {
  await openQueue(world, id);
  world.rightupTouchedQueues = world.rightupTouchedQueues || new Set();
  world.rightupTouchedQueues.add(id);
  while ((await world.page.locator(`${QUEUE_TABLE} tbody tr`).count()) > 0) {
    await click(world, world.page.locator(sel('edit-items-0-actions-delete')));
  }
  for (const title of titles) {
    const input = world.page.locator(sel('edit-items-add-more-new-item-target-id'));
    await input.fill('');
    await input.pressSequentially(title.slice(0, 40), { delay: 30 });
    const suggestion = world.page.locator('ul.ui-autocomplete li').filter({ hasText: title }).first();
    await suggestion.waitFor({ state: 'visible', timeout: 15000 }).catch((cause) => {
      throw friendly({ action: 'find an autocomplete suggestion for', target: title, cause });
    });
    await suggestion.click();
    await click(world, world.page.locator(sel('edit-items-add-more-submit')));
  }
  const sticky = world.page.locator(sel('gin-sticky-edit-submit'));
  await click(world, ((await sticky.count()) > 0 ? sticky : world.page.locator(sel('edit-submit'))).first());
}

/**
 * Curate a queue to hold exactly the listed stories, in the listed order.
 *
 * Example #1: Given the "Editors' picks" queue holds:
 * Example #2: And the "Featured" queue holds:
 * Example #3: Given the "Top stories" queue holds:
 */
Given(/^the "([^"]+)" queue holds:$/, async function (label, table) {
  await fillQueue(this, queueId(label), table.raw().map((r) => squash(r[0])));
});

/**
 * Empty a queue, the state a fresh install ships.
 *
 * Example #1: Given the "Editors' picks" queue holds nothing
 * Example #2: And the "Top stories" queue holds nothing
 */
Given(/^the "([^"]+)" queue holds nothing$/, async function (label) {
  await fillQueue(this, queueId(label), []);
});

/**
 * Assert a news list shows exactly these stories, in this order.
 *
 * Example #1: Then the "lead story" should list these stories, in order:
 * Example #2: And the "editors' picks" should list these stories, in order:
 */
Then(/^the "([^"]+)" should list these stories, in order:$/, async function (name, table) {
  const expected = table.raw().map((r) => squash(r[0]));
  let actual = [];
  const end = Date.now() + 10000;
  do {
    actual = await storyTitles(this, name);
    if (JSON.stringify(actual) === JSON.stringify(expected)) return;
    await new Promise((r) => setTimeout(r, 250));
  } while (Date.now() < end);
  assert.deepStrictEqual(actual, expected, `The "${name}" lists ${JSON.stringify(actual)}.`);
});

/**
 * Assert how many stories a news list shows.
 *
 * Example #1: Then the "latest stories" should list 10 stories
 * Example #2: And the "podcast episodes" should list 3 stories
 */
Then(/^the "([^"]+)" should list (\d+) stor(?:y|ies)$/, async function (name, count) {
  const actual = await storyTitles(this, name);
  assert.strictEqual(actual.length, parseInt(count, 10), `The "${name}" lists ${JSON.stringify(actual)}.`);
});

/**
 * Assert every story in a list carries the given category label.
 *
 * Example #1: Then every story in the "lead story" should be in the "Architecture" category
 * Example #2: And every story in the "more stories" should be in the "Studios" category
 */
Then(/^every story in the "([^"]+)" should be in the "([^"]+)" category$/, async function (name, category) {
  const labels = await region(this, name)
    .locator('.view-content .taxonomy')
    .evaluateAll((nodes) => nodes.map((n) => n.textContent.replace(/\s+/g, ' ').trim().toLowerCase()));
  assert.ok(labels.length > 0, `The "${name}" shows no category labels.`);
  const wrong = labels.filter((l) => l !== category.toLowerCase());
  assert.deepStrictEqual(wrong, [], `The "${name}" shows categories ${JSON.stringify(labels)}.`);
});

/** Log in as a configured test user, for the After hook. */
async function loginAs(world, username) {
  const user = (world.parameters.users || {})[username];
  if (!user) return;
  await world.page.goto(`${world.launchUrl}/user/login`, { waitUntil: 'domcontentloaded' });
  await world.page.fill(sel('edit-name'), user.username || username);
  await world.page.fill(sel('edit-pass'), user.password);
  await Promise.all([
    world.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    world.page.locator(sel('edit-submit')).first().click(),
  ]);
  await smartSettle(world.page, budget(world));
}

/** Put every queue a scenario curated back to empty. */
After(async function () {
  if (!this.page || !this.rightupTouchedQueues || !this.rightupTouchedQueues.size) return;
  const loggedIn = await this.page.locator('a[href^="/user/logout"]').count().catch(() => 0);
  if (!loggedIn) await loginAs(this, 'webmaster').catch(() => {});
  for (const id of this.rightupTouchedQueues) {
    await fillQueue(this, id, []).catch(() => {});
  }
  this.rightupTouchedQueues.clear();
});
