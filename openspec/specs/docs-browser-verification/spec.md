# docs-browser-verification Specification

## Purpose

Verification evidence.

## Requirements

### Requirement: Two-locale browser matrix

Automated verification MUST cover both locales at desktop and narrow viewports: H2/H3 fragments, hash-preserving switches, search states, scrollspy, and responsive tables.

#### Scenario: Success

- GIVEN the built site is served
- WHEN the two-locale, two-viewport matrix runs
- THEN all declared assertions pass

#### Scenario: Failure

- GIVEN route, fragment, search, scroll, or table behavior regresses
- WHEN the matrix runs
- THEN failure identifies locale, viewport, and behavior

### Requirement: Focused visual evidence

The suite MUST compare committed snapshots only for hero/banner and narrow responsive-table state, not broad full-page baselines.

#### Scenario: Compare

- GIVEN both locales and viewports are rendered
- WHEN snapshots are compared
- THEN approved surfaces match without unrelated noise

#### Scenario: Regression

- GIVEN banner, callout, or table presentation changes
- WHEN comparison runs
- THEN the affected snapshot fails
