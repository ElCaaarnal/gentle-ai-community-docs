# Docs MCP Adoption Specification

## Purpose

Describes the project-scoped, repo-committed configuration that lets Claude Code, OpenCode, Pi,
and Codex consume the MCP documentation server (AC1, AC9), including where invocation is
verified reliable and where it is a documented, partial limitation.

## Requirements

### Requirement: Claude Code Project-Scoped Tool-Restricted Invocation

Setup documentation MUST provide a project-scoped Claude Code command whose `allowed-tools`
frontmatter exposes only the MCP documentation tool, removing the fallback to the agent's own
knowledge when that command is used.

#### Scenario: Command-invoked search calls the server

- GIVEN the project-scoped command is installed
- WHEN a contributor invokes it with a documentation question
- THEN the server request log shows the corresponding tool call

### Requirement: OpenCode Project-Scoped Configuration

Setup documentation MUST provide OpenCode configuration registering the MCP server in
`opencode.json`, together with a project command bound to a project-scoped agent whose
permissions deny non-MCP categories, and MUST document explicitly that this composition stops
isolating the documentation tool the moment a second MCP server is registered in the project.

#### Scenario: Configured OpenCode session calls the server

- GIVEN the project-scoped OpenCode command and agent are installed
- WHEN a contributor invokes the command with a documentation question
- THEN the server request log shows the corresponding tool call

### Requirement: Pi Project-Scoped Configuration

Setup documentation MUST provide a repo-local Pi MCP configuration file consumable via
`--mcp-config`, connecting Pi to the server over Streamable HTTP, and a corresponding
project-scoped skill.

#### Scenario: Pi session calls the server

- GIVEN Pi is launched with the repo-local MCP configuration
- WHEN a contributor asks a documentation question through the corresponding skill
- THEN the server request log shows the corresponding tool call

### Requirement: Codex Project-Scoped Connection With Documented Partial Coverage

Setup documentation MUST provide a Codex skill and instructions to register the server through
`codex mcp add` and to grant project trust through Codex's own interactive prompt, never by
hand-editing global Codex configuration. Because Codex's skill format has no tool-restriction
field, the system MUST document, as a known and accepted limitation, that spontaneous invocation
on an unprompted question cannot be guaranteed; the server MUST still connect and respond
correctly when called on explicit request.

#### Scenario: Explicit request succeeds

- GIVEN Codex is configured with the project-scoped MCP registration
- WHEN a contributor explicitly asks Codex to use the documentation tool
- THEN the server request log shows the corresponding tool call and Codex returns that content

#### Scenario: Spontaneous invocation is not guaranteed (documented limitation)

- GIVEN a contributor asks a Gentle AI documentation question without explicitly invoking the
  skill or tool
- WHEN Codex answers
- THEN Codex MAY answer from its own knowledge instead of calling the server, and setup
  documentation MUST state this as a known limitation rather than present it as solved

### Requirement: Setup Documentation Covers All Four Agents

Setup documentation MUST include a working, project-scoped configuration example for each of
Claude Code, OpenCode, Pi, and Codex, and MUST state each configuration's scope explicitly.

#### Scenario: Each agent has a documented example

- GIVEN a contributor reads the setup documentation
- WHEN they look for their agent
- THEN they find a working configuration example and its stated scope for Claude Code,
  OpenCode, Pi, and Codex
