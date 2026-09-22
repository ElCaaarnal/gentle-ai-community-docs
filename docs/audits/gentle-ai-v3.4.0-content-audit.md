# v3.4.0 bilingual content audit matrix

**Answer:** the site has a sound ODD/SDD core, but it must not be treated as a
literal v3.4.0 reference until the confirmed research, TDD, delegation,
RDD-cycle, Pi-package, and version/release discrepancies below are corrected. This matrix covers the 34
shared English/Spanish H2 IDs exactly once; the supplied full source snapshot
is `v3.4.0` / `82a6de96ca6e1cb4f6bf603fe0c08ef1c2039833`.

## How to read this audit

**Evidence hierarchy:** executable tag code and tests > aligned tag docs > tag
manifests/workflows > historical OpenSpec. Stale top-level prose never
outweighs executable tag behavior. “Contradicted” is a confirmed site claim
that conflicts with higher-ranked evidence; “incomplete” is a gap or
unverified breadth; “intentional summary” is useful, bounded simplification.
“Upstream inconsistency” records conflicting tag sources without treating the
weaker source as canonical.

| ID / topic | Verdict | Exact v3.4.0 evidence | Required action |
|---|---|---|---|
| `que-es` — product | supported | `README.md`; `docs/usage.md:7-35` | Keep ecosystem-configurator framing. |
| `instalacion` — installation | incomplete | `docs/quickstart.md:1-60`; `docs/platforms.md` | Recheck platform/package-manager detail before claiming completeness. |
| `contexto` — project context | contradicted | `docs/usage.md:26`; `internal/cli/sync.go:121,194` (`--strict-tdd`) | Replace automatic detectable-test activation with explicit configured Strict-TDD selection. |
| `presets` — components/presets | incomplete | `internal/catalog/skills.go:1-35`; `internal/components` install catalog | Reconcile component and preset inventories with tag catalog. |
| `engram` — memory | incomplete | Partial only: `docs/engram.md`; `README.md` Engram references | Do not treat this as a verified command/tool inventory; reconcile it with the bundled Engram version. |
| `sdd` — workflow | supported | `internal/cli/sdd_preflight_hook.go:21`; `internal/components/sdd/commands_test.go:31-39` | Keep the phase overview; cite tag workflow when expanded. |
| `sdd-research` — evidence lane | contradicted | `internal/components/sdd/commands_test.go:101-104` forbids `gentle-ai.sdd-research-capability/v1`; collector prompt is optional/output-only | Remove admission, capability-grant, persistence, and proposal-gate contract claims; describe optional delegated research only. |
| `openspec` — configuration | intentional summary | `docs/openspec-config.md`; `internal/assets/*/sdd-*.md` | Keep as prompt-level convention; label field-shape conflicts as upstream inconsistency. |
| `tdd` — Strict TDD | contradicted | `internal/cli/sync.go:121,194` (`--strict-tdd`); `internal/tui/screens/strict_tdd.go:20-28` | Replace “detectable tests enable TDD” with explicit configured-mode language. |
| `skills` — registry | incomplete | `internal/catalog/skills.go:1-35`; `docs/skill-registry.md` | Recount and reconcile bundled/base/SDD skill claims. |
| `personas` — personas | supported | `internal/components/persona/inject.go:29`; `internal/assets/*/persona-*.md` | Keep ownership and unmanaged-custom distinction. |
| `ruteo` — organic routing | supported | `docs/usage.md:7-35`; `docs/intended-usage.md:42-56,210` | Keep ODD default and explicit-SDD selection. |
| `delegacion` — stop rules | contradicted | Generated guidance: `internal/components/agentguidance/routing.go:63-64,79-82` | Correct the site’s fresh-review alternative to a mandatory multi-file writer, and replan/explanation alternative to mandatory long-session delegation; then verify all remaining thresholds. |
| `estados` — public states | supported | `internal/sddstatus/status_v2.go:8`; `internal/sddstatus/status.go:274` | Keep `gentle-ai.sdd-status/v2`; cite it as executable status contract. |
| `rdd` — overview | intentional summary | Partial framing only: `internal/providercontractbundle/bundle.go:208-209`; terminal sequencing belongs to `rdd-ciclo` | Retain the high-level ownership summary; do not classify it as the terminal-capture contradiction. |
| `rdd-control` — switch | incomplete | Partial only: `internal/reviewtransaction/rdd_mode.go`; `internal/cli/review_mode_test.go` | Verify every command example and clone/global semantic before treating the control table as canonical. |
| `rdd-ciclo` — atomic cycle | contradicted | `bench/journeys_issue3587.go:16-25`; `internal/reviewtransaction/compact_burn_test.go:106-135` | Replace terminal-capture-immediately-burn language with pending exact acknowledgement. |
| `rdd-lentes` — risk/lenses | incomplete | Partial only: `contracts/review-integration/v2/schemas/*`; `internal/reviewtransaction/compact_reviewer_capture_test.go` | Keep only claims directly reconciled to exact lens-selection and immutable-context evidence. |
| `rdd-correccion` — bounded correction | contradicted | `internal/reviewtransaction/risk.go:234-257`; `compact_floor_two_budget_test.go:14-72` | Use compact `0` for zero lines; otherwise `max(2, min(200, ceil(n/2)))`. Preserve legacy `min(200, ceil(n/2))` for historical/non-compact authority. |
| `rdd-entrega` — delivery | incomplete | Partial only: `internal/providercontractbundle/bundle.go:208-209`; `docs/review-integration.md` | Verify delivery/gate wording against exact tag behavior before retaining it as canonical. |
| `rdd-limites` — trust boundaries | incomplete | Partial only: `docs/review-authority-threat-model.md`; `internal/reviewtransaction/compact_burn_test.go` | Reduce unverified implementation-detail claims or attach exact source citations. |
| `rdd-mantenimiento` — store maintenance | incomplete | Flag support: `internal/cli/review_store_reset.go`; burn/removal: `internal/reviewtransaction/compact_burn_test.go:106-135` | Correct the false “every candidate leaves permanent authority” premise: successful acknowledgement burns/removes it; separately verify retained-path details. |
| `flujo-organico` — ODD flow | supported | `docs/usage.md:7-35`; `docs/intended-usage.md:42-56` | Keep seven-stage flow and configured-TDD wording. |
| `flujo-sdd` — full SDD flow | supported | `README.md:110-124`; `docs/intended-usage.md:210` | Keep optional Verify, Archive behavior, and SDD/RDD separation. |
| `agentes` — agent matrix | incomplete | `docs/agents.md`; adapter directories under `internal/agents/` | Reconcile all 16 capability/config-path rows with adapters. |
| `modelos-delegacion` — delegation models | incomplete | Partial only: `internal/assets`; `docs/agents.md` | Reconcile each runtime/model claim to exact adapter evidence before retaining it. |
| `perfiles` — OpenCode profiles | incomplete | `docs/opencode-profiles.md`; `internal/agents/opencode/` | Validate flags, defaults, and V2 caveats against tag code. |
| `pi` — Pi harness | incomplete | Retired package guidance: `internal/agents/pi/adapter.go:40-57`; old-pin exception: `adapter_test.go:327-348` | Correct retired packages while preserving the old-pin exception; do not assert the command list without exact tag evidence. |
| `cli` — CLI reference | incomplete | `internal/app/app_test.go:418`; `internal/cli/sync.go:121-194` | Regenerate command/flag list from tag help tests; avoid undocumented claims. |
| `backups` — rollback | incomplete | Partial only: `internal/components` backup service/tests | Verify retention, restore, and scope claims against tag implementation. |
| `releases` — release verification | incomplete | Supported intended packaging: `CONTRACT_SEMVER:1` = `1.2.0`; `internal/providercontractbundle/bundle.go:155,292-345` generates eight fixed files plus `orchestration/pi.md` (nine total); `.goreleaser.yaml:60-65` packages the orchestration entry | Keep this generation/package intent separate from release-asset publication; verify actual asset inventory and date from release metadata. |
| `versiones` — version policy | incomplete | supplied snapshot identified as `v3.4.0@82a6de96…`; `docs/quickstart.md:54` still says v2.6.0 | Use the supplied snapshot identity for version context; correct stale quickstart-derived prose and source release date externally. |
| `glosario` — glossary | contradicted | `internal/providercontractbundle/bundle.go:208-209`; `bench/journeys_issue3587.go:16-25` | Redefine approval/burn/receipt terms around acknowledgement-before-burn. |
| `docs` — documentation index | incomplete | Existing task-oriented index: site `#docs`; tag `README.md` documentation links | Audit its links and blanket source-of-truth claim; do not propose a duplicate index. |

## Confirmed contradictions, gaps, and upstream inconsistencies

- **Confirmed contradictions:** `contexto`, `sdd-research`, `tdd`,
  `delegacion`, `rdd-ciclo`, `rdd-correccion`, and `glosario`. These are
  backed by executable tag code/tests or generated guidance, not later `main`
  behavior. `rdd` is an intentional, incomplete overview; `pi` is mixed
  evidence, with retired packages confirmed and commands unverified.
- **Gaps:** all `incomplete` rows need a focused tag-source reconciliation
  before the site makes exhaustive inventories or command semantics claims.
- **Upstream inconsistency:** `docs/architecture/organic-rdd.md` retains stale
  FINALIZE prose. It does not override acknowledgement-before-burn code/tests.
  `openspec` field examples also disagree; preserve the site’s “convention,
  not stable schema” warning rather than inventing a canonical shape.
- **Release metadata:** the supplied snapshot is identified as v3.4.0; its
  extracted directory has no `.git`, so it does not independently prove tag
  provenance or a release date. Source that date from signed release metadata,
  not from `docs/quickstart.md` or other stale prose.

## Prioritized correction backlog (bounded review units)

1. **P0 — lifecycle truth:** correct the RDD cycle, acknowledgement/burn,
   glossary, and exact compact floor-two formula (`rdd-ciclo`,
   `rdd-correccion`, `glosario`); keep `rdd` as a bounded overview.
2. **P0 — routing and TDD truth:** remove retired research admission contracts,
   correct automatic TDD activation, and restore mandatory delegation wording
   (`contexto`, `sdd-research`, `tdd`, `delegacion`).
3. **P1 — generated inventories:** correct Pi’s retired package guidance with
   its old-pin exception, then separately verify Pi commands, CLI, agent,
   skill, preset, and profile inventories (`presets`, `skills`, `agentes`,
   `perfiles`, `pi`, `cli`).
4. **P1 — bounded source checks:** validate installation, Engram, control,
   lens, delivery, maintenance, backups, and trust-boundary detail
   (`instalacion`, `engram`, `rdd-control`, `rdd-lentes`, `rdd-entrega`,
   `rdd-limites`, `rdd-mantenimiento`, `backups`).
5. **P2 — release/index hygiene:** source signed release metadata and audit the
   existing task-oriented index (`releases`, `versiones`, `docs`).

## Structural verification

The accompanying read-only check must extract `<h2 id>` values from both locale
files, compare their ordered shared set with matrix first-column IDs, and
assert 34 IDs with count one each. Validate this untracked file with `git diff
--no-index --check /dev/null docs/audits/gentle-ai-v3.4.0-content-audit.md`;
exit 1 is expected for a clean non-empty diff, but whitespace diagnostics are
not.
