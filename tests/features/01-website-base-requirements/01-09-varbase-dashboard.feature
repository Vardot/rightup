@regression @any @admin @dashboard
Feature: The Varbase welcome dashboard shows each editorial role what it needs
  Editorial users land on the Varbase welcome dashboard from Varbase Admin Base:
  a welcome card with their picture and name, Add content, Top tasks, their own
  drafts, recent content and pages, and what is scheduled to publish.

  @check @local @development @staging @production
  Scenario Outline: Check that <role> sees the Varbase welcome dashboard
    Given I am a logged in user with the "<role>" user
     When I go to "/admin/dashboard"
      And I wait until the page is loaded
     Then I should see "Welcome,"
      And I should see "Add content"
      And I should see "Top tasks"
      And I should see "My Drafts"
      And I should see "Recent content"
      And I should see "Recent pages"
      And I should see "Scheduled"
      And I should not see "Announcements"
      And I should not see "Drupal Events and User Groups"
      And I should not see "The website encountered an unexpected error"

    Examples:
      | role           |
      | webmaster      |
      | Content editor |
      | Content admin  |
      | Site admin     |
      | Super admin    |

  @check @local @development @staging @production
  Scenario: Check that the SEO admin sees the dashboard without Recent pages
    Given I am a logged in user with the "SEO admin" user
     When I go to "/admin/dashboard"
      And I wait until the page is loaded
     Then I should see "Welcome,"
      And I should see "Add content"
      And I should see "My Drafts"
      And I should see "Recent content"
      And I should see "Scheduled"
      And I should not see "Recent pages"

  @check @local @development @staging @production
  Scenario: Check that the webmaster sees the accessibility alerts
    Given I am a logged in user with the "webmaster" user
     When I go to "/admin/dashboard"
      And I wait until the page is loaded
     Then I should see "Pages with accessibility alerts"

  @check @local @development @staging @production
  Scenario: Check that a normal user is refused the dashboard
    Given I am a logged in user with the "Normal user" user
     When I go to "/admin/dashboard/welcome"
      And I wait until the page is loaded
     Then the response status code should be 403
