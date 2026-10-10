# Work Packages

*Last updated: 2026-10-10*

This is the **authoritative source** for work package status. Other documents should link here rather than duplicate this information.

## Status Key

- ✅ Complete — Deliverable exists and is validated
- ⏳ In Progress — Active work
- 📋 Planned — Defined but not started
- ⏸️ Blocked — Waiting on dependency

## Work Packages

| WP | Name | Status | Deliverable | Notes |
|----|------|--------|-------------|-------|
| WP1 | Boundary Definition | ✅ Complete | [sep-boundary-definition.md](./sep-boundary-definition.md) | |
| WP2 | Delegated Agent Analysis | ✅ Complete | [agent-analysis-delegated.md](./agent-analysis-delegated.md) | |
| WP3 | Autonomous Buyer Analysis | ✅ Complete | [agent-analysis-autonomous.md](./agent-analysis-autonomous.md) | |
| WP4 | Multi-Agent Network Analysis | ✅ Complete | [agent-analysis-multi-agent.md](./agent-analysis-multi-agent.md) | |
| WP5 | Interaction Model Design | ✅ Complete | [agent-interaction-models.md](./agent-interaction-models.md) | |
| WP6 | Protocol/Schema Updates | ✅ Complete | Schemas in [schemas/](../../schemas/) | No standalone doc |
| WP7 | Developer Documentation | ✅ Complete | [developer-guide.md](../developer-guide.md) | Reference implementation guide |
| WP8 | Capability Translation | ✅ Complete | [capability-translation.md](./capability-translation.md) | Core matching proven; schemas sufficient for Phase 1 |

## Phase 1b: Enforce the Design

*Agreed 2026-10-10. See the [Phase 1b decision](./decisions.md#decision-phase-1b--enforce-the-design) and the [code review](./analysis/code-review-2026-10.md) for the findings behind each stage.*

| WP | Name | Status | Scope | Review refs |
|----|------|--------|-------|-------------|
| WP10 | A: Make it honest | ⏳ In Progress | Code fixes, approval-status alignment and website content done 2026-10-10 (website branch `progress-and-tax-explainer`). Main repo merged and pushed 2026-10-10. Website content not deployed; folded into the website rework (B16) | C1, C4, S1–S3, P1, P2, P4, M7, M8, M9 (input guards), T6 (input guards), docs |
| WP11 | B: Matcher as thesis | 📋 Planned | Top-k cycle search with per-participant limits; non-overlapping chain selection (capacity, concurrency, concentration); simulation harness with bilateral and money baselines; Imas & Krishnan replication | M1–M6, B11, B12 |
| WP12 | Capability translation for current models | 📋 Planned | Candidate retrieval plus LLM pairwise judgement with caching; vocabulary grows from judgements; prompt-injection hardening; connect to matching | C2, C3, C5, B13 |
| WP13 | C: Enforce the designs | 📋 Planned | Q5 threshold alignment and anti-collusion diversity rule; tier enforcement in matching; Q1 fulfilment signal; Q9 implementation; settle the exposure-unit question | T1–T5, T7, S4, B1, B14 |
| WP14 | D: Protocol on standards | 📋 Planned | A2A alignment note, then protocol rebuild (schema validation at runtime, sender binding and signatures, confirmation tally, edge-derived chain state, failure attribution); mandate-based approvals; tamper-evident audit trail | P3, P5–P7, S5, B6–B8, B10 |

**Order:** WP10 → WP11 (with WP12 alongside) → WP13 → WP14. Website progress updates after WP10 and WP11 (B5).

## Origin

Work packages were originally defined in [agent-integration-plan.md](./agent-integration-plan.md). That document retains the historical context and detailed scope for each WP; this document is the authoritative source for current status.

## Pending Decisions (Not WPs)

These are decision items tracked separately from work packages:

- None currently.

*Resolved 2026-10-10: Deployment Architecture and the rest of the February design set, now Accepted in [decisions.md](./decisions.md#decision-february-2026-design-set-q1q7-q10); Q9 Taxation & Compliance accepted ([decision](./decisions.md#decision-taxation-and-compliance--declared-values-at-the-tax-boundary)).*

## Future Work Packages

| WP | Name | Status | Notes |
|----|------|--------|-------|
| WP9 | Agent Participation Guide | 📋 Planned | How to build agents that participate in SEP. Deferred from WP7 scope — appropriate when a live network or agent integration API exists. |

## Backlog

*Added 2026-10-10 from the [landscape scan](../research/landscape-scan-2026-10.md). Priority: **Soon** = the next few sessions; **Later** = after the Soon items. Items move into a WP once scoped.*

| # | Item | Priority | Depends on | Source |
|---|------|----------|-----------|--------|
| B1 | **Q9 implementation**: `tax_declaration` (with VAT fields) on chain edges; `jurisdiction_profile` and `vat_status` on participants; matcher firewall test; pre-approval VAT position view including unrecoverable VAT; VAT invoice data and settlement statement generation | Soon (in WP13) | — | [Q9 design](../plans/2026-10-10-taxation-and-compliance-design.md) |
| B2 | **Q9 open legal questions**, collected in [tax-adviser-questions.md](./tax-adviser-questions.md) (16 questions): third-party consideration in cycles; UK VAT Notice 700 check; VAT cash settlement in cycles; mixed VAT-registration status; direct tax on barter receipts; deadlock when an agreement is required; whether declaring values erodes the culture | Soon (needs a tax adviser) | B1 | Q9 design § Open Questions |
| B3 | **Q8 Network Bootstrapping** analysis: include "clearing layer on top of surplus platforms" and geographic seeding (Grassroots Economics) options; UK pilot (Q9 D3); use WP11 simulation results | After WP11 | WP11 | Landscape scan §4 |
| B4 | **Live check of the capability extractor** on Haiku 5.5 (`npm run capability:live` with an API key) | Soon | — | 2026-10-10 upgrade |
| B5 | *(done 2026-10-10, awaiting deploy)* **Website update** with a visible, dated progress entry: "why a protocol, not agent haggling"; positioning against AP2/ACP/UCP/x402; current agent capability; difference from trust *scoring*; **tax and VAT explainer** (how it works in practice with the worked cycle example, costs and benefits of declared values, open adviser questions) | Soon | — | Landscape scan §6 |
| B6 | **A2A alignment design note**: SEP messages as an A2A extension, signed Agent Cards, mapping `INPUT_REQUIRED` to human approval | Later | — | Landscape scan §1 |
| B7 | **Mandate-based approval**: model commitment approval on AP2's signed, scoped intent mandates | Later | B6 | Landscape scan §1 |
| B8 | **Tamper-evident audit trail** for approvals and declared values | Later | B1, B7 | UKJT liability statement |
| B9 | **SEP MCP server** (matching, ledger and trust as tools); spine for WP9 | Later | — | MCP 2026-07-28 |
| B10 | **`/.well-known/sep` discovery profile** with pluggable identity (OAuth/SPIFFE, optional DID) | Later | B6 | UCP, IETF/W3C identity work |
| B11 | *(now in WP11)* **Matcher: compare candidate cycles before presenting any** (guard against first-proposal bias); check current behaviour first | Later | — | Magentic Marketplace |
| B12 | *(now in WP11)* **Replicate the Imas & Krishnan barter simulation** through the SEP matcher | Later | — | Landscape scan §2 |
| B13 | **Capability translation threat model**: prompt injection and manipulation via offering text | Later | — | Magentic Marketplace |
| B14 | **Agent diversity** as a governance consideration (monoculture collusion risk) | Later | — | Collusion research |
| B16 | **Website rework**: new visual identity and restructure as one project (current design reads as AI-generated). Brief and design review: website repo `design/2026-10-10-design-review-and-rework-brief.md`. Architectural path: approaches → spec → plan | Soon (next session) | — | 2026-10-10 design review |
| B15 | **Cite Emek & Shpiro** in chain-discovery.md for chain-length caps | Later | — | Landscape scan §3 |

## Related

- [agent-integration-plan.md](./agent-integration-plan.md) — WP definitions and scope
- [open-questions.md](./open-questions.md) — Question lifecycle tracking
- [decisions.md](./decisions.md) — Design decision records
