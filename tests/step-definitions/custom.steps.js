'use strict';

// -----------------------------------------------------------------------------
// Custom step definitions for the RightUp site template.
//
// The "a working header" / "a working footer" steps assert the RightUp main
// navigation, footer menu, social profiles and credit line. They are
// site-specific, so they live here rather than in the shared
// @vardot/varbase-e2e package. Adapt the expected values to your own site when
// you build on this template.
// -----------------------------------------------------------------------------

const { Then } = require('@cucumber/cucumber');
const {
  smartSettle,
  friendly,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

/**
 * Verify the page header is "working".
 *
 * On a RightUp site the Main navigation menu is rendered through the Drupal
 * Canvas global Header region, so a working header means those primary links
 * are present. Alter the links below to match your own site's main menu.
 *
 * Example: Then the page should have a working header
 *
 * Example #1: Then the page should have a working header
 * Example #2: And I should have a working header
 * Example #3: Then I should have a working header
 * Example #4: And we should have a working header
 * Example #5: Then the page should have a working header
 */
Then(/^(?:the page should have|(?:I |we )*should have) a working header$/, async function () {
  // Smart-wait for the page to reach a quiet edge before reading the header.
  await smartSettle(this.page, (this.minWaitTime && this.minWaitTime.page) || 8000);

  // `banner` is the ARIA role of the site header (<header role="banner">).
  const header = this.page.getByRole('banner').first();
  const text = (await header.textContent().catch(() => '')) || '';

  // Main navigation menu links expected in the header (one per line):
  if (!text.includes('Studios')) throw friendly('Header is missing the "Studios" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Architecture')) throw friendly('Header is missing the "Architecture" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Product')) throw friendly('Header is missing the "Product" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Branding')) throw friendly('Header is missing the "Branding" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Process')) throw friendly('Header is missing the "Process" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Culture')) throw friendly('Header is missing the "Culture" link.', 'Check the Main navigation menu in the Canvas Header region.');
  if (!text.includes('Podcasts')) throw friendly('Header is missing the "Podcasts" link.', 'Check the Main navigation menu in the Canvas Header region.');
});

/**
 * Verify the page footer is "working".
 *
 * On a RightUp site the Main navigation, Footer and Social media menus are
 * rendered through the Drupal Canvas global Footer region. A working footer
 * means the sitemap row and the policy row are present, the social profiles
 * are linked, the copy page link control is there, and the credits show.
 * Alter the lines below to match your own site.
 *
 * Example: Then the page should have a working footer
 *
 * Example #1: Then the page should have a working footer
 * Example #2: And I should have a working footer
 * Example #3: Then I should have a working footer
 * Example #4: And we should have a working footer
 * Example #5: Then the page should have a working footer
 */
Then(/^(?:the page should have|(?:I |we )*should have) a working footer$/, async function () {
  // Smart-wait for the page to reach a quiet edge before reading the footer.
  await smartSettle(this.page, (this.minWaitTime && this.minWaitTime.page) || 8000);

  // `contentinfo` is the ARIA role of the site footer (<footer role="contentinfo">).
  // Scope to the role so card/section <footer> elements elsewhere are ignored.
  const footer = this.page.getByRole('contentinfo').first();
  const text = (await footer.textContent().catch(() => '')) || '';

  // Footer menu link text (one per line):
  if (!text.includes('About Us')) throw friendly('Footer is missing the "About Us" link.', 'Check the Footer menu in the Canvas Footer region.');
  if (!text.includes('Contact')) throw friendly('Footer is missing the "Contact" link.', 'Check the Footer menu in the Canvas Footer region.');
  if (!text.includes('Advertise')) throw friendly('Footer is missing the "Advertise" link.', 'Check the Footer menu in the Canvas Footer region.');
  if (!text.includes('Terms of Use')) throw friendly('Footer is missing the "Terms of Use" link.', 'Check the Footer menu in the Canvas Footer region.');
  if (!text.includes('Cookie Policy')) throw friendly('Footer is missing the "Cookie Policy" link.', 'Check the Footer menu in the Canvas Footer region.');
  if (!text.includes('Accessibility')) throw friendly('Footer is missing the "Accessibility" link.', 'Check the Footer menu in the Canvas Footer region.');

  // Footer credit text (one per line):
  if (!text.includes('The Right Up')) throw friendly('Footer is missing the "The Right Up" credit line.');
  if (!text.includes('All Rights Reserved')) throw friendly('Footer is missing the "All Rights Reserved" credit line.');

  // Social media menu profiles - full links (one per line):
  if ((await footer.locator('a[href="https://www.facebook.com"]').count()) === 0) throw friendly('Footer is missing the Facebook link (https://www.facebook.com).', 'Check the Social media menu in the Canvas Footer region.');
  if ((await footer.locator('a[href="https://x.com"]').count()) === 0) throw friendly('Footer is missing the X link (https://x.com).', 'Check the Social media menu in the Canvas Footer region.');
  if ((await footer.locator('a[href="https://www.instagram.com"]').count()) === 0) throw friendly('Footer is missing the Instagram link (https://www.instagram.com).', 'Check the Social media menu in the Canvas Footer region.');
  if ((await footer.locator('a[hx-on-click]').count()) === 0) throw friendly('Footer is missing the copy page link control.', 'Check the Copy link item in the Social media menu in the Canvas Footer region.');

  // The sitemap row: the Main navigation menu, placed in the footer.
  if (!text.includes('Studios')) throw friendly('Footer is missing the "Studios" sitemap link.', 'Check the Main navigation menu block in the Canvas Footer region.');
  if (!text.includes('Podcasts')) throw friendly('Footer is missing the "Podcasts" sitemap link.', 'Check the Main navigation menu block in the Canvas Footer region.');
});
