@regression @any @content
Feature: Frontend Pages - News Listing Page
      As a site visitor
      I want to see the news listing page
      So that I can browse the articles.

  @check @local @development @staging @production
  Scenario: Check that the news listing page loads correctly
    Given I am an anonymous user
     When I go to "/news"
      And wait
     Then I should not see "Page not found"
      And I should see "The Architecture of Unease: How Brutalism Became Beautiful Again"

  @check @local @development @staging @production
  Scenario: Check that the news listing page shows articles
    Given I am an anonymous user
     When I go to "/news"
      And wait
     Then I should see "The Architecture of Unease: How Brutalism Became Beautiful Again"

  @check @local @development @staging @production
  Scenario: Check that an article page loads with breadcrumbs
    Given I am an anonymous user
     When I go to "/news/architecture-unease-how-brutalism-became-beautiful-again"
      And wait
     Then I should see "The Architecture of Unease: How Brutalism Became Beautiful Again"
      And I should see "Home"

  @check @local @development @staging @production
  Scenario: Check that an article page has the main navigation
    Given I am an anonymous user
     When I go to "/news/architecture-unease-how-brutalism-became-beautiful-again"
      And wait
     Then I should see "Architecture"
      And I should see "Podcasts"
