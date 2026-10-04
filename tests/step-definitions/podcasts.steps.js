'use strict';

// Custom steps for the podcasts section (17-content-podcasts). Regions are named
// selectors in tests/selectors/default-theme.json.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { When, Then, After, AfterStep } = require('@cucumber/cucumber');
const {
  smartSettle,
  friendly,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

const budgetOf = (world) => (world.minWaitTime && world.minWaitTime.page) || 8000;
const squash = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/**
 * Resolve a named region from the selector registry.
 */
function region(world, name) {
  const css = (world.__selectorsCss || {})[name];
  if (!css) {
    throw friendly({
      action: 'find the region',
      target: name,
      hint: 'Register it in tests/selectors/default-theme.json.',
    });
  }
  return world.page.locator(css).first();
}

/**
 * Poll an async reader until the check passes or the budget runs out.
 */
async function poll(read, check, timeout = 10000) {
  const end = Date.now() + timeout;
  let value = await read();
  while (!check(value) && Date.now() < end) {
    await new Promise((r) => setTimeout(r, 200));
    value = await read();
  }
  return value;
}

/**
 * The titles a region lists: podcast card headings, episode row headings, or
 * the link texts of a plain link list.
 */
async function itemTitles(world, name) {
  const loc = region(world, name);
  await loc.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  return loc.evaluate((root) => {
    const text = (e) => e.textContent.replace(/\s+/g, ' ').trim();
    const cards = root.querySelectorAll('.podcast-card :is(h2, h3)');
    if (cards.length) return [...cards].map(text);
    const rows = root.querySelectorAll('.views-row :is(h2, h3)');
    if (rows.length) return [...rows].map(text);
    return [...root.querySelectorAll('a')].map(text).filter(Boolean);
  }).catch(() => []);
}

/**
 * The podcast card whose title reads exactly as given.
 */
function podcastCard(world, title) {
  return world.page
    .locator('article.podcast-card')
    .filter({ has: world.page.locator(':is(h2, h3)', { hasText: new RegExp(`^\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) }) })
    .first();
}

/**
 * The node id of the page in the browser, from drupalSettings.
 */
async function currentNid(page) {
  return page.evaluate(() => {
    const s = window.drupalSettings;
    const p = (s && s.path && s.path.currentPath) || '';
    const m = p.match(/^node\/(\d+)/);
    return m ? m[1] : null;
  });
}

/**
 * Assert a region lists exactly these titles, in this order.
 *
 * Example #1: Then the "podcasts listing" should list, in order:
 * Example #2: And the "more podcasts" should list, in order:
 * Example #3: Then the "listen on" should list, in order:
 * Example #4: And the "more episodes" should list, in order:
 * Example #5: Then the "episodes list" should list, in order:
 */
Then(/^the "([^"]+)" should list, in order:$/, async function (name, table) {
  const expected = table.raw().map((r) => squash(r[0]));
  const actual = await poll(() => itemTitles(this, name), (v) => JSON.stringify(v) === JSON.stringify(expected));
  assert.deepStrictEqual(actual, expected, `The "${name}" lists ${JSON.stringify(actual)}.`);
});

/**
 * Assert how many podcasts or episodes a region lists.
 *
 * Example #1: Then the "podcasts listing" should list 6 podcasts
 * Example #2: And the "more podcasts" should list 3 podcasts
 * Example #3: Then the "episodes list" should list 7 episodes
 * Example #4: And the "more episodes" should list 3 episodes
 * Example #5: Then the "listen on" should list 5 items
 */
Then(/^the "([^"]+)" should list (\d+) (?:podcasts?|episodes?|items?)$/, async function (name, count) {
  const want = parseInt(count, 10);
  const actual = await poll(() => itemTitles(this, name), (v) => v.length === want);
  assert.strictEqual(actual.length, want, `The "${name}" lists ${actual.length}: ${JSON.stringify(actual)}.`);
});

/**
 * Assert a region does, or does not, list a title.
 *
 * Example #1: Then the "more podcasts" should not list "Last Call"
 * Example #2: And the "more podcasts" should list "Field Notes"
 * Example #3: Then the "more episodes" should not list "No Straight Walls"
 * Example #4: And the "episodes list" should not list "A Draft Nobody Should Hear"
 * Example #5: Then the "podcasts listing" should list "Small Practice"
 */
Then(/^the "([^"]+)" should( not)? list "([^"]+)"$/, async function (name, not, title) {
  const titles = await itemTitles(this, name);
  assert.strictEqual(titles.includes(title), !not, `The "${name}" lists ${JSON.stringify(titles)}.`);
});

/**
 * Assert a podcast card shows a piece of text.
 *
 * Example #1: Then the "Last Call" podcast card should show "19 Episodes"
 * Example #2: And the "Field Notes" podcast card should show "View Show"
 * Example #3: Then the "Office Hours" podcast card should show "10 Episodes"
 * Example #4: And the "Small Practice" podcast card should show "10 Episodes"
 * Example #5: Then the "The Long Table" podcast card should show "8 Episodes"
 */
Then(/^the "([^"]+)" podcast card should show "([^"]+)"$/, async function (title, text) {
  const card = podcastCard(this, title);
  const got = await poll(async () => squash(await card.textContent().catch(() => '')), (v) => v.includes(text));
  assert.ok(got.includes(text), `The "${title}" podcast card reads "${got}".`);
});

/**
 * Assert a podcast card carries a cover image with a text alternative.
 *
 * Example #1: Then the "Last Call" podcast card should have a cover image
 * Example #2: And the "Field Notes" podcast card should have a cover image
 * Example #3: Then the "Office Hours" podcast card should have a cover image
 * Example #4: And the "Small Practice" podcast card should have a cover image
 * Example #5: Then the "Material World" podcast card should have a cover image
 */
Then(/^the "([^"]+)" podcast card should have a cover image$/, async function (title) {
  const img = podcastCard(this, title).locator('.podcast-card__media img').first();
  assert.ok(await img.count(), `The "${title}" podcast card has no cover image.`);
  assert.ok(squash(await img.getAttribute('alt')), `The "${title}" podcast cover has an empty alt text.`);
});

/**
 * Assert a podcast card shows the show's summary from the demo content.
 *
 * Example #1: Then the "Last Call" podcast card should show its summary
 * Example #2: And the "Field Notes" podcast card should show its summary
 * Example #3: Then the "Office Hours" podcast card should show its summary
 * Example #4: And the "Small Practice" podcast card should show its summary
 * Example #5: Then the "Material World" podcast card should show its summary
 */
Then(/^the "([^"]+)" podcast card should show its summary$/, async function (title) {
  const summary = demoContent('podcast', title, 'field_description');
  if (!summary) throw friendly({ action: 'find the summary of', target: title, hint: 'No podcast with that title in content/node.' });
  const text = squash(await podcastCard(this, title).textContent().catch(() => ''));
  assert.ok(text.includes(squash(summary)), `The "${title}" podcast card reads "${text}".`);
});

/**
 * Assert a region shows the summary the demo content gives a podcast or episode.
 *
 * Example #1: Then the "page header" should show the summary of the "Last Call" podcast
 * Example #2: And the "episode details" should show the summary of the "No Straight Walls" episode
 * Example #3: Then the "page header" should show the summary of the "The Long Table" podcast
 * Example #4: And the "episode details" should show the summary of the "Clients on Stage" episode
 * Example #5: Then the "page header" should show the summary of the "Field Notes" podcast
 */
Then(/^the "([^"]+)" should show the summary of the "([^"]+)" (podcast|episode)$/, async function (name, title, kind) {
  const summary = demoContent(kind === 'podcast' ? 'podcast' : 'podcast_episode', title, 'field_description');
  if (!summary) throw friendly({ action: 'find the summary of', target: title });
  const text = squash(await region(this, name).textContent());
  assert.ok(text.includes(squash(summary)), `The "${name}" does not show the summary of "${title}".`);
});

/**
 * Assert a region shows an image that carries a text alternative.
 *
 * Example #1: Then the "page header" should show an image with a text alternative
 * Example #2: And the "audio player" should show an image with a text alternative
 * Example #3: Then the "podcasts listing" should show an image with a text alternative
 * Example #4: And the "more podcasts" should show an image with a text alternative
 * Example #5: Then the "page header" should show an image with a text alternative
 */
Then(/^the "([^"]+)" should show an image with a text alternative$/, async function (name) {
  const alts = await region(this, name).locator('img').evaluateAll((imgs) => imgs.map((i) => (i.getAttribute('alt') || '').trim()));
  assert.ok(alts.some(Boolean), `The "${name}" shows no image with a text alternative (${JSON.stringify(alts)}).`);
});

/**
 * Assert a link inside a podcast card goes to a path.
 *
 * Example #1: Then the "Last Call" link in the "Last Call" podcast card should go to "/podcasts/last-call"
 * Example #2: And the "View Show" link in the "Last Call" podcast card should go to "/podcasts/last-call"
 * Example #3: Then the "Field Notes" link in the "Field Notes" podcast card should go to "/podcasts/field-notes"
 * Example #4: And the "View Show" link in the "Field Notes" podcast card should go to "/podcasts/field-notes"
 * Example #5: Then the "View Show" link in the "The Long Table" podcast card should go to "/podcasts/long-table"
 */
Then(/^the "([^"]+)" link in the "([^"]+)" podcast card should go to "([^"]+)"$/, async function (text, title, path) {
  const link = podcastCard(this, title).locator('a').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) }).first();
  assert.ok(await link.count(), `The "${title}" podcast card has no "${text}" link.`);
  assert.strictEqual(new URL(await link.getAttribute('href'), this.launchUrl).pathname, path);
});

/**
 * Follow a link inside a podcast card.
 *
 * Example #1: When I click "View Show" in the "Field Notes" podcast card
 * Example #2: And I click "Last Call" in the "Last Call" podcast card
 * Example #3: When we click "View Show" in the "Office Hours" podcast card
 * Example #4: And I click "View Show" in the "Small Practice" podcast card
 * Example #5: When I click "The Long Table" in the "The Long Table" podcast card
 */
When(/^(?:I |we )*click "([^"]+)" in the "([^"]+)" podcast card$/, async function (text, title) {
  const link = podcastCard(this, title).locator('a').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) }).first();
  const before = this.page.url();
  await Promise.all([this.page.waitForURL((u) => u.href !== before, { timeout: 30000 }), link.click()]);
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Assert a link inside a named region goes to a path or URL.
 *
 * Example #1: Then the "View All" link in the "more episodes" should go to "/podcasts/last-call"
 * Example #2: And the "RSS" link in the "listen on" should go to "/podcasts/feed"
 * Example #3: Then the "Spotify" link in the "listen on" should go to "https://open.spotify.com"
 * Example #4: And the "Share on Facebook (opens in a new tab)" link in the "share" should go to "https://www.facebook.com/sharer/sharer.php"
 * Example #5: Then the "No Straight Walls" link in the "more episodes" should go to "/podcasts/last-call/no-straight-walls"
 */
Then(/^the "([^"]+)" link in the "([^"]+)" should go to "([^"]+)"$/, async function (text, name, target) {
  const link = region(this, name).getByRole('link', { name: text, exact: true }).first();
  assert.ok(await link.count(), `The "${name}" has no "${text}" link.`);
  const href = new URL(await link.getAttribute('href'), this.launchUrl);
  const actual = /^https?:/.test(target) ? `${href.origin}${href.pathname}`.replace(/\/$/, '') : href.pathname;
  assert.strictEqual(actual, target.replace(/\/$/, ''), `The "${text}" link goes to ${href}.`);
});

/**
 * Assert the "listen on" links match the podcast's links in the demo content:
 * same platforms, same order, same addresses.
 *
 * Example #1: Then the episode should offer every platform of the "Last Call" podcast, in order
 * Example #2: And the episode should offer every platform of the "The Long Table" podcast, in order
 * Example #3: Then the episode should offer every platform of the "Field Notes" podcast, in order
 * Example #4: And the episode should offer every platform of the "Office Hours" podcast, in order
 * Example #5: Then the episode should offer every platform of the "Small Practice" podcast, in order
 */
Then(/^the episode should offer every platform of the "([^"]+)" podcast, in order$/, async function (title) {
  const want = demoListenLinks(title);
  if (!want.length) throw friendly({ action: 'find the Listen on links of', target: title, hint: 'No such podcast in content/node.' });
  const got = await region(this, 'listen on').locator('a').evaluateAll((as) => as.map((a) => ({
    uri: a.origin === location.origin ? a.pathname : a.href.replace(/\/$/, ''),
    // The theme adds a visually hidden new-tab hint to external links; the platform name is what is compared.
    title: a.textContent.replace(/\s+/g, ' ').trim().replace(/ \(opens in a new tab\)$/, ''),
  })));
  assert.deepStrictEqual(got, want.map((l) => ({ uri: l.uri.replace(/\/$/, ''), title: l.title })));
});

/**
 * Assert the "Episode N" labels of a region count down without a gap.
 *
 * Example #1: Then the episode numbers in the "episodes list" should count down from 19 to 13
 * Example #2: And the episode numbers in the "episodes list" should count down from 19 to 6
 * Example #3: Then the episode numbers in the "episodes list" should count down from 10 to 4
 * Example #4: And the episode numbers in the "episodes list" should count down from 8 to 2
 * Example #5: Then the episode numbers in the "episodes list" should count down from 19 to 1
 */
Then(/^the episode numbers in the "([^"]+)" should count down from (\d+) to (\d+)$/, async function (name, from, to) {
  const want = [];
  for (let n = parseInt(from, 10); n >= parseInt(to, 10); n--) want.push(n);
  const read = () => region(this, name).evaluate((root) =>
    [...root.textContent.matchAll(/Episode\s+(\d+)/g)].map((m) => parseInt(m[1], 10)));
  const got = await poll(read, (v) => JSON.stringify(v) === JSON.stringify(want));
  assert.deepStrictEqual(got, want, `The "${name}" numbers its episodes ${JSON.stringify(got)}.`);
});

/**
 * Assert every episode title in a region links to a page under a path.
 *
 * Example #1: Then every episode in the "episodes list" should link to a page under "/podcasts/last-call/"
 * Example #2: And every episode in the "more episodes" should link to a page under "/podcasts/last-call/"
 * Example #3: Then every episode in the "episodes list" should link to a page under "/podcasts/field-notes/"
 * Example #4: And every episode in the "episodes list" should link to a page under "/podcasts/office-hours/"
 * Example #5: Then every episode in the "more episodes" should link to a page under "/podcasts/long-table/"
 */
Then(/^every episode in the "([^"]+)" should link to a page under "([^"]+)"$/, async function (name, prefix) {
  const hrefs = await region(this, name).evaluate((root) =>
    [...root.querySelectorAll('.views-row :is(h2, h3) a')].map((a) => a.pathname));
  assert.ok(hrefs.length, `The "${name}" lists no episode links.`);
  const strays = hrefs.filter((h) => !h.startsWith(prefix) || h === prefix);
  assert.deepStrictEqual(strays, [], `These episodes link outside "${prefix}".`);
});

/**
 * Open an episode by clicking its row where its title is, as a visitor would.
 * The whole row is one link, so the click lands on the row's covering link.
 *
 * Example #1: When I open the "No Straight Walls" episode from the "episodes list"
 * Example #2: And I open the "Clients on Stage" episode from the "episodes list"
 * Example #3: When I open the "One Colour, Eleven Years" episode from the "more episodes"
 * Example #4: And we open the "Critics' Table" episode from the "more episodes"
 * Example #5: When I open the "Ten Years of One Logo" episode from the "episodes list"
 */
When(/^(?:I |we )*open the "([^"]+)" episode from the "([^"]+)"$/, async function (title, name) {
  const link = region(this, name).getByRole('link', { name: title, exact: true }).first();
  await link.scrollIntoViewIfNeeded();
  const before = this.page.url();
  await Promise.all([
    this.page.waitForURL((u) => u.href !== before, { timeout: 30000 }),
    link.click({ force: true }),
  ]);
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Click "View More Episodes" and wait for the next episodes to arrive in place.
 *
 * Example #1: When I load more episodes
 * Example #2: And I load more episodes
 * Example #3: When we load more episodes
 * Example #4: And we load more episodes
 * Example #5: Given I load more episodes
 */
When(/^(?:I |we )*load more episodes$/, async function () {
  const list = region(this, 'episodes list');
  const rows = list.locator('.views-row');
  const before = await rows.count();
  await this.page.evaluate(() => { window.__rightupStillHere = true; });
  await list.getByRole('link', { name: 'View More Episodes', exact: true }).click();
  const after = await poll(() => rows.count(), (n) => n > before, 15000);
  if (after <= before) {
    throw friendly({ action: 'load more episodes', hint: `The list stayed at ${before} episodes.` });
  }
  await smartSettle(this.page, 1500);
});

/**
 * Assert the browser did not leave or reload the page since "load more episodes".
 *
 * Example #1: Then the page should not have reloaded
 * Example #2: And the page should not have reloaded
 * Example #3: Then the page should not have reloaded
 * Example #4: And the page should not have reloaded
 * Example #5: But the page should not have reloaded
 */
Then(/^the page should not have reloaded$/, async function () {
  const still = await this.page.evaluate(() => window.__rightupStillHere === true);
  assert.ok(still, 'The page was reloaded, so the episodes did not load in place.');
});

/**
 * Move keyboard focus to a button by its accessible name.
 *
 * Example #1: When I focus the "Play" button
 * Example #2: And I focus the "Pause" button
 * Example #3: When I focus the "Skip forward" button
 * Example #4: And I focus the "Skip back" button
 * Example #5: When we focus the "Read More" button
 */
When(/^(?:I |we )*focus the "([^"]+)" button$/, async function (name) {
  await this.page.getByRole('button', { name, exact: true }).first().focus();
});

/**
 * Assert the episode audio is playing or paused.
 *
 * Example #1: Then the episode audio should be playing
 * Example #2: And the episode audio should be paused
 * Example #3: Then the episode audio should be paused
 * Example #4: And the episode audio should be playing
 * Example #5: But the episode audio should be paused
 */
Then(/^the episode audio should be (playing|paused)$/, async function (state) {
  const audio = region(this, 'audio player').locator('audio');
  const want = state === 'paused';
  const paused = await poll(() => audio.evaluate((a) => a.paused), (v) => v === want, 15000);
  assert.strictEqual(paused, want, `The episode audio is ${paused ? 'paused' : 'playing'}.`);
});

/**
 * Press a skip button of the player and remember how far the audio moved.
 *
 * Example #1: When I skip forward in the episode
 * Example #2: And I skip back in the episode
 * Example #3: When we skip forward in the episode
 * Example #4: And we skip back in the episode
 * Example #5: Given I skip forward in the episode
 */
When(/^(?:I |we )*skip (forward|back) in the episode$/, async function (direction) {
  const audio = region(this, 'audio player').locator('audio');
  // PHP's built-in server (CI's drush runserver) has no range requests, so no audio can seek there.
  const seekable = await poll(() => audio.evaluate((a) => (a.seekable.length ? a.seekable.end(0) : 0)), (v) => v > 20, 8000);
  if (!(seekable > 20)) {
    this.attach('Skipped: the server does not allow seeking this audio (no HTTP range requests).');
    return 'skipped';
  }
  const start = await audio.evaluate((a) => a.currentTime);
  await this.page.getByRole('button', { name: direction === 'forward' ? 'Skip forward' : 'Skip back', exact: true }).click();
  const end = await poll(() => audio.evaluate((a) => a.currentTime), (t) => Math.abs(t - start) >= 1, 5000);
  this.rightupAudioMoved = end - start;
});

/**
 * Assert the last skip moved the audio by about N seconds.
 *
 * Example #1: Then the episode should have moved forward by about 15 seconds
 * Example #2: And the episode should have moved back by about 15 seconds
 * Example #3: Then the episode should have moved forward by about 15 seconds
 * Example #4: And the episode should have moved back by about 15 seconds
 * Example #5: Then the episode should have moved forward by about 30 seconds
 */
Then(/^the episode should have moved (forward|back) by about (\d+) seconds$/, async function (direction, seconds) {
  const want = (direction === 'forward' ? 1 : -1) * parseInt(seconds, 10);
  const moved = this.rightupAudioMoved || 0;
  assert.ok(Math.abs(moved - want) <= 2, `The episode moved ${moved.toFixed(1)} seconds.`);
});

/**
 * Assert the audio transcript is collapsed or expanded, both to the eye and to
 * assistive technology.
 *
 * Example #1: Then the audio transcript should be collapsed
 * Example #2: And the audio transcript should be expanded
 * Example #3: Then the audio transcript should be expanded
 * Example #4: And the audio transcript should be collapsed
 * Example #5: But the audio transcript should be collapsed
 */
Then(/^the audio transcript should be (collapsed|expanded)$/, async function (state) {
  const root = region(this, 'audio transcript');
  const read = () => root.evaluate((r) => {
    const c = r.querySelector('.read-more__content');
    const t = r.querySelector('.read-more__toggle');
    return { aria: t && !t.hidden ? t.getAttribute('aria-expanded') : null, clipped: c.scrollHeight - c.clientHeight > 2 };
  });
  const want = state === 'expanded' ? { aria: 'true', clipped: false } : { aria: 'false', clipped: true };
  const got = await poll(read, (v) => v.aria === want.aria && v.clipped === want.clipped, 5000);
  assert.deepStrictEqual(got, want, `The transcript reports ${JSON.stringify(got)}.`);
});

/**
 * Assert how the title length indicator rates the title typed so far.
 *
 * Example #1: Then the title length indicator should rate the title as "bad"
 * Example #2: And the title length indicator should rate the title as "good"
 * Example #3: Then the title length indicator should rate the title as "ok"
 * Example #4: And the title length indicator should rate the title as "bad"
 * Example #5: Then the title length indicator should rate the title as "good"
 */
Then(/^the title length indicator should rate the title as "(bad|ok|good)"$/, async function (rating) {
  const indicator = this.page.locator('.form-item--title-0-value').locator('xpath=..').locator('.length-indicator').first();
  assert.ok(await indicator.isVisible(), 'The title has no length indicator.');
  const active = await poll(
    () => indicator.locator('.is-active').getAttribute('class').catch(() => ''),
    (c) => (c || '').includes(`--${rating}`),
    5000,
  );
  assert.ok((active || '').includes(`--${rating}`), `The length indicator rates the title as "${active}".`);
});

/**
 * Assert the content form offers these fields, wherever their tab is.
 *
 * Example #1: Then the content form should offer the fields:
 * Example #2: And the content form should offer the fields:
 * Example #3: Then the content form should offer the fields:
 * Example #4: And the content form should offer the fields:
 * Example #5: Then the content form should offer the fields:
 */
Then(/^the content form should offer the fields:$/, async function (table) {
  const wanted = table.raw().map((r) => squash(r[0]));
  const labels = await this.page.evaluate(() =>
    [...document.querySelectorAll('form.node-form :is(label, legend, .fieldset__legend, .form-item__label, th)')]
      .map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  const missing = wanted.filter((w) => !labels.includes(w));
  assert.deepStrictEqual(missing, [], 'The content form is missing these fields.');
});

/**
 * The media types the open media library offers, by their tab titles.
 */
async function mediaLibraryTypes(page) {
  return page.locator('.ui-dialog .js-media-library-menu a[data-title]').evaluateAll((as) => as.map((a) => a.dataset.title));
}

/**
 * Assert the open media library offers only one media type.
 *
 * Example #1: Then the media library should offer only the "Image" media type
 * Example #2: And the media library should offer only the "Image" media type
 * Example #3: Then the media library should offer only the "Audio" media type
 * Example #4: And the media library should offer only the "Remote video" media type
 * Example #5: Then the media library should offer only the "Document" media type
 */
Then(/^the media library should offer only the "([^"]+)" media type$/, async function (type) {
  await this.page.locator('.ui-dialog .media-library-view').first().waitFor({ state: 'visible', timeout: 20000 });
  const types = await mediaLibraryTypes(this.page);
  // A single allowed type renders no type menu at all.
  assert.ok(types.length === 0 || (types.length === 1 && types[0] === type), `The media library offers ${JSON.stringify(types)}.`);
});

/**
 * Pick an image from the media library as the Cover art of the content form.
 *
 * Example #1: When I add the "Microphone with headphones" image as the cover art
 * Example #2: And I add the "Microphone with headphones" image as the cover art
 * Example #3: When we add the "Museum gallery room" image as the cover art
 * Example #4: And I add the "Green grid poster" image as the cover art
 * Example #5: Given I add the "Mirrored corridor" image as the cover art
 */
When(/^(?:I |we )*add the "([^"]+)" image as the cover art$/, { timeout: 120000 }, async function (name) {
  const page = this.page;
  const budget = budgetOf(this);
  const dialog = page.locator('.ui-dialog .media-library-view').first();
  await page.locator('input[id*="field-featured-image-open-button"]:visible').first().click();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await smartSettle(page, budget);
  const imageTab = page.locator('.ui-dialog .media-library-menu-image a').first();
  if ((await imageTab.count()) && !(await imageTab.evaluate((a) => a.classList.contains('active')))) {
    await imageTab.click();
    await page.locator('.ui-dialog .media-library-menu-image a.active').waitFor({ timeout: 20000 });
    await smartSettle(page, budget);
  }
  const filter = page.locator('.ui-dialog input[name="name"]').first();
  if (await filter.count()) {
    await filter.fill(name);
    await page.locator('.ui-dialog input[type="submit"][value="Apply filters"]').first().click();
    await smartSettle(page, budget);
  }
  const item = page.getByLabel(`Select ${name}`, { exact: true }).first();
  await item.waitFor({ state: 'attached', timeout: 20000 }).catch(() => {
    throw friendly({ action: 'find the image', target: name, hint: 'Check the image exists in the media library.' });
  });
  await item.check({ force: true });
  await page.locator('.ui-dialog-buttonpane button').filter({ hasText: 'Insert selected' }).first().click();
  await dialog.waitFor({ state: 'detached', timeout: 30000 }).catch(() => {});
  await smartSettle(page, budget);
  const chosen = page.locator('fieldset.js-media-library-widget').filter({ hasText: 'Cover art' }).locator('.js-media-library-item');
  await chosen.first().waitFor({ state: 'attached', timeout: 20000 });
});

/**
 * Remember a saved node, so the After hook removes it even on a failure.
 */
async function trackSaved(world) {
  const nid = await currentNid(world.page);
  if (nid) {
    world.rightupSaved = world.rightupSaved || [];
    world.rightupSaved.push(nid);
    world.rightupSavedPath = new URL(world.page.url()).pathname;
  }
  return nid;
}

const onNodeForm = (url) => /\/node\/(add\/[^/?]+|\d+\/edit)/.test(url);

/**
 * Save the content form and require that it saved.
 *
 * Example #1: When I save the content
 * Example #2: And I save the content
 * Example #3: When we save the content
 * Example #4: And we save the content
 * Example #5: Given I save the content
 */
async function submitNodeForm(page) {
  // Gin's sticky top bar covers the form's own Save button, so click it in-page.
  const button = page.locator('form.node-form #edit-submit').first();
  // The browser itself refuses a form with an empty required field: no request.
  if (!(await button.evaluate((el) => el.form.checkValidity()))) {
    await button.evaluate((el) => el.click());
    return;
  }
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {}),
    button.evaluate((el) => el.click()),
  ]);
}

When(/^(?:I |we )*save the content$/, { timeout: 90000 }, async function () {
  await submitNodeForm(this.page);
  await smartSettle(this.page, budgetOf(this));
  if (onNodeForm(this.page.url())) {
    const errors = squash(await this.page.locator('[data-drupal-messages] .messages--error, .messages--error').allTextContents().then((a) => a.join(' | ')));
    throw friendly({ action: 'save the content', hint: errors || 'The form did not save.' });
  }
  await trackSaved(this);
});

/**
 * Submit the content form without requiring that it saves.
 *
 * Example #1: When I try to save the content
 * Example #2: And I try to save the content
 * Example #3: When we try to save the content
 * Example #4: And we try to save the content
 * Example #5: Given I try to save the content
 */
When(/^(?:I |we )*try to save the content$/, { timeout: 90000 }, async function () {
  await submitNodeForm(this.page);
  await smartSettle(this.page, budgetOf(this));
  if (!onNodeForm(this.page.url())) await trackSaved(this);
});

/**
 * Assert the save was refused because a required field is empty, whether the
 * browser or Drupal refused it.
 *
 * Example #1: Then saving should be refused because "Podcast" is required
 * Example #2: And saving should be refused because "Summary" is required
 * Example #3: Then saving should be refused because "Cover art" is required
 * Example #4: And saving should be refused because "Title" is required
 * Example #5: Then saving should be refused because "Podcast" is required
 */
Then(/^saving should be refused because "([^"]+)" is required$/, async function (label) {
  assert.ok(onNodeForm(this.page.url()), `The content was saved: the browser is on ${this.page.url()}.`);
  const byServer = squash(await this.page.locator('.messages--error, .form-item--error-message').allTextContents().then((a) => a.join(' ')));
  // Drupal names the field in its error summary, linking to it.
  const linked = await this.page.locator('.messages--error a').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }).count();
  const listed = new RegExp(`been found:.*\\b${label}\\b`).test(byServer);
  if (byServer.includes(`${label} field is required`) || linked || listed) return;
  const field = this.page.locator('form.node-form').getByLabel(label, { exact: true }).first();
  const missing = (await field.count()) ? await field.evaluate((el) => el.required && el.validity.valueMissing) : false;
  assert.ok(missing, `"${label}" was not reported as required. Errors shown: "${byServer}".`);
});

/**
 * Open a tab of the content form by its label.
 *
 * Example #1: When I open the "Audio" tab of the content form
 * Example #2: And I open the "Categorization" tab of the content form
 * Example #3: When we open the "Options" tab of the content form
 * Example #4: And I open the "General" tab of the content form
 * Example #5: When I open the "Search Engine Optimization (SEO)" tab of the content form
 */
When(/^(?:I |we )*open the "([^"]+)" tab of the content form$/, async function (label) {
  const tab = this.page
    .locator('form.node-form :is(.horizontal-tabs-list a, .vertical-tabs__menu a, [role="tab"])')
    .filter({ hasText: new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\(active tab\\))?\\s*$`) })
    .first();
  if (await tab.count()) {
    await tab.click();
  } else {
    const opened = await this.page.evaluate((wanted) => {
      const d = [...document.querySelectorAll('form.node-form details')].find((x) => x.querySelector('summary')?.textContent.trim().startsWith(wanted));
      if (d) d.open = true;
      return !!d;
    }, label);
    if (!opened) throw friendly({ action: 'open the tab', target: label });
  }
  await smartSettle(this.page, 1500);
});

/**
 * Go back to the page of the content saved last in this scenario.
 *
 * Example #1: When I go to the content I saved
 * Example #2: And I go to the content I saved
 * Example #3: When we go to the content I saved
 * Example #4: And we go to the content I saved
 * Example #5: Given I go to the content I saved
 */
When(/^(?:I |we )*go to the content I saved$/, async function () {
  if (!this.rightupSavedPath) throw friendly('Nothing was saved in this scenario.');
  await this.page.goto(this.launchUrl + this.rightupSavedPath, { waitUntil: 'domcontentloaded' });
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Assert a named region shows, or does not show, a piece of text.
 *
 * Example #1: Then I should see "10 Episodes" in the "episode count"
 * Example #2: And I should see "Hosted and Written by Sam Porter" in the "episode details"
 * Example #3: Then I should not see "Last Call" in the "more podcasts"
 * Example #4: And we should see "Copy site URL" in the "share"
 * Example #5: Then I should see "Episode 16" in the "episode details"
 */
Then(/^(?:I |we )*should( not)? see "([^"]+)" in the "([^"]+)"$/, async function (not, text, name) {
  const loc = region(this, name);
  const read = async () => squash(await loc.textContent().catch(() => ''));
  const got = await poll(read, (v) => v.includes(text) === !not, 5000);
  assert.strictEqual(got.includes(text), !not, `The "${name}" reads "${got.slice(0, 300)}".`);
});

/**
 * The demo content (content/node/*.yml) of a podcast or episode, by title, so
 * the suite follows the content rather than repeating it.
 */
function demoNodes() {
  const dir = path.join(__dirname, '..', '..', 'content', 'node');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
}

function yamlValue(yml, name) {
  const m = yml.match(new RegExp(`\\n  ${name}:\\n    -\\n      (?:value|entity): ["']?(.*?)["']?\\n`));
  return m ? m[1].replace(/''/g, "'") : null;
}

function demoNode(bundle, title) {
  return demoNodes().find((y) => y.includes(`bundle: ${bundle}\n`) && yamlValue(y, 'title') === title) || null;
}

function demoContent(bundle, title, field) {
  const node = demoNode(bundle, title);
  if (!node) return null;
  const own = yamlValue(node, field);
  if (own || bundle !== 'podcast_episode') return own;
  const show = demoNodes().find((y) => y.includes(`uuid: ${yamlValue(node, 'field_podcast')}`));
  return show ? yamlValue(show, field) : null;
}

/**
 * The "Listen on" links the demo content gives a podcast, in order.
 */
function demoListenLinks(title) {
  const yml = demoNode('podcast', title);
  const block = yml && (yml.split('\n  field_listen_links:\n')[1] || '').split(/\n  \S/)[0];
  if (!block) return [];
  const unquote = (v) => v.trim().replace(/^["']|["']$/g, '');
  return [...block.matchAll(/uri: (.*)\n\s+title: (.*)/g)].map((m) => ({
    uri: unquote(m[1]).replace(/^internal:/, ''),
    title: unquote(m[2]),
  }));
}

const demoHost = (title) => demoContent('podcast_episode', title, 'field_host');

/**
 * Assert the episode shows the date the demo content publishes it on, in words.
 *
 * Example #1: Then the episode should show the date it was published
 * Example #2: And the episode should show the date it was published
 * Example #3: Then the episode should show the date it was published
 * Example #4: And the episode should show the date it was published
 * Example #5: But the episode should show the date it was published
 */
Then(/^the episode should show the date it was published$/, async function () {
  const title = squash(await this.page.locator('main h1').first().textContent());
  const yml = demoNode('podcast_episode', title);
  const created = yml && parseInt((yml.match(/\n  created:\n\s*-\s*value: (\d+)/) || [])[1], 10);
  if (!created) throw friendly({ action: 'find the publication date of', target: title });
  const time = region(this, 'episode details').locator('time[datetime]').first();
  const datetime = await time.getAttribute('datetime');
  assert.strictEqual(Date.parse(datetime) / 1000, created, `The episode is dated ${datetime}.`);
  const [y, m, d] = datetime.slice(0, 10).split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  assert.strictEqual(squash(await time.textContent()), `${months[m - 1]} ${d}, ${y}`);
});

/**
 * Assert the episode page credits the host the demo content gives the episode.
 *
 * Example #1: Then the episode should be credited to its host
 * Example #2: And the episode should be credited to its host
 * Example #3: Then the episode should be credited to its host
 * Example #4: And the episode should be credited to its host
 * Example #5: But the episode should be credited to its host
 */
Then(/^the episode should be credited to its host$/, async function () {
  const title = squash(await this.page.locator('main h1').first().textContent());
  const host = demoHost(title);
  if (!host) throw friendly({ action: 'find the host of', target: title, hint: 'No episode with that title in content/node.' });
  const details = squash(await region(this, 'episode details').textContent());
  assert.ok(details.includes(`Hosted and Written by ${host}`), `The episode details read "${details.slice(0, 200)}".`);
});

/**
 * Assert the current user may, or may not, open the edit or delete form of the
 * content at a path.
 *
 * Example #1: Then I should be able to edit the content at "/podcasts/last-call"
 * Example #2: And I should not be able to delete the content at "/podcasts/last-call"
 * Example #3: Then I should be able to delete the content at "/podcasts/last-call/no-straight-walls"
 * Example #4: And I should not be able to edit the content at "/podcasts/last-call/no-straight-walls"
 * Example #5: Then we should be able to edit the content at "/podcasts/field-notes"
 */
Then(/^(?:I |we )*should( not)? be able to (edit|delete) the content at "([^"]+)"$/, { timeout: 120000 }, async function (not, op, path) {
  // Plain requests on the browser session: no rendering, same cookies.
  const page = await this.page.request.get(this.launchUrl + path);
  const nid = ((await page.text()).match(/"currentPath":"node\\\/(\d+)"/) || [])[1];
  if (!nid) throw friendly({ action: 'find the content at', target: path });
  const res = await this.page.request.get(`${this.launchUrl}/node/${nid}/${op}`, { maxRedirects: 0 });
  const html = await res.text();
  const form = op === 'edit' ? /<form[^>]+class="[^"]*node-form/.test(html) : /<form[^>]+id="[^"]*-delete-form"/.test(html);
  const allowed = res.status() === 200 && form;
  // Opening the edit form takes a content lock; release it for the next user.
  const unlock = (html.match(/href="([^"]*\/admin\/lock\/break\/node\/[^"]+)"/) || [])[1];
  if (unlock) {
    await this.page.goto(new URL(unlock.replace(/&amp;/g, '&'), this.launchUrl).href, { waitUntil: 'domcontentloaded' });
    const confirm = this.page.locator('main form #edit-submit').first();
    if (await confirm.count()) {
      await Promise.all([this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}), confirm.evaluate((el) => el.click())]);
    }
  }
  assert.strictEqual(allowed, !not, `The ${op} form of ${path} answered ${res.status()}.`);
});

/**
 * Assert the page does not scroll sideways at the current viewport.
 *
 * Example #1: Then the page should not scroll horizontally
 * Example #2: And the page should not scroll horizontally
 * Example #3: Then the page should not scroll horizontally
 * Example #4: And the page should not scroll horizontally
 * Example #5: But the page should not scroll horizontally
 */
Then(/^the page should not scroll horizontally$/, async function () {
  const { scroll, client } = await this.page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  assert.ok(scroll <= client, `The page is ${scroll}px wide in a ${client}px viewport.`);
});

/**
 * Tab to a link and assert it shows a visible focus indicator.
 *
 * Example #1: Then the "Last Call" link should show a focus indicator when reached with the keyboard
 * Example #2: And the "View Show" link should show a focus indicator when reached with the keyboard
 * Example #3: Then the "No Straight Walls" link should show a focus indicator when reached with the keyboard
 * Example #4: And the "View More Episodes" link should show a focus indicator when reached with the keyboard
 * Example #5: Then the "Field Notes" link should show a focus indicator when reached with the keyboard
 */
Then(/^the "([^"]+)" link should show a focus indicator when reached with the keyboard$/, async function (name) {
  // Matched by visible text: an icon glyph can leak into a link's accessible name.
  const target = this.page.locator('main a').filter({ hasText: new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) }).first();
  const handle = await target.elementHandle();
  if (!handle) throw friendly({ action: 'find the link', target: name });
  let reached = false;
  for (let i = 0; i < 250 && !reached; i++) {
    await this.page.keyboard.press('Tab');
    reached = await handle.evaluate((el) => document.activeElement === el);
  }
  assert.ok(reached, `The "${name}" link can not be reached with the Tab key.`);
  const style = await handle.evaluate((el) => {
    const s = getComputedStyle(el);
    const after = getComputedStyle(el, '::after');
    return {
      visible: el.matches(':focus-visible'),
      outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
      shadow: s.boxShadow !== 'none' || after.boxShadow !== 'none' || (after.outlineStyle !== 'none' && parseFloat(after.outlineWidth) > 0),
    };
  });
  assert.ok(style.visible && (style.outline || style.shadow), `The "${name}" link shows no focus indicator: ${JSON.stringify(style)}.`);
});

/**
 * Assert no link in a region announces raw HTML entities to screen readers.
 *
 * Example #1: Then every link in the "episodes list" should have a readable accessible name
 * Example #2: And every link in the "more podcasts" should have a readable accessible name
 * Example #3: Then every link in the "podcasts listing" should have a readable accessible name
 * Example #4: And every link in the "more episodes" should have a readable accessible name
 * Example #5: Then every link in the "share" should have a readable accessible name
 */
Then(/^every link in the "([^"]+)" should have a readable accessible name$/, async function (name) {
  const bad = await region(this, name).evaluate((root) =>
    [...root.querySelectorAll('a[aria-label]')]
      .map((a) => a.getAttribute('aria-label'))
      .filter((l) => /&(#\d+|#x[0-9a-f]+|amp|quot|apos|lt|gt);/i.test(l)));
  assert.deepStrictEqual(bad, [], `Links in the "${name}" announce raw HTML entities.`);
});

/**
 * Assert every link showing a text is announced by exactly that text.
 *
 * Example #1: Then every "View Show" link should be announced as "View Show"
 * Example #2: And every "View More Episodes" link should be announced as "View More Episodes"
 * Example #3: Then every "View All" link should be announced as "View All"
 * Example #4: And every "Read More" link should be announced as "Read More"
 * Example #5: Then every "RSS" link should be announced as "RSS"
 */
Then(/^every "([^"]+)" link should be announced as "([^"]+)"$/, async function (text, name) {
  const shown = await this.page.locator('main a').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) }).count();
  const announced = await this.page.locator('main').getByRole('link', { name, exact: true }).count();
  assert.ok(shown > 0, `No "${text}" link is on the page.`);
  assert.strictEqual(announced, shown, `${shown} "${text}" links are shown, ${announced} are announced as "${name}".`);
});

/**
 * Discard an Autosave Form "resume draft" dialog left over by an earlier try.
 */
AfterStep(async function () {
  if (!this.page || !onNodeForm(this.page.url())) return;
  const dialog = this.page.locator('.ui-dialog.autosave-dialog');
  if (!(await dialog.isVisible().catch(() => false))) return;
  await dialog.locator('.ui-dialog-buttonpane button').filter({ hasText: /discard|reject/i }).first().click().catch(() => {});
});

/**
 * Remove every node a scenario saved, as the webmaster, in a separate session
 * so it works whoever the scenario ended as.
 */
After(async function () {
  if (!this.rightupSaved || !this.rightupSaved.length || !this.playwrightBrowser) return;
  const admin = ((this.parameters || {}).users || {}).webmaster;
  if (!admin) return;
  const context = await this.playwrightBrowser.newContext({ ignoreHTTPSErrors: true });
  try {
    const page = await context.newPage();
    await page.goto(`${this.launchUrl}/user/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#edit-name', admin.username || 'webmaster');
    await page.fill('#edit-pass', admin.password);
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.locator('#user-login-form #edit-submit').click()]);
    for (const nid of [...new Set(this.rightupSaved)].reverse()) {
      await page.goto(`${this.launchUrl}/node/${nid}/delete`, { waitUntil: 'domcontentloaded' });
      const confirm = page.locator('form[id$="-delete-form"] #edit-submit');
      if (await confirm.count()) {
        await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), confirm.click()]);
      }
    }
  } finally {
    await context.close();
  }
});
