@regression @any @content
Feature: Frontend Pages - Podcast episode page
      As a site visitor
      I want to listen to an episode, read about it and find what to hear next
      So that one episode leads me to the rest of the show.

  @check @local @development @staging @production
  Scenario: Check that the episode page names the episode and its show
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then "Podcasts" should be in the breadcrumb
      And "Last Call" should be in the breadcrumb
      And I should see "Episode 16"
      And "h1" should have text "No Straight Walls"
      And the episode should show the date it was published
      And I should see text matching "\d{1,2}:\d{2} (AM|PM)"
      And the episode should be credited to its host

  @check @local @development @staging @production
  Scenario: Check that the episode offers the show's listening platforms
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then the "listen on" should list 5 items
      And the episode should offer every platform of the "Last Call" podcast, in order
      And the "RSS" link in the "listen on" should go to "/podcasts/feed"

  @check @local @development @staging @production
  Scenario: Check that the audio player plays and pauses the episode
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then the "Skip back" button should be visible
      And the "Play" button should be visible
      And the "Skip forward" button should be visible
      And the "page header" should show an image with a text alternative
     When I click the "Play" button
     Then the episode audio should be playing
      And the "Pause" button should be visible
     When I click the "Pause" button
     Then the episode audio should be paused
      And the "Play" button should be visible

  @check @local @development @staging @production
  Scenario: Check that the audio player skips forward and back fifteen seconds
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
      And I click the "Play" button
      And I click the "Pause" button
      And I skip forward in the episode
     Then the episode should have moved forward by about 15 seconds
     When I skip back in the episode
     Then the episode should have moved back by about 15 seconds

  @check @local @development @staging @production
  Scenario: Check that the audio player works from the keyboard
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
      And I focus the "Play" button
      And I press the key "Enter"
     Then the episode audio should be playing
      And the focused element should be labeled "Pause"
     When I press the key "Space"
     Then the episode audio should be paused
      And the focused element should be labeled "Play"

  @check @local @development @staging @production
  Scenario: Check that the episode can be shared
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then I should see "Share" in the "share"
      And the "Share on Facebook (opens in a new tab)" link in the "share" should go to "https://www.facebook.com/sharer/sharer.php"
      And the "Share on X (opens in a new tab)" link in the "share" should go to "https://twitter.com/intent/tweet"
      And the "Follow us on Instagram (opens in a new tab)" link in the "share" should go to "https://www.instagram.com"
      And the "Copy site URL" button should be visible

  @check @local @development @staging @production
  Scenario: Check that the episode details and the transcript read in full on request
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then I should see "Details"
      And the "main content" should show the summary of the "No Straight Walls" episode
      And I should see "Audio Transcript"
      And the audio transcript should be collapsed
     When I click the "Read More" button
     Then the audio transcript should be expanded
      And the "Read Less" button should be visible
     When I click the "Read Less" button
     Then the audio transcript should be collapsed
      And the "Read More" button should be visible

  @check @local @development @staging @production
  Scenario Outline: Check that More Episodes on <episode> offers three other episodes of <show>
    Given I am an anonymous user
     When I go to "<path>"
     Then the "more episodes" should list 3 episodes
      And the "more episodes" should not list "<episode>"
      And every episode in the "more episodes" should link to a page under "<show path>/"
      And the "View All" link in the "more episodes" should go to "<show path>"

    Examples:
      | episode           | show           | path                                 | show path           |
      | No Straight Walls | Last Call      | /podcasts/last-call/no-straight-walls | /podcasts/last-call |
      | Clients on Stage  | The Long Table | /podcasts/long-table/clients-stage    | /podcasts/long-table |

  @check @local @development @staging @production
  Scenario: Check that the episode page closes with the newsletter and more podcasts
    Given I am an anonymous user
     When I go to "/podcasts/last-call/no-straight-walls"
     Then I should see "The best of The Rightup, delivered to you weekly."
      And I should see "Email"
      And I should see "Subscribe"
      And the "more podcasts" should list 3 podcasts
