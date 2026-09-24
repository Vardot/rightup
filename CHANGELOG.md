# Changelog

All notable changes to the RightUp recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-24
### Changed
- Requires Vartheme BS5 RightUp 1.0.0.
- Requires Varbase Canvas Base (#3625669).
- The header menu panel lists the site menus (#3625604).
- varbase-e2e 2.0.7, with a stricter accessibility gate (#3625545).

### Fixes
- Heading levels no longer skip from h1 to h3 on four Canvas pages (#3625581).
- The News listing has an h1 (#3625582).

## [1.0.0-rc1] - 2026-09-23
### Changed
- Requires Vartheme BS5 RightUp 1.0.0-rc1, which stops the hero slider starting inside the Canvas
  editor preview and fixes the icon toggle, exposed filter labels and menu landmarks for assistive
  technology.

## [1.0.0-beta1] - 2026-09-23
### Added
- The article and podcast pages ship as Canvas page templates, and the subscribe form is built to
  the design, so a fresh install renders both to the design instead of a bare layout (#3625202).

### Fixed
- Home card headings follow the page H1 as h2 rather than restarting the heading order, and the
  menu placements are named, so assistive technology can tell the navigation regions apart
  (#3625206).

## [1.0.0-alpha1] - 2026-09-22
### Added
- The search results page comes from the Varbase Search Base recipe instead of being duplicated
  here. RightUp keeps its own page design, the Category facet and the news and podcast search
  displays (#3624922).
- The podcast content model comes from the Varbase Podcasts Base recipe instead of being duplicated
  here, and RightUp overrides the episode page layout rather than shipping a rival copy of it
  (#3624658).
- An episode's audio is one media reference field, so an editor picks an uploaded Audio item or a
  Remote audio item from the media library, the same way they already pick Video or Remote video
  (#3624733).
- The footer ships the pages its policy links point at: Privacy Notice, Terms of Use and
  Accessibility are Canvas pages, so a footer link no longer lands on a missing page. The wording is
  placeholder text a site replaces before launch, not legal advice. The Cookie Policy link is still a
  placeholder anchor with no page behind it.
- The Live Feed ticker is driven by an entity queue (`drupal/entityqueue`) instead of the most recent
  articles, so editors choose what the ticker carries and in what order.
- The search results page matches the design: a Drupal Canvas page at `/search` with the keyword bar,
  the results, and a filter rail of Category, Content Type and Date Published. Results render through a
  new `search_result` node view mode whose display is built in Canvas from the theme's existing
  Featured Card, so a result row carries the image, category eyebrow, title, summary and byline the
  design shows instead of a bare title and snippet. No new component was needed: Featured Card is
  already a horizontal image-and-text row, and at `04_08` columns it lands the design's 260x195 image.
- Category and Content Type are Facets (`drupal/facets`). Date Published is a Views GROUPED exposed
  filter — Past 24 Hours, Past Week, Past Month, Past Year — because Facets cannot produce those:
  its date processor always renders an actual date ("2026", "July 2026"), never a relative window.
  It is exposed on its own block display so the rail can hold it while the keyword bar sits above the
  results; each form carries both fields and hides the half it does not own, which is what keeps the
  keyword through a date change and the date through a new search.

### Fixed
- A fresh install no longer fails on the header region. The Category facet, the search block
  components and the header region are created by config actions, in that order, because a
  recipe imports its config before it runs its actions (#3624946).
- A fresh install no longer renders its content while it imports it. Search indexing moved to
  cron, which removed about 220 of the errors an install used to log (#3624787).
- The header search popover no longer carries the Date Published group. Every display inherits the
  default display's filters, so the results page's date filter rendered inside the header panel too.
- Search barely matched articles. `search_index` is the view mode Search API renders into its index,
  but RightUp's carried almost no text, so a news article was indexed as little more than its title.
  It now ships the body and description fields, the way Varbase Starter, Educare and Horizon Aid do.
- Results are restricted to content, so a Canvas page no longer appears as a result rendered in full.
- Anonymous visitors get `view any term` AND `view any term name`. Canvas needs both to resolve a term
  reference; without the second it returns NULL and every result row fails to render.

### Changed
- The footer matches the design: the social media icons, the link columns and their spacing.
- The News listing lays its exposed filters out inline rather than stacked.
- `composer.json` requires releases instead of development branches, so RightUp can be installed
  alongside the tagged Varbase base recipes. It also requires `drupal/canvas` and
  `drupal/better_exposed_filters`, which `recipe.yml` installs but nothing declared: they arrived only
  transitively, which breaks exactly when the other pins are tightened for a release.
- The Navigation sidebar shows the RightUp mark instead of Drupal's default: the admin base recipe
  pointed it at a Varbase profile emblem that does not exist on a Drupal CMS site, so it fell back.
  Now `vartheme_bs5_rightup/logo-icon.svg`, the square mark, which is what fits Navigation's 40x40 cap.
- The site-template card image (`logo.png`, shown in the Drupal CMS installer's template picker) is the
  square RightUp icon rather than the full wordmark, so it reads at card size and matches the way
  Varbase Starter, Educare and Horizon Aid each use a mark rather than a wordmark there.

### Changed
- The header search opens as a full-width bar below the header, the way the design shows it, instead
  of a narrow popover anchored under the icon. Sets `panel_width: full` on the Icon Toggle placement
  in the header region, and repoints that placement at the component version carrying the new prop:
  Canvas resolves inputs against the pinned version, so a placement left on the older version stores
  the input and silently renders the popover anyway.

### Added
- Ship the RightUp editorial content the design calls for: 33 news articles across six categories,
  seven podcast episodes, nine author accounts and 38 images, plus the Canvas pages that present
  them - Home, the six category landings, Podcasts, the Last Call show page, Newsletter, About Us
  and Contact Us - and neutral Main, Footer and Social media menus.
- Require `drupal/varbase_news_base` and repoint the News view and its 19 Canvas content templates
  at the default theme, so News renders through the RightUp components.
- Initialize the Rightup site template recipe and start the `1.0.x` branch: the `type: Site` recipe,
  its bundled Drupal CMS and Varbase base recipes, Canvas components, patterns and content
  templates, default content, and the Vartheme BS5 Rightup theme as the default theme.

### Changed
- Replace the Varbase Starter demo content with the RightUp content above: the five Varbase Canvas
  pages, their 18 media items and the menu links that pointed at them are gone, and the shipped
  Canvas patterns and the Hero Slide and Card Hero component defaults carry RightUp copy instead of
  Varbase marketing copy.

### Fixed
- Every front-end page returned HTTP 500 after installing on Drupal CMS: the header page region pinned the
  `icon-toggle` and `button` components to versions (`1fabce12570a28f0`, `89760b927a14a505`) that no shipped
  component config declares. The header now references their shipped active versions, and the recipe ships
  the `offcanvas-menu` component config the header depends on.
- The admin favicon and the Gin, Gin Login and Navigation logos 404'd on a Drupal CMS site: the Varbase
  admin base recipe points them at Varbase profile and starter-theme images that do not exist there.
  RightUp now points Gin and Gin Login at its own theme's `favicon.ico` and `logo.svg`, and the
  Navigation logo at the default provider until the theme ships a square icon.
