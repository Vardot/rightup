@regression @any @content
Feature: Frontend Pages - Homepage news lists
      As an editor
      I want every story list on the homepage to come from the news content
      So that publishing or curating a story changes the homepage without editing it.

  @check @local @development @staging @production
  Scenario: Check that the homepage hero lists the newest stories
    Given I am an anonymous user
     When I go to the homepage
     Then the "top story" should list these stories, in order:
        | The Architecture of Unease: How Brutalism Became Beautiful Again |
      And the "top side stories" should list these stories, in order:
        | Fen & Marble Reveal First Look at Rotterdam Flagship              |
        | Milan Design Week Opens With Record Number of Independent Studios |
      And the "top story pair" should list these stories, in order:
        | A Danish Lighting Brand Just Reissued Its Most Controversial Chair |
        | What Fen & Marble Actually Use to Pitch New Clients                |
      And the "top stories list" should list 5 stories

  @check @local @development @staging @production
  Scenario: Check that the homepage featured block and slider list the promoted stories
    Given I am an anonymous user
     When I go to the homepage
     Then the "featured story" should list these stories, in order:
        | Inside the Gallery Show Built Entirely From Borrowed Light |
      And the "more featured stories" should list these stories, in order:
        | A Type Foundry Built From Overlapping Shapes   |
        | The Museum That Became Its Own Archive         |
        | The Concert Hall Reshaping What a Roof Can Do  |
      And the "on display" should list these stories, in order:
        | A Photographer's 10-Year Study of Ceremony and Color in West Africa |
        | The Documentary Series Turning Manual Labor Into Still Life         |
        | A Facade System Built Entirely From Salvaged Material               |
        | A Concrete Institute Built to Age on Purpose                        |

  @check @local @development @staging @production
  Scenario: Check that the homepage latest grid and podcast band come from content
    Given I am an anonymous user
     When I go to the homepage
     Then the "home latest stories" should list 6 stories
      And the "podcast show" should list these stories, in order:
        | Last Call |
      And the "podcast episodes" should list 3 stories

  @check @local @development @staging
  Scenario: Check that a story queued in Top stories leads the homepage
    Given I am a logged in user with the "webmaster" user
      And the "Top stories" queue holds:
        | A Gallery With No Walls, Only Light |
     When I go to the homepage
     Then the "top story" should list these stories, in order:
        | A Gallery With No Walls, Only Light |
      And the "top side stories" should list these stories, in order:
        | The Architecture of Unease: How Brutalism Became Beautiful Again |
        | Fen & Marble Reveal First Look at Rotterdam Flagship              |

  @check @local @development @staging
  Scenario: Check that a story queued in Featured leads the featured block
    Given I am a logged in user with the "webmaster" user
      And the "Featured" queue holds:
        | The Chair Every Design School Still Teaches |
     When I go to the homepage
     Then the "featured story" should list these stories, in order:
        | The Chair Every Design School Still Teaches |
