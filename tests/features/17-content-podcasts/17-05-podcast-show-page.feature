@regression @any @content
Feature: Frontend Pages - Podcast show page
      As a site visitor
      I want a page for each podcast show with all of its episodes
      So that I can catch up on a show from its latest episode backwards.

  @check @local @development @staging @production
  Scenario: Check that the show page introduces the show
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
     Then "Home" should be in the breadcrumb
      And "Podcasts" should be in the breadcrumb
      And "h1" should have text "Last Call"
      And the "page header" should show the summary of the "Last Call" podcast
      And I should see "19 Episodes" in the "episode count"
      And the "page header" should show an image with a text alternative

  @check @local @development @staging @production
  Scenario: Check that the show page lists its seven latest episodes first
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
     Then the "episodes list" should list 7 episodes
      And the episode numbers in the "episodes list" should count down from 19 to 13
      And every episode in the "episodes list" should link to a page under "/podcasts/last-call/"
      And I should see "View More Episodes"

  @check @local @development @staging @production
  Scenario: Check that View More Episodes loads the next episodes in place until none are left
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
      And I load more episodes
     Then the "episodes list" should list 14 episodes
      And the episode numbers in the "episodes list" should count down from 19 to 6
      And the page should not have reloaded
     When I load more episodes
     Then the "episodes list" should list 19 episodes
      And the episode numbers in the "episodes list" should count down from 19 to 1
      And the page should not have reloaded
      And I should not see "View More Episodes"

  @check @local @development @staging @production
  Scenario: Check that a show lists only its own episodes
    Given I am an anonymous user
     When I go to "/podcasts/long-table"
      And I load more episodes
     Then the "episodes list" should list 8 episodes
      And the episode numbers in the "episodes list" should count down from 8 to 1
      And every episode in the "episodes list" should link to a page under "/podcasts/long-table/"
      And the "episodes list" should not list "No Straight Walls"
      And I should not see "View More Episodes"

  @check @local @development @staging @production
  Scenario: Check that an episode in the list opens its episode page
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
      And I open the "No Straight Walls" episode from the "episodes list"
     Then the url should match "/podcasts/last-call/no-straight-walls$"
      And "h1" should have text "No Straight Walls"

  @check @local @development @staging @production
  Scenario Outline: Check that More Podcasts on the <show> page offers the other shows
    Given I am an anonymous user
     When I go to "<path>"
     Then the "more podcasts" should list 3 podcasts
      And the "more podcasts" should not list "<show>"

    Examples:
      | show           | path                   |
      | Last Call      | /podcasts/last-call    |
      | The Long Table | /podcasts/long-table   |
      | Field Notes    | /podcasts/field-notes  |
