'use strict';

// Custom steps for the news article page.

const assert = require('assert');
const { Then } = require('@cucumber/cucumber');
const { friendly } = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

/**
 * Assert the author's name and the Share links sit on one row, with Share at the
 * end of the row.
 *
 * Example #1: Then the "Chiara Romano" byline and the Share links should sit on one row
 */
Then(/^the "([^"]+)" byline and the Share links should sit on one row$/, async function (author) {
  const byline = this.page.getByText(author, { exact: true }).first();
  const share = this.page.locator('.webshare').first();
  const [name, links] = [await byline.boundingBox(), await share.boundingBox()];
  if (!name || !links) throw friendly({ action: 'find the byline and the Share links', target: author });
  const rtl = await this.page.evaluate(() => document.documentElement.dir === 'rtl');
  const sameRow = Math.abs((name.y + name.height / 2) - (links.y + links.height / 2)) < 24;
  const atEnd = rtl ? links.x + links.width <= name.x : links.x >= name.x + name.width;
  assert.ok(sameRow && atEnd, `The Share links are not at the end of the row of "${author}" (byline ${JSON.stringify(name)}, share ${JSON.stringify(links)}).`);
});
