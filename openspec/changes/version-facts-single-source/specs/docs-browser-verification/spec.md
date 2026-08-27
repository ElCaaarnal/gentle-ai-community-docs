# Delta for docs-browser-verification

## ADDED Requirements

### Requirement: Independent version literals

The browser suite MUST assert channel version identifiers and release dates as literals authored in the test itself, and MUST NOT import the version module or any value derived from it.

The assertion's value comes from a human having written the expected version independently of the source that renders it. If one module fed both the page and the test, the comparison would be a tautology and would prove nothing. Two entries that must be updated together are the point, not a duplication defect.

*Evidence: tests/docs.spec.ts:245 (pinned literal list), tests/docs.spec.ts:267 (asserted in `main` on both routes)*

#### Scenario: Drift between source and expectation fails

- GIVEN the module records a version the suite's literal list does not contain
- WHEN the suite runs against the built site
- THEN the assertion for the missing literal fails and names the value

#### Scenario: A release update requires a second, human entry

- GIVEN a release update changes the recorded facts
- WHEN the suite runs before the test literals are updated
- THEN it fails
- AND it passes only once a human has updated the test literals to match

#### Scenario: The suite does not read the version module

- GIVEN the browser suite's sources
- WHEN their imports are inspected
- THEN no test module imports the version module or any value derived from it
