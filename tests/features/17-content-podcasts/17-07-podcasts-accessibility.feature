@regression @any @a11y
Feature: Quality - Podcasts accessibility
      As a keyboard and screen reader user
      I want the podcasts section to meet WCAG 2.2 AA
      So that I can browse the shows and listen to every episode.

  @a11y @local @development @staging @production
  Scenario Outline: The <page> passes the WCAG 2.2 AA audit
    Given I am an anonymous user
     When I go to "<path>"
     Then the page should pass an accessibility audit at level "AA"
      And the page should have no serious accessibility violations
      And the page should pass the full accessibility check

    Examples:
      | page                   | path                                  |
      | Podcasts page          | /podcasts                             |
      | Last Call show page    | /podcasts/last-call                   |
      | No Straight Walls page | /podcasts/last-call/no-straight-walls |

  @a11y @local @development @staging @production
  Scenario: The podcast card links show where the keyboard focus is
    Given I am an anonymous user
     When I go to "/podcasts"
     Then the "Last Call" link should show a focus indicator when reached with the keyboard
      And the "View Show" link should show a focus indicator when reached with the keyboard

  @a11y @local @development @staging @production
  Scenario: The episode rows show where the keyboard focus is
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
     Then the "One Colour, Eleven Years" link should show a focus indicator when reached with the keyboard
      And the "View More Episodes" link should show a focus indicator when reached with the keyboard

  @a11y @local @development @staging @production
  Scenario: The audio player controls carry accessible names
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then every button should have an accessible name
      And the page should not violate the accessibility rule "button-name"
      And the page should not violate the accessibility rule "label"
      And every form field should have an accessible label

  @a11y @wip @local @development @staging @production
  Scenario: The episode rows announce their titles as written
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
     Then every link in the "episodes list" should have a readable accessible name

  @a11y @wip @local @development @staging @production
  Scenario: The View Show links are announced by their label alone
    Given I am an anonymous user
     When I go to "/podcasts"
     Then every "View Show" link should be announced as "View Show"
