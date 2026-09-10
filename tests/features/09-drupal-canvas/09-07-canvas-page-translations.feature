@regression @any @canvas @i18n
Feature: Drupal Canvas - translating a Canvas page
      As a content editor on a multilingual site
      I want to translate a Drupal Canvas page and have it served in its own language
      So that every visitor reads the page in the language they asked for.

  # The Varbase Internationalization Base recipe is what makes this surface
  # exist: it switches content translation on for the Drupal Canvas "Page"
  # entity and makes the component input values - the copy an editor typed into
  # each component - translatable. The first scenario reads that setup off the
  # admin screen and runs on any site the recipe was applied to, single language
  # or not.
  #
  # The remaining scenarios need a site that actually has a second language and
  # a translated Canvas page, so they are tagged @wip: the CI suites run
  # `--tags "not @wip"` against a freshly installed, single-language site, where
  # Drupal hides the Translate tab altogether (content translation access is
  # gated on LanguageManager::isMultilingual()). They are NOT unfinished work -
  # they are proven against a multilingual fixture and stay excluded until a
  # fresh install can add a language through the admin UI without a fatal error
  # (Drupal core #3002532 / Drupal CMS #3497957: the language module is
  # installed without its language.entity.en / und / zxx config entities).
  #
  # Fixture the @wip scenarios expect: English (default) + Arabic, and the
  # "Features" Canvas page translated into Arabic with the title "المزايا".
  # Run them with:
  #   FEATURES="tests/features/09-drupal-canvas/09-07-*.feature" \
  #     ./node_modules/.bin/cucumber-js --config cucumber.js --tags "@multilingual"

  Background:
    Given I am a logged in user with the "webmaster" user

  # The prerequisite, readable on any site: the Canvas "Page" entity is
  # translatable and so is the field that carries the component copy, so a
  # translator can rewrite the page itself and not only its title. The entity
  # types the recipe leaves alone stay clear, so the scope is deliberate.
  @check @local @development @staging @production
  Scenario: A Canvas page is set up to be translated, component copy included
     When I go to "/admin/config/regional/content-language"
      And wait
      And I wait for the text "Custom language settings" to appear
     Then I should see "Custom language settings"
      And the Drupal checkbox "edit-entity-types-canvas-page" is checked
      And the Drupal checkbox "edit-entity-types-node" is unchecked
      And I should see "Component input values"
      And the Drupal checkbox "edit-settings-canvas-page-canvas-page-translatable" is checked
      And the Drupal checkbox "edit-settings-canvas-page-canvas-page-fields-components" is checked
      And the Drupal checkbox "edit-settings-canvas-page-canvas-page-fields-title" is checked

  # A Canvas page carries a Translate operation in the Pages listing, and it
  # opens a translations overview that names every language on the site with
  # what has been done to it: the original language row shows the source title,
  # the translated language row shows the translated title and its status.
  @wip @multilingual @check @local @development
  Scenario: The translations overview of a Canvas page lists the site languages and their status
     When I go to "/admin/content/pages"
      And wait
      And I wait for the text "Features" to appear
     Then I should see "Translate" in the "Features" row
     When I open the "Translate" link in the "Features" row
      And wait
      And I wait for the text "Original language" to appear
     Then I should see "Language"
      And I should see "Translation"
      And I should see "Status"
      And I should see "Operations"
      And I should see "Features" in the "English (Original language)" row
      And I should see "Published" in the "English (Original language)" row
      And I should see "المزايا" in the "Arabic" row
      And I should see "Published" in the "Arabic" row
      And I should not see "Not translated" in the "Arabic" row

  # The translation is not just a row in an admin table: a visitor who asks for
  # the Arabic path is served the Arabic page, in Arabic and right to left,
  # while the English path stays English and left to right. The page also
  # advertises both variants to crawlers.
  @wip @multilingual @check @local @development
  Scenario: A translated Canvas page is served in its own language and direction
    Given I am an anonymous user
     When I go to "/features"
      And wait
     Then "html" should have attribute "lang" with value "en"
      And "html" should have attribute "dir" with value "ltr"
     When I go to "/ar/features"
      And wait
     Then "html" should have attribute "lang" with value "ar"
      And "html" should have attribute "dir" with value "rtl"
      And "link[rel='alternate'][hreflang='en']" should be attached
      And "link[rel='alternate'][hreflang='ar']" should be attached
