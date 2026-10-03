@regression @acceptance @any @auth @content
Feature: Content Structure - Podcast and Podcast episode permissions
      As a site admin user
      I want only the editorial roles to create, edit and delete podcasts and their episodes
      So that visitors can listen to the published shows while only the newsroom changes them.

  @check @local @development @staging @production
  Scenario Outline: Check that the <role> can create podcasts and podcast episodes
    Given I am a logged in user with the "<role>" user
     When I go to "/node/add/podcast"
     Then I should see "Create Podcast"
     When I go to "/node/add/podcast_episode"
     Then I should see "Create Podcast episode"

    Examples:
      | role           |
      | Content editor |
      | Content admin  |
      | SEO admin      |
      | Site admin     |
      | Super admin    |
      | webmaster      |

  @check @local @development @staging @production
  Scenario: Check that anonymous users can not create podcasts or podcast episodes
    Given I am an anonymous user
     Then I should be refused "/node/add/podcast"
      And I should not see "Create Podcast"
      And I should be refused "/node/add/podcast_episode"
      And I should not see "Create Podcast episode"

  @check @local @development @staging @production
  Scenario: Check that Normal users can not create podcasts or podcast episodes
    Given I am a logged in user with the "Normal user" user
     Then I should be refused "/node/add/podcast"
      And I should not see "Create Podcast"
      And I should be refused "/node/add/podcast_episode"
      And I should not see "Create Podcast episode"

  @check @local @development @staging @production
  Scenario Outline: Check that the <role> can edit and delete any podcast and podcast episode
    Given I am a logged in user with the "<role>" user
     Then I should be able to edit the content at "/podcasts/last-call"
      And I should be able to delete the content at "/podcasts/last-call"
      And I should be able to edit the content at "/podcasts/last-call/no-straight-walls"
      And I should be able to delete the content at "/podcasts/last-call/no-straight-walls"

    Examples:
      | role           |
      | Content editor |
      | Content admin  |
      | SEO admin      |
      | Site admin     |
      | webmaster      |

  @check @local @development @staging @production
  Scenario Outline: Check that <who> can not edit or delete podcasts and podcast episodes
    Given <login>
     Then I should not be able to edit the content at "/podcasts/last-call"
      And I should not be able to delete the content at "/podcasts/last-call"
      And I should not be able to edit the content at "/podcasts/last-call/no-straight-walls"
      And I should not be able to delete the content at "/podcasts/last-call/no-straight-walls"

    Examples:
      | who               | login                                            |
      | anonymous users   | I am an anonymous user                           |
      | Normal users      | I am a logged in user with the "Normal user" user |

  @check @local @development @staging @production
  Scenario: Check that anonymous users can listen to the published podcasts and episodes
    Given I am an anonymous user
     When I go to "/podcasts/last-call"
     Then I should see "Last Call"
      And I should not see "The requested page could not be found."
     When I go to "/podcasts/last-call/no-straight-walls"
     Then I should see "No Straight Walls"
      And I should not see "Access denied"
