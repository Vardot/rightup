@regression @any @content
Feature: Frontend Pages - Homepage Live Feed queue editing
      As an editor
      I want the homepage Live Feed ticker to be driven by the Live feed entity queue
      So that curating the queue, and publishing a news item, changes what readers see
      without anyone editing the homepage.

  @check @live-feed-restore @local @development @staging
  Scenario: Check that removing a node from the Live feed queue removes it from the ticker
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
        | The Chair Every Design School Still Teaches        |
     When I remove the node "The Chair Every Design School Still Teaches" from the Live feed queue
      And I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should not contain "The Chair Every Design School Still Teaches"
      And the live feed should contain "A Gallery With No Walls, Only Light"

  @check @live-feed-restore @local @development @staging
  Scenario: Check that reordering the Live feed queue reorders the ticker
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
        | The Chair Every Design School Still Teaches        |
     When I move the last Live feed queue item to the top
      And I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should start with "The Chair Every Design School Still Teaches"

  @check @live-feed-restore @local @development @staging
  Scenario: Check that an unpublished queued node is hidden from anonymous visitors
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
     When I unpublish the first Live feed queue item
      And I am an anonymous user
      And I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should not contain "A Gallery With No Walls, Only Light"
      And the live feed should start with "Why More Studios Are Charging for the Pitch Itself"

  @check @a11y @local @development @staging @production
  Scenario: Check that the Live Feed is reachable for keyboard and screen reader users
    Given I am an anonymous user
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And every live feed entry should be a keyboard reachable link
      And the duplicated live feed entries should be hidden from assistive technology
