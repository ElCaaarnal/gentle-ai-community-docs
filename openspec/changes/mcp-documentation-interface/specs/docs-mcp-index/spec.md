# Docs MCP Index Specification

## Purpose

Define the generated bilingual evidence index that lets the MCP interface expose the existing Astro documentation without creating a second content authority.

## Requirements

### Requirement: Reproducible index derived from built documentation

The build MUST generate the MCP index from the built English `/` and Spanish `/es/` Astro pages. For the same built page content and declared extraction inputs, generation MUST produce the same ordered records and identity values. The index MUST NOT require independently maintained Markdown, JSON, or other documentation copy.

#### Scenario: Index follows the published pages

- GIVEN both locale pages have been built successfully
- WHEN the index is generated
- THEN its records are extracted from those built page outputs
- AND the same source content remains the authority for both the website and MCP evidence

#### Scenario: Repeated generation is reproducible

- GIVEN identical built English and Spanish page bytes and extraction inputs
- WHEN the index is generated more than once
- THEN the record order, field values, and declared source/index identities are equivalent in every generation

#### Scenario: No independent content copy is accepted

- GIVEN an index-generation change includes manually maintained documentation content unrelated to built-page extraction
- WHEN the build is evaluated
- THEN publication MUST fail rather than establish that content as a second authority

### Requirement: Complete bilingual H2/H3 parity validation

The build MUST validate the complete set of H2 and H3 identifiers in both locales, including heading level and parent-child hierarchy. Every English H2/H3 identifier MUST have exactly one Spanish counterpart, and every Spanish identifier MUST have exactly one English counterpart. A parity or hierarchy failure MUST prevent publication of the generated index.

#### Scenario: Matching bilingual hierarchy publishes

- GIVEN English and Spanish built pages contain the same ordered H2/H3 identifier set and corresponding hierarchy
- WHEN parity validation runs
- THEN validation succeeds and the index may be published

#### Scenario: Missing or extra identifier blocks publication

- GIVEN one locale is missing an H2/H3 identifier or contains an extra identifier
- WHEN parity validation runs
- THEN validation fails with a deterministic parity error
- AND no index is published

#### Scenario: Hierarchy drift blocks publication

- GIVEN an identifier exists in both locales but its heading level or parent relationship differs
- WHEN parity validation runs
- THEN validation fails with a deterministic hierarchy error
- AND no index is published

### Requirement: Structured section records preserve source identity

Each indexed H2/H3 record MUST include a shared stable `id`, localized `title`, heading `level`, explicit `parent_id` or `null`, ordered hierarchy information, and a locale-specific canonical URL containing the section fragment. Each record and each successful operation response MUST expose non-empty `source_identity`, `source_version`, `index_identity`, and `index_version` metadata that identifies the originating Astro build and generated index. The generated index metadata MUST also expose its non-empty `bounds_config_version` and the applicable validated bounds. Records MUST retain enough structured evidence to preserve headings, links, code blocks, lists, and tables.

#### Scenario: A section record is complete

- GIVEN an indexed H2 or H3 section
- WHEN its record is inspected
- THEN the record contains its shared ID, localized title, level, parent relationship, hierarchy, canonical URL, locale, and source/index identity metadata

#### Scenario: Rich source structure survives extraction

- GIVEN a source section containing links, code blocks, lists, and tables
- WHEN its index record is generated
- THEN the record retains the corresponding destinations, code content, ordering, and tabular values without replacing them with an AI-authored summary

#### Scenario: Source and index identity are consistent

- GIVEN two records are generated from one index
- WHEN their metadata is compared
- THEN both identify the same source build and index version, while locale and section-specific fields remain distinct

### Requirement: Versioned bounds govern publication and readiness

Index generation and service startup MUST consume one versioned mandatory bounds configuration contract. Every query, identifier, option, request, result, snippet, section-body, serialized-evidence, complete-response, error-message, rate-limit, and index record or serialized-index limit used by these specifications MUST have an explicit positive finite configured value; count and length limits MUST additionally use the required integral form. The configuration MUST retain the approved search default of 8 results and maximum of 20 results. Build-time validation MUST reject missing or invalid index bounds before publication, and service startup validation MUST reject missing or invalid request/response bounds before readiness. The validated bounds configuration version and applicable values MUST be exposed through index or service metadata wherever clients need to predict acceptance or response size. Boundary tests MUST cover the exact accepted and rejected edges for every declared bound. Missing or invalid bounds MUST fail closed and MUST NOT permit partial index publication or unbounded service behavior.

#### Scenario: Valid bounds produce predictable service and index metadata

- GIVEN the index generator and service receive one complete valid versioned bounds configuration
- WHEN the bilingual index is generated and the service becomes ready
- THEN the artifact and service metadata expose the same non-empty bounds configuration version and applicable bound values
- AND the search bounds remain default 8 and maximum 20 results

#### Scenario: Missing or invalid bounds block publication and readiness

- GIVEN a required bound is absent, zero, negative, non-finite, or otherwise invalid for its declared type
- WHEN build or service startup validation runs
- THEN index publication or service readiness is blocked respectively
- AND no partial index or unbounded service behavior is made available

#### Scenario: Every bound has boundary evidence

- GIVEN the versioned bounds configuration declares all applicable query, identifier, option, request, response, error-message, evidence, result, rate-limit, and index limits
- WHEN boundary verification runs
- THEN each exact boundary is tested for accepted and rejected behavior
- AND no requirement relies on an undeclared bound

### Requirement: Invalid extraction output fails closed

The build MUST fail closed when either locale cannot be parsed into valid H2/H3 records, when required identity or hierarchy fields are missing, or when generated output would exceed the configured publication bounds. It MUST NOT publish partial, fabricated, or stale records as a successful index.

#### Scenario: Malformed page output blocks generation

- GIVEN a built locale page cannot be parsed into valid section boundaries
- WHEN index generation runs
- THEN generation reports a bounded extraction failure
- AND no partial index is published

#### Scenario: Oversized generated output is rejected

- GIVEN generated records or their serialized index exceed the configured record-count or serialized-index bound
- WHEN publication validation runs
- THEN it reports a bounded output failure
- AND the service does not receive the oversized or partial index

## Non-Goals

- Broad migration of Astro content into a new structured-content system.
- WebMCP implementation.
- LLM-generated summaries, answers, or rankings.
- Documentation mutation, private content, repository commands, or a separately authored content copy.
