@regression @any @content
Feature: Frontend Pages - Category landing pages
      As a reader
      I want each category page to list only stories from that category
      So that the Architecture page shows architecture, and so on.

  @check @local @development @staging @production
  Scenario Outline: Check that a category page lists its own stories
    Given I am an anonymous user
     When I go to "<path>"
     Then every story in the "lead story" should be in the "<category>" category
      And every story in the "side stories" should be in the "<category>" category
      And the "lead story" should list these stories, in order:
        | <lead> |
      And the "more stories" should list 3 stories
      And the "editors' picks" should list 3 stories
      And the "latest stories" should list 10 stories

    Examples:
      | category     | path          | lead                                                              |
      | Studios      | /studios      | Bloom & Ash, Kiro Tanaka, and Lea Wren Launch New Collective       |
      | Architecture | /architecture | The Architecture of Unease: How Brutalism Became Beautiful Again   |
      | Product      | /product      | A Danish Lighting Brand Just Reissued Its Most Controversial Chair |
      | Branding     | /branding     | Arclight Studio Unveils New Identity for Nordic Airline            |
      | Process      | /process      | What Fen & Marble Actually Use to Pitch New Clients                |
      | Culture      | /culture      | Milan Design Week Opens With Record Number of Independent Studios  |

  @check @local @development @staging @production
  Scenario: Check that the Architecture page lists its stories in the shipped order
    Given I am an anonymous user
     When I go to "/architecture"
     Then the "side stories" should list these stories, in order:
        | Fen & Marble Reveal First Look at Rotterdam Flagship |
        | A Community Center Built From Color-Blocked Voids    |
      And the "more stories" should list these stories, in order:
        | The Concert Hall Reshaping What a Roof Can Do               |
        | A Norwegian Firm Builds a Library With No Straight Shelves  |
        | The Concrete Church Reclaimed as a Climbing Gym             |
      And the "editors' picks" should list these stories, in order:
        | A Facade System Built Entirely From Salvaged Material |
        | A Concrete Institute Built to Age on Purpose          |
        | A Facade That Changes Color With the Weather          |

  @check @local @development @staging @production
  Scenario: Check that The Latest lists the newest stories from every category
    Given I am an anonymous user
     When I go to "/studios"
     Then the "latest stories" should list these stories, in order:
        | The Architecture of Unease: How Brutalism Became Beautiful Again   |
        | Fen & Marble Reveal First Look at Rotterdam Flagship               |
        | Milan Design Week Opens With Record Number of Independent Studios  |
        | A Danish Lighting Brand Just Reissued Its Most Controversial Chair |
        | What Fen & Marble Actually Use to Pitch New Clients                |
        | Arclight Studio Unveils New Identity for Nordic Airline            |
        | Renzo Vidal Premieres Short Film Honoring Late Mentor              |
        | Bloom & Ash, Kiro Tanaka, and Lea Wren Launch New Collective       |
        | See Fen & Marble's Surprise Pop-Up With Local Ceramicists          |
        | Arclight Studio Announce Fall Exhibition                           |

  @check @local @development @staging
  Scenario: Check that a story queued in Editors' picks leads that category only
    Given I am a logged in user with the "webmaster" user
      And the "Editors' picks" queue holds:
        | A Norwegian Firm Builds a Library With No Straight Shelves |
     When I go to "/architecture"
     Then the "editors' picks" should list these stories, in order:
        | A Norwegian Firm Builds a Library With No Straight Shelves |
        | A Facade System Built Entirely From Salvaged Material      |
        | A Concrete Institute Built to Age on Purpose               |
     When I go to "/culture"
     Then the "editors' picks" should list these stories, in order:
        | A Photographer's 10-Year Study of Ceremony and Color in West Africa |
        | The Documentary Series Turning Manual Labor Into Still Life         |
        | The Archive That Became an Exhibition by Accident                   |
