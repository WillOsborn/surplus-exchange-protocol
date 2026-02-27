# Commitment-Based Accountability Design

*Date: 2026-02-26*
*Status: Approved*

## Problem Statement

The Surplus Exchange Protocol uses subjective value ledgers — each participant maintains their own sense of balance, with no shared currency or network-wide accounting. This avoids valuation disputes and respects that value is contextual.

However, the [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) identified accountability gaps:

1. **Enforcement blind spots** — No shared metrics to detect exploitation
2. **Tax compliance ambiguity** — Authorities require valuations the network doesn't provide
3. **No recovery mechanism** — No basis for claims when exchanges fail

## Reframing the Problem

Through analysis, we identified that the real accountability concern is not **balance** but **commitment fulfilment**:

| Behaviour | Problem? |
|-----------|----------|
| Receiving more than giving | No — this is the system working. Surplus flows to need. |
| Failing to fulfil commitments | Yes — this is a trust violation. |

The farmer analogy: In traditional surplus sharing, the issue was never "you took more corn than you gave" — it was "you said you'd help with the harvest and didn't show up."

**Reframed question**: How do we detect and respond to broken commitments without creating a ledger mentality?

## Design Principles

1. **Track commitments, not balance** — The system cares whether you do what you say, not whether you give as much as you receive

2. **Preserve surplus generosity** — Making balance visible could poison the culture, creating competitive score-keeping instead of generous sharing

3. **Graduated response** — Intervention matches the scope of the issue (bilateral → governance → removal)

4. **Sense and learn, don't auto-enforce** — Patterns trigger investigation, not automatic penalties

5. **Consent matters** — Asymmetric receiving isn't bad if partners don't mind; context determines whether a pattern is problematic

## Design Components

### 1. Commitment Fulfilment Signals

After each exchange completes (or fails to complete), both parties answer:

> **Did they deliver what was agreed?**
> - Yes
> - Partially
> - No

"Partially" and "No" prompt optional context: *"What was different from what was agreed?"*

**Key points:**

- Replaces or refines the existing satisfaction signal (which currently asks about general satisfaction)
- Focuses on the specific commitment made, not subjective satisfaction
- Individual responses remain between participants unless escalated
- Patterns of non-fulfilment surface to governance — balance patterns do not

**Relationship to existing trust model:**

The current trust model ([Layered Trust Without Shared Accounting](../design/decisions.md#decision-layered-trust-without-shared-accounting)) includes Layer 3: Mutual Satisfaction with three options (satisfied / partially satisfied / not satisfied). This design sharpens the question from general satisfaction to commitment fulfilment, making it actionable for accountability purposes.

### 2. Lightweight Escalation Path

When an exchange isn't progressing smoothly, either party can flag it as **"stuck"**.

**Stage 1: Participant Conversation**

- Flag triggers a prompt to both parties: *"This exchange has been flagged as stuck. Can you resolve it together?"*
- Most issues resolve here — misunderstanding, timing, need for clarification
- No governance involvement; no overhead

**Stage 2: Accept Outcome**

- If unresolved through conversation, participants record the outcome
- This becomes a "Partially" or "No" on the fulfilment signal
- Still bilateral — feeds into pattern detection but doesn't escalate

**Stage 3: Escalation**

- If there's a dispute about what was agreed, or repeated issues with the same participant, either party can escalate to governance/operator
- This is where investigation overhead kicks in — only when genuinely needed
- Escalation is a conscious choice, not automatic

### 3. Pattern Detection (Governance View)

The operator or governance body sees aggregate patterns:

**Visible to governance:**

- Participants with repeated "No" or "Partially" fulfilment signals
- Participants with multiple "stuck" flags from different partners
- Participants where multiple partners have escalated

**Not visible to governance (by default):**

- Balance of giving vs receiving
- Who is "contributing more" to the network
- Flow patterns that might encourage ledger thinking

**Graduated response:**

| Pattern | Response |
|---------|----------|
| Single partial/no | Nothing — normal friction in any exchange system |
| Multiple from different partners | Conversation with participant to understand context |
| Repeated pattern after conversation | Formal review by governance |
| Confirmed bad faith | Removal (conscious decision, not automatic) |

**Learning over time:**

The system learns what "normal" looks like. Early on, any pattern might trigger investigation. As the network matures, governance develops judgement about which patterns indicate genuine problems vs normal variation.

### 4. Tax Compliance (Out of Scope)

Tax compliance remains a participant responsibility. The network does not provide valuations.

**Rationale:**

- Subjective value is a core design principle — the network genuinely doesn't know what exchanges are "worth"
- Participants are businesses with existing accounting practices
- Each jurisdiction has different requirements; the network can't solve this centrally
- Attempting to provide valuations would reintroduce currency dynamics

**What the network could provide (future consideration):**

- Guidance documents on how participants might approach tax reporting
- Export of exchange records (what was exchanged, with whom, when) for participant's own valuation
- Templates for common jurisdictions

This is explicitly deferred — not a Phase 1 concern.

## What This Preserves

**Subjective value**: Participants still maintain their own sense of balance. The network doesn't track or display who's "ahead" or "behind."

**Generous surplus culture**: By not making balance visible, we avoid creating competitive score-keeping. People can give freely without worrying about whether they've "given too much."

**Low overhead for normal exchanges**: Most exchanges complete without any friction. The escalation path only activates when something goes wrong.

**Human judgement**: Patterns trigger investigation, not automatic action. Context matters — someone receiving a lot might be a new business building up, not a bad actor.

## Relationship to Other Open Questions

This design affects several downstream questions:

| Question | How This Design Affects It |
|----------|---------------------------|
| **Bad Actor Scenarios** | Detection signals are now defined: repeated non-fulfilment, multiple stuck flags, escalations |
| **Trust & Gatekeeping** | Vouching remains for entry; this adds accountability for ongoing behaviour |
| **Algorithm Transparency** | Matching algorithm doesn't need to factor in balance (only fulfilment patterns affect trust) |
| **Taxation & Compliance** | Explicitly out of scope for network; participant responsibility |

## Open Questions for Implementation

1. **Signal UI**: How do we ask the fulfilment question without making it feel bureaucratic?

2. **Timing**: When does the fulfilment signal get requested? Immediately after exchange? After a cooling-off period?

3. **Stuck flag threshold**: How long before "stuck" becomes an option? Should it be time-based or participant-triggered only?

4. **Governance tooling**: What does the governance dashboard look like? How are patterns surfaced?

5. **Schema changes**: What changes to `exchange-chain.schema.json` or related schemas are needed?

## Summary

The Subjective Value vs Accountability tension is resolved by **reframing accountability as commitment fulfilment rather than balance tracking**.

- The network tracks whether participants do what they say they'll do
- It does not track whether participants give as much as they receive
- This preserves the generous surplus-sharing culture while creating accountability for bad faith behaviour
- Response is graduated and human-judged, not automatic

This maintains the core innovation of subjective value while addressing the legitimate accountability concerns raised in the unintended consequences analysis.

## Related Documents

- [Subjective Value Over Shared Currency](../design/decisions.md#decision-subjective-value-over-shared-currency) — Original decision this design preserves
- [Layered Trust Without Shared Accounting](../design/decisions.md#decision-layered-trust-without-shared-accounting) — Trust model this integrates with
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) — Source of the accountability concerns
- [Open Questions](../design/open-questions.md) — Question #1 that this design addresses
