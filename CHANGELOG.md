# Changelog

All notable changes to the Rightup recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
