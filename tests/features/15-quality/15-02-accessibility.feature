@regression @any @a11y
Feature: Quality - Accessibility (a11y)
      As a site owner
      I want every public page to be free of serious accessibility issues
      So that the site is usable by everyone, on any device and with any assistive technology.

  @a11y @local @development @staging @production
  Scenario Outline: The <page> page has no serious accessibility violations
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the page should have no serious accessibility violations

    Examples:
      | page              | path                                                            |
      | home              | /home                                                           |
      | studios           | /studios                                                        |
      | architecture      | /architecture                                                   |
      | product           | /product                                                        |
      | branding          | /branding                                                       |
      | process           | /process                                                        |
      | culture           | /culture                                                        |
      | podcasts          | /podcasts                                                       |
      | last call podcast | /podcasts/last-call                                             |
      | newsletter        | /newsletter                                                     |
      | about us          | /about-us                                                       |
      | advertise         | /advertise                                                      |
      | contact us        | /contact-us                                                     |
      | privacy notice    | /privacy-notice                                                 |
      | search            | /search                                                         |
      | terms of use      | /terms-of-use                                                   |
      | accessibility     | /accessibility                                                  |
      | news listing      | /news                                                           |
      | news article      | /news/architecture-unease-how-brutalism-became-beautiful-again  |
      | podcast episode   | /podcast/no-straight-walls                                      |
      | login             | /user/login                                                     |
      | not found         | /this-page-does-not-exist                                       |

  @a11y @local @development @staging @production
  Scenario Outline: The <page> page passes the full accessibility check
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the page should pass the full accessibility check

    Examples:
      | page            | path                                                           |
      | home            | /home                                                          |
      | news article    | /news/architecture-unease-how-brutalism-became-beautiful-again |
      | podcast episode | /podcast/no-straight-walls                                     |
      | news listing    | /news                                                          |
      | podcasts        | /podcasts                                                      |
      | search          | /search                                                        |

  @a11y @local @development @staging @production
  Scenario: The front page has no serious accessibility violations
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then the page should have no serious accessibility violations

  @a11y @local @development @staging @production
  Scenario: The admin dashboard has no critical accessibility violations for the webmaster
    Given I am a logged in user with the "webmaster" user
     When I go to "/admin/dashboard"
      And wait
     Then the page should have no critical accessibility violations

  @a11y @local @development @staging @production
  Scenario Outline: The <page> page satisfies the accessibility rule "<rule>"
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the page should not violate the accessibility rule "<rule>"

    Examples:
      | page         | path                                                           | rule                 |
      | home         | /home                                                          | image-alt            |
      | home         | /home                                                          | html-has-lang        |
      | home         | /home                                                          | color-contrast       |
      | home         | /home                                                          | page-has-heading-one |
      | home         | /home                                                          | link-name            |
      | home         | /home                                                          | button-name          |
      | home         | /home                                                          | duplicate-id-aria    |
      | news listing | /news                                                          | color-contrast       |
      | news listing | /news                                                          | link-name            |
      | news article | /news/architecture-unease-how-brutalism-became-beautiful-again | image-alt            |
      | news article | /news/architecture-unease-how-brutalism-became-beautiful-again | color-contrast       |
      | podcasts     | /podcasts                                                      | color-contrast       |
      | contact us   | /contact-us                                                    | label                |
      | newsletter   | /newsletter                                                    | label                |
      | search       | /search                                                        | label                |
      | login        | /user/login                                                    | label                |

  @a11y @local @development @staging @production
  Scenario: The Live Feed ticker links meet the minimum target size
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then the page should not violate the accessibility rule "target-size"

  @a11y @local @development @staging @production
  Scenario: Each navigation landmark on the homepage is distinguishable
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then the page should not violate the accessibility rule "landmark-unique"

  @a11y @local @development @staging @production
  Scenario: The homepage has a single main landmark
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then the page should not violate the accessibility rule "landmark-one-main"

  @a11y @local @development @staging @production
  Scenario: The homepage headings descend without skipping a level
    Given I am an anonymous user
     When I go to homepage
      And wait
     Then the page should not violate the accessibility rule "heading-order"
