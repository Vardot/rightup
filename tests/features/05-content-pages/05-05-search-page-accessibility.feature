@regression @any @a11y
Feature: Quality - Search page accessibility
      As a keyboard and screen reader user
      I want the search page to stay accessible while I narrow and sort the results
      So that I can find a story like anyone else.

  @a11y @local @development @staging @production
  Scenario Outline: The search page <state> has no serious accessibility violations
    Given I am an anonymous user
     When I go to "<path>"
     Then the page should have no serious accessibility violations

    Examples:
      | state                  | path                                               |
      | with results           | /search?keywords=client                            |
      | narrowed to a category | /search?keywords=client&f[0]=category:Architecture |
      | sorted by Newest       | /search?keywords=client&sort_by=newest             |
      | with no results        | /search?keywords=xylophone                         |

  @a11y @local @development @staging @production
  Scenario Outline: The search page <state> passes the full accessibility check
    Given I am an anonymous user
     When I go to "<path>"
     Then the page should pass the full accessibility check

    Examples:
      | state                  | path                                               |
      | with results           | /search?keywords=client                            |
      | narrowed to a category | /search?keywords=client&f[0]=category:Architecture |

  @a11y @local @development @staging @production
  Scenario: The Category tabs show where the keyboard focus is
    Given I am an anonymous user
     When I go to "/search?keywords=client"
     Then the "Architecture" link should show a focus indicator when reached with the keyboard
