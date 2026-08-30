{
  "schema": "gentle-ai.sdd-research/v1",
  "revision": 3,
  "change": "mcp-documentation-interface",
  "status": "done",
  "outcome": "done",
  "research_selected": true,
  "research_mandatory_before_proposal": true,
  "questions": [
    "What MCP remote transports and configuration formats are currently supported by Claude Code, OpenCode, Pi, and Codex?",
    "Which clients require stdio, support Streamable HTTP directly, or impose authentication/TLS constraints?",
    "What is the current stable WebMCP API, browser availability, security model, and relationship to standard MCP?",
    "Does Netlify's chosen function or edge runtime support the required Streamable HTTP behavior, connection lifetime, body streaming, and response limits?",
    "Which MCP SDK/runtime version should define schema and compatibility behavior, and what Node versions does it require?",
    "What public abuse controls are available at the selected host, and what rate-limit headers/semantics should clients expect?"
  ],
  "requested_source_classes": [
    "documentation",
    "open-web"
  ],
  "admission": {
    "outcome": "granted",
    "reason": "The project-local runtime exposes every requested read-only evidence capability.",
    "observed_exact_grants": {
      "documentation": [
        "fetch_content",
        "get_search_content",
        "source_check"
      ],
      "open-web": [
        "web_search",
        "source_check",
        "fetch_content",
        "get_search_content"
      ]
    },
    "missing_evidence_capabilities": []
  },
  "access_date": "2026-08-29",
  "sources": [
    {
      "id": "S1",
      "class": "documentation",
      "authority": "first-party",
      "url": "https://docs.anthropic.com/en/docs/claude-code/mcp",
      "title": "Connect Claude Code to tools via MCP - Claude Code Docs",
      "access_date": "2026-08-29",
      "passages": [
        "HTTP servers are the recommended option for connecting to remote MCP servers.",
        "When configuring MCP servers via JSON in `.mcp.json`, `~/.claude.json`, or `claude mcp add-json`, the `type` field accepts `streamable-http` as an alias for `http`.",
        "Some services still expose only an SSE endpoint. Use the same command as the HTTP transport, with `--transport sse`.",
        "Stdio servers run as local processes on your machine.",
        "HTTP supports OAuth and the `claude mcp add --transport` flag, while WebSocket supports neither."
      ]
    },
    {
      "id": "S2",
      "class": "documentation",
      "authority": "first-party",
      "url": "https://opencode.ai/docs/mcp-servers/",
      "title": "MCP servers - OpenCode",
      "access_date": "2026-08-29",
      "passages": [
        "OpenCode supports both local and remote servers.",
        "You can define MCP servers in your OpenCode Config under `mcp`.",
        "Add local MCP servers using `type` to `local` within the MCP object.",
        "Add remote MCP servers by setting `type` to `remote`.",
        "OpenCode automatically handles OAuth authentication for remote MCP servers.",
        "If you want to disable automatic OAuth for a server ... set `oauth` to `false` ... and use `headers`."
      ]
    },
    {
      "id": "S3",
      "class": "documentation",
      "authority": "first-party",
      "url": "https://developers.openai.com/codex/mcp",
      "title": "Model Context Protocol - Codex",
      "access_date": "2026-08-29",
      "passages": [
        "STDIO servers: Servers that run as a local process (started by a command).",
        "Streamable HTTP servers: Servers that you access at an address.",
        "Codex stores MCP configuration in `config.toml` alongside other Codex configuration settings.",
        "Streamable HTTP servers ... `bearer_token_env_var` ... `http_headers` ... `env_http_headers`.",
        "Run `codex mcp login <server-name>` separately to start an MCP OAuth login."
      ]
    },
    {
      "id": "S4",
      "class": "open-web",
      "authority": "first-party-author",
      "url": "https://mariozechner.at/posts/2025-11-30-pi-coding-agent/",
      "title": "What I learned building an opinionated and minimal coding agent",
      "access_date": "2026-08-29",
      "passages": [
        "No MCP support",
        "pi does not and will not support MCP.",
        "If you absolutely must use MCP servers, look into ... mcporter ... that wraps MCP servers as CLI tools."
      ]
    },
    {
      "id": "S5",
      "class": "open-web",
      "authority": "third-party-extension",
      "url": "https://github.com/nicobailon/pi-mcp-adapter",
      "title": "Pi MCP Adapter",
      "access_date": "2026-08-29",
      "passages": [
        "Use MCP servers with Pi without burning your context window.",
        "Install: `pi install npm:pi-mcp-adapter`.",
        "The adapter reads standard MCP files automatically.",
        "Native Pi MCP config remains `.mcp.json`, `~/.config/mcp/mcp.json`, and Pi-owned overrides."
      ]
    },
    {
      "id": "S6",
      "class": "documentation",
      "authority": "normative",
      "url": "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports",
      "title": "Transports - Model Context Protocol",
      "access_date": "2026-08-29",
      "passages": [
        "The protocol currently defines two standard transport mechanisms ... stdio ... [and] Streamable HTTP.",
        "This transport uses HTTP POST and GET requests. Server can optionally make use of Server-Sent Events (SSE).",
        "The server MUST provide a single HTTP endpoint path ... that supports both POST and GET methods.",
        "If the input is a JSON-RPC request, the server MUST either return `Content-Type: text/event-stream` ... or `Content-Type: application/json`.",
        "Servers MUST validate the `Origin` header on all incoming connections ... [and] SHOULD implement proper authentication for all connections."
      ]
    },
    {
      "id": "S7",
      "class": "documentation",
      "authority": "first-party-browser",
      "url": "https://developer.chrome.com/blog/webmcp-epp",
      "title": "WebMCP is available for early preview",
      "access_date": "2026-08-29",
      "passages": [
        "Published: February 10, 2026.",
        "WebMCP is available for prototyping to early preview program participants."
      ]
    },
    {
      "id": "S8",
      "class": "documentation",
      "authority": "specification-project",
      "url": "https://raw.githubusercontent.com/webmachinelearning/webmcp/main/implementation-status.md",
      "title": "WebMCP Implementation Status",
      "access_date": "2026-08-29",
      "passages": [
        "WebMCP is supported in ChatGPT Desktop.",
        "An Origin Trial is live in Chrome 149.",
        "An Origin Trial is live in Edge 150.",
        "Firefox: Mozilla standards-positions ... Safari: WebKit standards-positions."
      ]
    },
    {
      "id": "S9",
      "class": "documentation",
      "authority": "draft-specification",
      "url": "https://webmachinelearning.github.io/webmcp/",
      "title": "WebMCP",
      "access_date": "2026-08-29",
      "passages": [
        "The ModelContext interface provides methods for web applications to register and manage tools that can be invoked by agents.",
        "`Promise<undefined> registerTool(...)`; `Promise<sequence<RegisteredTool>> getTools(...)`; `Promise<DOMString> executeTool(...)`.",
        "Despite the name of this API ... this specification does not prescribe the format in which tools are exposed to the browser agent.",
        "This section is non-normative ... it introduces new threat vectors and privacy implications."
      ]
    },
    {
      "id": "S10",
      "class": "documentation",
      "authority": "specification-project",
      "url": "https://raw.githubusercontent.com/webmachinelearning/webmcp/main/security-privacy-questionnaire.md",
      "title": "WebMCP Security and Privacy Self-Review Questionnaire",
      "access_date": "2026-08-29",
      "passages": [
        "Tool registrations are tied to the document's lifetime.",
        "The feature is gated by the `tools` permission policy. It is allowed in top-level documents and same-origin descendants by default.",
        "Cross-origin iframes may discover these tools only if the tool author explicitly opts in via `exposedTo`.",
        "Agents browsing multiple origins may carry state from one origin to another if not handled securely by the user agent ... this section is currently marked as TODO in the draft spec."
      ]
    },
    {
      "id": "S11",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://docs.netlify.com/build/functions/api/",
      "title": "Functions API reference - Netlify Docs",
      "access_date": "2026-08-29",
      "passages": [
        "A function can stream data to clients as it becomes available.",
        "To stream a response, return a `ReadableStream` as the `body` of the `Response`.",
        "Streaming functions have a 60-second execution limit and a 20 MB response size limit."
      ]
    },
    {
      "id": "S12",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://docs.netlify.com/build/functions/configuration/",
      "title": "Configuration for functions - Netlify Docs",
      "access_date": "2026-08-29",
      "passages": [
        "Synchronous execution limit 60 seconds [not configurable].",
        "Buffered request/response payload 6 MB [not configurable].",
        "Streamed response payload 20 MB [not configurable].",
        "Background request/response payload 256 KB [not configurable]."
      ]
    },
    {
      "id": "S13",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://docs.netlify.com/build/edge-functions/limits/",
      "title": "Edge Functions limits - Netlify Docs",
      "access_date": "2026-08-29",
      "passages": [
        "CPU execution time per request: 50 ms. Execution time does not include time spent waiting for resources or responses.",
        "Response header timeout: 40 s."
      ]
    },
    {
      "id": "S14",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://docs.netlify.com/build/edge-functions/api/",
      "title": "Edge Functions API - Netlify Docs",
      "access_date": "2026-08-29",
      "passages": [
        "The expected return value [includes] a standard Response object.",
        "Edge functions run in a Deno runtime environment.",
        "Support for npm packages is in beta.",
        "Streams API: ReadableStream, WritableStream, TransformStream."
      ]
    },
    {
      "id": "S15",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/",
      "title": "Rate limiting - Netlify Docs",
      "access_date": "2026-08-29",
      "passages": [
        "Basic functionality is available on all plans.",
        "Block the request (returns HTTP status `429`), or rewrite the request to another path.",
        "Per domain and IP address ... available to all customers.",
        "All plans support rate limiting rules in code for serverless functions, edge functions, and redirects.",
        "windowSize ... Maximum is 180."
      ]
    },
    {
      "id": "S16",
      "class": "documentation",
      "authority": "first-party-sdk",
      "url": "https://github.com/modelcontextprotocol/typescript-sdk",
      "title": "MCP TypeScript SDK",
      "access_date": "2026-08-29",
      "passages": [
        "This is the `main` branch - v2 of the SDK ... implementing the 2026-07-28 MCP spec.",
        "v2 is the stable release line.",
        "It runs on Node.js, Bun, and Deno.",
        "MCP server libraries [include] Streamable HTTP, stdio, auth helpers."
      ]
    },
    {
      "id": "S17",
      "class": "documentation",
      "authority": "first-party-sdk",
      "url": "https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/packages/server/package.json",
      "title": "@modelcontextprotocol/server package.json",
      "access_date": "2026-08-29",
      "passages": [
        "`name`: `@modelcontextprotocol/server`.",
        "`version`: `2.0.0`.",
        "`engines`: { `node`: `>=20` }."
      ]
    },
    {
      "id": "S18",
      "class": "documentation",
      "authority": "first-party-sdk",
      "url": "https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/docs/protocol-versions.md",
      "title": "MCP TypeScript SDK Protocol versions",
      "access_date": "2026-08-29",
      "passages": [
        "Every protocol revision from `2024-10-07` through `2025-11-25` ... [is] `legacy`. The `2026-07-28` revision starts the `modern` era.",
        "Absent, or `mode: legacy` - the 2025 `initialize` handshake ... [is] the default.",
        "By default the handler also serves 2025-era traffic per request (`legacy: stateless`)."
      ]
    },
    {
      "id": "S19",
      "class": "product-decision",
      "authority": "confirmed-user-decision",
      "url": "engram://observation/4039",
      "title": "Host production MCP on HostGator VPS",
      "access_date": "2026-08-29",
      "passages": [
        "The user confirmed HostGator VPS as the official production host for the MCP service.",
        "Netlify remains the static documentation/index publisher and a user-operated experimental MCP test surface only.",
        "Netlify Edge body limits and rate-limit headers are no longer proposal blockers for the official service."
      ]
    },
    {
      "id": "S20",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/vps-getting-started",
      "title": "VPS Getting Started",
      "access_date": "2026-08-29",
      "passages": [
        "Our VPS platform is a Kernel-based Virtual Machine (KVM). It is a more modern, open-source virtualization technology already built into Linux.",
        "Using the URL format above, you'll be able to access WHM with `root` as the username.",
        "To restart your container using SSH: Log in to SSH as root; enter the reboot command.",
        "Before your name servers are created, you will have to use your IP address, which is available in your Welcome email and Customer Portal."
      ]
    },
    {
      "id": "S21",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/vps-general-information",
      "title": "VPS General Information",
      "access_date": "2026-08-29",
      "passages": [
        "A VPS is best for installing custom software [and] creating custom configurations.",
        "There is no enforced limit for the number of simultaneous processes you may run on a VPS. You may use 100% of the resources defined by your plan.",
        "HostGator does not recommend obtaining a VPS account as a resource-intensive account or heavy traffic solution.",
        "Your VPS hosting plan will come with one (1) dedicated IP address.",
        "Just like Dedicated servers, we do not maintain backups for the VPS. You do have the ability to set up backups with WHM and cPanel."
      ]
    },
    {
      "id": "S22",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/open-new-ports",
      "title": "Open New Ports",
      "access_date": "2026-08-29",
      "passages": [
        "VPS and Dedicated Server accounts can open new inbound and outbound ports.",
        "Log in to WHM as root [and select] HG Firewall Administration.",
        "From here, you may open ports, whitelist or blacklist IP addresses, add custom rules, delete rules, and even stop, start, and restart the firewall service."
      ]
    },
    {
      "id": "S23",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/hg-compatible-technologies",
      "title": "Compatible Technologies With HostGator",
      "access_date": "2026-08-29",
      "passages": [
        "Below is a list of programs and software for HostGator's Linux servers. We have tested these items for compatibility.",
        "Apache 2: Dedicated/VPS compatible.",
        "Node.js: Dedicated/VPS compatible.",
        "Proxy servers, socket servers, SOCKS 4, 4a, &5: Dedicated/VPS not compatible.",
        "This article indicates compatibility. This does not imply that we install these programs for free."
      ]
    },
    {
      "id": "S24",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/what-are-some-of-the-things-i-get-with-a-vps",
      "title": "What are some of the things I get with a VPS?",
      "access_date": "2026-08-29",
      "passages": [
        "Some of the features include cPanel, root WHM, KVM, and a root shell.",
        "Semi-managed VPS plans ... can install the software you require through SSH using the Yum Package Manager.",
        "Fully managed support [includes] firewall setup and troubleshooting, network related issues, package installations via a package manager, DNS configuration, task automation, and custom Apache configurations."
      ]
    },
    {
      "id": "S25",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/help/article/manage-autossl-in-whm",
      "title": "Manage AutoSSL in WHM",
      "access_date": "2026-08-29",
      "passages": [
        "AutoSSL is a WHM feature that automatically installs and manages domain-validated SSL certificates for cPanel accounts on VPS and dedicated servers.",
        "For the AutoSSL DCV to function, the domain must be pointed to HostGator via either nameservers or an A record to your server's IP address.",
        "Select Let's Encrypt under AutoSSL Providers."
      ]
    },
    {
      "id": "S26",
      "class": "documentation",
      "authority": "first-party-host",
      "url": "https://www.hostgator.com/tos/vps-tos",
      "title": "VPS Terms of Service",
      "access_date": "2026-08-29",
      "passages": [
        "VPS accounts may not exceed a 15 minute load average greater than two (2) times the amount of CPU cores given.",
        "VPS accounts come with a default inode limit of 10,000,000.",
        "User is solely responsible for backing-up all User Content ... off of HostGator's servers."
      ]
    }
  ],
  "validated_claims": [
    {
      "id": "C1",
      "question": 1,
      "claim": "Claude Code directly supports remote HTTP/Streamable HTTP, legacy SSE, WebSocket, and local stdio. Its documented JSON locations are `.mcp.json` and `~/.claude.json`, and its CLI uses `claude mcp add` or `add-json`.",
      "source_ids": ["S1"]
    },
    {
      "id": "C2",
      "question": 1,
      "claim": "OpenCode directly supports local command-spawned and remote URL MCP servers in its JSON configuration under `mcp`, using `type: local` or `type: remote`.",
      "source_ids": ["S2"]
    },
    {
      "id": "C3",
      "question": 1,
      "claim": "Codex directly supports stdio and Streamable HTTP servers and stores both in user or trusted-project `config.toml` under `mcp_servers` tables.",
      "source_ids": ["S3"]
    },
    {
      "id": "C4",
      "question": 1,
      "claim": "Pi intentionally has no native MCP support. MCP use therefore requires an external bridge or extension; `pi-mcp-adapter` is one third-party option and is not evidence of Pi-native compatibility.",
      "source_ids": ["S4", "S5"]
    },
    {
      "id": "C5",
      "question": 2,
      "claim": "Claude Code, OpenCode, and Codex all support remote HTTP directly and local stdio; none of those three requires stdio for this public documentation service. Their remote configurations support OAuth and/or explicit headers or bearer tokens.",
      "source_ids": ["S1", "S2", "S3"]
    },
    {
      "id": "C6",
      "question": 2,
      "claim": "MCP Streamable HTTP permits JSON-only responses for simple request/response tools and optionally uses SSE for streaming or server-to-client messages. It normatively requires one endpoint supporting POST and GET, Origin validation, and recommends authentication.",
      "source_ids": ["S6"]
    },
    {
      "id": "C7",
      "question": 3,
      "claim": "WebMCP is not a universally stable browser API: Chrome documentation calls it an early preview, while the implementation tracker shows origin trials in Chrome and Edge, support in ChatGPT Desktop, and only standards-position links for Firefox and Safari.",
      "source_ids": ["S7", "S8"]
    },
    {
      "id": "C8",
      "question": 3,
      "claim": "The current imperative draft exposes `document.modelContext` operations for registering, discovering, and executing tools. The specification explicitly does not require browser agents to expose those tools using standard MCP wire format.",
      "source_ids": ["S9"]
    },
    {
      "id": "C9",
      "question": 3,
      "claim": "WebMCP is origin- and document-scoped, gated by a `tools` Permissions Policy, and cross-origin discovery requires explicit `exposedTo` opt-in. Its security analysis remains incomplete for multi-origin agent state, so it cannot be treated as a mature replacement for a remote MCP service.",
      "source_ids": ["S9", "S10"]
    },
    {
      "id": "C10",
      "question": 4,
      "claim": "Netlify Functions support Web-standard streamed responses. Streaming is capped at 60 seconds and 20 MB; buffered request/response payloads are capped at 6 MB. These limits are sufficient evidence for bounded JSON responses and bounded SSE, but not for connections longer than 60 seconds.",
      "source_ids": ["S11", "S12"]
    },
    {
      "id": "C11",
      "question": 4,
      "claim": "Netlify Edge Functions expose Web Streams in a Deno runtime and impose a 40-second response-header timeout plus a 50 ms CPU budget excluding waits. Their official limits page does not state a response-body-size limit.",
      "source_ids": ["S13", "S14"]
    },
    {
      "id": "C12",
      "question": 5,
      "claim": "The official TypeScript SDK v2 is the stable line; `@modelcontextprotocol/server` 2.0.0 requires Node 20 or newer and supports Streamable HTTP, stdio, and authentication helpers.",
      "source_ids": ["S16", "S17"]
    },
    {
      "id": "C13",
      "question": 5,
      "claim": "SDK v2 can serve both the legacy 2024-2025 protocol era and the 2026-07-28 modern era, with legacy behavior remaining the documented default. This provides an evidence-backed compatibility boundary without assuming every named client already implements the modern era.",
      "source_ids": ["S16", "S18"]
    },
    {
      "id": "C14",
      "question": 6,
      "claim": "Netlify offers code-based rate limiting for Functions, Edge Functions, and redirects on all plans. Rules can aggregate by domain and IP, and the block action returns HTTP 429; richer shared per-domain controls are enterprise-only.",
      "source_ids": ["S15"]
    },
    {
      "id": "C15",
      "question": 4,
      "claim": "The confirmed production boundary is a HostGator VPS. Netlify remains authoritative only for the static site/index and may host a user-operated experimental Functions test surface; Netlify Edge Functions are excluded from official support.",
      "source_ids": ["S19"]
    },
    {
      "id": "C16",
      "question": 4,
      "claim": "HostGator documents a Linux KVM VPS with root shell/SSH control, custom software/configuration use, Node.js and Apache compatibility, and software installation through SSH on semi-managed plans. This is sufficient evidence for a host-agnostic Node MCP service proposal, but not for any unconfirmed plan or operating-system version.",
      "source_ids": ["S20", "S21", "S23", "S24"]
    },
    {
      "id": "C17",
      "question": 4,
      "claim": "HostGator VPS networking includes a dedicated IP and owner-managed inbound/outbound ports and firewall rules. HTTP/HTTPS exposure is operationally feasible, while exact DNS, firewall, and selected-plan details remain deployment prerequisites.",
      "source_ids": ["S20", "S21", "S22"]
    },
    {
      "id": "C18",
      "question": 4,
      "claim": "For cPanel VPS deployments, HostGator documents AutoSSL with domain-validated certificates and a Let's Encrypt provider after DNS points to the VPS. The evidence does not establish an officially supported Node reverse-proxy topology, and HostGator's compatibility table marks generic proxy/socket servers incompatible; reverse-proxy support must therefore be confirmed for the purchased plan or replaced by a directly terminated HTTPS design.",
      "source_ids": ["S23", "S25"]
    },
    {
      "id": "C19",
      "question": 4,
      "claim": "Production capacity is owned by the selected VPS plan rather than Netlify limits. HostGator documents use of plan-defined resources, no enforced simultaneous-process count, a warning against resource-intensive/heavy-traffic use, a load-average policy, a default inode ceiling, and customer-owned backups; concrete CPU, memory, storage, backup, and traffic assumptions must be confirmed before deployment.",
      "source_ids": ["S21", "S26"]
    },
    {
      "id": "C20",
      "question": 4,
      "claim": "The experimental Netlify Functions surface is bounded only by the documented 60-second execution limit, 20 MB streamed-response limit, and 6 MB buffered request/response limit. The missing Edge response-body ceiling is an explicit exclusion because Edge Functions are outside official support, not a production blocker.",
      "source_ids": ["S11", "S12", "S13", "S14", "S19"]
    },
    {
      "id": "C21",
      "question": 6,
      "claim": "At the HostGator VPS layer, documented abuse controls include opening/closing ports, IP allow/block lists, and custom firewall rules. No retrieved HostGator source establishes managed HTTP request-rate limiting or response-header semantics, so application or web-server rate limiting and any client-visible headers remain deployment-owned and must not be attributed to HostGator.",
      "source_ids": ["S22", "S24"]
    },
    {
      "id": "C22",
      "question": 6,
      "claim": "For the experimental Netlify Functions surface, HTTP 429 is the only documented rate-limit response semantic in scope. `Retry-After`, `RateLimit-*`, and `X-RateLimit-*` headers are explicitly unsupported promises and their absence does not block the official HostGator service proposal.",
      "source_ids": ["S15", "S19"]
    }
  ],
  "question_outcomes": [
    {"question": 1, "outcome": "answered", "claim_ids": ["C1", "C2", "C3", "C4"]},
    {"question": 2, "outcome": "answered", "claim_ids": ["C5", "C6"]},
    {"question": 3, "outcome": "answered", "claim_ids": ["C7", "C8", "C9"]},
    {"question": 4, "outcome": "answered", "claim_ids": ["C10", "C11", "C15", "C16", "C17", "C18", "C19", "C20"], "reason": "HostGator VPS is the confirmed production boundary and has evidence for a host-agnostic Linux/Node service. Netlify Functions is experimental and bounded by documented limits; Edge Functions and their undocumented body ceiling are explicitly excluded."},
    {"question": 5, "outcome": "answered", "claim_ids": ["C12", "C13"]},
    {"question": 6, "outcome": "answered", "claim_ids": ["C14", "C21", "C22"], "reason": "HostGator documents firewall controls but not managed HTTP rate-limit semantics, which remain deployment-owned. Experimental Netlify support promises only HTTP 429 and explicitly excludes undocumented rate-limit headers."}
  ],
  "unresolved_claims": [
    {
      "id": "U1",
      "question": 2,
      "claim": "A single explicit client-enforced TLS rule for all public MCP endpoints across Claude Code, OpenCode, and Codex.",
      "reason": "The client guides use HTTPS examples and document OAuth/header authentication, while the MCP security guidance recommends HTTPS for production OAuth URLs; none of the retrieved client passages states one identical hard TLS rule for every unauthenticated remote MCP URL.",
      "impact": "Do not claim identical TLS validation behavior across clients; a public deployment should still use HTTPS under ordinary web and OAuth security practice."
    },
    {
      "id": "U2",
      "question": 4,
      "claim": "Netlify Edge Functions have a documented response-body-size limit and verified end-to-end Streamable HTTP/SSE conformance for MCP.",
      "reason": "The Edge API documents Streams support and the limits page documents CPU and response-header timeout, but no response-body limit or MCP-specific behavior was found.",
      "impact": "Explicitly excluded: Netlify Edge Functions are outside official support and this missing evidence does not block the HostGator proposal."
    },
    {
      "id": "U3",
      "question": 6,
      "claim": "Netlify code-based rate limiting emits `Retry-After`, standardized `RateLimit-*`, or legacy `X-RateLimit-*` headers.",
      "reason": "First-party documentation validates HTTP 429 and rule semantics but does not document those headers.",
      "impact": "Explicitly excluded: the experimental Netlify contract may promise HTTP 429 only and must not promise these headers."
    },
    {
      "id": "U4",
      "question": 5,
      "claim": "Every named client already negotiates the SDK v2 modern 2026-07-28 protocol era.",
      "reason": "Claude Code documents a v2 runtime, but the retrieved OpenCode, Pi-adapter, and Codex sources do not identify their negotiated protocol revision.",
      "impact": "Compatibility should retain the SDK's legacy serving path unless client smoke tests prove modern-era support individually."
    },
    {
      "id": "U5",
      "question": 4,
      "claim": "The purchased HostGator plan's exact Linux distribution/version, CPU, memory, storage, bandwidth, backup product, support tier, and installed Node version.",
      "reason": "Retrieved first-party pages establish general VPS capabilities and policies but plan details can vary and were not supplied for the user's purchased VPS.",
      "impact": "Deployment prerequisite: confirm the actual plan and operating environment before implementation; do not encode plan-specific facts in the proposal."
    },
    {
      "id": "U6",
      "question": 4,
      "claim": "HostGator officially supports the intended Node reverse-proxy topology.",
      "reason": "HostGator documents Node.js and Apache compatibility and managed custom Apache configuration, but its compatibility table marks generic proxy/socket servers incompatible without clarifying reverse proxies.",
      "impact": "Deployment prerequisite: obtain HostGator confirmation for the intended topology or terminate HTTPS directly in the Node service; this does not block a host-agnostic VPS proposal."
    },
    {
      "id": "U7",
      "question": 6,
      "claim": "HostGator supplies managed per-request HTTP rate limiting or specific `Retry-After`, `RateLimit-*`, or `X-RateLimit-*` response headers for VPS traffic.",
      "reason": "Retrieved first-party HostGator documentation establishes firewall and IP controls but no managed HTTP rate-limit contract or headers.",
      "impact": "Deployment prerequisite and product-design input: rate limiting must be application/web-server owned, and no HostGator-provided headers may be promised without later evidence."
    }
  ],
  "contradictions": [
    {
      "id": "X1",
      "sources": ["S7", "S8"],
      "description": "Chrome's February 2026 page describes a participant-only early preview, while the current implementation tracker reports later Chrome 149 and Edge 150 origin trials. This is a timeline change, not proof of broad stable availability.",
      "resolution": "Treat the current implementation tracker as fresher for availability and keep the API classified as experimental."
    },
    {
      "id": "X2",
      "sources": ["S4", "S5"],
      "description": "Pi's author states that Pi has no MCP support, while a third-party adapter advertises MCP use with Pi.",
      "resolution": "Separate native client capability from extension capability; the adapter does not change Pi's native support statement."
    }
  ],
  "evidence_freshness": {
    "as_of": "2026-08-29",
    "assessment": "Current first-party client, MCP SDK/specification, WebMCP project, Netlify, and HostGator documentation were fetched directly. Client/browser capabilities, HostGator plan details, and hosting policies are time-sensitive and should be rechecked before publishing setup or deployment instructions.",
    "stale_or_inaccessible": [
      "The npm package page for `@modelcontextprotocol/sdk` returned HTTP 403; GitHub package manifests and release-line documentation were used instead.",
      "The HostGator product-plan page and some help pages returned HTTP 403; no claim relies on their search summaries. Claims use directly fetched first-party HostGator help and terms pages.",
      "Several discovery-provider searches were rate-limited; no claim relies on those failed summaries.",
      "Netlify Edge Functions documentation did not expose a response-body-size ceiling; Edge Functions are explicitly excluded from official support."
    ]
  },
  "external_claims_verified": true,
  "proposal_ready": false,
  "proposal_blockers": [
    "The orchestrator still owes the product decision round; product decisions remain pending."
  ]
}
