@regression @acceptance @any @content @workflow
Feature: Content Structure - Podcast episode content type
      As a content editor
      I want to add episodes to a podcast and choose when they go live
      So that each show lists only its finished, published episodes.

  @check @local @development @staging @production
  Scenario: Check that the podcast episode form offers every field of an episode
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast_episode"
     Then I should see "Create Podcast episode"
      And the content form should offer the fields:
        | Title          |
        | Podcast        |
        | Summary        |
        | Cover art      |
        | Audio          |
        | Duration       |
        | Episode number |
        | Host           |
        | Show notes     |
        | Tags           |
        | Save as        |

  @check @wip @local @development @staging @production
  Scenario: Check that the cover art of a podcast episode can only be an image
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast_episode"
      And I open the "field_featured_image" media library
     Then the media library should offer only the "Image" media type

  @check @local @development @staging @production
  Scenario: Check that a podcast episode is not saved until it is given a podcast
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast_episode"
      And I fill in "Title" with "Sketchbooks on the Night Bus"
      And I fill in "Summary" with "Why three illustrators still draw on the commute home."
      And I add the "Microphone with headphones" image as the cover art
      And I try to save the content
     Then saving should be refused because "Podcast" is required

  @check @local @development @staging
  Scenario: Check that a published episode gets its page under its podcast and is counted
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast_episode"
      And I fill in "Title" with "Sketchbooks on the Night Bus"
      And I fill in "Podcast" with "Office Hours"
      And I fill in "Summary" with "Why three illustrators still draw on the commute home."
      And I add the "Microphone with headphones" image as the cover art
      And I select "Published" from "Save as"
      And I open the "Audio" tab of the content form
      And I fill in "Duration" with "24 Mins"
      And I fill in "Episode number" with "11"
      And I save the content
     Then the url should match "/podcasts/office-hours/sketchbooks-night-bus(-\d+)?$"
      And I should see "Episode 11"
      And I should see "Sketchbooks on the Night Bus"
     When I am an anonymous user
      And I go to "/podcasts/office-hours"
     Then the "episodes list" should list "Sketchbooks on the Night Bus"
      And I should see "11 Episodes" in the "episode count"

  @check @local @development @staging
  Scenario: Check that a draft episode is hidden from visitors and is not counted
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/podcast_episode"
      And I fill in "Title" with "Sketchbooks on the Night Bus"
      And I fill in "Podcast" with "Office Hours"
      And I fill in "Summary" with "Why three illustrators still draw on the commute home."
      And I add the "Microphone with headphones" image as the cover art
      And I select "Draft" from "Save as"
      And I save the content
     Then I should see "Sketchbooks on the Night Bus"
     When I am an anonymous user
      And I go to the content I saved
     Then I should see "The requested page could not be found."
      And I should not see "Sketchbooks on the Night Bus"
     When I go to "/podcasts/office-hours"
     Then the "episodes list" should not list "Sketchbooks on the Night Bus"
      And I should see "10 Episodes" in the "episode count"
     When I go to "/podcasts"
     Then the "Office Hours" podcast card should show "10 Episodes"
