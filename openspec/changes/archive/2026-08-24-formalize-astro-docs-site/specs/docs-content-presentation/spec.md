# Docs Content Presentation Specification

## Purpose

Describes how documentation content is structured and presented: sections, tables, diagrams, code blocks, and responsive reflow, as observed in the existing implementation. This is a retroactive spec — it authorizes no new work.

## Requirements

### Requirement: Structured Section Content

Documentation content MUST be organized as `h2`-level sections with optional `h3` subsections, MUST use tables with a header row for tabular data, and MUST use Mermaid diagrams for flow illustration.

*Evidence: src/components/DocumentationContent.astro — verified counts: 33 `<h2 `, 36 `<table>`, 2 `class="mermaid"` occurrences*

#### Scenario: Content renders as structured sections

- GIVEN the documentation content component
- WHEN it is rendered
- THEN it produces `h2` sections, tables with header rows, and Mermaid diagrams matching the currently authored content

> Note: the 33/36/2 counts are the observed content volume at time of writing, not a requirement to maintain those exact counts going forward.

### Requirement: Code Block Copy Control

Every code block MUST expose a control that copies its raw text to the clipboard and MUST give transient visual confirmation that the copy succeeded.

*Evidence: src/scripts/site.js:197-212*

#### Scenario: Reader copies a code block

- GIVEN a code block on the page
- WHEN the reader activates its copy control
- THEN the block's text is written to the clipboard and the control shows a temporary "copied" state before reverting

### Requirement: Table Horizontal Scroll Affordance

A table wider than its container MUST be horizontally scrollable and MUST visually indicate that more content exists off-screen until the reader scrolls to the table's end.

*Evidence: src/scripts/site.js:227-235; src/styles/global.css:373-378*

#### Scenario: Wide table signals more content

- GIVEN a table wider than its container
- WHEN it first renders
- THEN a scroll-edge hint is visible

#### Scenario: Hint clears at the scroll end

- GIVEN a wide table's hint is visible
- WHEN the reader scrolls the table to its right edge
- THEN the hint disappears

### Requirement: Card-Mode Tables on Narrow Viewports

Below a defined narrow-viewport breakpoint, tables MUST reflow from a row/column grid into stacked cards, with each cell labeled by its column header.

*Evidence: src/scripts/site.js:214-225 (header-to-cell label assignment); src/styles/global.css:539-569 (`@media(max-width:760px)`)*

#### Scenario: Table becomes stacked cards on narrow viewports

- GIVEN a viewport narrower than the card breakpoint
- WHEN a table renders
- THEN each row becomes a bordered card and each cell shows its column header as a label

> Provisional observed value (not contracted): the 760px card breakpoint (global.css:539) — a chosen-by-eye value, not a requirement.

### Requirement: Readable Measure for Running Text

Running text (paragraphs, lists, callout boxes) MUST be width-constrained for readability, while tables, code blocks, and diagrams MUST remain unconstrained to full content width, since they carry data rather than prose.

*Evidence: src/styles/global.css:506-509*

#### Scenario: Prose is narrower than data elements

- GIVEN a section containing both a paragraph and a table
- WHEN it renders on a wide viewport
- THEN the paragraph is narrower than the content column while the table spans the full content width

> Provisional observed values (not contracted): 70ch measure for running text, 76ch for notice boxes (global.css:506-507) — chosen-by-eye values, not requirements.

### Requirement: Diagram Legibility on Narrow Viewports

A Mermaid diagram MUST remain legible on narrow viewports by scrolling horizontally rather than shrinking below a readable text size.

*Evidence: src/styles/global.css:242 (overflow-x:auto — the scrolling half), 467-469 (min-width and max-width override — the legibility half)*

#### Scenario: Diagram stays legible when the viewport narrows

- GIVEN a Mermaid diagram and a viewport narrower than the mobile breakpoint
- WHEN the diagram renders
- THEN it becomes horizontally scrollable and its text does not shrink below the current legible size

> Provisional observed value (not contracted): 600px diagram minimum width (global.css:469) — a chosen-by-eye value, not a requirement.

## Known Issues (Deferred — Out of Scope)

- Shared responsive-cascade debt: the three overlapping `@media(max-width:900px)` blocks in `src/styles/global.css` (lines 256, 407, 426) also affect elements described here (e.g. `main` padding). See the `docs-navigation` spec's Known Issues for the full description; not duplicated here.
- `/favicon.ico` returns 404 — see the `docs-site-shell` spec.

## Non-Goals

- Any content rewrite, redesign, or the 18 pending BRIEF.md decisions (mobile table treatment beyond current behavior, light theme, typography, hero width, section order, and the rest).
