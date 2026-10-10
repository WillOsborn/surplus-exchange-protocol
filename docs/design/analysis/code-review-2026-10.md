# Code and Design Review: October 2026

**Date**: 2026-10-10
**Scope**: Whole repository: `src/` (about 6,000 lines excluding tests and generated types), schemas and examples, design documents, plus the changes made on 2026-10-10
**Method**: Three parallel reviews (matching; trust and protocol; schemas, capability and documentation coherence), each checked with probe scripts against a fresh build, then spot-checked and put together by the lead reviewer. "Confirmed" means the finding was reproduced by running code.
**Baseline**: Build, schema validation, example validation and all 255 tests pass.

---

## Verdict

**The thinking is strong. The code is a readable sketch that does not yet enforce that thinking.**

The design work (philosophy, historical research, and the Q1–Q7 and Q10 designs) is careful and self-aware. The reference implementation looks complete, with demos running and tests passing, but most of the properties the designs rely on are not actually guaranteed:

- **Matching**, which is SEP's central claim, returns the first cycles found rather than the best. It ignores per-participant chain limits (so newcomers are not limited to two-party exchanges) and doesn't stop one participant being committed to several chains at once.
- **The protocol** can't commit a chain through messages, has no authentication, and has no handling for partial failure.
- **Trust** is a set of separate calculators: callers state their own tier and vouch status, and a ring of colluding accounts can promote itself.
- **Several approved designs** (Q1's fulfilment signal, Q5's thresholds, Q7's concentration caps) are either not implemented or contradicted by the code.

"Phase 1: 100% complete" is accurate for the original Phase 1 scope (schemas, a reference sketch, documentation). It hides a large backlog of designed-but-unbuilt behaviour, and a few public claims are false: the developer guide says the cycle finder uses Johnson's algorithm, and newcomers are described as limited to two-party exchanges.

None of this is unusual for a proof of concept. It matters because **the matcher is the thesis**. The 2026 research (Imas & Krishnan) shows that emergent agent barter fails; SEP's answer is a designed clearing mechanism. Today that mechanism is the weakest part of the code.

---

## Findings by Area

### Matching (`src/matching/`)

| # | Finding | Severity | Evidence |
|---|---|---|---|
| M1 | **Results are the first found, not the best.** The search stops at `maxResults` in search order and only then sorts. Every chain the demo shows starts from the same participant (Harrison→Savour), which reproduces the "Meridian" concentration scenario the designs tried to prevent. | High | Confirmed; [cycles.ts:73-101](../../../src/matching/cycles.ts#L73-L101) |
| M2 | **Per-participant chain limits aren't enforced.** A newcomer (max 2) appears in a five-party cycle; PrintCraft (max 3) appears in a five-party chain in the demo. Nothing in matching imports `TIER_EXPOSURE_LIMITS`. | High | Confirmed; `graph.ts:38`, `cycles.ts:124` |
| M3 | **No selection of non-overlapping chains.** Overlapping cycles are returned (Harrison is in all top 10). There are no capacity, concurrency or concentration checks. | High | Confirmed; `chain-scorer.ts:295-309` |
| M4 | **Brute-force search, not Johnson's algorithm.** 50 participants at chain length 8 hit 1 million results in 16 seconds. The developer guide's claim is false. | Medium | Confirmed |
| M5 | When two edges connect the same pair, whichever was added first wins, even if it is weaker. | Medium | Confirmed; `cycles.ts:154-158` |
| M6 | Chain trust uses the weakest participant's reliability rather than multiplying reliabilities, so 8 × 0.8 scores the same as 2 × 0.8. The length penalty is negligible. | Medium | `chain-scorer.ts:165-213` |
| M7 | The timing score goes up and down instead of improving consistently, and expired offerings score 1.0. | Medium | Confirmed; `scorer.ts:340-362` |
| M8 | Matching on substrings in both directions gives false positives: "ai" matches "email marketing", and "UK" matches "Ukraine", which defeats the geographic deal-breaker. | Medium | Confirmed; `scorer.ts:252, 410, 536` |
| M9 | Weights aren't normalised (scores above 1 are possible), invalid trust scores are treated as safe, and placeholder scorers (timing, geography, capacity) still carry weight. | Low | Confirmed |

### Protocol (`src/protocol/`)

| # | Finding | Severity | Evidence |
|---|---|---|---|
| P1 | **A chain can't be committed through messages.** Every "confirm" is mapped to a first confirmation, so the second one is rejected. | High | Confirmed; [message-handler.ts:216-221](../../../src/protocol/message-handler.ts#L216-L221) |
| P2 | **A new proposal with an existing chain ID silently replaces the chain**, including one that is already executing. | High | Confirmed; `message-handler.ts:183` |
| P3 | **No authentication.** Signatures are never checked, the sender is never matched to the participant it claims to be, and chain membership isn't checked. This contradicts `docs/specs/security-integration.md`. | High | Confirmed |
| P4 | A decline sent as the first response to a proposal is rejected. | Medium | Confirmed; `state-machine.ts:64-68` |
| P5 | Partial failure isn't handled: one failure fails the whole chain, compensation is only a label, reservations leak when a chain is cancelled or fails, and an edge can wait forever after delivery. | Medium | Confirmed |
| P6 | Duplicate detection relies on IDs the sender chooses, so an attacker can suppress a legitimate message by using its ID first. | Medium | Read |
| P7 | No message is validated against its schema at runtime, and only 2 of 11 message types are handled. | Medium | Read |

### Trust (`src/trust/`)

| # | Finding | Severity | Evidence |
|---|---|---|---|
| T1 | **A ring of four colluding newcomers reaches Established in 30 days** by rating each other, then vouches in more accounts, so the ring grows geometrically. | High (design and code) | Confirmed |
| T2 | **Thresholds contradict the approved Q5 design.** Newcomer promotion needs 2 partners, 14 days and no satisfaction floor (Q5: 3 partners, 80%, 30 days). Chain caps are 3/5/8 (Q5: 4/6/up to 12). | High | Confirmed; `tiers.ts:93-100`, `exposure.ts` |
| T3 | The vouching sponsor's tier comes from the caller and is never checked, and self-vouching is allowed. | High | Confirmed; `vouching.ts:193-251` |
| T4 | 120 exchanges, all disputed, still give a score of 0.60 (Established), because disputes are never read. | Medium | Confirmed; `calculator.ts:163-191` |
| T5 | The "at risk of demotion" flag can never be true: the grace band is dead code, so tiers flip back and forth around thresholds. | Medium | Confirmed; `tiers.ts:200-267` |
| T6 | Invalid or negative inputs pass exposure checks, and escrow isn't enforced. | Medium | Confirmed; `exposure.ts:143-203` |
| T7 | **Design tension:** exposure is measured in shared numeric "exchange units". That is a shared measure of value, which sits awkwardly with Principle 1 and will meet Q9's declared values. | Design | Read |

### Schemas, validation and capability

| # | Finding | Severity | Evidence |
|---|---|---|---|
| S1 | `createValidator()` can't compile the project's own schemas (it uses the wrong Ajv build). | High | Confirmed; `validate.ts:28-38` |
| S2 | **The match demo's participant data fails its schema** (an invalid `sub_type` value), and `validate:examples` never checks participant, offering or matching data. | High | Confirmed |
| S3 | `src/schemas/index.ts` is written by hand and copies enums instead of re-exporting the generated types. This is the root cause of the known `TrustTier` issue. | Medium | Confirmed |
| S4 | Q1's "Did they deliver what was agreed?" signal was never applied. The schemas and code still use `satisfied`/`partially_satisfied`, and a partial delivery counts as fully satisfied. | Medium | Confirmed |
| S5 | Message schemas are inconsistent: there is no counter-proposal message, a non-standard `discriminator` keyword, and a `version` that isn't a JSON Schema keyword. Header and payload fields are mixed together, which would block a clean A2A mapping. | Medium | Read |
| C1 | **Introduced on 2026-10-10:** the leftover code-fence stripping in the extractor breaks valid structured JSON whenever a reasoning string contains a triple backtick. | Medium | Confirmed; [extractor.ts:140-160](../../../src/capability/extractor.ts#L140-L160) |
| C2 | User input is placed in the prompt inside plain quotes, so input can inject instructions (limited by the term-ID enum, but confidence and reasoning still feed matching). | Medium | Read |
| C3 | An interrupted write to the feedback store loses all history, with no atomic write or backup. | Medium | Read; `feedback.ts:47-80` |
| C4 | The live demo writes users' free text to a file tracked in git. | Medium | `capability-demo.ts:39` |
| C5 | The 15-term vocabulary is sent whole in every prompt. There's no retrieval, no caching, and the capability module isn't connected to matching. | Design | Read |

### Documentation coherence

- **Approval status contradicts itself across documents.**
  - The Q1–Q6 and Q10 plan files say "Approved".
  - `decisions.md` has no entries for them and lists Deployment as "Proposed".
  - `work-packages.md` and `STATUS.md` say Deployment is "decision pending".
  - Under `open-questions.md`'s own rule (a question is resolved only once `decisions.md` says Accepted), all of these are still open.
- **Stale figures:** test count (252 → 255), "Known Issues: None", "8 design documents" (now 12), and the developer guide's `scoreMatch` signature.

### Designed but not implemented (from the approved February designs)

- Q1: fulfilment signal, "stuck" flag, escalation states
- Q2/Q7: relationship-diversity weighting, participation discount, concentration hard cap, decision logging, match audit messages, algorithm changelog, governance events
- Q5: thresholds (see T2), failure attribution, 180-day decay, anchor activity requirement, cross-cluster incentive
- Q6: staged removal, chain freezing, partner notification
- Q3/Q4: trust attestation format, portable identity
- The governance and monitoring service as a whole

---

## Strategic View

### 1. Make the matcher the centrepiece

The research since March makes this the decisive component. Rework it as:

- enumeration that pushes per-participant chain limits into the search itself, not checked afterwards
- keeping the best N results in a priority queue rather than stopping at the first N found
- a **selection stage** that chooses a set of non-overlapping chains, applying capacity, concurrency and concentration limits. Kidney exchange solves this same problem (cycle packing with length caps) using integer programming; a greedy packing is enough for a proof of concept.

For networks of 500+ participants, search outward from each participant with a depth limit, or search incrementally around new offerings, rather than enumerating every cycle.

### 2. New direction: a simulation harness that produces evidence

SEP has only ever matched 7 participants. The February consolidated review already noted there was no validation strategy. Build synthetic economies of 50 to 5,000 businesses and measure:

- clearing rate (the share of needs met)
- concentration
- how well newcomers are included
- robustness to collusion

Compare against bilateral barter (the Imas & Krishnan baseline) and a money baseline. This:

- turns the website's argument into evidence, which also makes progress visible
- calibrates the Q5 and Q7 thresholds, which are currently guesses
- tests the trust design against collusive rings (T1)

Current models also make **LLM-driven synthetic participants** practical, so the human-approval and negotiation layers can be tested too.

### 3. Rethink capability translation for current models

The 15-term vocabulary is the bottleneck, and it isn't connected to matching. With Haiku 5.5 at $0.10 per million input tokens, a different design becomes affordable and still meets Principle 8:

- cheap candidate retrieval (keywords or embeddings)
- an LLM judges each candidate pairing ("can this offering meet this need, and what's missing?"), with results cached
- the vocabulary emerges *from* those judgements rather than being a prerequisite *for* them

This removes the scaling ceiling and turns the "seed → canonical" idea into something real.

### 4. Rebuild the protocol on the standards, not by patching

Fix the commit path now so the trace demo is honest (P1, P2, P4). Beyond that, don't patch the hand-written state machine piece by piece. Decide A2A alignment (backlog B6) first, then rebuild with:

- messages validated against the schemas
- senders tied to who they claim to be, with signatures
- a confirmation tally per chain
- chain state worked out from the state of its edges
- failure attributed to a specific edge

### 5. Treat trust gaming as a design problem, not just a code fix

The colluding ring (T1) works within the spirit of the current Q5 rules, not just the code. Relationship-based trust needs a **diversity requirement** for promotion: some exchanges must be with partners outside your cluster. Q5 mentions a cross-cluster incentive; it needs to be a hard requirement. The exposure-unit tension (T7) should be settled alongside Q9.

### 6. Be honest about where the project stands

Reframe the phases. Phase 1 (design plus reference sketch) is complete; **Phase 1b makes the reference enforce the design, before Phase 2 (Delegation) begins.** Fix false claims now. Publishing that candidly in the website's progress update builds credibility rather than costing it.

---

## Proposed Sequencing

| Stage | Content | Size |
|---|---|---|
| **Stage A: Make it honest** | Quick fixes: C1, S1, S2, S3, C4, P1, P2, P4, M7, M8, invalid-input guards; documentation corrections and status alignment | 1–2 sessions |
| **Stage B: Matcher as thesis** | Matcher rework (§1) plus the simulation harness (§2), including the Imas & Krishnan replication (B11, B12) | 3–5 sessions |
| **Stage C: Enforce the designs** | Q5 alignment and anti-collusion rule, tier enforcement in matching, Q1 fulfilment signal, Q9 implementation (B1) | 2–4 sessions |
| **Stage D: Protocol on standards** | A2A design note (B6), then protocol rebuild (§4), mandate-based approvals (B7), audit trail (B8) | 3–5 sessions |
| **Website** | After Stage A (candid status and research) and again after Stage B (evidence) | Per stage |

Capability translation (§3) can run alongside Stage B, since the simulation needs a translation step that scales.
