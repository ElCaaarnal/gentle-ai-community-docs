# Proposal: Single-Source Channel Version Facts

## Intent

Issue #30: live release facts are hand-maintained prose duplicated across both locale files, so every release edits the same values in four places and any missed edit ships as silent drift. Make the four live facts authoritative in one locale-invariant typed module and bind them where they render.

This change lowers the **cost** of a release edit. It does not resolve the **forgetting** that issue #30 also describes; the staleness detector is deliberately deferred (see Out of Scope), so #30 is not fully closed by this change.

## Scope

### In Scope
- New `src/data/versions.ts`: four recorded facts (`stable.version`, `stable.released`, `prerelease.version`, `prerelease.released`) plus one derived `prereleaseInstall` string, using the repo's `as const satisfies` precedent.
- Hero version chips and channel-table rows in `DocumentationContentEn.astro` and `DocumentationContentEs.astro` bind the module; authored labels stay in place.
- Two ADDED spec-delta requirements.

### Out of Scope
- The 14 delta pills and retirement prose — their lifecycle is deletion, not update.
- Immutable historical references (v1.47.0, v2.1.6, v2.2.0, v2.0.0, v1.15.3, v1.11.0).
- The warn box and closing paragraph — prose arguments, not data.
- Normalizing the ES `{<>…</>}` wrapper.
- The scheduled staleness checker (`check:versions`) — **deferred to a named follow-up issue**, with its own unresolved decisions (API rate limits, pagination, failure semantics).
- Extracting shared `<VersionChips>` / `<ChannelTable>` components — named follow-up.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `docs-content-presentation`: ADDED **Single-source channel version facts** — both locales render live channel facts from one locale-invariant typed module; no version sentence is produced by concatenation.
- `docs-browser-verification`: ADDED **Independent version literals** — the suite asserts hardcoded version literals and MUST NOT import the module, preserving double-entry verification.

## Approach

`src/data/versions.ts` as a sibling of `src/i18n/`. Locale-invariant data is a different concern from `site.ts`, which is `Record<Locale, …>` and would force duplicating each string per locale, recreating the drift. Each locale component imports it directly in frontmatter — version facts have no per-call-site variance, so prop-threading adds a hop for nothing. EN gains a new frontmatter fence; ES already parses as a JSX fragment expression. `@latest` and `@main` stay literal constants.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/data/versions.ts` | New | Four facts plus one derived install string |
| `src/components/DocumentationContentEn.astro` | Modified | New frontmatter fence; chips + table rows bound |
| `src/components/DocumentationContentEs.astro` | Modified | Fence filled; chips + table rows bound |
| `openspec/changes/.../specs/` | New | Two delta requirements |
| `tests/`, `*.png` | Unchanged | Target outcome: zero changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hero pixel baselines regenerate (4 PNGs; Linux pair only via `workflow_dispatch update_snapshots`) | High | Require byte-identical hero HTML; diff `dist/index.html` and `dist/es/index.html` against a pre-change build |
| Per-locale whitespace divergence (EN template mode vs ES JSX fragment; `compressHTML` broke this repo once) | Medium | Diff **both** built files, never just one |
| Partial drift survives by design | High | Accepted and stated; prose surfaces stay hand-written |
| Scope creep toward the ES wrapper or the checker | Medium | Explicit Out of Scope |
| `openspec/config.yaml` is stale (`test_command: null` though Playwright landed) | Low | Flagged for a separate change; not fixed here |

## Rollback Plan

Revert the single PR: delete `src/data/versions.ts`, restore the literal version strings and the EN file's fence-free head, drop the two delta specs. No data migration, no config change, no baseline regeneration to undo. Confirm with `npm run check`, `npm run build`, and `npx playwright test`.

## Dependencies

- None. No new packages, no tsconfig change, no build-time network.

## Success Criteria

- [ ] Hero region renders byte-identical HTML in both locales; zero changes under `tests/` and zero `.png` changes.
- [ ] `npm run check` reports 0 errors / 0 warnings / 0 hints.
- [ ] `npx playwright test` stays at 28 passing.
- [ ] Tests keep hardcoded version literals and do not import the module.
- [ ] Both locales stay aligned by canonical heading ID, not line number.
- [ ] A release update touches exactly one file for the four live facts.
