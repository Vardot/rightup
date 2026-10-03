@regression @acceptance @any @content
Feature: Content Structure - Podcast content type
      As a content editor
      I want to add a podcast show with its cover, host and listening links
      So that the show gets its own page in the Podcasts section.

  @check @local @development @staging @production
  Scenario: Check that the podcast form offers every field of a show
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast"
     Then I should see "Create Podcast"
      And the content form should offer the fields:
        | Title       |
        | Summary     |
        | Cover art   |
        | Host        |
        | Listen on   |
        | Show notes  |
        | Tags        |
        | Save as     |

  @check @local @development @staging @production
  Scenario: Check that the podcast title shows how well its length reads
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast"
      And I fill in "Title" with "Pods"
     Then the title length indicator should rate the title as "bad"
     When I fill in "Title" with "Conversations from the studio floor"
     Then the title length indicator should rate the title as "good"

  @check @local @development @staging @production
  Scenario: Check that a podcast is not saved without its summary and cover art
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast"
      And I fill in "Title" with "Studio Floor Sessions"
      And I try to save the content
     Then saving should be refused because "Summary" is required
     When I fill in "Summary" with "Unscripted talks recorded on the studio floor between client meetings."
      And I try to save the content
     Then saving should be refused because "Cover art" is required

  @check @wip @local @development @staging @production
  Scenario: Check that the cover art of a podcast can only be an image
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast"
      And I open the "field_featured_image" media library
     Then the media library should offer only the "Image" media type

  @check @local @development @staging
  Scenario: Check that saving a podcast gives the show its own page in the Podcasts section
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast"
      And I fill in "Title" with "Studio Floor Sessions"
      And I fill in "Summary" with "Unscripted talks recorded on the studio floor between client meetings."
      And I fill in "Host" with "Sam Porter"
      And I add the "Microphone with headphones" image as the cover art
      And I select "Published" from "Save as"
      And I save the content
     Then the url should match "/podcasts/studio-floor-sessions(-\d+)?$"
      And I should see "Studio Floor Sessions"
      And I should see "Unscripted talks recorded on the studio floor between client meetings."
      And I should see "0 Episodes"
