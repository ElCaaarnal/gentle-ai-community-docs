# Security Policy

## Reporting a vulnerability

Please report security issues **privately**, not through a public issue.

Use GitHub's private vulnerability reporting on this repository
(**Security → Report a vulnerability**). If that is unavailable to you, contact the
maintainers through the Gentleman Programming organization rather than opening a
public issue.

Please include what you observed, the steps to reproduce it, and the affected
endpoint or file. A working proof of concept is welcome but never required.

## Scope

This project publishes two things:

- **A static documentation site.** It has no backend, no accounts, no user data, and
  no server-side execution.
- **A read-only MCP server** exposing the built documentation index over Streamable
  HTTP. It serves documentation text only. It has no authentication because it
  exposes nothing private; it performs no writes, executes no repository commands,
  reads no filesystem paths from user input, and embeds no language model.

Reports we are most interested in: anything that lets the MCP server return content
outside its generated index, execute code, read arbitrary files, be used to attack
the host, or take the service down disproportionately to the request cost.

## Out of scope

- Missing rate limiting reported without a demonstrated impact. Request-rate limiting
  is applied at the reverse proxy, documented in `docs/mcp-server-operations.md`.
- The absence of authentication on a deliberately public, read-only documentation
  endpoint.
- Findings against a locally modified deployment rather than the published service.

## Operational hardening

`docs/mcp-server-operations.md` documents the deployed configuration: the service
binds to a local port only, a reverse proxy is the public boundary, request bodies
are capped, and origin and host validation reject untrusted callers. Corrections to
that document are welcome as ordinary pull requests.
