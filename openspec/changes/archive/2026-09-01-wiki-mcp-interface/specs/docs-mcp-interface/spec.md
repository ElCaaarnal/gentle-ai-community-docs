# Docs MCP Interface Specification

## Purpose

Describes the three read-only MCP tools exposed over the documentation index: their schemas,
scoring, result shape, and explicit error paths (AC2, AC3, AC4, AC5, AC7, AC8).

## Requirements

### Requirement: search_docs Tool With Relevance Scoring

The system MUST expose a `search_docs` tool accepting a required `query` string, an optional
`locale` (`en` or `es`), and an optional bounded `limit`, and MUST rank matches using
length-normalized, stopword-aware (English and Spanish), inverse-document-frequency-weighted
scoring rather than raw term counting, because raw term counting produces incorrect top results.

#### Scenario: Precisely relevant section outranks a longer weakly-relevant one

- GIVEN a query where raw term counting would rank a longer, weakly-relevant section above a
  shorter, precisely-relevant one
- WHEN `search_docs` scores candidates
- THEN the precisely-relevant section MUST rank first

#### Scenario: Locale-scoped search

- GIVEN `locale` is provided
- WHEN `search_docs` runs
- THEN only sections in that locale are considered

### Requirement: Search Results Are Bounded And Fully Described

Each `search_docs` result MUST carry the section id, title, locale, a bounded snippet, and the
canonical URL. The result list MUST NOT exceed the requested (or default) limit, and each
snippet MUST be truncated to a fixed maximum length documented in the tool's schema description.

#### Scenario: Result carries all required fields

- GIVEN a query with at least one match
- WHEN `search_docs` returns results
- THEN every result includes section id, title, locale, snippet, and canonical URL

#### Scenario: Long section still yields a bounded snippet

- GIVEN a matching section's full text exceeds the documented snippet bound
- WHEN a result for that section is produced
- THEN the snippet is truncated to that bound, never returned in full

### Requirement: list_sections Tool For Discovery

The system MUST expose a `list_sections` tool accepting an optional `locale` filter and
returning every indexed section's id, title, level, and locale, without body text, supporting
discovery independent of a search query.

#### Scenario: Enumerates one locale

- GIVEN `locale` is provided
- WHEN `list_sections` runs
- THEN only that locale's sections are returned

#### Scenario: Enumerates all locales when omitted

- GIVEN `locale` is omitted
- WHEN `list_sections` runs
- THEN sections from every indexed locale are returned

### Requirement: get_section Tool Returns Full, Untruncated Content

The system MUST expose a `get_section` tool accepting a required `id` and a required `locale`,
and MUST return that section's entire body untruncated, preserving code-block line breaks and
link destinations exactly as extracted by the index.

#### Scenario: Full body returned intact

- GIVEN a valid section id and locale pair
- WHEN `get_section` is called
- THEN the response contains the section's entire body text with no truncation, and its code
  blocks and links remain intact

### Requirement: Locale Is Required Wherever A Section ID Is Used

Because a section id repeats across locales, `get_section` MUST require an explicit `locale`
argument and MUST NOT resolve a section id without one.

#### Scenario: Same id resolves differently per locale

- GIVEN a section id exists in both `en` and `es`
- WHEN `get_section` is called once with `locale: en` and once with `locale: es`
- THEN each call returns that locale's own section content

### Requirement: Explicit Errors For Invalid Input

The system MUST return an explicit, typed error — distinct from a normal successful response —
for: an empty or whitespace-only `query`; a `get_section` id with no match in the given locale;
and a `locale` outside the supported set. The system MUST NOT return an empty success response
in place of an error.

#### Scenario: Empty query is an error, not empty results

- GIVEN `query` is empty or whitespace-only
- WHEN `search_docs` is called
- THEN the tool returns an explicit error, not a success response with zero results

#### Scenario: Unknown section id is an error

- GIVEN an `id` with no matching section in the given `locale`
- WHEN `get_section` is called
- THEN the tool returns an explicit error naming the id and locale

#### Scenario: Unsupported locale is an error

- GIVEN a `locale` outside `en`/`es`
- WHEN any tool receiving `locale` is called
- THEN the tool returns an explicit error naming the unsupported value

### Requirement: A Valid Query Matching Nothing Is A Legitimate Empty Result

When `search_docs` receives a well-formed, non-empty query and a supported (or omitted) locale
but no section satisfies the score threshold, the system MUST return a successful response with
zero results — this is not an error condition.

#### Scenario: No matches for a valid query

- GIVEN a well-formed query and a supported locale
- WHEN no section matches
- THEN the response is a successful result with an empty result list, distinguishable from the
  error responses above

### Requirement: Tool Responses Carry Index Build Identity

Every response from `search_docs`, `list_sections`, and `get_section` MUST include the index
build identity recorded at index generation time, so a caller can detect a stale build.

#### Scenario: Build identity present in every response

- GIVEN any of the three tools is called
- WHEN it returns
- THEN the response includes the index build identity

### Requirement: Automated Coverage Across Schemas, Retrieval, Parity, And Client Consumption

The automated test suite MUST cover: (1) each tool's advertised input/output schema; (2)
retrieval behavior for search, listing, and section fetch, including the error and empty-result
paths above; (3) EN/ES locale parity of served content; and (4) representative client
consumption — an automated test connecting an `@modelcontextprotocol/sdk` `Client` over
Streamable HTTP through `initialize`, `tools/list`, and `tools/call`, asserting the negotiated
protocol version, the advertised tool schemas, and the exact content returned for a known
section. This client-consumption test MUST run in CI without external credentials or an
installed third-party agent. Manual verification with the four named agents is separate and is
evidenced by the server request log.

#### Scenario: Client-consumption test passes in CI

- GIVEN the MCP server is running in the test environment
- WHEN the automated SDK client completes `initialize`, `tools/list`, and one `tools/call`
- THEN the test asserts the negotiated protocol version, the returned tool schemas, and the
  exact expected section content
