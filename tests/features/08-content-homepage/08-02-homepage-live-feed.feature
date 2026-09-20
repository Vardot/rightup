@regression @any @content
Feature: Frontend Pages - Homepage Live Feed
      As an editor
      I want the homepage Live Feed ticker to be driven by the Live feed entity queue
      So that curating the queue, and publishing a news item, changes what readers see
      without anyone editing the homepage.

  @check @local @development @staging @production
  Scenario: Check that the homepage shows the Live Feed ticker
    Given I am an anonymous user
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And I should see "Latest"
      And the live feed should repeat its entries once for the seamless loop

  @check @live-feed-restore @local @development @staging
  Scenario: Check that an empty Live feed queue falls back to the latest published content
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds nothing
     When I am an anonymous user
      And I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should list 10 entries
      And the live feed should list no entry twice
      And the live feed should start with "The Architecture of Unease: How Brutalism Became Beautiful Again"

  @check @live-feed-restore @local @development @staging
  Scenario: Check that the queued nodes lead the Live Feed, in queue order
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
        | The Chair Every Design School Still Teaches        |
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should start with the queued items in order
      And the live feed should list 10 entries
      And the live feed should list no entry twice

  @check @local @development @staging @production
  Scenario: Check that every Live Feed entry links to a page that resolves
    Given I am an anonymous user
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And every live feed entry should link to a page that resolves

  @check @local @development @staging @production
  Scenario: Check that every Live Feed entry shows a 12-hour time
    Given I am an anonymous user
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And every live feed entry should show a time in 12-hour format

  @check @live-feed-restore @local @development @staging
  Scenario: Check that each queued Live Feed entry time is its node's authored time
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
        | The Chair Every Design School Still Teaches        |
     When I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And every queued live feed entry time should match its node's authored time

  @check @live-feed-restore @local @development @staging
  Scenario: Check that adding a node to the Live feed queue adds it to the ticker
    Given I am a logged in user with the "webmaster" user
      And the Live feed queue holds:
        | A Gallery With No Walls, Only Light                |
        | Why More Studios Are Charging for the Pitch Itself |
     When I add the node "A Concrete Institute Built to Age on Purpose" to the Live feed queue
      And I go to the homepage
     Then ".live-feed" should be visible within 10 seconds
      And the live feed should contain "A Concrete Institute Built to Age on Purpose"

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
