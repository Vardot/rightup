@smoke @regression @slow @any @content
Feature: Website Base Requirements - Front-end pages warm-up
      As the test runner
      I want each public page visited once at every testing breakpoint before the health checks
      So that the default theme image derivatives are generated and cached first.

  # The default theme renders responsive images through drimage_improved, which
  # generates a WebP derivative per rendered width on the fly. The first request
  # for a derivative can be dropped while it is still being generated (most
  # visibly under HTTP/2), which later surfaces as a console resource error on
  # the 01-06 health checks. Visiting each page once at every viewport breakpoint
  # from the testing settings primes the derivative cache for all widths, so the
  # health checks serve them as static files. This warm-up makes no assertions.

  @check @local @development @staging @production
  Scenario Outline: Warm up the <name> page across all breakpoints
    Given I am an anonymous user
     When I warm up "<path>" at all testing breakpoints

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
