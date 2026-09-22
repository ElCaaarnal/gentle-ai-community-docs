# Canonical v3.4.0 documentation audit and correction

## Goal

Make the bilingual community wiki traceable to the exact Gentle AI v3.4.0 source snapshot, correcting verified contradictions first and then auditing the remaining published sections without mixing in later `main` behavior.

## Authority

- Local source repository: `/Users/usuarionuevo/work/oss/gentle-ai`
- Exact tag: `v3.4.0`
- Exact commit: `82a6de96ca6e1cb4f6bf603fe0c08ef1c2039833`
- User authorization: proceed with urgent corrections and a complete source audit.

## Scope

- `src/components/DocumentationContentEn.astro`
- `src/components/DocumentationContentEs.astro`
- `tests/docs.spec.ts`
- `docs/audits/gentle-ai-v3.4.0-content-audit.md`
- Additional focused tests only when needed to verify canonical content invariants.

## Constraints

- English and Spanish must change together and preserve shared heading IDs.
- Every factual correction must cite exact v3.4.0 tag evidence in this task or the audit matrix.
- Do not import behavior from `main` or releases after v3.4.0.
- Tests must validate canonical invariants, not only bilingual phrase parity.
- Keep correction units reviewable; do not combine unrelated wording cleanup or visual redesign.
- Publishing, pushing, opening a PR, and merging remain out of scope.
- Commits were created only after the user's explicit authorization.

## Tasks

- [x] T1 — Correct the verified ODD and SDD contradictions in both locales and add truth-focused browser assertions.
  - Acceptance: ODD's seven stages are represented; RDD assessment is explicitly conditional on RDD being enabled; ambiguity alone is not presented as a reason to offer/select SDD; Verify is optional and does not gate Archive; SDD never invokes RDD.
  - Authority: `v3.4.0:docs/usage.md:7-35`, `v3.4.0:docs/intended-usage.md:42-56,210`, and `v3.4.0:README.md:110-124`.
  - Evidence: strict-TDD focused browser assertions failed before the content correction and passed afterward in both Chromium projects; an independent verifier confirmed both locales and Mermaid topology against the exact tag, `npm run check` passed with zero diagnostics, `npm run build` produced two pages and 192 indexed sections, and `git diff --check` passed. The independent verifier could not rerun the focused browser command without either starting the user-declined MCP test server or writing a temporary config; the writer's focused run remains the execution evidence.
  - Commit: `ed0f3cfb4d818967ef9fc2063861854aca38cf38` (`docs(site): align guide with Gentle AI v3.4.0`).

- [x] T2 — Create a section-by-section canonical audit matrix for all published English sections, with Spanish parity tracked by shared IDs.
  - Acceptance: every H2 section is classified as supported, incomplete, contradicted, or intentionally summarized; each nontrivial finding names exact v3.4.0 evidence or an explicit evidence gap.
  - Evidence: created `docs/audits/gentle-ai-v3.4.0-content-audit.md`; a structural check confirmed identical locale H2 sequences, 34 unique shared IDs, and exactly one matrix row per ID. Independent source verification challenged and corrected evidence hierarchy, release bundle/publication distinctions, Pi exceptions, delegation citations, acknowledgement burn semantics, compact-budget formula, and provenance wording. Final bounded recheck passed with no residual blocker; no-index whitespace check produced no diagnostics.
  - Commit: `0ee847cc70c07b9cc11d5c9f5225801f73bf35e6` (`docs(audit): map v3.4.0 content evidence`).

- [x] T3 — Apply the remaining high-confidence factual corrections from the matrix in bounded review units.
  - Acceptance: all confirmed contradicted claims are corrected; mixed-evidence areas remain explicitly classified in the audit rather than guessed.
  - Evidence: three strict-TDD correction units updated both locales and focused assertions: (A) configured TDD, optional output-only research, and mandatory delegation; (B) acknowledgement-before-burn, compact floor-two correction budget, maintenance premise, and glossary; (C) current Pi packages, Gentle Agents ownership, commands, and troubleshooting. Each unit observed focused RED then GREEN in both Chromium projects and passed `git diff --check`. Independent verifiers source-checked every unit against the exact snapshot, required two bounded follow-up fixes, then reported no residual blocker; `npm run check` and `npm run build` passed after each unit with 192 indexed sections and locale ID parity.
  - Residual evidence gaps: incomplete rows in the audit matrix require future focused reconciliation before claiming exhaustive reference coverage; release publication date/assets require release metadata rather than source-tree inference.
  - Commit: `ed0f3cfb4d818967ef9fc2063861854aca38cf38` (`docs(site): align guide with Gentle AI v3.4.0`).

- [x] T4 — Run independent final verification against the exact tag and report residual gaps.
  - Acceptance: independent verifier confirms source fidelity, locale parity, and all configured checks; any blocked or intentionally omitted coverage is explicit.
  - Evidence: `npm run check` passed with zero diagnostics; 49 unit tests passed; production build generated two pages and 192 indexed sections; docs-only Playwright verification passed 38 tests across desktop and narrow Chromium without starting MCP; `git diff --check` and no-index whitespace checks passed; structural assertions confirmed 34 shared H2 IDs in identical locale order and exactly one audit row per ID. Final source readback confirmed both verifier-requested fixes (two Mermaid diagrams only and the pre-2.5.0 `gentle-pi` pin exception). The temporary external Playwright config was removed afterward.
  - Residual gaps: rows marked `incomplete` in the audit matrix are not certified as exhaustive inventories; published release date/assets require release metadata. These are evidence gaps, not newly confirmed source contradictions.
  - Commit: verification evidence covers `ed0f3cfb4d818967ef9fc2063861854aca38cf38` and audit commit `0ee847cc70c07b9cc11d5c9f5225801f73bf35e6`.
  - Native review: lineage `review-cb9a78fbc110ff54` approved the exact five-path candidate; exact acknowledgement completed and burned authority. One readability warning was informational and non-blocking.

## Review workload forecast

- T1 is expected to remain below 300 authored changed lines and form one cohesive correction unit.
- T2 is expected to remain below 300 authored changed lines as a review-facing audit artifact.
- T3 must be split by documentation domain if its forecast exceeds roughly 400 authored changed lines; no code-golf or omission is allowed to fit the budget.

## Progress

- Exact tag identity verified.
- T1 completed and independently source-verified against the exact tag.
- T2 completed with a 34-section evidence matrix and independent challenge/recheck.
- T3 completed in three bounded correction units with independent source verification.
- T4 passed all authorized checks; residual evidence gaps are recorded explicitly.
- Site/tests committed as `ed0f3cf`; audit matrix committed as `0ee847c`.
- Native review approved and exact acknowledgement burned authority.
- Next step: commit this ODD evidence update. No push, PR, or publication has been performed.
