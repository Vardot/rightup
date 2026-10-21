@regression @any @content
Feature: Frontend Pages - Search page
      As a reader
      I want to narrow search results by category and choose how they are sorted
      So that I find the story I am looking for quickly.

  @check @local @development @staging @production
  Scenario: Check that the Category tabs start on All, with four categories at most
    Given I am an anonymous user
     When I go to "/search?keywords=client"
     Then the "category tabs" should list, in order:
        | All          |
        | Architecture |
        | Branding     |
        | Process      |
        | Studios      |
      And I should see "All" in the "active category tab"
      And I should see "Relevance" in the "selected sort"

  @check @local @development @staging @production
  Scenario: Check that a Category tab narrows the results and ticks the same category in the list
    Given I am an anonymous user
     When I go to "/search?keywords=client"
      And I click architecture tab
      And wait
     Then current url should have the "f[0]" parameter with the "category:Architecture" value
      And I should see "Architecture" in the "active category tab"
      And I should not see "All" in the "active category tab"
      And I should see "Architecture" in the "active category filter"
      And every story in the "search results" should be in the "Architecture" category

  @check @local @development @staging @production
  Scenario: Check that a category ticked in the list marks its tab
    Given I am an anonymous user
     When I go to "/search?keywords=client"
      And I check "Process (8)"
      And wait
     Then current url should have the "f[0]" parameter with the "category:Process" value
      And I should see "Process" in the "active category tab"
      And I should see "Process" in the "active category filter"

  @check @local @development @staging @production
  Scenario: Check that a category ticked outside the four tabs still marks its tab
    Given I am an anonymous user
     When I go to "/search?keywords=client"
      And I check "Culture (1)"
      And wait
     Then current url should have the "f[0]" parameter with the "category:Culture" value
      And I should see "Culture" in the "active category tab"
      And I should see "Culture" in the "active category filter"
      And every story in the "search results" should be in the "Culture" category

  @check @local @development @staging @production
  Scenario: Check that a Category tab keeps the other filters and the sort
    Given I am an anonymous user
     When I go to "/search?keywords=client&published=All&sort_by=newest&f[0]=content_type:news"
      And I click architecture tab
      And wait
     Then current url should have the "f[0]" parameter with the "category:Architecture" value
      And current url should have the "f[1]" parameter with the "content_type:news" value
      And current url should have the "sort_by" parameter with the "newest" value
      And current url should have the "keywords" parameter with the "client" value

  @check @local @development @staging @production
  Scenario: Check that sorting by Newest keeps the chosen Category tab
    Given I am an anonymous user
     When I go to "/search?keywords=client&f[0]=category:Architecture"
      And I click the "Sort by Relevance" button
      And I click "Newest"
      And wait
     Then current url should have the "sort_by" parameter with the "newest" value
      And current url should have the "f[0]" parameter with the "category:Architecture" value
      And I should see "Newest" in the "selected sort"
      And I should see "Architecture" in the "active category tab"
      And the search results should be listed newest first

  @check @local @development @staging @production
  Scenario: Check that All clears the category and keeps the sort
    Given I am an anonymous user
     When I go to "/search?keywords=client&sort_by=newest&f[0]=category:Architecture"
      And I click all tab
      And wait
     Then current url should not have the "f[0]" parameter
      And current url should have the "sort_by" parameter with the "newest" value
      And I should see "All" in the "active category tab"
      And I should see "Newest" in the "selected sort"
      And I should see "Architecture" in the "category filter"
      And I should not see "Architecture" in the "active category filter"

  @check @local @development @staging @production
  Scenario: Check that a new keyword search keeps the sort
    Given I am an anonymous user
     When I go to "/search?keywords=client&sort_by=newest"
      And I search for "studio"
     Then current url should have the "keywords" parameter with the "studio" value
      And current url should have the "sort_by" parameter with the "newest" value
      And I should see "Newest" in the "selected sort"
      And the search results should be listed newest first

  @check @wip @local @development @staging @production
  Scenario: Check that a Date Published choice keeps the chosen category
    Given I am an anonymous user
     When I go to "/search?keywords=client&f[0]=category:Architecture"
      And I choose the "Past Year" Date Published filter
     Then current url should have the "f[0]" parameter with the "category:Architecture" value
      And I should see "Architecture" in the "active category tab"
      And I should see "Architecture" in the "active category filter"
