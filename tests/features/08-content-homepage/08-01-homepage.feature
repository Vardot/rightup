@regression @any @content
Feature: Frontend Pages - Homepage
      As a site visitor
      I want to verify the homepage loads correctly
      So that I can confirm the site is accessible and displays expected content.

  @check @local @development @staging @production
  Scenario: Check that the homepage loads and displays expected content
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "The Architecture of Unease: How Brutalism Became Beautiful Again"
      And I should not see "Page not found"

  @check @local @development @staging @production
  Scenario: Check that the homepage has main navigation links
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "Studios"
      And I should see "Architecture"
      And I should see "Podcasts"

  @check @local @development @staging @production
  Scenario: Check that the homepage has the latest news live feed
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "Latest"

  @check @local @development @staging @production
  Scenario: Check that the homepage has the featured section
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "Featured"
      And I should see "Inside the Gallery Show Built Entirely From Borrowed Light"

  @check @local @development @staging @production
  Scenario: Check that the homepage has the podcast section
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "Podcasts"
      And I should see "Last Call"
      And I should see "Hosted by Idris Calloway"

  @check @local @development @staging @production
  Scenario: Check that the homepage has the On Display slider
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "On Display"
      And the element ".card-slider" should be displayed

  @check @local @development @staging @production
  Scenario: Check that the homepage has the newsletter subscribe block
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then I should see "Design News Before It's Polished"
      And the element "input[type='email']" should be displayed
