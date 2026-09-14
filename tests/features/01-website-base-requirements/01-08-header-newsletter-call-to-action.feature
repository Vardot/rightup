@smoke @regression @any @content
Feature: Website Base Requirements - Header newsletter call to action
      As a site visitor
      I want the Newsletter button in the site header to take me to the newsletter page
      So that I can subscribe from any page on the site.

  @check @local @development @staging @production
  Scenario: Check that the header Newsletter button has a link destination
    Given I am an anonymous user
     When I go to "/"
      And wait
     Then the ".btn-accent" link should contain "/newsletter" by attr

  @check @local @development @staging @production
  Scenario: Check that the header Newsletter button opens the newsletter page
    Given I am an anonymous user
     When I go to "/"
      And wait
      And I click ".btn-accent" by attr
      And wait
     Then the url should match "/newsletter"
      And I should see "Get the Work Before It's Polished"

  @check @local @development @staging @production
  Scenario Outline: Check that the header Newsletter button has a link destination on the <name> page
    Given I am an anonymous user
     When I go to "<path>"
      And wait
     Then the ".btn-accent" link should contain "/newsletter" by attr

    Examples: Canvas pages
      | name       | path        |
      | Studios    | /studios    |
      | Podcasts   | /podcasts   |
      | About Us   | /about-us   |
      | Contact Us | /contact-us |
