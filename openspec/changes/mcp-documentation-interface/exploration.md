# Exploration: Public MCP documentation interface

## Executive summary

Issue #34 is feasible without turning the documentation server into an answer-generating system. The strongest boundary is a public, read-only MCP service backed by a build-generated section index derived from the same Astro documentation that publishes the website. The service should expose deterministic listing, exact retrieval, and bounded search; it should return source evidence, stable shared section IDs, locale metadata, and canonical URLs without an LLM.

The repository is currently a static Astro site, not a server application. Its English and Spanish prose live in separate large Astro components, while stable H2/H3 IDs are manually aligned. Browser search builds a private in-memory text index from the rendered DOM. There is no reusable server-side documentation model or committed/generated search index today. A design must therefore choose both an extraction boundary and a hosting boundary.

A narrow generated-index approach can preserve the current website and provide a clean rollback boundary. A full migration to structured content would improve long-term authoring integrity but is substantially larger and riskier than the issue requires. Standard MCP remains necessary for terminal clients unless client-specific research proves otherwise; WebMCP should be treated as a complementary browser-agent surface, not the only transport.

## Scope understood from issue #34

### Required product boundary

- Public and read-only.
- Evidence retrieval, not AI-authored answers.
- No repository commands, mutation, private data, or server-side LLM dependency.
- Search by query and locale with bounded results.
- List sections and retrieve one exact section by stable identifier.
- Return canonical URLs and source metadata.
- Preserve code examples, links, and relevant document structure.
- Maintain English/Spanish parity through shared canonical section IDs.
- Define deterministic errors for unsupported locale, unknown section, empty query, and unavailable content.
- Test schemas, retrieval, locale parity, and representative client consumption.
- Document setup for Claude Code, OpenCode, Pi, and Codex.
- Address transport, hosting, versioning, rate limiting, and compatibility.
- Evaluate WebMCP as a complementary surface.

### Explicit non-goals

- Conversational answer synthesis.
- Ranking or summarization through an LLM.
- Authenticated/private documentation.
- Repository or Gentle AI CLI execution.
- Documentation mutation through MCP.
- Replacing the existing website search unless separately justified.

## Current system map

### Verified facts

| Area | Current state | Evidence |
| --- | --- | --- |
| Site runtime | Astro 7.2.4 produces plain static output in `dist/`; there is no Astro server adapter. | `package.json`, `README.md` |
| Public routes | English is `/`; Spanish is `/es/`. Canonical and alternate locale URLs are already tested. | `src/pages/index.astro`, `src/pages/es/index.astro`, `tests/docs.spec.ts` |
| Content source | English and Spanish prose are authored separately in `DocumentationContentEn.astro` and `DocumentationContentEs.astro`. | `src/components/DocumentationPage.astro` |
| Stable identifiers | H2/H3 elements carry explicit IDs, and tests assert a representative shared-ID set across locales. | content components, `tests/docs.spec.ts` |
| Navigation metadata | Top-level navigation IDs and localized labels are duplicated in `src/i18n/site.ts`; H3 subnavigation is derived in the browser from rendered headings. | `src/i18n/site.ts`, `src/scripts/site.js` |
| Search index | Browser search traverses rendered H2/H3 sections, strips Mermaid/controls, flattens text, normalizes accents, and stores the result only in page memory. | `src/scripts/site.js` |
| Search behavior | Empty browser queries return the first 8 sections; non-empty results are capped at 24 and ranked only by title position before body matches. | `src/scripts/site.js` |
| Rich structure | Content contains tables, lists, links, code blocks, notices, and Mermaid source; the browser index intentionally discards much of that structure. | content components, `src/scripts/site.js` |
| Deployment | Netlify runs `npm run build` and publishes `dist/`; no functions, redirects, or server runtime are configured. | `netlify.toml`, `README.md` |
| CI | Node 22 runs Astro check, build, and Playwright. Current tests serve `dist/` with Python's static HTTP server. | `.github/workflows/docs-browser.yml`, `playwright.config.ts` |
| Test layers | The project currently has E2E coverage only; no unit or integration runner is configured. Strict TDD uses `npx playwright test`, with check/build as additional gates. | `openspec/config.yaml`, `package.json` |
| Baseline | Provided orchestration evidence reports Astro check clean, build successful, and Playwright 28/28 at the baseline commit. | Delegated context |

### Consequences of the current shape

1. The browser index cannot be imported by an MCP server because it is assembled from a live DOM inside `site.js`.
2. The localized Astro components are currently the authoritative prose, but their parity is enforced only partially through selected Playwright assertions.
3. A plain-text-only extraction would fail the requirement to preserve code, links, and relevant structure.
4. Adding an MCP endpoint changes the deployment model unless the endpoint is hosted separately or implemented as a Netlify function/edge surface.
5. A generated artifact can be authoritative as an index only if it is reproducibly derived during build and drift-tested; it must not become a separately edited documentation copy.

## Capability boundaries

### Likely MCP tool surface

The minimum coherent capability surface is three deterministic operations:

- `search_documentation(query, locale, limit?)`: bounded matches containing section ID, title, locale, snippet, canonical URL, and source/index metadata.
- `list_documentation_sections(locale)`: ordered available sections with shared IDs, localized titles, hierarchy, and canonical URLs.
- `get_documentation_section(section_id, locale)`: one exact section with structured/rich evidence and source metadata.

Tool names and exact schemas remain design decisions. The important boundary is that responses are retrieval records, not prose answers. A resource surface may complement tools for exact section URIs, but it should not replace the discoverable operations required by the issue.

### Evidence representation

Exact retrieval needs more than the browser search text. A practical record would preserve:

- stable section ID and parent ID;
- locale and localized title;
- canonical URL with fragment;
- normalized plain text for search/snippets;
- a rich representation such as sanitized HTML or Markdown-compatible content;
- outbound links with resolved URLs;
- code blocks with language hints when available;
- source revision/index version and generation timestamp or content hash.

The exact rich format needs a compatibility decision. Sanitized HTML best matches the rendered Astro source; Markdown is easier for terminal agents but requires a reliable HTML-to-Markdown conversion and fidelity tests.

### Error boundary

The contract should distinguish invalid input from unavailable evidence:

| Condition | Expected semantic outcome |
| --- | --- |
| Empty or whitespace query | Deterministic invalid-query response; do not silently list sections through search. |
| Unsupported locale | Invalid locale with supported locales (`en`, `es`). |
| Unknown section ID | Not-found response that does not fall back to fuzzy search. |
| Known section missing in one locale | Locale-parity/build failure before publication; if observed at runtime, unavailable-content response. |
| Index/source unavailable | Service-unavailable or content-unavailable response with no fabricated result. |
| Requested limit too large | Clamp to a documented server maximum or reject consistently; choose one behavior in the spec. |

This intentionally differs from the current browser search's empty-query behavior because machine clients need an unambiguous contract.

## Candidate approaches

### A. Build-generated section index from rendered Astro output — preferred exploration direction

After Astro builds both routes, a deterministic generator parses the rendered pages into locale-aware section records. The website remains authored exactly as it is. The generated index is consumed by the MCP service and can also be published as static evidence.

**Advantages**

- One authoritative prose source: the existing Astro content.
- Captures the exact published structure, code, links, and canonical fragments.
- Minimal disruption to routes and browser behavior.
- Generation can fail on duplicate IDs, locale parity drift, malformed links, or missing sections.
- Clear rollback: remove the generator/service while leaving the website unchanged.

**Costs and risks**

- HTML section-boundary parsing must be explicit and tested.
- Post-build extraction ties index production to successful site rendering.
- Sanitization and URL resolution need careful contracts.
- Hosting a standard MCP endpoint still requires a runtime separate from the static pages.

### B. Shared structured content model that generates both Astro pages and MCP records

Move localized sections into a canonical content schema or Astro content collections, then render the website and MCP index from that model.

**Advantages**

- Strongest structural locale parity and schema validation.
- Clean reuse by web, search, and MCP consumers.
- Easier future section-level metadata and versioning.

**Costs and risks**

- Requires migrating roughly 1,400 lines per locale of rich, hand-authored Astro content.
- High regression risk for tables, code, Mermaid, notices, styling hooks, and snapshots.
- Entangles the MCP feature with a documentation architecture rewrite.
- Very likely to exceed the 400 authored-line review budget by a wide margin.

This is a long-term architecture option, not the smallest path for issue #34.

### C. MCP server scrapes the live published website at request time

The server fetches `/` or `/es/` and extracts sections on demand.

**Advantages**

- No generated index to publish.
- Reads the currently deployed website.

**Costs and risks**

- Couples MCP availability and latency to the website and network on every cache miss.
- Makes deterministic version metadata, rate limits, and failure behavior harder.
- Repeats parsing at runtime and increases operational complexity.
- A partially deployed or changed page can create inconsistent locale results.

This may be useful only as a fallback source strategy, not the preferred authority model.

### D. Independently maintained MCP documentation copy — reject

A manually authored JSON/Markdown corpus would simplify the server but violates the issue's single-authority requirement and creates guaranteed drift between website and agent evidence.

## Transport and hosting assessment

### Facts

- The current Netlify deployment is static-only.
- Static files can publish an index, but static hosting alone cannot implement the MCP request/response protocol.
- CI and local development standardize on Node 22, while Astro dependencies require a modern Node runtime.

### Working hypotheses requiring validation

- Standard MCP over Streamable HTTP is the best public remote transport for terminal-capable clients.
- A stdio launcher or thin proxy may still be needed for clients whose remote HTTP configuration is absent or immature.
- WebMCP can expose the same read-only capabilities to browser agents but cannot be assumed to satisfy terminal clients.
- A Netlify function could colocate the endpoint with the site, while a separately deployed Node service would create a cleaner operational and rollback boundary.

### Hosting choices to compare during design

| Choice | Benefit | Tradeoff |
| --- | --- | --- |
| Netlify function/edge endpoint | Same domain and deployment pipeline; canonical index is nearby. | Introduces runtime/function configuration into a static project; platform limits and MCP streaming support require proof. |
| Separate Node MCP service | Independent scaling, rollback, observability, and protocol lifecycle. | Additional host, deployment ownership, CORS/domain documentation, and release coordination. |
| Static index plus stdio-only package | Simple server semantics and local execution. | Does not satisfy the requested public remote interface by itself and makes clients install a package. |

Rate limiting belongs at the HTTP edge/service boundary, not in the generated content index. The service should remain cacheable and stateless where possible, with explicit request-size, query-length, result-count, and response-size bounds.

## Testing seams

### Existing seams that can be extended

- Playwright already verifies both published routes, shared representative IDs, links, code-related rendering, locale isolation, and browser search.
- Astro build output gives a deterministic extraction fixture.
- CI already runs on Node 22 and triggers for JavaScript/TypeScript/package changes.

### Missing seams

- Schema validation for tool inputs and outputs.
- Unit coverage for section extraction, snippets, limits, locale validation, and exact lookup.
- Full parity validation for every H2/H3 ID, not only representative sets.
- Protocol-level MCP tests over the chosen transport.
- Representative consumption tests for configured Claude Code, OpenCode, Pi, and Codex clients or protocol-equivalent fixtures.
- Operational tests for unavailable index/source, oversized input, rate limiting, and compatibility/version headers.

Strict TDD is active. The eventual design must decide whether to add a focused Node test layer or drive protocol tests through Playwright's request facilities; using browser E2E alone for parser and schema logic would be slow and imprecise.

## Decision gaps

1. **Rich content format:** sanitized HTML, Markdown, or both for exact retrieval.
2. **Section granularity:** whether H2 and H3 are both independently retrievable, and whether H2 retrieval includes descendant H3 content.
3. **Search semantics:** ranking, accent handling, tokenization, snippet construction, default and maximum limits, and empty-query behavior.
4. **Protocol exposure:** tools only versus tools plus MCP resources.
5. **Remote transport:** Streamable HTTP implementation and whether an optional stdio adapter is required for compatibility.
6. **Hosting ownership:** Netlify function/edge versus a separately deployed service.
7. **Index publication:** bundled into the service, published under the documentation origin, or both.
8. **Version identity:** schema version, documentation revision, cache validators, and compatibility policy.
9. **WebMCP role:** browser-only complement, shared adapter over the same core, or deferred after standard MCP.
10. **Client proof level:** real runtime smoke tests versus validated configuration plus protocol client fixtures for each named agent.

## External research questions

These cannot be settled from repository evidence and should be researched before design approval:

- What MCP remote transports and configuration formats are currently supported by Claude Code, OpenCode, Pi, and Codex?
- Which clients require stdio, support Streamable HTTP directly, or impose authentication/TLS constraints?
- What is the current stable WebMCP API, browser availability, security model, and relationship to standard MCP?
- Does Netlify's chosen function or edge runtime support the required Streamable HTTP behavior, connection lifetime, body streaming, and response limits?
- Which MCP SDK/runtime version should define schema and compatibility behavior, and what Node versions does it require?
- What public abuse controls are available at the selected host, and what rate-limit headers/semantics should clients expect?

## Risks

| Risk | Severity | Mitigation direction |
| --- | --- | --- |
| Generated index loses code, links, tables, or section hierarchy | High | Extract from built HTML and fidelity-test representative rich sections. |
| Locale IDs drift silently | High | Build-time full-set parity validation across `en` and `es`. |
| Static deployment cannot support selected transport | High | Prove hosting/streaming behavior before committing to platform integration. |
| Client support differs from assumptions | High | Research and smoke-test each named client before final transport choice. |
| MCP corpus becomes a second maintained copy | High | Generate only from authoritative site content and prohibit manual index edits. |
| Public endpoint abuse or unexpectedly large responses | Medium | Stateless service, hard input/result/response bounds, caching, and edge rate limits. |
| Content refactor causes broad website regressions | High | Prefer additive generated-index boundary; defer structured-content migration. |
| Search semantics diverge from browser search | Medium | Share generated normalized records or explicitly document distinct machine semantics. |
| Authored change exceeds the 400-line review budget | High | Expect a chained delivery across independent rollback boundaries; do not combine content migration with the first MCP slice. |

## Likely rollback and delivery boundaries

The safest rollback boundary is additive: generated index and validation first, MCP runtime/transport second, client setup and complementary WebMCP exposure separately. Each boundary should leave the current bilingual routes and browser search operational. A service deployment must be independently disableable without removing published documentation.

The overall feature is qualitatively high risk for the 400 authored-line budget. Even without migrating content, extraction, schemas, protocol service, operational controls, tests, and four client guides are unlikely to fit comfortably in one review unit. The cached `auto-chain` strategy is therefore consistent with the likely size, but exact slices belong in later design/tasks phases.

## Exploration conclusion

Proceed to an interactive proposal only after the product owner can make or authorize the key decisions around exact-section representation, hosting ownership, and required client transport compatibility. The proposal should favor a generated index from rendered Astro output and a standard read-only MCP surface, keep WebMCP complementary, and explicitly exclude a broad content migration from the first delivery unless later evidence invalidates extraction fidelity.
