# Docs MCP Index Specification

## Purpose

Describes the build-time process that derives a locale-aware section index from the same built
HTML the public site serves, so the site and the MCP interface read one authoritative source
(AC6) instead of an independently maintained copy.

## Requirements

### Requirement: Index Derived From Built Site Output

The system MUST derive the section index from the built HTML output (`dist/index.html` and
`dist/es/index.html`) produced by the existing site build, never from a separately authored or
separately maintained data file.

#### Scenario: Index reflects published content

- GIVEN a completed `astro build`
- WHEN the index generator runs
- THEN every `<h2>`/`<h3>` heading with an `id` inside each page's `<main>` becomes one indexed
  section carrying that heading's id, title, level, locale, and canonical URL

#### Scenario: Index generation is wired into the build

- GIVEN `npm run build` is invoked
- WHEN the Astro build step completes
- THEN the index generator MUST run automatically as a post-build step, requiring no separate
  manual step

### Requirement: EN/ES Section ID Parity Enforced At Build Time

The system MUST fail the build when a section id present in one locale's index has no
corresponding id in the other locale's index.

#### Scenario: Parity mismatch fails the build

- GIVEN the EN and ES indexes contain at least one unpaired section id
- WHEN the index generator runs as part of `npm run build`
- THEN the build MUST exit with a non-zero status and report the unpaired ids, without writing a
  partial or stale index

#### Scenario: Parity holds

- GIVEN every EN section id has a matching ES section id and vice versa
- WHEN the index generator runs
- THEN the build proceeds and the generator reports parity as satisfied

### Requirement: Code Block And Link Fidelity In Extraction

The system MUST preserve a `<pre>` block's internal line breaks and preserve each link's
destination alongside its label when extracting section text.

#### Scenario: Code block retains line breaks

- GIVEN a section body contains a `<pre>` element spanning multiple lines
- WHEN that section is indexed
- THEN the indexed text preserves the original line breaks inside that block

#### Scenario: Link retains its destination

- GIVEN a section body contains an `<a href="...">` element
- WHEN that section is indexed
- THEN the indexed text includes both the link's visible label and its href destination

### Requirement: Index Build Identity Recorded

The system MUST record a build identity — at minimum a generation timestamp and the total
section count — alongside the generated index, so downstream consumers can detect staleness.

#### Scenario: Build identity is present

- GIVEN the index generator completes successfully
- WHEN the resulting index is inspected
- THEN it includes a generation timestamp and the total number of indexed sections

### Requirement: Extraction Failure Is Explicit, Not Silent

The system MUST fail with a descriptive error, instead of producing an empty or partial index,
when required structure — a canonical link, a `<main>` element, or at least one heading — is
missing from a built page.

#### Scenario: Missing structure aborts generation

- GIVEN a built page is missing its `<main>` element or contains no headings
- WHEN the index generator runs
- THEN it exits with a non-zero status and a message naming the missing structure, and MUST NOT
  write an index file
