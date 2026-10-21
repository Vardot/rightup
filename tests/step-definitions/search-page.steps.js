'use strict';

// Search page steps; regions are named selectors in tests/selectors/default-theme.json.

const assert = require('assert');
const { When, Then } = require('@cucumber/cucumber');
const {
  smartSettle,
  friendly,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

const budgetOf = (world) => (world.minWaitTime && world.minWaitTime.page) || 8000;

async function region(world, name, hint) {
  const css = (world.__selectorsCss || {})[name];
  if (!css) throw friendly({ action: 'find the region', target: name, hint: 'Register it in tests/selectors/default-theme.json.' });
  const loc = world.page.locator(css).first();
  await loc.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
  if (!(await loc.count())) throw friendly({ action: 'find the', target: name, hint });
  return loc;
}

// Run an action that loads a new page, then settle.
async function navigate(world, act) {
  const before = world.page.url();
  await Promise.all([
    world.page.waitForURL((url) => url.toString() !== before, { timeout: 15000 }).catch(() => {}),
    act(),
  ]);
  await world.page.waitForLoadState('load').catch(() => {});
  await smartSettle(world.page, budgetOf(world));
}

// Example: When I search for "studio"
When(/^(?:I |we )*search for "([^"]+)"$/, async function (keywords) {
  const form = await region(this, 'search form', 'Go to /search first; the keyword form sits above the results.');
  await form.getByRole('textbox', { name: 'Search by keyword' }).first().fill(keywords);
  await navigate(this, () => form.getByRole('button', { name: 'Search', exact: true }).first().click());
  const now = await (await region(this, 'search form')).getByRole('textbox', { name: 'Search by keyword' }).first().inputValue();
  if (now !== keywords) throw friendly({ action: 'search for', target: keywords, hint: `The keyword field reads "${now}" after the search.` });
});

// Example: When I choose the "Past Year" Date Published filter
When(/^(?:I |we )*choose the "([^"]+)" Date Published filter$/, async function (label) {
  const form = await region(this, 'search date form', 'Go to /search first; the Date Published filter sits beside the results.');
  const radio = form.getByRole('radio', { name: label, exact: true }).first();
  if (!(await radio.count())) throw friendly({ action: 'find the Date Published option', target: label });
  if (await radio.isChecked()) return;
  const before = this.page.url();
  await navigate(this, () => radio.click());
  // The filter submits itself on change; submit it here when that is switched off.
  if (this.page.url() === before) await navigate(this, () => form.evaluate((f) => f.submit()));
});

// Example: Then the search results should be listed newest first
Then(/^the search results should be listed newest first$/, async function () {
  const results = await region(this, 'search results', 'Search for a keyword first.');
  const dates = await results.locator('.views-row').evaluateAll((rows) => rows.map((row) => {
    const time = row.querySelector('time[datetime]');
    return time ? time.getAttribute('datetime') : null;
  }));
  const known = dates.filter(Boolean).map((d) => Date.parse(d));
  assert.ok(known.length > 1, `The search results show ${known.length} dated stories, too few to judge the order.`);
  assert.ok(known.every((d, i) => i === 0 || d <= known[i - 1]), `The search results are not newest first: ${JSON.stringify(dates)}.`);
});
