// Stateless Streamable HTTP transport for the docs MCP server, ported from the
// validated spike (spike/mcp/server.mjs, read-only) — see design.md's "index
// contract" and "keep regex extraction" decisions for why this shape was kept
// essentially unchanged. A fresh McpServer + transport is built per request:
// nothing is shared, no session id exists to hijack.

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { hostHeaderValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { registerTools } from './tools.mjs';

function buildServer(indexStore, version) {
  const server = new McpServer({ name: 'gentle-ai-docs-mcp', version });
  registerTools(server, indexStore);
  return server;
}

// Origin check. Deliberately NOT the SDK's deprecated transport-level default:
// a missing Origin header MUST pass, because terminal MCP clients never send
// one. Rejecting it locks out every agent. Only a present-and-untrusted origin
// or the literal `null` is rejected.
function originValidation(allowed) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (origin === undefined) return next();

    let ok = false;
    if (origin !== 'null') {
      try {
        ok = allowed.includes(new URL(origin).host);
      } catch {
        ok = false;
      }
    }

    return ok ? next() : res.status(403).json({ error: 'forbidden origin' });
  };
}

/**
 * Builds the Express app. `indexStore` is a loaded `index-store.mjs` store;
 * `allowedHosts`/`allowedOrigins` are the Host/Origin allow-lists; `version`
 * is the process release identifier (mcp-server/package.json's `version`).
 */
export function createApp({ indexStore, allowedHosts, allowedOrigins, version }) {
  const app = express();

  // Request log: the only way to prove a client actually called this server
  // rather than producing a plausible-looking answer from its own knowledge.
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(hostHeaderValidation(allowedHosts));
  app.use(originValidation(allowedOrigins));

  app.get('/health', (_req, res) => {
    const index = indexStore.getBuildIdentity();
    res.json({ ok: true, sections: indexStore.getSections().length, index });
  });

  app.post('/mcp', async (req, res) => {
    // Stateless: fresh server + transport per request, nothing shared, nothing
    // to hijack (design.md — "mcp-server/ is an npm workspace" decision's
    // sibling: the transport decision, "Stateless Streamable HTTP Transport").
    const server = buildServer(indexStore, version);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // No server-initiated stream in stateless mode — removes the SSE stream
  // and with it nginx's `proxy_buffering off` requirement (design.md).
  const notAllowed = (_req, res) => res.status(405).json({ error: 'method not allowed' });
  app.get('/mcp', notAllowed);
  app.delete('/mcp', notAllowed);

  return app;
}
