@regression @any @content @mobile
Feature: Frontend Pages - Podcasts on a phone
      As a site visitor on a phone
      I want the podcasts pages to fit my screen
      So that I never have to scroll sideways to read or listen.

  @check @local @development @staging @production
  Scenario Outline: The <page> fits a phone screen
    Given I am an anonymous user
      And I am viewing the site on a "xs" screen
     When I go to "<path>"
     Then the page should not scroll horizontally

    Examples:
      | page                   | path                                  |
      | Podcasts page          | /podcasts                             |
      | Last Call show page    | /podcasts/last-call                   |
      | No Straight Walls page | /podcasts/last-call/no-straight-walls |
