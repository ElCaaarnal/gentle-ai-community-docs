# Delta for docs-content-presentation

## ADDED Requirements

### Requirement: Single-source channel version facts

The stable version, the prerelease version, their release dates, and the prerelease install pin MUST originate from one locale-invariant typed module, and both locale content components MUST render those values by binding that module rather than by repeating literals.

Binding MUST be render-transparent: for a given set of recorded facts, the rendered markup MUST be identical to the literal text it replaces. Version narrative prose MUST NOT be produced by concatenating recorded facts with authored sentences — labels and prose stay authored in each locale, and only the datum is bound. Version-independent install targets (stable `@latest`, development `@main`) MUST remain literal constants and MUST NOT be derived from the module. Delta pills, retirement prose, and immutable historical version references are outside this mechanism's reach and MUST remain authored text.

*Evidence: src/components/DocumentationContentEn.astro:8,1403-1404; src/components/DocumentationContentEs.astro:10,1426-1427; src/data/versions.ts*

#### Scenario: A release update edits one file

- GIVEN a new stable release must be published on the site
- WHEN the module's recorded stable version and release date are updated and the site is rebuilt
- THEN both locales render the new version and date in the hero chips and the channel table
- AND no locale content component required an edit

#### Scenario: The prerelease install pin follows the recorded fact

- GIVEN the recorded prerelease version changes
- WHEN both locales are rendered
- THEN the prerelease install command pins exactly that version in each locale
- AND the stable and development install targets are unchanged

#### Scenario: Labels stay authored, only the datum binds

- GIVEN the hero chip labels and channel-table row labels in either locale
- WHEN that locale renders
- THEN each label is the authored text of that locale's component
- AND no rendered sentence is assembled by concatenating a recorded fact with authored prose

#### Scenario: Binding does not disturb the hero baseline

- GIVEN a build produced before the facts were bound
- WHEN the same facts are rendered through the module
- THEN the hero region of `dist/index.html` and `dist/es/index.html` is byte-identical to that earlier build
- AND the committed hero snapshots need no regeneration

#### Scenario: Out-of-reach surfaces are untouched

- GIVEN the delta pills, retirement prose, and historical version references
- WHEN the recorded facts are updated
- THEN those surfaces render unchanged, because they are authored text outside this mechanism
