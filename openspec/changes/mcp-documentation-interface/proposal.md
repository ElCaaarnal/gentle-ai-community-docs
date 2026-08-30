# Proposal: Public MCP documentation interface

## Intent

Provide coding agents with a public, deterministic, read-only MCP interface for retrieving evidence from the existing English and Spanish Gentle AI documentation. The interface will expose bounded section discovery, search, and exact retrieval without generating answers, executing repository commands, or creating a second documentation authority.

The existing Astro content remains authoritative. A reproducible build step will derive a bilingual section index from the published site output so the MCP service and future adapters can consume the same evidence records without requiring a broad content migration.

## Problem and user value

The documentation is currently optimized for people browsing the static website. Agent clients cannot reliably discover or retrieve exact bilingual sections through a stable machine interface, and the browser-only search index cannot be reused by a server. Asking agents to scrape pages ad hoc loses structure, weakens locale parity, and makes source identity and failures inconsistent.

This change gives Claude Code, OpenCode, Pi users through a third-party adapter, and Codex a predictable way to:

- discover available documentation sections;
- search bounded English or Spanish evidence;
- retrieve an exact H2 or H3 section by shared stable identifier;
- preserve Markdown-oriented structure, code examples, links, canonical URLs, and source/index identity;
- distinguish invalid input, missing evidence, and service unavailability without fabricated results.

The service retrieves evidence only. Any interpretation or answer generation remains the client model's responsibility.

## First-slice scope

The first product slice includes:

1. A reproducible generated index derived from the built English and Spanish Astro pages, with no independently edited content copy.
2. Build-time validation of shared H2/H3 identifiers, hierarchy, and locale parity.
3. A public, read-only MCP service offering section listing, bounded search, and exact section retrieval.
4. Markdown as the default exact-retrieval representation and sanitized HTML only when explicitly requested.
5. Independent H2 and H3 addressing, with descendant inclusion available only through an explicit option.
6. Search that rejects empty or whitespace-only queries, is accent-insensitive, defaults to 8 results, and never returns more than 20.
7. Canonical URLs, locale, section hierarchy, and index/source version metadata in retrieval records.
8. A production deployment boundary on the confirmed HostGator VPS over public HTTPS.
9. Origin validation, bounded request and response behavior, and IP-based rate limiting without API keys or OAuth.
10. Setup and compatibility guidance backed by representative client smoke tests for Claude Code, OpenCode, Pi through a named third-party adapter, and Codex.

## Capabilities

The proposal establishes three deterministic user capabilities; later specifications will finalize names and schemas:

| Capability | Outcome |
| --- | --- |
| List documentation sections | Return ordered H2/H3 records for one supported locale, including shared IDs, localized titles, hierarchy, and canonical URLs. |
| Search documentation | Return ranked, bounded evidence matches for a non-empty locale-specific query, using accent-insensitive matching with a default of 8 and maximum of 20 results. |
| Retrieve an exact section | Return one exact H2 or H3 by stable ID and locale as Markdown by default or sanitized HTML on explicit request, with optional descendant expansion and no fuzzy fallback. |

All capabilities are read-only and return evidence records rather than AI-authored answers.

## Acceptance outcomes

The proposal is successful when the completed change demonstrates that:

- the same existing Astro content continues to publish the website and reproducibly generates the MCP index;
- every indexed English H2/H3 ID has its Spanish counterpart and parity failures stop publication;
- representative rich sections preserve headings, links, code blocks, lists, tables, and canonical fragments in the supported retrieval formats;
- exact retrieval distinguishes H2 and H3 records and includes descendants only when explicitly requested;
- search rejects empty or whitespace-only input, applies accent-insensitive matching, returns 8 results by default, and enforces a maximum of 20;
- unsupported locales, unknown section IDs, unavailable index data, oversized inputs, and bounded-response failures produce deterministic non-fabricated errors;
- the public HTTPS endpoint validates Origin, enforces request/response bounds, and applies IP-based rate limiting without requiring credentials;
- Claude Code, OpenCode, and Codex can consume the supported remote MCP surface in smoke tests;
- Pi documentation and testing truthfully use a third-party adapter and do not claim native MCP support;
- legacy MCP protocol compatibility remains enabled until client-by-client smoke tests prove that a narrower modern-only boundary is safe;
- current website routes and browser search behavior remain unchanged unless a later specification explicitly shares normalized records and proves no regression;
- disabling the MCP runtime does not remove or impair the static documentation site.

## Operational boundary

Production MCP runs as a host-agnostic Node service on the confirmed HostGator VPS. Netlify remains responsible for publishing the static website and generated index; any Netlify Functions MCP deployment is experimental and carries no production guarantee. Netlify Edge is not part of this proposal.

The production design must account for HTTPS termination, process supervision, index publication or synchronization, health and failure visibility, backups or reproducible recovery, and independent service rollback. It must not assume an undocumented HostGator plan, operating-system version, resource allocation, support tier, backup product, traffic capacity, managed reverse proxy, or managed HTTP rate limiter. The selected deployment topology must confirm reverse-proxy support with HostGator or use another supported HTTPS-termination approach.

## Security boundary

The endpoint is intentionally public and unauthenticated: no API key and no OAuth. That low-friction access is bounded by the following mandatory controls:

- HTTPS in production;
- validation of the HTTP `Origin` header according to the MCP transport contract;
- strict schema validation and bounded query, identifier, option, request-body, result-count, and response sizes;
- IP-based request rate limiting owned by the application or supported web-server layer;
- sanitized HTML only, and only when explicitly requested;
- read-only access to generated documentation evidence;
- no repository filesystem access, repository command execution, content mutation, private documentation, or server-side LLM calls;
- deterministic failure when the index or requested evidence is unavailable.

No undocumented `Retry-After`, `RateLimit-*`, or `X-RateLimit-*` headers are promised. Exact response semantics belong in the later specification and must be backed by the chosen production implementation.

## Preserved behavior

The current Astro pages, bilingual routes, canonical links, and browser search remain operational and authoritative. The machine search contract may differ from browser search where explicitly confirmed, including invalid empty queries and a maximum of 20 results. The implementation must not replace or silently alter browser search. A later specification may elect to share generated normalized records only if it also defines regression protection for existing browser behavior.

## Non-goals

This proposal does not include:

- LLM-generated answers, summaries, rankings, or conversational synthesis;
- repository or Gentle AI CLI command execution;
- documentation mutation or private/authenticated content;
- an independently maintained JSON or Markdown documentation copy;
- broad migration of the existing Astro content into a new structured-content system;
- replacement or behavioral redesign of current website/browser search;
- WebMCP implementation in the first slice;
- Netlify Edge Functions;
- production guarantees for the experimental Netlify Functions surface;
- undocumented rate-limit response headers;
- plan-specific HostGator assumptions;
- claims that Pi supports MCP natively;
- claims that every named client already supports only the modern MCP protocol era.

The generated index should remain reusable by a future experimental WebMCP adapter, but no browser-agent API is delivered here.

## Testing and TDD intent

Strict TDD is active. Implementation must begin with behavior-first failing tests at the narrowest practical seam and retain `npx playwright test` as the established project test runner, with Astro check and build as additional gates. Later design may introduce a focused Node test layer if needed for precise extractor, schema, and protocol feedback; this proposal does not choose that mechanism.

Verification must cover at least:

- deterministic index generation and full bilingual H2/H3 parity;
- representative rich-content fidelity in Markdown and sanitized HTML;
- independent H2/H3 retrieval and optional descendant expansion;
- search normalization, empty-query rejection, default and maximum limits;
- schemas, canonical URLs, source/index identity, and deterministic errors;
- unavailable or malformed index behavior and request/response bounds;
- Origin validation and IP-rate-limit behavior;
- protocol-level remote MCP behavior and legacy compatibility;
- real or representative smoke tests for Claude Code, OpenCode, Pi through a third-party adapter, and Codex;
- unchanged static routes and browser search behavior.

Protocol fixtures are not sufficient to claim a named client works when an actual runtime smoke test is required and feasible. Any untested compatibility claim must remain explicitly qualified.

## Dependencies and prerequisites

- Successful Astro builds for both `/` and `/es/` as the extraction source.
- Stable shared H2/H3 identifiers and canonical fragment URLs.
- A deterministic HTML-to-record and HTML-to-Markdown/sanitized-HTML generation path.
- A supported Node runtime and compatible official MCP TypeScript SDK release.
- Legacy MCP serving support until named-client smoke evidence permits narrowing it.
- HostGator VPS details confirmed before deployment, including runtime availability, DNS, ports/firewall, HTTPS termination, process supervision, resource capacity, backups, and the rate-limiting layer.
- A reliable publication or synchronization path from the Netlify-generated index to the production service.
- Current first-party client configuration documentation rechecked before publishing setup instructions.

## Affected areas

| Area | Expected impact |
| --- | --- |
| Astro build pipeline | Adds reproducible bilingual index generation and parity/fidelity validation. |
| Generated artifacts | Adds a versioned machine-readable index derived only from built site output. |
| MCP runtime | Adds a separate public read-only Node service and bounded retrieval contract. |
| Netlify publication | Continues static site publication and publishes the reusable generated index; MCP hosting remains experimental only. |
| HostGator operations | Adds production deployment, HTTPS, process, synchronization, observability, rate-limit, and rollback responsibilities. |
| Browser experience | Must remain unchanged in the first slice. |
| Client documentation | Adds truthful configuration and compatibility guidance for four named client workflows. |
| Test suite and CI | Expands parity, extraction, protocol, security-boundary, client-consumption, and regression coverage. |

## Risks and mitigations

| Risk | Impact | Mitigation direction |
| --- | --- | --- |
| Generated content loses code, links, tables, or hierarchy | Agents receive incomplete or misleading evidence. | Extract from built output and require representative fidelity tests for both formats. |
| English and Spanish section IDs drift | Locale retrieval becomes inconsistent. | Validate the complete H2/H3 ID and hierarchy set at build time and fail publication. |
| Generated index becomes a second authority | Website and agent evidence diverge. | Prohibit manual index maintenance and make generation reproducible from Astro output. |
| Public endpoint is abused or produces oversized responses | Availability and VPS capacity degrade. | Enforce bounded inputs/results/responses, IP rate limiting, and operational visibility. |
| HostGator capabilities are assumed rather than verified | Production deployment or recovery fails. | Keep the service host-agnostic and confirm actual plan, TLS topology, resources, and backup responsibilities before deployment. |
| Client protocol support differs | Setup guides overpromise compatibility. | Retain legacy serving and require client-specific smoke evidence; describe Pi's adapter dependency explicitly. |
| Machine search changes website behavior | Existing users experience regressions. | Keep browser search untouched unless a later spec explicitly shares records with regression tests. |
| WebMCP instability expands scope | Delivery couples to an experimental browser API. | Defer implementation while keeping the generated index adapter-neutral. |
| MCP runtime failure affects documentation availability | A service outage blocks both humans and agents. | Keep static publication independent and make the MCP service separately disableable. |

## Rollback

Rollback is additive and independent of the static site:

1. Disable or remove the HostGator MCP service while leaving Netlify-hosted documentation available.
2. Stop publishing or synchronizing the generated index if generation or fidelity is defective.
3. Revert build-pipeline index generation and its validations without migrating or rewriting Astro content.
4. Preserve the current bilingual routes and browser search throughout rollback.

Delivery should preserve separate rollback boundaries for index generation, service runtime/transport, production operations, and client documentation.

## Delivery-size warning

**The complete change is expected to exceed the 400 authored-line review budget and must not be forced into one review unit.** Extraction, schemas, bilingual validation, protocol runtime, security controls, production operations, tests, and four client guides are distinct review concerns. With the confirmed `auto-chain` strategy, later design and task planning must define a sequence of independently reviewable and rollbackable slices, each staying within the 400-line budget. A broad structured-content migration must not be included as a shortcut or bundled follow-up.

## Success criteria

The change succeeds when coding agents can retrieve bounded, versioned, bilingual source evidence through a public HTTPS MCP endpoint; the evidence is reproducibly derived from the authoritative Astro site; exact and search semantics match the confirmed product rules; production security and operational boundaries are enforced; named-client compatibility claims are backed by truthful smoke evidence; and the existing website remains independently available and behaviorally unchanged.
