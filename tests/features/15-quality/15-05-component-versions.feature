@regression @any @quality
Feature: Quality - Component versions
      As a visitor and as a content editor
      I want every page to render all of its components
      So that no page shows a component rendering error.

  @check @local @development @staging @production
  Scenario: Check that the recipe ships every component version its content uses
    Then the recipe should ship every component version its content uses

  @check @local @development @staging @production
  Scenario Outline: Check that <page> shows no component rendering error
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then I should not see "OutOfRangeException"
      And I should not see "The website encountered an unexpected error"

    Examples:
      | page                | path                |
      | the home page       | /home               |
      | the podcasts page   | /podcasts           |
      | a podcast show      | /podcasts/last-call |
      | the culture page    | /culture            |
      | the search page     | /search             |
      | the contact page    | /contact-us         |
