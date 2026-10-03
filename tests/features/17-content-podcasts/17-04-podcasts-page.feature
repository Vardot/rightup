@regression @any @content
Feature: Frontend Pages - Podcasts page
      As a site visitor
      I want to see every podcast show in one place
      So that I can pick a show and start listening.

  @check @local @development @staging @production
  Scenario: Check that the Podcasts page lists all six shows in order
    Given I am an anonymous user
     When I go to "/podcasts"
     Then I should see "Podcasts"
      And the "podcasts listing" should list, in order:
        | Last Call      |
        | Field Notes    |
        | Office Hours   |
        | The Long Table |
        | Material World |
        | Small Practice |

  @check @local @development @staging @production
  Scenario Outline: Check that the <show> card shows its cover, summary and published episode count
    Given I am an anonymous user
     When I go to "/podcasts"
     Then the "<show>" podcast card should have a cover image
      And the "<show>" podcast card should show its summary
      And the "<show>" podcast card should show "<count> Episodes"
      And the "<show>" link in the "<show>" podcast card should go to "<path>"
      And the "View Show" link in the "<show>" podcast card should go to "<path>"

    Examples:
      | show           | count | path                     |
      | Last Call      | 19    | /podcasts/last-call      |
      | Field Notes    | 10    | /podcasts/field-notes    |
      | Office Hours   | 10    | /podcasts/office-hours   |
      | The Long Table | 8     | /podcasts/long-table     |
      | Material World | 10    | /podcasts/material-world |
      | Small Practice | 10    | /podcasts/small-practice |

  @check @local @development @staging @production
  Scenario: Check that a podcast card opens its show
    Given I am an anonymous user
     When I go to "/podcasts"
      And I click "View Show" in the "Field Notes" podcast card
     Then the url should match "/podcasts/field-notes$"
      And I should see "Field Notes"
