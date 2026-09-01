# Docs MCP Deployment Specification

## Purpose

Describes the transport, origin/host validation, hosting, operations, and staleness controls
for the MCP server as a second deployable alongside the statically hosted site (AC1 transport,
AC6 staleness, AC10 operations).

## Requirements

### Requirement: Stateless Streamable HTTP Transport

The system MUST expose the MCP server over a single stateless Streamable HTTP endpoint
(`POST /mcp`), constructing a fresh server and transport per request with JSON responses
enabled, sharing no session state between requests.

#### Scenario: Independent requests

- GIVEN two sequential MCP requests
- WHEN each is handled
- THEN neither request's handling depends on state retained from the other

### Requirement: Server-Initiated Streaming Is Not Supported

The system MUST respond `405 Method Not Allowed` to `GET /mcp` and `DELETE /mcp`, since the
stateless design offers no server-initiated stream or session to close.

#### Scenario: GET is rejected without breaking the client

- GIVEN a client attempts a server-initiated stream via `GET /mcp`
- WHEN the server responds `405`
- THEN a compliant client MUST be able to complete its request/response exchange normally using
  `POST /mcp` alone

### Requirement: Missing Origin Header Is Accepted

The system MUST accept a request whose `Origin` header is absent, because terminal MCP clients
do not send one.

#### Scenario: No Origin header

- GIVEN a request has no `Origin` header
- WHEN the request reaches origin validation
- THEN the request proceeds

### Requirement: Untrusted Or Null Origin Is Rejected

The system MUST reject a request whose `Origin` header is present and either equals the literal
`null` or names a host outside the configured allow-list, responding with an explicit forbidden
error.

#### Scenario: Untrusted origin rejected

- GIVEN a request's `Origin` header names a host not in the allow-list
- WHEN the request reaches origin validation
- THEN the server responds with an explicit forbidden error

#### Scenario: Literal null origin rejected

- GIVEN a request's `Origin` header is the literal string `null`
- WHEN the request reaches origin validation
- THEN the server responds with an explicit forbidden error

### Requirement: Host Header Validation

The system MUST validate the `Host` header against a configured allow-list before processing
any `/mcp` request.

#### Scenario: Unrecognized host rejected

- GIVEN a request's `Host` header is outside the configured allow-list
- WHEN the request is received
- THEN the server rejects it before MCP processing begins

### Requirement: Independently Deployed From The Static Site

The system MUST run as a long-running process separate from the statically hosted site, since
the static hosting target cannot run a persistent process.

#### Scenario: Static site availability is unaffected by the MCP process

- GIVEN the MCP process is stopped or restarting
- WHEN a reader loads the public documentation site
- THEN the site remains available, unaffected by the MCP process state

### Requirement: Rate Limiting At The Reverse Proxy

Requests to the MCP endpoint MUST be rate-limited at the reverse proxy layer in front of the
process, not solely relied upon in-process.

#### Scenario: Excess request rate is throttled at the proxy

- GIVEN a client exceeds the configured request rate
- WHEN subsequent requests arrive within the rate window
- THEN the reverse proxy throttles or rejects them before they reach the process

### Requirement: Health Endpoint Exposes Operational Status And Build Identity

The system MUST expose a `/health` endpoint reporting, at minimum, process availability, the
indexed section count, and the index build identity.

#### Scenario: Health reflects the currently loaded index

- GIVEN the process has an index loaded
- WHEN `/health` is requested
- THEN the response reports the section count and build identity of that loaded index

### Requirement: Index Freshness Is Bound To Process Restart — Deploy Runbook Required

Because the served index is fixed at process start, the deployment runbook MUST document that
publishing new documentation and restarting the MCP process are one combined deploy step, so
served content cannot silently diverge from the published site.

#### Scenario: Publish without restart is observable, not silent

- GIVEN new documentation is published to the static site without restarting the MCP process
- WHEN a tool is called afterward
- THEN the response's index build identity reveals that it predates the new publish, and the
  runbook states this failure mode explicitly

### Requirement: Versioning And Compatibility Documented

The deployment documentation MUST state the server's supported MCP protocol version and the
process's own release identifier, so operators can reason about client compatibility.

#### Scenario: Compatibility statement present in operations docs

- GIVEN an operator reads the deployment documentation
- WHEN they check compatibility before upgrading a client
- THEN the documentation states the supported protocol version and the server's release
  identifier
