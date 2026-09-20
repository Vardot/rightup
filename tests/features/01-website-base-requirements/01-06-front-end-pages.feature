@smoke @regression @any @content
Feature: Website Base Requirements - Front-end pages
      As a site visitor
      I want every front-end page to be healthy
      So that I can navigate, read and trust the site on any page.

  @check @local @development @staging @production
  Scenario Outline: The <name> page is healthy
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the page should have a working header
      And the page should have a working footer
      And the page should have a main landmark
      And the page should have a navigation landmark
      And the page should have a skip link
      And the page should declare a language
      And the page should have a title
      And there should be no JavaScript errors

    Examples: Canvas pages
      | name         | path                |
      | Home         | /                   |
      | Studios      | /studios            |
      | Architecture | /architecture       |
      | Product      | /product            |
      | Branding     | /branding           |
      | Process      | /process            |
      | Culture      | /culture            |
      | Podcasts     | /podcasts           |
      | Last Call    | /podcasts/last-call |
      | Newsletter   | /newsletter         |
      | About Us     | /about-us           |
      | Contact Us   | /contact-us         |
      | Advertise    | /advertise          |
      | Privacy Notice | /privacy-notice   |
      | Terms of Use | /terms-of-use       |
      | Accessibility | /accessibility     |

    Examples: Listing pages
      | name   | path    |
      | News   | /news   |
      | Search | /search |

    Examples: News articles
      | name                  | path                                                                   |
      | Article - Brutalism   | /news/architecture-unease-how-brutalism-became-beautiful-again         |
      | Article - Flagship    | /news/fen-marble-reveal-first-look-rotterdam-flagship                  |
      | Article - Design Week | /news/milan-design-week-opens-record-number-independent-studios        |
      | Article - Lighting    | /news/danish-lighting-brand-just-reissued-its-most-controversial-chair |
      | Article - Pitching    | /news/what-fen-marble-actually-use-pitch-new-clients                   |
      | Article - Identity    | /news/arclight-studio-unveils-new-identity-nordic-airline              |

    Examples: Podcast episodes
      | name                        | path                                |
      | Podcast - Studio Wont Use   | /podcast/studio-wont-use-mood-board |
      | Podcast - No Straight Walls | /podcast/no-straight-walls          |

  @check @local @development
  Scenario Outline: The <name> content page has a working header and footer
    Given I am a logged in user with the "webmaster" user
     When I go to "<path>"
      And wait
     Then the page should have a working header
      And the page should have a working footer
      And the page should have a main landmark
      And the page should have a skip link
      And the page should declare a language
      And the page should have a title

    Examples: Content pages
      | name                     | path                           |
      | Privacy policy           | /privacy-policy                |
      | Accessibility tools demo | /accessibility-tools-demo-page |
