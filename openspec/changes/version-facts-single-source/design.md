# Design: Single-Source Channel Version Facts

## Technical Approach

One locale-invariant typed module, `src/data/versions.ts`, holds four recorded facts and derives one install string. Both locale content components import it directly in frontmatter and substitute it at seven sites each. Every substitution is a **tag-hugging replacement of a complete text node** — that single invariant is what makes render-transparency (`docs-content-presentation` spec, scenario 4) structural rather than hoped for. Verification is a full-file byte comparison of both built HTML outputs against a pre-change build.

## Architecture Decisions

### Decision: Tag-hugging substitution as the render-transparency mechanism

**Choice**: Every `{expression}` MUST be immediately preceded by `>` and immediately followed by `<`, with no space, tab, or newline between. Only a *complete* text node is ever replaced; a partial text node is never split.
**Alternatives considered**: (a) partial interpolation such as `<code>go install …@{releases.prerelease.version}</code>`; (b) accepting a diff and regenerating the four hero PNGs.
**Rationale**: `astro.config.mjs` sets no `compressHTML`, so Astro's default `true` is active — the same HTML compressor that produced this repo's Mermaid statement-separator bug. Compression collapses runs of whitespace at static-text-node boundaries, and introducing `{expr}` splits a static node into new boundaries. When the expression hugs its tags there is **no adjacent whitespace to collapse**, so the boundary change is inert and the two parse modes (EN template, ES JSX fragment) cannot diverge. Partial interpolation puts literal text beside an expression and reintroduces exactly the divergence risk the proposal rates Medium. Regenerating baselines is rejected outright: the spec contracts render-transparency as durable, and the Linux pair is only reachable through `workflow_dispatch update_snapshots`.

All fourteen target sites already satisfy the invariant today (`En:5,1400,1401`; `Es:9,1425,1426`). The literal space between `</code>` and `<span class="pill">` stays static text and is never touched.

### Decision: `goModulePath` is module-local, not exported

**Choice**: Export `releases` and `prereleaseInstall` only.
**Alternatives considered**: exporting the path for a future staleness checker.
**Rationale**: The exported surface is exactly what renders. The checker is deferred; it can widen the API when it exists.

### Decision: Stable and development install commands stay fully literal

**Choice**: `En:1400`/`Es:1425` bind only the version and date; `@latest` and `@main` command strings are untouched literals.
**Alternatives considered**: deriving all three commands from `goModulePath`.
**Rationale**: Confirmed decision 1 — version-independent targets are never derived. Also keeps two whole lines out of the diff.

### Decision: EN frontmatter fence is the only new parse-mode surface

**Choice**: Add a three-line fence above `<section class="hero">`; fill the existing ES fence (lines 1-2).
**Alternatives considered**: normalizing the ES `{<>…</>}` wrapper for symmetry.
**Rationale**: Out of scope by proposal. The asymmetry is preserved deliberately; the byte diff proves it is harmless.

## Data Flow

    src/data/versions.ts  (4 recorded facts → 1 derived string)
            │
            ├──→ DocumentationContentEn.astro  (frontmatter import → 7 sites)
            └──→ DocumentationContentEs.astro  (frontmatter import → 7 sites)
                        │
                        ▼
              dist/index.html · dist/es/index.html
                        │
                        ▼
              tests/docs.spec.ts — INDEPENDENT literals, no import (double entry)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/data/versions.ts` | Create | ~12 lines: `ReleaseFact`, `releases`, `prereleaseInstall` |
| `src/components/DocumentationContentEn.astro` | Modify | New 3-line fence; lines 5, 1400, 1401 |
| `src/components/DocumentationContentEs.astro` | Modify | Fill fence (lines 1-2); lines 9, 1425, 1426 |
| `tests/**`, `tests/**/*.png` | Unchanged | Target outcome: zero changes |
| `openspec/config.yaml` | Unchanged | Stale; see Open Questions |

## Interfaces / Contracts

```ts
// src/data/versions.ts
export type ReleaseFact = { readonly version: string; readonly released: string };

const goModulePath = 'github.com/gentleman-programming/gentle-ai/v2/cmd/gentle-ai';

export const releases = {
  stable:     { version: 'v2.4.0',      released: '2026-08-17' },
  prerelease: { version: 'v2.5.0-rc.1', released: '2026-08-26' },
} as const satisfies Record<'stable' | 'prerelease', ReleaseFact>;

export const prereleaseInstall = `go install ${goModulePath}@${releases.prerelease.version}`;
```

`prereleaseInstall` is a locale-invariant machine invocation, not narrative prose. Scenario 3's prohibition on concatenation governs authored sentences in the locale components; this derivation is what makes scenario 2 (the pin follows the fact) observable.

### Exact markup — EN

```astro
---
import { prereleaseInstall, releases } from '../data/versions';
---
<!-- line 5 -->
…<span class="chip">Stable <b>{releases.stable.version}</b></span><span class="chip">Latest RC <b>{releases.prerelease.version}</b></span>…
<!-- line 1400 -->
<tr><td>Stable</td><td><code>{releases.stable.version}</code> <span class="pill">{releases.stable.released}</span></td><td><code>go install github.com/gentleman-programming/gentle-ai/v2/cmd/gentle-ai@latest</code></td></tr>
<!-- line 1401 -->
<tr><td>Prerelease</td><td><code>{releases.prerelease.version}</code> <span class="pill">{releases.prerelease.released}</span></td><td><code>{prereleaseInstall}</code></td></tr>
```

### Exact markup — ES

Identical expressions; labels stay Spanish (`Estable`, `Última RC`, `Prerelease`, `Desarrollo`). The import goes **between** the existing `---` fence lines; `{<>` on line 4 and `</>}` on line 1501 are untouched.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type | Module type-checks under `astro/tsconfigs/strict` | `npm run check` — 0 errors / 0 warnings / 0 hints |
| Build | Render-transparency in **both** locales | Byte-identity protocol below |
| E2E | Existing 28 assertions still pass | `npx playwright test` — 28 passing, zero `.png` regeneration |
| Static | Suite does not import the module | Repository grep, below |

### Byte-identity protocol (the primary gate)

0. **Prove the build is deterministic first.** At the base commit, run `npm run build` twice, hashing `dist/index.html` and `dist/es/index.html` each time. If the two runs disagree, the diff is meaningless and the phase MUST stop and report — do not proceed to step 1.
1. At the base commit, record `shasum -a 256 dist/index.html dist/es/index.html` into a scratch file outside the repo.
2. Apply the change, `npm run build`, re-hash.
3. **Both hashes MUST match.** Full-file identity is used deliberately instead of cropping the hero region: it is simpler, strictly stronger, and covers the channel table too.
4. If a hash differs, `diff` the file against the saved copy to localize. A whitespace-only delta at the EN component boundary (the new fence) is the expected failure shape. The correct response is to restore transparency or report a blocker — **never** to regenerate the four hero PNGs.

### Static check for "the suite does not read the version module"

A Playwright test cannot usefully observe its own import graph at runtime, and the scenario's own wording is *inspecting the suite's imports*, so static inspection is the faithful verification, not a workaround:

```
rg -n "from .[^'\"]*data/versions" tests/    # MUST return no matches (exit 1)
```

Rejected alternatives: an ESLint `no-restricted-imports` rule (no linter is configured; adding one is a new dependency and a large scope increase) and a self-reading Playwright test (adds a file under `tests/`, breaking the zero-`tests/`-change target, and is self-referential).

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. The change adds one static typed data module and template bindings; the build performs no network access and no process integration. Shell commands appear only in the verification protocol above, not in the product surface.

## Migration / Rollout

No migration. Single PR, ~35-45 changed lines (`additions + deletions`), well inside the 400-line budget. Rollback is a single revert per the proposal.

## Open Questions

- [ ] **CI enforcement of the no-import guard is deferred, and the residual risk is real.** The `rg` check above runs in the verify phase but is not wired into `.github/workflows/docs-browser.yml`, so a future PR could add the import and land. Wiring it is ~2 workflow lines but edits a surface the proposal does not list as affected. Recommendation: keep the verify-phase check in this change; open a follow-up for CI enforcement. This is stated as accepted residual risk, not a solved problem.
- [ ] **`openspec/config.yaml` is stale and will cause under-verification.** It declares `test_runner.available: false`, `test_command: null`, and `rules.verify.test_command: npm run check`, though Playwright 1.61.0 has landed and `package.json` has no `test` script. Recommended mechanism, in order: (1) `sdd-tasks` MUST record the authoritative verification command set — `npm run check`, `npm run build`, `npx playwright test` — verbatim in `tasks.md`, and the orchestrator MUST pass the same set explicitly in the `sdd-verify` launch prompt, so the verify phase has an in-band source that outranks the stale config; (2) fix `config.yaml` in a separate change. Do **not** bundle a `"test"` script into `package.json` here — it would make the runner look configured while `config.yaml` still declares it absent.
