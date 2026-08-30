# Docs MCP Retrieval Specification

## Purpose

Define the deterministic, read-only schemas and behavior for listing, searching, and exactly retrieving bilingual documentation sections.

## Canonical operation and response contract

The MCP interface MUST expose exactly these stable operation names for the first-slice capabilities:

- `list_documentation_sections`
- `search_documentation`
- `get_documentation_section`

The operation request and success payloads MUST use these field names and shapes, whether they are carried directly or inside the MCP protocol result wrapper:

- List request: `{ "locale": "en" | "es" }`; success: `{ "operation": "list_documentation_sections", "locale": "en" | "es", "service_identity": string, "schema_identity": string, "source_identity": string, "source_version": string, "index_identity": string, "index_version": string, "bounds_config_version": string, "bounds": BoundsMetadata, "index_identity_status": "loaded", "sections": SectionSummary[] }`.
- Search request: `{ "locale": "en" | "es", "query": string, "limit"?: positive integer }`; success: `{ "operation": "search_documentation", "locale": "en" | "es", "service_identity": string, "schema_identity": string, "source_identity": string, "source_version": string, "index_identity": string, "index_version": string, "bounds_config_version": string, "bounds": BoundsMetadata, "index_identity_status": "loaded", "results": SearchResult[] }`.
- Exact request: `{ "locale": "en" | "es", "section_id": string, "format"?: "markdown" | "html", "include_descendants"?: boolean }`; success: `{ "operation": "get_documentation_section", "locale": "en" | "es", "service_identity": string, "schema_identity": string, "source_identity": string, "source_version": string, "index_identity": string, "index_version": string, "bounds_config_version": string, "bounds": BoundsMetadata, "index_identity_status": "loaded", "section": SectionContent, "descendants"?: SectionContent[] }`.
- Failure: `{ "operation": OperationName | null, "requested_operation": string | null, "service_identity": string, "schema_identity": string, "source_identity": string | null, "source_version": string | null, "index_identity": string | null, "index_version": string | null, "bounds_config_version": string | null, "bounds": BoundsMetadata | null, "index_identity_status": "loaded" | "unavailable", "error": { "code": ErrorCode, "message": string } }`.

`OperationName` MUST be exactly one of the three operation names above. In a failure envelope for a recognized operation that fails validation or execution, `operation` MUST contain that validated `OperationName` and `requested_operation` MUST be `null`. For a bounded but unknown operation name, `operation` MUST be `null` and `requested_operation` MUST echo the submitted bounded string. For a transport or request failure where no bounded requested operation can be safely identified, both `operation` and `requested_operation` MUST be `null`. `ErrorCode` MUST be exactly one of: `invalid_request`, `unsupported_locale`, `invalid_query`, `invalid_limit`, `invalid_format`, `invalid_section_id`, `section_not_found`, `bounded_input`, `bounded_response`, `origin_not_allowed`, `method_not_allowed`, `rate_limited`, `index_unavailable`, `index_malformed`, or `service_unavailable`.

`BoundsMetadata` MUST enumerate the validated positive finite values for query characters, identifier characters, option bytes, request bytes, response bytes, result count, snippet characters, section-body bytes, serialized-evidence bytes, error-message characters, index record count, serialized-index bytes, rate-limit requests, and rate-limit window. Count and character or byte values MUST use the required integral form. It MUST also expose `search_default_results: 8` and `search_max_results: 20`.

Every response MUST contain exactly one success payload or one `error` object and MUST NOT contain both. A success response MUST contain non-empty service, schema, source, index, and bounds configuration identities, the applicable `BoundsMetadata`, and `index_identity_status: "loaded"`. An error produced while a valid index is loaded, including invalid-input, not-found, and bounded-response errors, MUST contain the loaded source, index, schema, service, and bounds configuration identities and applicable `BoundsMetadata`. An `index_unavailable` or `index_malformed` error MUST contain non-empty service and schema identities, set source and index identities and versions to `null`, set `index_identity_status` to `"unavailable"`, and MUST NOT fabricate an index identity. Error messages MUST be bounded by the applicable configured response/error bound.

A `SectionSummary` MUST contain `id`, `title`, `level`, `parent_id`, `hierarchy`, `canonical_url`, `source_identity`, `source_version`, `index_identity`, and `index_version`. A `SearchResult` MUST contain those identity fields plus `snippet`. A `SectionContent` MUST contain those identity fields plus `format` and `body`. The schemas MUST remain JSON-serializable, and identity/version fields in successful evidence records MUST be non-empty strings bound to the same generated index for one response.

## Requirements

### Requirement: Stable named operation contract

The MCP interface MUST publish the three first-slice capabilities under the exact operation names `list_documentation_sections`, `search_documentation`, and `get_documentation_section`. Each operation MUST accept only its specified request fields and MUST return the corresponding deterministic success or failure envelope; no alias or undocumented fourth capability is required by this change.

#### Scenario: Capability names are stable

- GIVEN a client discovers the first-slice MCP capabilities
- WHEN it invokes section listing, documentation search, or exact section retrieval
- THEN the advertised operation names are `list_documentation_sections`, `search_documentation`, and `get_documentation_section` respectively
- AND each response echoes the invoked stable operation name

#### Scenario: Unknown operation names are rejected

- GIVEN a request submits a bounded operation name that is not one of the three stable operation names
- WHEN the request is validated
- THEN it returns `invalid_request`
- AND `operation` is `null`
- AND `requested_operation` echoes the submitted bounded string
- AND it does not dispatch another capability or infer a different operation

#### Scenario: Valid operation schemas reject undeclared fields

- GIVEN a request uses one of the three stable operation names with fields outside that operation's declared request schema
- WHEN the request is validated
- THEN it returns `invalid_request`
- AND `operation` echoes the validated operation name
- AND `requested_operation` is `null`
- AND it does not dispatch another capability or infer a different operation

### Requirement: Deterministic list schema

The `list_documentation_sections` operation MUST expose one supported locale at a time. A valid list request MUST identify `locale` as `en` or `es`. The response MUST contain the requested locale, the index/source identity metadata, and an ordered `sections` array in document order. Each section entry MUST include its shared `id`, localized `title`, `level` (`2` or `3`), `parent_id`, hierarchy, and canonical URL.

#### Scenario: List returns one locale in document order

- GIVEN a valid request for `locale: en` or `locale: es`
- WHEN `list_documentation_sections` is called
- THEN it returns only that locale's sections in document order
- AND each entry includes the required identifier, hierarchy, URL, and identity fields

#### Scenario: Shared IDs address both locales

- GIVEN an H2 or H3 identifier present in both locale indexes
- WHEN the corresponding list requests are compared
- THEN the identifier and hierarchy position are shared
- AND the titles and canonical URLs are localized to the requested locale

### Requirement: Bounded accent-insensitive search schema and behavior

The `search_documentation` operation MUST expose a search capability with required `locale` and `query` fields and an optional positive integer `limit`. The query MUST be trimmed and MUST contain at least one non-whitespace character. Matching MUST be accent-insensitive and MUST search only the requested locale's indexed evidence. The default limit MUST be 8, the maximum MUST be 20, and a request above the maximum MUST be rejected rather than producing an unbounded response. Results MUST be deterministically ranked, with title-prefix matches before title-substring matches before body-only matches, and ties MUST use stable document order. Each result MUST include its section identity, localized title, locale, canonical URL, bounded matching `snippet`, and source/index identity metadata.

#### Scenario: Search returns the default bounded result set

- GIVEN a valid non-empty query and no `limit`
- WHEN `search_documentation` runs
- THEN it returns at most 8 deterministically ranked results
- AND every result contains a bounded snippet and the required section and identity metadata

#### Scenario: Search honors the maximum

- GIVEN a valid non-empty query with `limit: 20`
- WHEN `search_documentation` runs
- THEN it returns no more than 20 results
- AND it does not expose records outside the requested locale

#### Scenario: Excessive result limit is rejected

- GIVEN a search request with a limit greater than 20
- WHEN the request is validated
- THEN it returns the `invalid_limit` error
- AND it does not run an unbounded search

#### Scenario: Accents do not change matching

- GIVEN indexed content contains an accented term such as `Instalación`
- WHEN the caller searches for its unaccented form such as `instalacion`
- THEN the corresponding section can match
- AND the returned snippet identifies evidence from the requested locale

#### Scenario: Search ranking and snippets are stable

- GIVEN the same index and valid search request are evaluated repeatedly
- WHEN matching results are produced
- THEN ranking, tie ordering, and snippet boundaries are equivalent across evaluations

### Requirement: Exact section retrieval schema and representation

The `get_documentation_section` operation MUST expose an exact retrieval capability with required `locale` and `section_id` fields, an optional `format`, and an optional `include_descendants` flag. The default format MUST be `markdown`; `html` MUST be available only when explicitly requested. Retrieval MUST address H2 and H3 records independently by exact shared ID and MUST NOT use fuzzy fallback. The response MUST include the selected section's ID, localized title, locale, level, parent and hierarchy data, canonical URL, requested representation, source/index identity metadata, and exact rich evidence. When `include_descendants` is false or omitted, the response MUST contain only the selected section; when true, it MUST include its descendants in document order.

#### Scenario: Default retrieval returns one Markdown section

- GIVEN a valid locale and exact H2 or H3 ID
- WHEN `get_documentation_section` is called without `format` or descendant expansion
- THEN it returns that section in Markdown
- AND H3 retrieval does not silently return its parent H2 or sibling sections

#### Scenario: HTML requires explicit opt-in and is sanitized

- GIVEN a valid exact section request with `format: html`
- WHEN retrieval runs
- THEN it returns sanitized HTML preserving the section's headings, links, code blocks, lists, and tables
- AND active scripts, event-handler attributes, unsafe URLs, and equivalent executable content are absent

#### Scenario: Descendants are opt-in

- GIVEN an H2 with one or more H3 descendants
- WHEN retrieval is called with `include_descendants: false` or omitted
- THEN only the H2 evidence is returned
- WHEN retrieval is called with `include_descendants: true`
- THEN the H2 and its ordered descendant H3 evidence are returned

#### Scenario: Markdown preserves rich evidence

- GIVEN a section containing links, fenced code, lists, or tables
- WHEN it is retrieved as Markdown
- THEN link destinations, code text, list order, and table values remain represented without an AI-generated rewrite

### Requirement: Deterministic validation and failure schema

All three capabilities MUST return a deterministic structured error with one of the closed `ErrorCode` values and a bounded human-readable `message` when a request is invalid or evidence cannot be served. Unsupported locales MUST identify that only `en` and `es` are supported. Empty or whitespace-only search queries, unknown formats, invalid limits, oversized fields, and unknown section IDs MUST fail without fuzzy substitution or fabricated evidence. An unavailable or malformed index MUST produce its corresponding `index_unavailable` or `index_malformed` error rather than a partial success. Successful responses MUST NOT contain an error object, and failed responses MUST NOT contain evidence results.

#### Scenario: Unsupported locale is rejected

- GIVEN a request with a locale other than `en` or `es`
- WHEN it is validated
- THEN it returns the `unsupported_locale` error naming the supported locales
- AND no locale is inferred

#### Scenario: Empty search is rejected

- GIVEN a search query that is empty or whitespace-only
- WHEN it is validated
- THEN it returns the `invalid_query` error
- AND it does not substitute a default section listing or default search results

#### Scenario: Unknown ID has no fuzzy fallback

- GIVEN a valid locale and a section ID absent from that locale's index
- WHEN exact retrieval is called
- THEN it returns the `section_not_found` error
- AND it does not return a similarly named section

#### Scenario: Missing or malformed index is unavailable

- GIVEN the required index is missing, malformed, or fails integrity validation
- WHEN any documentation capability is called
- THEN it returns `index_unavailable` for an unavailable index or `index_malformed` for a malformed or integrity-invalid index
- AND it returns no partial or fabricated evidence

#### Scenario: Loaded-index error retains evidence identity

- GIVEN a valid index is loaded and a request fails validation or cannot find requested evidence
- WHEN the capability returns an error
- THEN the error includes the loaded source, index, schema, service, and bounds configuration identities
- AND it does not include a success collection or section

#### Scenario: Unavailable-index error declares missing identity

- GIVEN the index is unavailable or malformed before a capability can load it
- WHEN the capability returns its error
- THEN the error includes non-empty service and schema identities
- AND it sets index identity and version to `null` with `index_identity_status: "unavailable"`
- AND it does not fabricate source or index metadata

#### Scenario: Bounded invalid input fails before work expands

- GIVEN a query, identifier, options object, request, or requested result set exceeds its declared bound
- WHEN the request is validated
- THEN it returns the applicable `bounded_input` or `bounded_response` error
- AND it does not produce an oversized response or perform unbounded processing

### Requirement: Read-only evidence boundary

The capabilities MUST read only generated documentation evidence. They MUST NOT mutate documentation or service state, execute repository or Gentle AI commands, access private content, or invoke a server-side LLM. Returned snippets, Markdown, and HTML MUST be evidence from the selected index rather than generated answers or summaries.

#### Scenario: Retrieval is evidence-only

- GIVEN a caller requests documentation through any capability
- WHEN the request completes
- THEN the response contains indexed evidence and metadata only
- AND no answer, summary, command result, mutation, or private record is produced

## Non-Goals

- Replacing or sharing the browser search contract without separately specified regression protection.
- OAuth, API keys, authenticated documentation, repository access, or content mutation.
