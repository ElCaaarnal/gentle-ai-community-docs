# Docs MCP Client Compatibility Specification

## Purpose

Document and verify truthful consumption of the public documentation MCP service by the named client workflows without overstating native protocol support.

## Requirements

### Requirement: Truthful named-client consumption evidence

Published setup and compatibility guidance MUST distinguish direct remote MCP support from adapter-mediated support and MUST be backed by a representative smoke test for each named workflow before making an affirmative compatibility claim. Claude Code, OpenCode, and Codex MAY be documented as direct remote Streamable HTTP consumers only when their respective smoke tests demonstrate connection and a successful read-only documentation call. Pi MUST be documented as lacking native MCP support and as consuming the service only through the named third-party `pi-mcp-adapter` (or an explicitly identified successor), with adapter evidence kept separate from Pi-native evidence.

#### Scenario: Claude Code evidence is direct

- GIVEN a smoke test uses the documented Claude Code remote MCP configuration
- WHEN it connects to the public endpoint and invokes a read-only documentation capability
- THEN the result records Claude Code direct consumption evidence
- AND the guide does not require a local stdio wrapper for that claim

#### Scenario: OpenCode evidence is direct

- GIVEN a smoke test uses OpenCode's documented remote MCP configuration
- WHEN it connects to the public endpoint and invokes a read-only documentation capability
- THEN the result records OpenCode direct consumption evidence
- AND the guide identifies the remote transport actually exercised

#### Scenario: Codex evidence is direct

- GIVEN a smoke test uses Codex's documented Streamable HTTP configuration
- WHEN it connects to the public endpoint and invokes a read-only documentation capability
- THEN the result records Codex direct consumption evidence
- AND the guide does not claim support for a protocol revision that the test did not observe

#### Scenario: Pi evidence is adapter-mediated

- GIVEN a smoke test installs and configures the named third-party `pi-mcp-adapter`
- WHEN Pi uses that adapter to invoke a read-only documentation capability successfully
- THEN the result records Pi-through-adapter evidence
- AND the documentation explicitly states that Pi itself has no native MCP support

### Requirement: Compatibility claims remain qualified and current

Client guidance MUST identify the tested client version or date, endpoint transport, operation exercised, and outcome. It MUST not claim that every named client supports only the modern MCP protocol era, and it MUST not publish an affirmative compatibility statement for an untested workflow when a representative runtime smoke test is feasible. If evidence is unavailable, the guidance MUST say so plainly and MUST preserve the legacy compatibility qualification.

#### Scenario: Untested client is not presented as verified

- GIVEN no representative smoke evidence exists for a named client workflow
- WHEN compatibility guidance is prepared
- THEN the workflow is marked unverified or qualified
- AND fixtures or configuration examples alone are not described as runtime proof

#### Scenario: Protocol-era evidence is scoped

- GIVEN a smoke test succeeds for one client and one negotiated protocol behavior
- WHEN the result is documented
- THEN the claim is limited to that client, version, endpoint, and observed behavior
- AND legacy support remains documented unless all required narrowing evidence exists

#### Scenario: Client instructions use public unauthenticated access

- GIVEN the service is documented for a named client
- WHEN configuration guidance is published
- THEN it uses the public HTTPS endpoint without requiring API keys or OAuth
- AND it does not include secrets or imply credentials are needed for this service

## Non-Goals

- Implementing MCP support inside Pi.
- Claiming native Pi compatibility from an adapter.
- Guaranteeing behavior for untested client versions, undocumented protocol revisions, or future client releases.
