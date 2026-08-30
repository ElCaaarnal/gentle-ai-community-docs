# Docs MCP Service Specification

## Purpose

Define the public production transport and operational boundary for the read-only documentation MCP service.

## Requirements

### Requirement: Public Streamable HTTP MCP transport

The production service MUST expose the documentation capabilities through one public Streamable HTTP MCP endpoint that supports both HTTP POST and HTTP GET according to the MCP transport contract. It MUST return protocol-valid JSON or Server-Sent Events content types as appropriate, and MUST remain read-only. The service MUST continue to support the established legacy MCP protocol compatibility path alongside the modern path until client-by-client smoke evidence and an approved change authorize narrowing that boundary.

#### Scenario: Remote client uses the MCP endpoint

- GIVEN a supported remote MCP client sends a valid protocol request to the public endpoint
- WHEN the service handles the request
- THEN it responds through the Streamable HTTP MCP contract
- AND the requested documentation capability remains read-only

#### Scenario: GET and POST are both supported

- GIVEN a client uses the endpoint's required GET or POST method
- WHEN the request is valid for that method
- THEN the endpoint handles it according to the Streamable HTTP contract
- AND an unsupported method does not become an undocumented alternate protocol

#### Scenario: Legacy compatibility remains available

- GIVEN a named client still negotiates the supported legacy MCP protocol era
- WHEN it connects to the production endpoint
- THEN the service continues to provide the compatible legacy behavior
- AND modern protocol availability alone does not remove that path

### Requirement: HostGator VPS production boundary

The official production MCP service MUST run as a host-agnostic Node service on the confirmed HostGator VPS. The production endpoint MUST be publicly reachable over HTTPS with a valid certificate and a supported HTTPS termination arrangement confirmed for the purchased environment. The specification MUST NOT depend on an undocumented HostGator plan, operating-system version, resource allocation, managed proxy, managed rate limiter, or backup product.

#### Scenario: Production endpoint is secure

- GIVEN a caller uses the official production service
- WHEN it connects to the documented endpoint
- THEN the connection uses HTTPS and certificate validation succeeds
- AND the service does not require cleartext HTTP as a supported production route

#### Scenario: Unconfirmed host capability is not assumed

- GIVEN a deployment prerequisite such as DNS, ports, HTTPS termination, process supervision, resources, or backups has not been confirmed for the purchased VPS
- WHEN production readiness is evaluated
- THEN readiness remains blocked or qualified
- AND no plan-specific capability is represented as guaranteed

### Requirement: Confirmed process supervision

The production deployment MUST use a process-supervision capability confirmed for the purchased VPS. The selected supervision arrangement MUST provide documented start, stop, restart, and status controls and MUST make startup failures and unexpected process exits observable to operators. The service MUST become ready only after its validated configuration and compatible index are loaded, and process rollback or disablement MUST remain independent of the static site.

#### Scenario: Supervised service exposes lifecycle state

- GIVEN the confirmed production service has valid configuration and a compatible index
- WHEN an operator starts, restarts, or inspects the service through the documented supervision arrangement
- THEN the service reaches ready state only after successful loading
- AND the operator can distinguish running, ready, stopped, and failed states

#### Scenario: Startup failure is visible and contained

- GIVEN the service cannot load its configuration or compatible index, or the process exits unexpectedly
- WHEN the supervisor handles that failure
- THEN the service remains not ready and the failure is visible through the documented status or logs
- AND the static documentation site remains available

### Requirement: Atomic versioned index publication or synchronization

The index publication or synchronization path MUST make only a complete, validated, versioned index available to the service. A service update MUST switch between identifiable index versions as one publication outcome, retain the last known valid version until the replacement is validated and accepted, and reject incomplete, stale, or integrity-invalid replacements. The path MUST expose source, index, and bounds-configuration identities needed to verify what is being served without assuming a HostGator-specific transfer mechanism.

#### Scenario: Valid index version becomes the served version

- GIVEN a complete generated index passes extraction, parity, integrity, and configured-bound validation
- WHEN the publication or synchronization path accepts it
- THEN the service serves that identifiable index version as one complete unit
- AND responses expose the corresponding source, index, and bounds configuration identities

#### Scenario: Interrupted replacement preserves the prior version

- GIVEN a replacement index is incomplete, interrupted, stale, or fails integrity validation
- WHEN publication or synchronization evaluates the replacement
- THEN it is not made available as the active index
- AND the last known valid index remains served or the service reports unavailable without partial evidence

### Requirement: Operational failure visibility beyond liveness

Production operations MUST expose both liveness and readiness signals plus bounded, operator-accessible failure information that distinguishes at least process failure, configuration/readiness failure, index load or publication failure, and request rejection or service failure. These signals MAY use the confirmed application, web-server, host, or deployment tooling, but MUST NOT depend on an undocumented provider feature, expose private documentation, or expose secrets. A live process MUST NOT be treated as healthy when it cannot serve a valid index.

#### Scenario: Live process with bad index is visibly unready

- GIVEN the Node process is running but its index is missing, malformed, stale under the declared identity policy, or rejected during synchronization
- WHEN an operator checks production health and failure information
- THEN liveness can be distinguished from not-ready status
- AND the index failure category and serving consequence are observable without exposing content or secrets

#### Scenario: Request failures remain distinguishable

- GIVEN a request is rejected for origin, schema, bounds, rate, or service availability reasons
- WHEN the client and operator inspect the result
- THEN the client receives the corresponding closed error code and bounded message
- AND operational information distinguishes the failure category from process liveness

### Requirement: Backup or reproducible recovery is verified

Before production readiness, operations MUST verify either a backup-and-restore path or a reproducible recovery procedure for the service release, validated bounds and transport configuration, and a known compatible index version. A reproducible path MUST be able to regenerate the index from authoritative built site output and declared inputs, while a backup path MUST verify that a restored index and configuration retain their recorded identities and bounds compatibility. Recovery MUST preserve the independent static-site rollback boundary and MUST NOT require an undocumented HostGator backup product.

#### Scenario: Verified backup restores a compatible service state

- GIVEN the deployment has a documented backup containing the required service configuration and a known compatible index version
- WHEN the restore procedure is exercised
- THEN the service can load the restored configuration and index with their recorded identities
- AND readiness is restored without changing the static documentation publication

#### Scenario: Reproducible recovery rebuilds the index

- GIVEN no provider-specific backup product is available but the authoritative built site output and declared extraction inputs are retained
- WHEN the documented recovery procedure regenerates the service artifacts
- THEN it produces the same valid index records and identities for identical inputs
- AND the service can be restored without creating an independent documentation authority

### Requirement: Origin validation

The service MUST validate the HTTP `Origin` on every incoming connection as required by the MCP transport contract. A present Origin MUST be accepted only when it matches the configured allowed-origin policy; a disallowed Origin MUST be rejected before capability dispatch. Missing-Origin handling MUST be an explicit, deterministic policy for non-browser protocol clients and MUST NOT be treated as a wildcard allow.

#### Scenario: Allowed Origin proceeds

- GIVEN an incoming MCP request has an Origin in the configured allowed set
- WHEN Origin validation runs
- THEN the request may proceed to normal protocol and schema validation

#### Scenario: Disallowed Origin is rejected

- GIVEN an incoming MCP request has an Origin outside the configured allowed set
- WHEN Origin validation runs
- THEN the request is rejected deterministically before documentation retrieval
- AND no evidence is returned

#### Scenario: Missing Origin follows a declared policy

- GIVEN a non-browser MCP client omits the Origin header
- WHEN the connection is evaluated
- THEN the service applies its documented missing-Origin policy
- AND it never reflects or wildcard-allows an arbitrary origin

### Requirement: Bounded requests and responses

The service MUST enforce every applicable request-body, query, identifier, option, result-count, serialized-evidence, and complete-response bound from the validated versioned bounds configuration. It MUST reject over-bound requests deterministically before unbounded processing, and it MUST never truncate evidence into a misleading successful response. A response that cannot fit within the configured bound MUST fail with the structured `bounded_response` behavior rather than being partially returned.

#### Scenario: Oversized request is rejected

- GIVEN a request body or field exceeds its configured limit
- WHEN transport validation runs
- THEN the service returns the deterministic `bounded_input` failure
- AND it does not dispatch the capability or consume an unbounded body

#### Scenario: Oversized response fails closed

- GIVEN a valid request would produce evidence larger than the configured response bound
- WHEN the service evaluates the response
- THEN it returns the deterministic `bounded_response` failure
- AND it does not silently truncate or fabricate the evidence

### Requirement: IP-based rate limiting without credentials

The public service MUST be usable without API keys or OAuth and MUST apply IP-based request rate limiting at the application or a confirmed supported web-server layer. The effective policy MUST be finite and documented in the versioned service configuration, must use the verified client IP for the deployed HTTPS topology, and must return the deterministic `rate_limited` failure when the limit is exceeded. The service MUST NOT trust an arbitrary client-supplied forwarding header as the client IP.

#### Scenario: Requests within the limit proceed

- GIVEN a client IP has not exceeded the configured request window
- WHEN it sends a valid request
- THEN the request is eligible for normal handling without credentials

#### Scenario: Excess requests are bounded

- GIVEN a client IP exceeds the configured request window
- WHEN another request arrives
- THEN the service rejects it with the deterministic `rate_limited` failure
- AND it does not perform documentation retrieval for that request

### Requirement: Health and unavailability semantics

The deployment MUST expose distinct operational liveness and readiness signals. Readiness MUST report ready only when a valid compatible documentation index, the validated bounds configuration, and the transport are able to serve it. If the index is missing, malformed, stale beyond the declared identity policy, or otherwise unavailable, readiness MUST report unavailable and documentation capabilities MUST return the structured `index_unavailable` or `index_malformed` error without partial evidence. Health output MUST not expose private content or implementation secrets.

#### Scenario: Ready service reports healthy

- GIVEN the service is running with a valid compatible generated index and validated bounds configuration loaded
- WHEN its liveness and readiness signals are checked
- THEN liveness reports running and readiness reports ready according to the documented health schema

#### Scenario: Missing index reports unavailable

- GIVEN the service cannot load or validate its required index
- WHEN liveness, readiness, or a documentation capability is checked
- THEN liveness and readiness distinguish a running but unavailable service where applicable
- AND the capability returns the corresponding unavailable or malformed-index error
- AND no partial documentation result is presented as successful

### Requirement: No undocumented rate-limit header promise

The public interface MUST NOT promise `Retry-After`, `RateLimit-*`, or `X-RateLimit-*` response headers unless a later approved specification explicitly defines and verifies them. Client guidance and error handling MUST remain correct when those headers are absent.

#### Scenario: Rate-limit response makes no unsupported promise

- GIVEN a request is rejected for exceeding the IP rate limit
- WHEN the response is inspected
- THEN its documented status and structured error are present
- AND clients are not entitled to any undocumented rate-limit header

## Non-Goals

- Netlify Edge Functions as an official production deployment.
- Production guarantees for an experimental Netlify Functions surface.
- HostGator plan assumptions or a promise of managed reverse-proxy, backup, or rate-limit services.
- OAuth, API keys, repository commands, private data, mutation, or server-side LLM execution.
