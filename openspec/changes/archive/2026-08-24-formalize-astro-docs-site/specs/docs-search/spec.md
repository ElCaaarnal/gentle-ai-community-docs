# Docs Search Specification

## Purpose

Describes the in-page search overlay: how the index is built, how matching and ranking behave from the reader's perspective, and the keyboard interaction contract. This is a retroactive spec — it authorizes no new work.

## Requirements

### Requirement: Runtime Search Index From Rendered Content

The site MUST build its search index at page-load time from the rendered `h2`/`h3` headings and the text between them, rather than from a separately maintained data file.

*Evidence: src/scripts/site.js:85-103*

#### Scenario: Index reflects the current page content

- GIVEN the page has loaded
- WHEN the search index is built
- THEN it contains one entry per `h2`/`h3` section, with the section's title, parent title, and body text

> Note (historical rationale, non-binding): building the index from the DOM avoids drift between the index and displayed content — a BRIEF finding, not a requirement on mechanism.

### Requirement: Accent-Insensitive Matching

Search MUST match query text against titles and body text regardless of diacritics, so an unaccented query finds accented content.

*Evidence: src/scripts/site.js:28-34 (normalization), 122-135 (matching)*

#### Scenario: Unaccented query matches accented content

- GIVEN a section titled with an accented word (e.g. "Instalación")
- WHEN the reader searches for the unaccented form (e.g. "instalacion")
- THEN that section appears in the results

> Note (historical rationale, non-binding): implemented via Unicode NFD normalization and diacritic stripping — a BRIEF finding, not a mechanism requirement.

### Requirement: Keyboard-Driven Search Overlay

The search overlay MUST open via a keyboard shortcut (`/` outside a text field, or Ctrl/Cmd+K) or a visible button, and while open MUST support arrow-key navigation between results, Tab-cycling confined to the overlay, Enter to open the selected result, and Escape to close and return focus to the trigger.

*Evidence: src/scripts/site.js:106-195; src/components/InterfaceChrome.astro:5-21; src/components/Sidebar.astro:4-8*

#### Scenario: Shortcut opens the overlay

- GIVEN the reader is not focused in a text input
- WHEN the reader presses `/`
- THEN the search overlay opens and the search input receives focus

#### Scenario: Escape closes and restores focus

- GIVEN the overlay is open
- WHEN the reader presses Escape
- THEN the overlay closes and focus returns to the element that opened it

#### Scenario: Empty query shows default results

- GIVEN the overlay opens with no query typed
- WHEN results are rendered
- THEN a bounded set of default entries is shown (currently the first 8 index entries)

### Requirement: Ranked, Snippeted Results

Results MUST be ranked so a title-prefix match ranks above a title-substring match, which ranks above a body-text-only match, MUST be capped to a bounded count, and a body-only match MUST show a highlighted snippet of the matching text.

*Evidence: src/scripts/site.js:122-135 (scoring, sort, cap), 111-121 (snippet, highlight), 149 (the conditional that renders the snippet for a body-only match)*

#### Scenario: Title matches rank above body-only matches

- GIVEN a query that matches one section's title and another section's body text only
- WHEN results are rendered
- THEN the title match appears above the body-only match

#### Scenario: Body-only match shows a highlighted snippet

- GIVEN a query that matches only within a section's body text
- WHEN that result is rendered
- THEN it shows a truncated snippet of surrounding text with the match visually highlighted

> Provisional observed values (not contracted): result cap of 24 entries and ~130-character snippet length (site.js:115, 134) — chosen-by-eye limits, not requirements.

### Requirement: No-Results Empty State

When a non-empty query matches nothing, the overlay MUST show an explicit empty-results message rather than an empty list.

*Evidence: src/scripts/site.js:136-139*

#### Scenario: Non-matching query shows an explicit empty state

- GIVEN the reader types a query that matches no section
- WHEN results are rendered
- THEN the overlay shows a "no results" message
