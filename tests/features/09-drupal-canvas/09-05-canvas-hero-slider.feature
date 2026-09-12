@regression @any @canvas
Feature: Content Structure - Hero Slider in Drupal Canvas
      As a site builder
      I want a Bootstrap 5 carousel-based Hero Slider in Drupal Canvas
      So that I can present rotating hero slides with images, overlay content and buttons.

  # The RightUp homepage leads with the editorial hero grid rather than a
  # carousel, so the Hero Slider is proven the way a site builder meets it: a
  # page built in the Canvas editor.
  @slow @flaky @check @local @development
  Scenario: A site builder adds a Hero Slider and it renders as a Bootstrap carousel
    Given I am a logged in user with the "webmaster" user
      And a new Canvas page "Test Hero Slider Basic" at "/test-hero-slider-basic"
     When I add the "Hero Slider (Container)" component to the "Test Hero Slider Basic" Canvas page using the editor
      And I publish the Canvas page changes
     Then I am an anonymous user
      And I go to "/test-hero-slider-basic"
      And wait
      And the element ".carousel.hero-slider" should be displayed
      And the element "[data-bs-ride='carousel']" should be displayed
      And the element "[data-bs-slide='prev']" should be displayed
      And the element "[data-bs-slide='next']" should be displayed

  @slow @flaky @check @local @development
  Scenario Outline: A site builder styles a Hero Slider in the editor - <name>
    Given I am a logged in user with the "webmaster" user
      And a new Canvas page "Test Hero Slider <name>" at "/test-hero-slider-<slug>"
     When I add the "Hero Slider (Container)" component to the "Test Hero Slider <name>" Canvas page using the editor
      And I set the Canvas component option "<option>" to "<value>"
      And I publish the Canvas page changes
     Then I am an anonymous user
      And I go to "/test-hero-slider-<slug>"
      And wait
      And the element ".carousel" should be displayed
      And the element "<selector>" should be displayed

    Examples:
      | name             | slug  | option           | value  | selector                        |
      | fade transition  | fade  | Transition       | Fade   | .carousel-fade                  |
      | tall height      | tall  | Slider height    | 900px  | .hero-slider--h-900             |
      | short height     | short | Slider height    | 500px  | .hero-slider--h-500             |
      | dark controller  | dark  | Controller color | Dark   | .hero-slider--controller-dark   |
      | light controller | light | Controller color | Light  | .hero-slider--controller-light  |
