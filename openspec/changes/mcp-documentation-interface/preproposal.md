{
  "schema": "gentle-ai.sdd-preproposal/v1",
  "revision": 5,
  "change": "mcp-documentation-interface",
  "exploration_reference": {
    "openspec": "openspec/changes/mcp-documentation-interface/exploration.md",
    "engram": "sdd/mcp-documentation-interface/explore"
  },
  "research_request": {
    "selected": true,
    "mandatory_before_proposal": true,
    "user_decision": "Pausar para investigar",
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
    ]
  },
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
    }
  },
  "research_reference": {
    "openspec": "openspec/changes/mcp-documentation-interface/research.md",
    "engram": "sdd/mcp-documentation-interface/research",
    "revision": 3,
    "outcome": "done",
    "access_date": "2026-08-29"
  },
  "evidence_references": [
    "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9",
    "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18",
    "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26"
  ],
  "research_summary": {
    "answered_questions": [1, 2, 3, 4, 5, 6],
    "partial_questions": [],
    "validated_boundaries": [
      "Claude Code, OpenCode, and Codex directly support remote HTTP and local stdio configurations; Pi does not natively support MCP and needs an external bridge or extension.",
      "WebMCP remains experimental and browser-scoped, with origin-trial or implementation-specific availability; it complements rather than proves compatibility with remote standard MCP clients.",
      "The official production service is a host-agnostic Linux/Node deployment on the confirmed HostGator VPS; first-party evidence establishes root access, Node/Apache compatibility, dedicated-IP and firewall control, and cPanel AutoSSL capability.",
      "Netlify remains the authoritative static site/index publisher and an experimental Functions test surface bounded by 60 seconds, 20 MB streamed, 6 MB buffered, and documented HTTP 429 behavior.",
      "Netlify Edge Functions and undocumented Netlify rate-limit headers are explicit exclusions rather than official-service blockers.",
      "The stable official TypeScript SDK v2 server package requires Node 20 or newer and can serve both legacy 2024-2025 and modern 2026 protocol eras."
    ],
    "unresolved_boundaries": [
      "The actual HostGator plan, Linux/runtime versions, resources, support tier, backups, and traffic assumptions must be confirmed before deployment.",
      "HostGator's intended reverse-proxy support must be confirmed or replaced by direct HTTPS termination because its compatibility table is ambiguous for reverse proxies.",
      "HostGator does not document managed HTTP request-rate limiting or rate-limit response headers; those controls remain application/web-server owned.",
      "Protocol-revision negotiation has not been proved individually for every named client."
    ]
  },
  "product_decisions": "confirmed",
  "confirmed_product_decisions": [
    "Production MCP runs on a HostGator VPS; Netlify publishes the static site/index and remains an experimental test surface only.",
    "Exact retrieval returns Markdown by default and sanitized HTML on explicit request.",
    "H2 and H3 are independently addressable; descendant expansion is explicit and optional.",
    "Empty or whitespace-only search queries are invalid; search defaults to 8 results, caps at 20, and is accent-insensitive.",
    "The production endpoint is public HTTPS without API keys or OAuth, with Origin validation, bounded inputs/responses, and IP-based rate limiting.",
    "WebMCP implementation is deferred; the generated index remains reusable by a future experimental adapter."
  ],
  "proposal_ready": true,
  "blocking_reasons": [],
  "next_action": "Launch `sdd-proposal` with the confirmed exploration, research, hosting, and product-decision handoff."
}
