# Docs Navigation Specification

## Purpose

Describes the sidebar, contextual sub-navigation, active-section tracking, mobile drawer, and scroll-progress/back-to-top affordances of the documentation site, as observed in the existing implementation. This is a retroactive spec — it authorizes no new work.

## Requirements

### Requirement: Sidebar Section List

The sidebar MUST list every documentation section, grouped under labeled groups, each entry linking to that section's heading anchor.

*Evidence: src/components/Sidebar.astro:9-51*

#### Scenario: Sidebar renders grouped section links

- GIVEN the page has loaded
- WHEN the sidebar is rendered
- THEN it shows labeled groups (e.g. "Empezar", "El ecosistema") each containing links to a `#section-id` anchor

### Requirement: Heading Anchor Generation

Every `h2`/`h3` heading without an explicit id MUST receive a stable, slugified id and a visible anchor link; colliding slugs MUST be disambiguated with a numeric suffix.

*Evidence: src/scripts/site.js:28-47*

#### Scenario: Heading without an id gets one derived from its text

- GIVEN a heading with no `id` attribute
- WHEN the page initializes
- THEN its id is derived from a slugified version of its text and an anchor link is appended to it

#### Scenario: Colliding slugs are disambiguated

- GIVEN two headings whose text slugifies to the same base id
- WHEN ids are assigned
- THEN the second heading's id is suffixed (e.g. `base-2`) to remain unique

### Requirement: Contextual Sub-Navigation

For each top-level section that contains `h3` subsections, the sidebar MUST build a sub-navigation list, which SHALL be visible only while the reader is inside that section.

*Evidence: src/scripts/site.js:49-69, 254-282; src/styles/global.css:291-295*

#### Scenario: Sub-navigation appears for the active section only

- GIVEN a section with `h3` subsections
- WHEN the reader scrolls into that section
- THEN its sub-navigation becomes visible and other sections' sub-navigations remain collapsed

> Note (historical rationale, non-binding): the current build toggles a `max-height` transition rather than `display`, to animate the reveal. This is implementation detail, not a spec requirement.

### Requirement: Active Section Highlight (Scrollspy)

The sidebar MUST mark the link for the section currently in view as active, including its parent group where applicable, and MUST keep this highlight current during continuous or fast scrolling without visible lag or freezing.

*Evidence: src/scripts/site.js:244-292, 304-308 (`requestAnimationFrame`-throttled scroll handler)*

#### Scenario: Active link updates as the reader scrolls

- GIVEN the reader scrolls past a section boundary
- WHEN the scroll settles
- THEN the corresponding sidebar link is marked active (`aria-current`) and the previous active link is cleared

#### Scenario: Highlight tracks fast scrolling

- GIVEN the reader scrolls rapidly through several sections
- WHEN scrolling stops
- THEN the active link reflects the section currently in view, without a stuck or delayed highlight

> Note (historical rationale, non-binding): the current build computes each heading's position via `getBoundingClientRect` rather than `IntersectionObserver`, a documented BRIEF finding. This is not a mechanism requirement.

### Requirement: Sidebar Auto-Scroll With User Override

On wide viewports, the sidebar SHOULD scroll to keep the active link visible, but MUST NOT do so while the reader is actively interacting with the sidebar itself.

*Evidence: src/scripts/site.js:249-252, 284-291*

#### Scenario: Sidebar follows the active section

- GIVEN the active link scrolls out of the visible sidebar area on a wide viewport
- WHEN the section changes
- THEN the sidebar smoothly scrolls to bring the active link back into view

#### Scenario: Manual sidebar interaction suppresses auto-scroll

- GIVEN the reader is scrolling or hovering the sidebar directly
- WHEN the active section changes
- THEN the sidebar does not auto-scroll while that interaction is recent

### Requirement: Mobile Drawer Navigation

On narrow viewports, the sidebar MUST be reachable as a togglable off-canvas drawer, opened by a menu control and closed by its scrim, or by selecting a link inside it.

*Evidence: src/scripts/site.js:311-316; src/components/InterfaceChrome.astro:2-9; src/styles/global.css:407-415*

#### Scenario: Menu button opens the drawer

- GIVEN a narrow viewport
- WHEN the reader activates the menu button
- THEN the sidebar drawer opens and its scrim appears

#### Scenario: Selecting a link or the scrim closes the drawer

- GIVEN the drawer is open
- WHEN the reader selects a navigation link, or taps the scrim
- THEN the drawer closes

### Requirement: Scroll Progress and Back-to-Top

The site MUST show a page-scroll progress indicator and MUST offer a back-to-top control that becomes visible after sufficient scroll and smooth-scrolls to the top when activated.

*Evidence: src/scripts/site.js:294-309*

#### Scenario: Progress bar tracks scroll position

- GIVEN the reader scrolls the page
- WHEN scroll position changes
- THEN the progress indicator's width reflects the fraction of scrollable height covered

#### Scenario: Back-to-top appears and works

- GIVEN the reader has scrolled past the current threshold
- WHEN the reader activates the back-to-top control
- THEN the page smooth-scrolls to the top

### Requirement: Accessible fragment-preserving locale links

The site MUST expose real `English` and `Español` links, visible focus, and `aria-current="page"` only on the active page. H2/H3 IDs MUST remain stable; flags MUST NOT be sole labels.

#### Scenario: Keyboard

- GIVEN either locale is open
- WHEN navigation is keyboard-operated
- THEN both links, active state, and focus are available

#### Scenario: Hash

- GIVEN `/` is at `#rdd-ciclo` without JavaScript
- WHEN Español is activated
- THEN `/es/#rdd-ciclo` opens; an unusable hash MUST NOT block navigation

## Known Issues (Deferred — Out of Scope)

- Three separate `@media(max-width:900px)` blocks exist in `src/styles/global.css` (lines 256, 407, 426), declaring overlapping rules for the same elements (`aside`, `main` padding, `#toTop`). Which declaration wins for a given property depends on source order across three blocks rather than one coherent block. This is recorded as known structural debt — a source-clarity problem, not a rendering defect — and is not fixed here; the cascade order itself is explicitly not specified as intended behavior. This spec makes no claim about current visual parity: it was verified byte-identical against reference screenshots at implementation time, but those references no longer exist in this tree, so that comparison cannot be reproduced today.

## Provisional Observed Values (Not Contracted)

Recorded as currently observed, chosen-by-eye values — not requirements. Changing them does not break this spec: back-to-top visibility threshold (700px scroll, site.js:300); sidebar auto-scroll suppression window (~1200ms, site.js:285); mobile drawer width (290px, global.css:410); layout breakpoints (420 / 760 / 900px, global.css, multiple).
