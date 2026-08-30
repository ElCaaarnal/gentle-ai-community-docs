# Docs MCP Preservation Specification

## Purpose

Protect the existing static documentation experience and keep MCP rollback independent from website publication.

## Requirements

### Requirement: Existing static routes and browser behavior remain authoritative

Adding the generated index and MCP service MUST preserve the existing English `/` and Spanish `/es/` static routes, canonical links, bilingual presentation, and browser search behavior. The MCP search contract MAY differ where explicitly specified, but it MUST NOT replace, silently alter, or become the runtime source of the browser search contract. Existing live documentation requirements remain in force.

#### Scenario: Static routes remain available with MCP enabled

- GIVEN the generated index and MCP service are deployed
- WHEN a browser requests `/` or `/es/`
- THEN the corresponding static documentation page loads with its existing locale, canonical links, and presentation behavior

#### Scenario: Browser search remains independent

- GIVEN a reader uses the browser search overlay
- WHEN the MCP index or MCP search behavior changes
- THEN browser search continues to follow its existing site contract
- AND machine-only rules such as rejecting an empty query or capping results at 20 do not silently change browser behavior

### Requirement: MCP rollback is independent of the static site

The MCP runtime MUST be disableable or removable without removing or impairing the Netlify-hosted static documentation. Index generation/publication, MCP transport/runtime, production operations, and client guidance MUST retain separate rollback boundaries. A defective index or unavailable service MUST be able to be withdrawn while the authoritative Astro pages continue to publish.

#### Scenario: Service rollback leaves documentation online

- GIVEN the production MCP service is disabled because of a runtime or security defect
- WHEN a reader visits the documentation site
- THEN `/` and `/es/` remain available through the static publication path
- AND no MCP outage is represented as a website outage

#### Scenario: Index rollback leaves source content unchanged

- GIVEN parity or fidelity validation identifies a defective generated index
- WHEN index publication is stopped or reverted
- THEN Astro source content and static routes remain unchanged
- AND no independent documentation rewrite is required to restore the site

### Requirement: First-slice scope excludes unrelated browser and server features

This change MUST remain limited to generated read-only documentation evidence, the specified MCP service, production operations required for that service, and truthful client guidance. It MUST NOT add WebMCP, Netlify Edge Functions, broad content migration, LLM synthesis, repository commands, content mutation, private data, OAuth, API keys, or undocumented HostGator plan assumptions.

#### Scenario: Out-of-scope request does not expand this capability

- GIVEN a proposed implementation requires WebMCP, Netlify Edge, broad Astro content migration, server-side LLM behavior, repository execution, mutation, private content, credentials, or an unverified HostGator plan feature
- WHEN the proposal is evaluated against this specification
- THEN that work is rejected as outside this change
- AND the read-only MCP and static-site boundaries remain unchanged

## Non-Goals

- Redesigning the website or browser search.
- Delivering a browser-agent API.
- Making Netlify Edge or experimental Netlify Functions an official MCP host.
