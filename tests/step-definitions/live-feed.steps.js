'use strict';

// -----------------------------------------------------------------------------
// Custom step definitions for the RightUp Live Feed ticker.
//
// The Live Feed is content-driven: the `live_feed` entity queue curates which
// news/podcast nodes appear and in what order, the `live_feed` view renders that
// queue through the `live_feed` view mode, and the Canvas content template binds
// each item's time to the node's `created` field. These steps drive the queue's
// admin form and read the rendered ticker, so the feature file can stay in
// business language.
//
// RightUp ships the queue EMPTY. A simple queue's subqueue cannot be shipped as
// recipe content — Entityqueue creates it on import with a freshly generated
// UUID, so a shipped subqueue collides on `entity_subqueue.name` — and the view
// therefore falls back to the latest published news and podcast content until
// an editor curates it. Every scenario about curation seeds the queue itself,
// through the admin form, and the After hook puts the queue back the way the
// scenario found it.
//
// `live-feed.js` clones the rendered item group once for a seamless scroll loop
// and marks the clone `aria-hidden="true"`, so every read here is scoped to the
// authored (non-cloned) group.
// -----------------------------------------------------------------------------

const { Given, When, Then, After } = require('@cucumber/cucumber');
const {
  smartSettle,
  friendly,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

/** Path of the `live_feed` subqueue edit form. */
const QUEUE_FORM_PATH = '/admin/structure/entityqueue/live_feed/live_feed';

/**
 * A Drupal form element, by its stable selector.
 *
 * Drupal randomises HTML ids on every AJAX form rebuild — adding or removing a
 * queue row turns `#edit-items-add-more-submit` into
 * `#edit-items-add-more-submit--28LukLkDvBQ` — so nothing here may hold on to
 * an id. `data-drupal-selector` is the attribute Drupal guarantees stable for
 * exactly this reason, and is what core's own tests target.
 */
function sel(name) {
  return `[data-drupal-selector="${name}"]`;
}

/** The queue's multi-value table. Its id is randomised after an AJAX rebuild. */
const QUEUE_TABLE = 'table[id^="items-values"]';

/** The authored item group — the clone carries aria-hidden="true". */
const AUTHORED_GROUP = '.live-feed__group:not([aria-hidden="true"])';

/** A rendered ticker entry inside the authored group. */
const AUTHORED_ITEM = `${AUTHORED_GROUP} .live-feed-item`;

/** Settle budget used after every form interaction. */
function budget(world) {
  return (world.minWaitTime && world.minWaitTime.page) || 8000;
}

/**
 * Read the rendered ticker entries, in document order.
 *
 * @return {Promise<Array<{time: string, title: string, href: string|null}>>}
 */
async function readFeed(page) {
  return page.$$eval(AUTHORED_ITEM, (nodes) =>
    nodes.map((el) => ({
      time: (el.querySelector('.live-feed-item__time')?.textContent || '').trim(),
      title: (el.querySelector('.live-feed-item__title')?.textContent || '').trim(),
      href: el.getAttribute('href'),
      tabindex: el.getAttribute('tabindex'),
      tag: el.tagName.toLowerCase(),
    })),
  );
}

/**
 * Read the queue rows from the subqueue edit form, in queue order.
 *
 * @return {Promise<Array<{nid: string, title: string}>>}
 */
async function readQueueRows(page) {
  return page.$$eval(`${QUEUE_TABLE} tbody tr`, (rows) =>
    rows
      .map((row) => ({
        nid: row.querySelector('input[name$="[target_id]"]')?.value || '',
        title: (
          row.querySelector('div[id^="edit-items-"][id*="-label"]')?.textContent || ''
        ).trim(),
      }))
      .filter((item) => item.nid !== ''),
  );
}

/**
 * Navigate to the subqueue edit form and wait for it to settle.
 *
 * Asked for immediately after the login form is submitted, the first request
 * can still land as the anonymous user and answer 403, so this asks twice
 * before giving up. A genuine permission problem fails both times.
 */
async function openQueueForm(world) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await world.page.goto(world.launchUrl + QUEUE_FORM_PATH, {
      waitUntil: 'domcontentloaded',
    });
    await smartSettle(world.page, budget(world));
    if ((await world.page.locator(QUEUE_TABLE).count()) > 0) return;
  }
  const heading = (
    await world.page.locator('h1').first().textContent().catch(() => '')
  ).trim();
  throw friendly({
    action: 'open the Live feed queue form',
    target: QUEUE_FORM_PATH,
    hint: `The page answered with "${heading || '(no heading)'}". Log in as a user who may administer entity queues before this step.`,
  });
}

/**
 * Click a control inside the subqueue form.
 *
 * Gin's sticky top bar and sticky form actions float over the page, so a plain
 * click on a control scrolled to the edge of the viewport is intercepted by
 * them. Centring the control first puts it clear of both bars.
 */
async function clickInForm(world, locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await locator.click({ timeout: 15000 });
}

/**
 * Submit the form on screen, the way Gin presents it.
 *
 * Gin lifts the form actions into a sticky bar and leaves the original Save
 * button in the page, under that bar — so clicking the original is a click on
 * the bar. Click Gin's own button when it is there.
 */
async function submitForm(world) {
  const sticky = world.page.locator(sel('gin-sticky-edit-submit'));
  const target = (await sticky.count()) > 0 ? sticky : world.page.locator(sel('edit-submit'));
  await clickInForm(world, target.first());
}

/** Submit the subqueue edit form and wait for the saved page. */
async function saveQueueForm(world) {
  await submitForm(world);
  await smartSettle(world.page, budget(world));
}

/**
 * Add a node to the queue through the reference autocomplete, exactly as an
 * editor does: type the title, then pick the suggestion.
 */
async function addToQueue(world, title) {
  const page = world.page;
  const input = page.locator(sel('edit-items-add-more-new-item-target-id'));
  await input.fill('');
  await input.pressSequentially(title.slice(0, 40), { delay: 30 });

  const suggestion = page.locator('ul.ui-autocomplete li').filter({ hasText: title }).first();
  try {
    await suggestion.waitFor({ state: 'visible', timeout: 15000 });
  } catch (cause) {
    throw friendly({
      action: 'find an autocomplete suggestion for',
      target: title,
      cause,
      hint: 'Check the node exists, is of a bundle the live_feed queue accepts (news or podcast), and that the title matches exactly.',
    });
  }
  await suggestion.click();

  await clickInForm(world, page.locator(sel('edit-items-add-more-submit')));
  await smartSettle(world.page, budget(world));
}

/** Remove the queue row holding the given node title. */
async function removeFromQueue(world, title) {
  const rows = await readQueueRows(world.page);
  const index = rows.findIndex((row) => row.title === title);
  if (index === -1) {
    throw friendly({
      action: 'remove from the Live feed queue',
      target: title,
      hint: `The queue currently holds: ${rows.map((r) => r.title).join(' | ') || '(nothing)'}.`,
    });
  }
  await clickInForm(world, world.page.locator(sel(`edit-items-${index}-actions-delete`)));
  await smartSettle(world.page, budget(world));
}

/**
 * Make the row-weight selects usable.
 *
 * Drupal's tabledrag hides them behind drag handles until "Show row weights"
 * is clicked, and Playwright refuses to select on a hidden control.
 */
async function showRowWeights(world) {
  const firstWeight = world.page.locator('select[name$="[_weight]"]').first();
  if (await firstWeight.isVisible().catch(() => false)) return;
  const toggle = world.page.locator('.tabledrag-toggle-weight').first();
  if ((await toggle.count()) > 0) {
    await toggle.click();
    await smartSettle(world.page, 1500);
  }
}

/**
 * Put the queue rows in the given node-id order using the weight selects.
 *
 * The selects share one contiguous range of option values, so the i-th
 * smallest value is assigned to the node that should sit at position i.
 */
async function setQueueOrder(world, nids) {
  await showRowWeights(world);
  const rows = await readQueueRows(world.page);
  const values = await world.page
    .locator('select[name$="[_weight]"]')
    .first()
    .locator('option')
    .evaluateAll((options) => options.map((o) => o.value));
  const ordered = values.map(Number).sort((a, b) => a - b).map(String);

  for (let position = 0; position < nids.length; position += 1) {
    const rowIndex = rows.findIndex((row) => row.nid === nids[position]);
    if (rowIndex === -1) continue;
    await world.page
      .locator(`select[name="items[${rowIndex}][_weight]"]`)
      .selectOption(ordered[position]);
  }
}

/**
 * Remember the queue as the scenario found it, once, so the After hook can put
 * it back. On a fresh install that is an empty queue.
 */
async function rememberOriginalQueue(world) {
  if (world.rightupQueueOriginal === undefined) {
    world.rightupQueueOriginal = await readQueueRows(world.page);
  }
}

/**
 * Put the queue into exactly the given titles, in the given order, through the
 * admin form — the way an editor curates it.
 */
async function setQueue(world, titles) {
  await openQueueForm(world);
  await rememberOriginalQueue(world);

  for (const row of await readQueueRows(world.page)) {
    if (!titles.includes(row.title)) {
      await removeFromQueue(world, row.title);
    }
  }

  for (const title of titles) {
    const current = await readQueueRows(world.page);
    if (!current.some((row) => row.title === title)) {
      await addToQueue(world, title);
    }
  }

  const rows = await readQueueRows(world.page);
  const nids = titles
    .map((title) => (rows.find((row) => row.title === title) || {}).nid)
    .filter(Boolean);
  await setQueueOrder(world, nids);
  await saveQueueForm(world);

  await openQueueForm(world);
  const saved = await readQueueRows(world.page);
  if (saved.map((row) => row.title).join(' | ') !== titles.join(' | ')) {
    throw friendly({
      message: 'The Live feed queue does not hold what the scenario asked for.',
      hint:
        `Asked for: ${titles.join(' | ') || '(nothing)'}\n  ` +
        `Queue holds: ${saved.map((row) => row.title).join(' | ') || '(nothing)'}\n  ` +
        'The recipe ships the queue empty, so each scenario curates its own; ' +
        'check the titles exist and are of a bundle the queue accepts (news or podcast).',
    });
  }
  world.rightupQueueSnapshot = saved;
}

/**
 * Put the queue back the way the scenario found it — removing what it added,
 * re-adding what it removed, and restoring the order.
 */
async function restoreQueue(world) {
  const wanted = world.rightupQueueOriginal;
  if (!wanted) return;

  await openQueueForm(world);
  let current = await readQueueRows(world.page);

  const wantedNids = wanted.map((item) => item.nid);
  for (const row of current) {
    if (!wantedNids.includes(row.nid)) {
      await removeFromQueue(world, row.title);
    }
  }

  current = await readQueueRows(world.page);
  const currentNids = current.map((row) => row.nid);
  for (const item of wanted) {
    if (!currentNids.includes(item.nid)) {
      await addToQueue(world, item.title);
    }
  }

  await setQueueOrder(world, wantedNids);
  await saveQueueForm(world);
}

/** Log in with a configured user, used by the cleanup hook. */
async function loginAs(world, username) {
  const users = world.parameters.users || {};
  const user = users[username];
  if (!user) return false;
  await world.page.goto(world.launchUrl + '/user/login', { waitUntil: 'domcontentloaded' });
  await world.page.waitForSelector(sel('edit-name'), { state: 'visible', timeout: 15000 });
  await world.page.fill(sel('edit-name'), user.username || username);
  await world.page.fill(sel('edit-pass'), user.password);
  await Promise.all([
    world.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    world.page.evaluate(() => {
      const submit = document.querySelector('[data-drupal-selector="edit-submit"]');
      if (submit) submit.click();
    }),
  ]);
  await smartSettle(world.page, budget(world));
  return true;
}

/** Set a node's moderation state through its edit form. */
async function setModerationState(world, nid, state) {
  await world.page.goto(`${world.launchUrl}/node/${nid}/edit`, {
    waitUntil: 'domcontentloaded',
  });
  await smartSettle(world.page, budget(world));
  await world.page.locator(sel('edit-moderation-state-0-state')).selectOption({ label: state });
  await submitForm(world);
  await smartSettle(world.page, budget(world));
}

/**
 * Curate the Live feed queue to exactly the listed nodes, in the listed order,
 * through the admin form.
 *
 * Example #1: Given the Live feed queue holds:
 * Example #2: And the Live feed queue holds:
 * Example #3: Given I set the Live feed queue to hold:
 * Example #4: When the Live feed queue holds:
 * Example #5: And we set the Live feed queue to hold:
 */
Given(
  /^(?:I |we )*(?:set )?the Live feed queue (?:holds|to hold):$/,
  async function (table) {
    await setQueue(
      this,
      table.raw().map((row) => row[0].trim()),
    );
  },
);

/**
 * Empty the Live feed queue — the state a fresh RightUp install ships, where
 * the ticker falls back to the latest published content.
 *
 * Example #1: Given the Live feed queue holds nothing
 * Example #2: And the Live feed queue holds nothing
 * Example #3: Given I set the Live feed queue to hold nothing
 * Example #4: When the Live feed queue holds nothing
 * Example #5: And we set the Live feed queue to hold nothing
 */
Given(
  /^(?:I |we )*(?:set )?the Live feed queue (?:holds|to hold) nothing$/,
  async function () {
    await setQueue(this, []);
  },
);

/**
 * Add a node to the Live feed queue and save.
 *
 * Example #1: When I add the node "A Concrete Institute Built to Age on Purpose" to the Live feed queue
 * Example #2: And I add the node "Milan Design Week Opens" to the Live feed queue
 * Example #3: Given I add the node "Last Call" to the Live feed queue
 * Example #4: When we add the node "A Facade That Changes Color With the Weather" to the Live feed queue
 * Example #5: And we add the node "Why More Studios Are Sketching by Hand Again" to the Live feed queue
 */
When(/^(?:I |we )*add the node "([^"]*)" to the Live feed queue$/, async function (title) {
  await addToQueue(this, title);
  await saveQueueForm(this);
});

/**
 * Remove a node from the Live feed queue and save.
 *
 * Example #1: When I remove the node "Arclight Studio Unveils New Identity for Nordic Airline" from the Live feed queue
 * Example #2: And I remove the node "Last Call" from the Live feed queue
 * Example #3: Given I remove the node "Milan Design Week Opens" from the Live feed queue
 * Example #4: When we remove the node "A Concrete Institute Built to Age on Purpose" from the Live feed queue
 * Example #5: And we remove the node "A Facade That Changes Color With the Weather" from the Live feed queue
 */
When(/^(?:I |we )*remove the node "([^"]*)" from the Live feed queue$/, async function (title) {
  await removeFromQueue(this, title);
  await saveQueueForm(this);
});

/**
 * Move the last queued node to the top of the queue and save.
 *
 * Example #1: When I move the last Live feed queue item to the top
 * Example #2: And I move the last Live feed queue item to the top
 * Example #3: Given I move the last Live feed queue item to the top
 * Example #4: When we move the last Live feed queue item to the top
 * Example #5: And we move the last Live feed queue item to the top
 */
When(/^(?:I |we )*move the last Live feed queue item to the top$/, async function () {
  const rows = await readQueueRows(this.page);
  if (rows.length < 2) {
    throw friendly({
      message: 'The Live feed queue needs at least two items to reorder.',
      hint: `It currently holds ${rows.length}.`,
    });
  }
  const reordered = [rows[rows.length - 1], ...rows.slice(0, rows.length - 1)];
  await setQueueOrder(this, reordered.map((row) => row.nid));
  await saveQueueForm(this);
});

/**
 * Unpublish a queued node through its edit form, remembering it for cleanup.
 *
 * Example #1: When I unpublish the first Live feed queue item
 * Example #2: And I unpublish the first Live feed queue item
 * Example #3: Given I unpublish the first Live feed queue item
 * Example #4: When we unpublish the first Live feed queue item
 * Example #5: And we unpublish the first Live feed queue item
 */
When(/^(?:I |we )*unpublish the first Live feed queue item$/, async function () {
  const rows = this.rightupQueueSnapshot || (await readQueueRows(this.page));
  const target = rows[0];
  this.rightupUnpublished = target;
  await setModerationState(this, target.nid, 'Archived / Unpublished');
});

/**
 * Assert the queued nodes lead the ticker, in queue order. What follows them is
 * the view's fallback to the latest published content, which this does not read.
 *
 * Example #1: Then the live feed should start with the queued items in order
 * Example #2: And the live feed should start with the queued items in order
 * Example #3: Then the live feed should start with the queued items in order
 * Example #4: And we should see the live feed start with the queued items in order
 * Example #5: Then the live feed should start with the queued items in order
 */
Then(
  /^(?:the )?live feed should start with the queued items in order$/,
  async function () {
    const expected = (this.rightupQueueSnapshot || []).map((item) => item.title);
    const actual = (await readFeed(this.page)).map((item) => item.title);
    if (expected.join(' | ') !== actual.slice(0, expected.length).join(' | ')) {
      throw friendly({
        message: 'The queued nodes do not lead the live feed, in queue order.',
        hint: `Queue order: ${expected.join(' | ')}\n  Ticker order: ${actual.join(' | ')}`,
      });
    }
  },
);

/**
 * Assert the ticker's first entry is the given headline.
 *
 * Example #1: Then the live feed should start with "A Gallery With No Walls, Only Light"
 * Example #2: And the live feed should start with "The Chair Every Design School Still Teaches"
 * Example #3: Then the live feed should start with "Milan Design Week Opens"
 * Example #4: And we should see the live feed start with "Last Call"
 * Example #5: Then the live feed should start with "Why More Studios Are Sketching by Hand Again"
 */
Then(/^(?:the )?live feed should start with "([^"]*)"$/, async function (title) {
  const feed = await readFeed(this.page);
  if (feed.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });
  if (feed[0].title !== title) {
    throw friendly({
      message: `The live feed does not start with "${title}".`,
      hint: `Ticker: ${feed.map((item) => item.title).join(' | ')}`,
    });
  }
});

/**
 * Assert how many entries the ticker renders.
 *
 * Example #1: Then the live feed should list 10 entries
 * Example #2: And the live feed should list 10 entries
 * Example #3: Then the live feed should list 3 entries
 * Example #4: And we should see the live feed list 5 entries
 * Example #5: Then the live feed should list 1 entries
 */
Then(/^(?:the )?live feed should list (\d+) entries$/, async function (count) {
  const feed = await readFeed(this.page);
  if (feed.length !== Number(count)) {
    throw friendly({
      message: `The live feed lists ${feed.length} entries, not ${count}.`,
      hint: `Ticker: ${feed.map((item) => item.title).join(' | ') || '(nothing)'}`,
    });
  }
});

/**
 * Assert no headline appears twice — the view query is DISTINCT, so a queued
 * node must not also arrive through the latest-content fallback.
 *
 * Example #1: Then the live feed should list no entry twice
 * Example #2: And the live feed should list no entry twice
 * Example #3: Then the live feed should list no entry twice
 * Example #4: And we should see the live feed list no entry twice
 * Example #5: Then the live feed should list no entry twice
 */
Then(/^(?:the )?live feed should list no entry twice$/, async function () {
  const titles = (await readFeed(this.page)).map((item) => item.title);
  if (titles.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });
  const seen = new Set();
  const repeated = [];
  for (const title of titles) {
    if (seen.has(title)) repeated.push(title);
    seen.add(title);
  }
  if (repeated.length > 0) {
    throw friendly({
      message: 'The live feed lists the same entry more than once.',
      hint: `Repeated: ${[...new Set(repeated)].join(' | ')}\n  Ticker: ${titles.join(' | ')}`,
    });
  }
});

/**
 * Assert a headline is, or is not, in the ticker.
 *
 * Example #1: Then the live feed should contain "Milan Design Week Opens"
 * Example #2: And the live feed should not contain "Last Call"
 * Example #3: Then the live feed should contain "A Concrete Institute Built to Age on Purpose"
 * Example #4: And the live feed should not contain "A Facade That Changes Color With the Weather"
 * Example #5: Then the live feed should contain "Fen & Marble Reveal First Look at Rotterdam Flagship"
 */
Then(
  /^(?:the )?live feed should( not)? contain "([^"]*)"$/,
  async function (negate, title) {
    const titles = (await readFeed(this.page)).map((item) => item.title);
    const found = titles.includes(title);
    if (negate && found) {
      throw friendly({
        message: `The live feed still shows "${title}".`,
        hint: `Ticker: ${titles.join(' | ')}`,
      });
    }
    if (!negate && !found) {
      throw friendly({
        message: `The live feed does not show "${title}".`,
        hint: `Ticker: ${titles.join(' | ')}`,
      });
    }
  },
);

/**
 * Assert every entry shows a 12-hour clock time.
 *
 * Example #1: Then every live feed entry should show a time in 12-hour format
 * Example #2: And every live feed entry should show a time in 12-hour format
 * Example #3: Then every live feed entry should show a time in 12-hour format
 * Example #4: And we should see every live feed entry show a time in 12-hour format
 * Example #5: Then every live feed entry should show a time in 12-hour format
 */
Then(
  /^every live feed entry should show a time in 12-hour format$/,
  async function () {
    const feed = await readFeed(this.page);
    if (feed.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });
    const pattern = /^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/;
    const bad = feed.filter((item) => !pattern.test(item.time));
    if (bad.length > 0) {
      throw friendly({
        message: 'Some live feed entries do not show a 12-hour time.',
        hint: bad.map((item) => `"${item.title}" shows "${item.time}"`).join('\n  '),
      });
    }
  },
);

/**
 * Assert each entry's time equals its node's authored time.
 *
 * Reads the "Authored on" value straight off each queued node's edit form, so
 * the assertion compares the ticker against the node rather than against a
 * hardcoded string. Requires a session that may edit the queued nodes.
 *
 * Example #1: Then every queued live feed entry time should match its node's authored time
 * Example #2: And every queued live feed entry time should match its node's authored time
 * Example #3: Then every queued live feed entry time should match its node's authored time
 * Example #4: And we should see every queued live feed entry time match its node's authored time
 * Example #5: Then every queued live feed entry time should match its node's authored time
 */
Then(
  /^every queued live feed entry time should match its node's authored time$/,
  async function () {
    const feed = await readFeed(this.page);
    const queue = this.rightupQueueSnapshot || [];
    if (feed.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });

    const mismatches = [];
    for (let i = 0; i < queue.length && i < feed.length; i += 1) {
      const response = await this.page.request.get(
        `${this.launchUrl}/node/${queue[i].nid}/edit`,
      );
      const html = await response.text();
      const match = html.match(/name="created\[0\]\[value\]\[time\]"[^>]*value="(\d{2}):(\d{2})/);
      if (!match) {
        mismatches.push(`"${queue[i].title}": could not read the Authored on time`);
        continue;
      }
      const hours = Number(match[1]);
      const expected = `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`;
      if (feed[i].time !== expected) {
        mismatches.push(
          `"${queue[i].title}": authored ${expected}, ticker shows ${feed[i].time}`,
        );
      }
    }
    if (mismatches.length > 0) {
      throw friendly({
        message: 'Live feed times do not match the nodes authored times.',
        hint: mismatches.join('\n  '),
      });
    }
  },
);

/**
 * Assert every entry links somewhere that answers, not a 404.
 *
 * Example #1: Then every live feed entry should link to a page that resolves
 * Example #2: And every live feed entry should link to a page that resolves
 * Example #3: Then every live feed entry should link to a page that resolves
 * Example #4: And we should see every live feed entry link to a page that resolves
 * Example #5: Then every live feed entry should link to a page that resolves
 */
Then(
  /^every live feed entry should link to a page that resolves$/,
  async function () {
    const feed = await readFeed(this.page);
    if (feed.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });

    const broken = [];
    for (const item of feed) {
      if (!item.href) {
        broken.push(`"${item.title}" has no href`);
        continue;
      }
      const url = item.href.startsWith('http') ? item.href : this.launchUrl + item.href;
      const response = await this.page.request.get(url);
      if (response.status() >= 400) {
        broken.push(`"${item.title}" -> ${item.href} answered ${response.status()}`);
      }
    }
    if (broken.length > 0) {
      throw friendly({
        message: 'Some live feed entries do not link to a page that resolves.',
        hint: broken.join('\n  '),
      });
    }
  },
);

/**
 * Assert every entry is a real link a keyboard user can reach.
 *
 * Example #1: Then every live feed entry should be a keyboard reachable link
 * Example #2: And every live feed entry should be a keyboard reachable link
 * Example #3: Then every live feed entry should be a keyboard reachable link
 * Example #4: And we should see every live feed entry be a keyboard reachable link
 * Example #5: Then every live feed entry should be a keyboard reachable link
 */
Then(
  /^every live feed entry should be a keyboard reachable link$/,
  async function () {
    const feed = await readFeed(this.page);
    if (feed.length === 0) throw friendly({ message: 'The live feed rendered no entries.' });
    const bad = feed.filter(
      (item) => item.tag !== 'a' || !item.href || item.tabindex === '-1',
    );
    if (bad.length > 0) {
      throw friendly({
        message: 'Some live feed entries are not keyboard reachable links.',
        hint: bad
          .map((item) => `"${item.title}" is a <${item.tag}> (tabindex ${item.tabindex})`)
          .join('\n  '),
      });
    }
  },
);

/**
 * Assert the seamless-loop clone is hidden from assistive technology and taken
 * out of the tab order.
 *
 * Example #1: Then the duplicated live feed entries should be hidden from assistive technology
 * Example #2: And the duplicated live feed entries should be hidden from assistive technology
 * Example #3: Then the duplicated live feed entries should be hidden from assistive technology
 * Example #4: And we should see the duplicated live feed entries hidden from assistive technology
 * Example #5: Then the duplicated live feed entries should be hidden from assistive technology
 */
Then(
  /^the duplicated live feed entries should be hidden from assistive technology$/,
  async function () {
    const clone = this.page.locator('.live-feed__group[aria-hidden="true"]');
    if ((await clone.count()) === 0) {
      throw friendly({
        message: 'The live feed did not duplicate its items for the seamless loop.',
        hint: 'live-feed.js clones the item group and marks the clone aria-hidden; it skips that under prefers-reduced-motion.',
      });
    }
    const focusable = await clone.locator('a, button, [tabindex]').all();
    const reachable = [];
    for (const element of focusable) {
      if ((await element.getAttribute('tabindex')) !== '-1') {
        reachable.push((await element.textContent()) || '(no text)');
      }
    }
    if (reachable.length > 0) {
      throw friendly({
        message: 'The duplicated live feed entries are still in the tab order.',
        hint: reachable.join('\n  '),
      });
    }
  },
);

/**
 * Assert the ticker renders each queued item twice — once authored, once cloned.
 *
 * Example #1: Then the live feed should repeat its entries once for the seamless loop
 * Example #2: And the live feed should repeat its entries once for the seamless loop
 * Example #3: Then the live feed should repeat its entries once for the seamless loop
 * Example #4: And we should see the live feed repeat its entries once for the seamless loop
 * Example #5: Then the live feed should repeat its entries once for the seamless loop
 */
Then(
  /^the live feed should repeat its entries once for the seamless loop$/,
  async function () {
    const authored = await this.page.locator(AUTHORED_ITEM).count();
    const total = await this.page.locator('.live-feed-item').count();
    if (authored === 0) throw friendly({ message: 'The live feed rendered no entries.' });
    if (total !== authored * 2) {
      throw friendly({
        message: 'The live feed did not render exactly one clone of its entries.',
        hint: `Authored entries: ${authored}, rendered entries: ${total}.`,
      });
    }
  },
);

// Put the site back the way the scenario found it. Defined after the
// varbase-e2e hooks, so it runs first and still has an open browser.
After({ tags: '@live-feed-restore' }, async function () {
  if (!this.page) return;

  if (this.rightupUnpublished || this.rightupQueueOriginal) {
    const loggedIn = await this.page
      .locator('a[href="/user/logout"], a[href^="/user/logout"]')
      .count()
      .catch(() => 0);
    if (!loggedIn) await loginAs(this, 'webmaster');
  }

  if (this.rightupUnpublished) {
    await setModerationState(this, this.rightupUnpublished.nid, 'Published').catch(() => {});
    this.rightupUnpublished = null;
  }

  await restoreQueue(this).catch(() => {});
  this.rightupQueueSnapshot = null;
  this.rightupQueueOriginal = undefined;
});
