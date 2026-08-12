# AGENTS.md

Guidance for AI coding agents working on the Rightup recipe.

## Before you start

Read the project history and context first:

- **`CHANGELOG.md`** — what changed in each release, newest first. Read it before
  proposing changes so you follow the established direction and versioning.
- **Merge request comments and history** on
  [git.drupalcode.org/project/rightup](https://git.drupalcode.org/project/rightup/-/merge_requests)
  — the reasoning behind recent changes lives in the MR discussions.
- **Issue comments** on
  [drupal.org/project/issues/rightup](https://www.drupal.org/project/issues/rightup)
  — the Problem/Motivation and Proposed resolution for each change.

## When you make a change

- Add an entry under `## [Unreleased]` in `CHANGELOG.md`.
- Keep commit messages in the Drupal commit-type format:
  `{type}: #{issueID} Summary` (see https://www.drupal.org/node/3586390).
- Never bump the version or tag a release without explicit maintainer approval.
- This is a `drupal-recipe`; keep configuration in the recipe, not in
  `config/install` or `config/optional`.
