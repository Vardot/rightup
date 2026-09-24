@regression @any @a11y
Feature: Quality - Accessibility structure
      As a keyboard and screen reader user
      I want every page type to carry a sound document structure
      So that I can skip to the content, follow the headings and reach every control.

  @a11y @local @development @staging @production
  Scenario Outline: The <page> page carries a sound document structure
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the page should have a title
      And the page should declare a language
      And the page should have exactly one h1
      And the heading hierarchy should be valid
      And the page should have a main landmark
      And the page should have a navigation landmark
      And the page should have a skip link
      And user zoom should be allowed

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

  @a11y @local @development @staging @production
  Scenario Outline: Every control and image on the <page> page can be identified
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then every image should have an alt attribute
      And every link should have an accessible name
      And every button should have an accessible name
      And every ARIA reference should resolve
      And every ARIA role should be valid
      And no element should have a positive tabindex

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

  @a11y @local @development @staging @production
  Scenario Outline: Every form field on the <page> page is labelled
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then every form field should have an accessible label

    Examples:
      | page       | path         |
      | contact us | /contact-us  |
      | newsletter | /newsletter  |
      | search     | /search      |
      | advertise  | /advertise   |
      | login      | /user/login  |

  @a11y @local @development @staging @production
  Scenario: The login page carries a sound document structure
    Given I am an anonymous user
     When I go to "/user/login"
      And wait
     Then the page should have a title
      And the page should declare a language
      And the page should have exactly one h1
      And the heading hierarchy should be valid
      And the page should have a main landmark
      And user zoom should be allowed

  @a11y @local @development @staging @production
  Scenario: The not found page carries a sound document structure
    Given I am an anonymous user
     When I go to "/this-page-does-not-exist"
      And wait
     Then the page should have a title
      And the page should declare a language
      And the page should have a main landmark
      And every link should have an accessible name
      And user zoom should be allowed
