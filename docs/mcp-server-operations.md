# Operate the production documentation MCP service

This runbook defines the desired VPS state for the Gentle AI wiki and its separate, long-running MCP service. It is for the VPS administrator; it does **not** claim that any command has run on the VPS.

## Target state

| Component | Desired state |
| --- | --- |
| Public host | `gentle-ai-wiki.gentlemanprogramming.com` over HTTPS |
| Static wiki | Apache serves the built `dist/` output from the Gentleman-Programming serving fork |
| MCP endpoint | Apache reverse-proxies `POST /mcp` to `127.0.0.1:3111` |
| Health endpoint | Apache reverse-proxies `/health` to the same local process |
| Runtime | Node.js **24 Active LTS** only; do not select Node 26 Current |
| Supervision | `systemd` service `gentle-ai-docs-mcp` |
| Index URLs | Build with `DOCS_BASE_URL=https://gentle-ai-wiki.gentlemanprogramming.com` |

Netlify remains the static demo deployment. Do not change its configuration from this runbook.

## Prerequisites

- An administrator account with `sudo`, Apache TLS-vhost access, and a service account named `gentle-ai-mcp`.
- The clone URL and approved ref for the **Gentleman-Programming serving fork**. Do not substitute a personal development fork.
- A TLS certificate already configured for `gentle-ai-wiki.gentlemanprogramming.com`.
- Node 24 installed at `/usr/bin/node`; do not rely on an interactive `nvm` profile in systemd.

The production target is Node.js 24 Active LTS. The official Node release page was checked on 2026-09-02 and reported `v24.20.0`; install a maintained 24.x release available through the VPS's approved package policy. Node 26 is Current, not the selected production target.

```sh
/usr/bin/node --version
/usr/bin/node -e "const major = Number(process.versions.node.split('.')[0]); if (major !== 24) { console.error('Node 24 is required; found ' + process.version); process.exit(1); } console.log('Node 24 verified: ' + process.version);"
```

Continue only when both commands show a major version of `24`.

## Checkout and build

Set the administrator-provided serving-fork URL and approved Git ref, then create a deployment checkout. The service account owns the checkout; the administrator applies updates through that account.

```sh
export SERVING_REPOSITORY_URL='<Gentleman-Programming serving-fork clone URL>'
export DEPLOY_REF='<approved tag or commit>'
sudo install -d -o gentle-ai-mcp -g gentle-ai-mcp /srv/gentle-ai-community-docs
sudo -u gentle-ai-mcp git clone "$SERVING_REPOSITORY_URL" /srv/gentle-ai-community-docs
cd /srv/gentle-ai-community-docs
sudo -u gentle-ai-mcp git checkout --detach "$DEPLOY_REF"
sudo -u gentle-ai-mcp npm ci
sudo -u gentle-ai-mcp env DOCS_BASE_URL=https://gentle-ai-wiki.gentlemanprogramming.com npm run build
```

`npm run build` generates both the static site and `dist/mcp/docs-index.json`. Build and restart are one deployment operation: publishing new static files without restarting leaves the MCP process on its older in-memory index. The `/health` response and every tool response expose the loaded index identity (`schemaVersion`, `generatedAt`, `commit`, and `sectionCount`) so that mismatch is observable.

## Service environment and systemd

Create `/etc/gentle-ai-docs-mcp.env` with root-only permissions:

```ini
PORT=3111
ALLOWED_HOSTS=gentle-ai-wiki.gentlemanprogramming.com
ALLOWED_ORIGINS=https://gentle-ai-wiki.gentlemanprogramming.com
DOCS_INDEX_PATH=dist/mcp/docs-index.json
NODE_ENV=production
```

```sh
sudo install -o root -g gentle-ai-mcp -m 0640 /dev/null /etc/gentle-ai-docs-mcp.env
sudoedit /etc/gentle-ai-docs-mcp.env
```

Create `/etc/systemd/system/gentle-ai-docs-mcp.service`:

```ini
[Unit]
Description=Gentle AI documentation MCP server
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=gentle-ai-mcp
Group=gentle-ai-mcp
WorkingDirectory=/srv/gentle-ai-community-docs
EnvironmentFile=/etc/gentle-ai-docs-mcp.env
ExecStart=/usr/bin/node mcp-server/src/server.mjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ProtectKernelTunables=yes
ProtectControlGroups=yes
CapabilityBoundingSet=
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
MemoryMax=512M
UMask=0027

[Install]
WantedBy=multi-user.target
```

The process binds only to its local port. Apache is the public boundary; do not open port `3111` in the public firewall.

## Apache modules and reverse proxy

Use the command family for the VPS distribution; do not assume either one has already run.

| Distribution family | Install/enable Apache capabilities |
| --- | --- |
| Debian/Ubuntu | `sudo apt-get install apache2 libapache2-mod-security2` then `sudo a2enmod proxy proxy_http headers ssl security2` |
| RHEL/Fedora/Alma/Rocky | `sudo dnf install httpd mod_ssl mod_security`; verify loaded modules with `sudo httpd -M` and enable the distribution's Apache module configuration as required |
| Other | Install Apache HTTP Server with `proxy`, `proxy_http`, `headers`, `ssl`, and ModSecurity v2-compatible request-rate limiting; use that distribution's package and service commands |

Merge this into the existing HTTPS virtual host for `gentle-ai-wiki.gentlemanprogramming.com`. Keep its certificate directives and existing static-site settings; the example is intentionally generic rather than tied to a distro-specific include path.

```apache
<VirtualHost *:443>
    ServerName gentle-ai-wiki.gentlemanprogramming.com
    DocumentRoot /srv/gentle-ai-community-docs/dist

    <Directory /srv/gentle-ai-community-docs/dist>
        Require all granted
    </Directory>

    ProxyRequests Off
    ProxyPreserveHost On
    ProxyTimeout 30
    LimitRequestBody 1000000

    ProxyPass        /mcp    http://127.0.0.1:3111/mcp connectiontimeout=5 timeout=30 retry=0
    ProxyPassReverse /mcp    http://127.0.0.1:3111/mcp
    ProxyPass        /health http://127.0.0.1:3111/health connectiontimeout=5 timeout=30 retry=0
    ProxyPassReverse /health http://127.0.0.1:3111/health

    <IfModule security2_module>
        SecRuleEngine On
        SecAction "id:100100,phase:1,nolog,pass,initcol:ip=%{REMOTE_ADDR}"
        SecRule "REQUEST_URI" "@streq /mcp" "id:100101,phase:1,nolog,pass,setvar:ip.mcp_requests=+1,expirevar:ip.mcp_requests=60"
        SecRule IP:MCP_REQUESTS "@gt 30" "id:100102,phase:1,deny,status:429,msg:'MCP request rate exceeded'"
    </IfModule>
</VirtualHost>
```

The body limit matches the service's `express.json({ limit: '1mb' })` boundary. The 30-second proxy timeout is appropriate because this transport returns one JSON response per stateless `POST`; it has no SSE stream. The ModSecurity rule is the required proxy-layer rate limit (30 `/mcp` requests per IP per 60 seconds). If the host uses an existing equivalent Apache request-rate-limit policy, preserve the same or stricter boundary and verify that it runs before proxying.

Validate the Apache configuration with the distribution's binary (`apachectl configtest` or `httpd -t`), then reload the existing Apache service using its local service name (`apache2` or `httpd`).

## Enable and smoke-check

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now gentle-ai-docs-mcp
sudo systemctl status gentle-ai-docs-mcp --no-pager
curl --fail --silent --show-error https://gentle-ai-wiki.gentlemanprogramming.com/health
```

Run a real tool smoke check after health succeeds. It uses the installed project SDK and confirms the public stateless transport, rather than inferring tool availability from a `200` response.

```sh
cd /srv/gentle-ai-community-docs
MCP_URL=https://gentle-ai-wiki.gentlemanprogramming.com/mcp node --input-type=module <<'NODE'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const client = new Client({ name: 'operations-smoke', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL(process.env.MCP_URL));
await client.connect(transport);
const { tools } = await client.listTools();
if (!tools.some(({ name }) => name === 'search_docs')) throw new Error('search_docs is not advertised');
const result = await client.callTool({ name: 'search_docs', arguments: { query: 'installation', locale: 'en', limit: 1 } });
if (result.isError) throw new Error('search_docs returned a typed error');
console.log('MCP tool smoke check passed');
await client.close();
NODE
```

## Upgrade and rollback

For an upgrade, record the current revision and health identity, then run the same checkout, install, build, restart, health, and tool-smoke sequence against the approved new ref. Do not restart before the build succeeds.

```sh
cd /srv/gentle-ai-community-docs
PREVIOUS_REF=$(sudo -u gentle-ai-mcp git rev-parse HEAD)
sudo -u gentle-ai-mcp git fetch --prune origin
sudo -u gentle-ai-mcp git checkout --detach "$DEPLOY_REF"
sudo -u gentle-ai-mcp npm ci
sudo -u gentle-ai-mcp env DOCS_BASE_URL=https://gentle-ai-wiki.gentlemanprogramming.com npm run build
sudo systemctl restart gentle-ai-docs-mcp
```

To roll back, substitute the recorded `PREVIOUS_REF` for `DEPLOY_REF`, rebuild with the same `DOCS_BASE_URL`, restart the service, and repeat both smoke checks. Revert the static output and MCP process together so they use the same generated index revision.

## Logs and failure diagnosis

| Symptom | Check | Expected correction |
| --- | --- | --- |
| Service will not start | `sudo journalctl -u gentle-ai-docs-mcp -b --no-pager` | Fix the reported Node version, environment file, ownership, or invalid/missing index; rebuild before restarting. |
| `/health` is unavailable | `sudo systemctl status gentle-ai-docs-mcp --no-pager` and Apache error log | Separate local service failure from Apache proxy/TLS configuration before changing either. |
| `403 forbidden origin` | Inspect `ALLOWED_ORIGINS` and the browser's exact HTTPS origin | Add only the intended origin; terminal clients normally omit `Origin` and must remain allowed. |
| Host rejection | Inspect `ALLOWED_HOSTS` and confirm `ProxyPreserveHost On` | Use the public hostname exactly; do not expose the local port publicly. |
| `413` or payload rejection | Check Apache `LimitRequestBody` and application logs | Keep the proxy and application limits aligned at 1 MB; do not raise them casually. |
| Static wiki and MCP disagree | Compare `/health` index identity with a tool response and deployed Git ref | Rebuild and restart as one deploy operation, or roll both back together. |
| `429` responses | Inspect Apache access/error logs and ModSecurity audit log | Confirm the request-rate rule is active; tune only with an approved capacity decision. |

For live logs, use `sudo journalctl -u gentle-ai-docs-mcp -f`; use the distribution's configured Apache access, error, and ModSecurity audit logs for proxy decisions.

## Compatibility

The server uses `@modelcontextprotocol/sdk` `1.30.0` and accepts the SDK-supported MCP protocol versions `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`, and `2024-10-07`. The process release identifier is `mcp-server/package.json`'s version (`0.1.0` at this runbook revision). Verify both values before upgrading the SDK or client fleet.
