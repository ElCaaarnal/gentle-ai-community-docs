# docs-navigation Specification

## Purpose

Locale navigation.

## Requirements

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
