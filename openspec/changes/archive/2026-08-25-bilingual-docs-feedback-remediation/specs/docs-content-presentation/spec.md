# docs-content-presentation Specification

## Purpose

Content parity.

## Requirements

### Requirement: Equivalent localized presentation

Both locales MUST preserve meaning, order, IDs, diagrams, table labels, ARIA text, warnings, feedback, and progress. Prose MUST be neutral-international; technical literals MUST remain exact.

#### Scenario: Compare

- GIVEN one section is rendered in both locales
- WHEN outputs are compared
- THEN structure and behavior match while text is localized

#### Scenario: Retention

- GIVEN scrolling or feedback is active
- WHEN the locale changes
- THEN the target retains that behavior and progress affordance

### Requirement: Confirmed visual remediation

The adapted banner MUST be responsive; the first callout MUST use its approved treatment; H2 accents and inert hover effects MUST be absent; tables MUST remain usable.

#### Scenario: Responsive

- GIVEN desktop and narrow viewports
- WHEN hero, callout, and tables are viewed
- THEN width, readability, aspect ratio, and overflow feedback are correct
