# Delta for docs-browser-verification

## ADDED Requirements

### Requirement: Independent version literals

The browser suite MUST assert channel version identifiers and release dates as literals authored in the test itself, and MUST NOT import the version module or any value derived from it.

The assertion's value comes from a human having written the expected version independently of the source that renders it. If one module fed both the page and the test, the comparison would be a tautology and would prove nothing. Two entries that must be updated together are the point, not a duplication defect.

Those assertions MUST be scoped to the regions that render bound facts — the hero channel chips and the version-policy channel table. A page-wide assertion cannot satisfy this requirement: the same version identifiers also occur many times in authored prose that the single-source requirement deliberately leaves authored, so a page-wide search still finds the literal after the module has drifted, and passes.

*Evidence: tests/docs.spec.ts:247-250 (authored `bound` facts), tests/docs.spec.ts:273-284 (region-scoped assertions). Verified by mutation: changing all four recorded facts in `src/data/versions.ts` fails the assertion at tests/docs.spec.ts:279 and names the received value.*

#### Scenario: Drift between source and expectation fails

- GIVEN the module records a version the suite's authored literals do not contain
- WHEN the suite runs against the built site
- THEN the assertion over a bound region fails and names the received value

#### Scenario: Page-wide assertion is insufficient

- GIVEN a version identifier that appears both in a bound region and in authored prose elsewhere on the page
- WHEN the module's recorded value drifts from the suite's authored literal
- THEN an assertion scoped to the bound region fails
- AND an assertion over the whole page would still pass, which is why it does not satisfy this requirement

#### Scenario: A release update requires a second, human entry

- GIVEN a release update changes the recorded facts
- WHEN the suite runs before the test literals are updated
- THEN it fails
- AND it passes only once a human has updated the test literals to match

#### Scenario: The suite does not read the version module

- GIVEN the browser suite's sources
- WHEN their imports are inspected
- THEN no test module imports the version module or any value derived from it
