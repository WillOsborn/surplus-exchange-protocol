# Bad Actor Scenarios Design

*Date: 2026-02-26*
*Status: Approved*

## Problem Statement

Q6 asks: How do we handle malicious or exploitative participants?

Seven bad actor types were identified in [open-questions.md](../design/open-questions.md): free riders, quality cheats, data harvesters, reputation manipulators, collusion rings, Sybil attacks, and trust model temporal lag exploitation.

## Finding: Q1-Q5 Already Covers Most Scenarios

Mapping each bad actor type against decisions from Q1-Q5 reveals that the existing framework handles most scenarios through three reinforcing layers:

1. **Structural prevention** — exposure limits, bilateral-only newcomer tier, concentration limits, diversity preferences
2. **Detection** — fulfilment signals, behaviour monitoring, network health metrics
3. **Response** — graduated, human-judged, from conversation to removal

### Coverage Map

| Bad Actor Type | Addressed By | Gap? |
|---|---|---|
| **Free riders** (receive much, give little) | Q1: Not a problem — surplus flows to need. Only broken commitments matter. | None |
| **Quality cheats** (deliver less than promised) | Q1: Commitment fulfilment signals, graduated escalation, pattern detection | None |
| **Reputation manipulators** (game trust metrics) | Q5: Bilateral-only newcomer tier (farming slow/conspicuous), partner diversity requirement, satisfaction reciprocity monitoring | None |
| **Collusion rings** (coordinated exploitation) | Q5: Bilateral-only newcomer tier (blast radius = 1), partner diversity requirement. Q2: Concentration limits, relationship diversity preferences | None |
| **Sybil attacks** (shell participants) | Q5: Bilateral-only newcomer tier, identity verification, partner diversity requirement catches self-dealing | None |
| **Data harvesters** (competitive intelligence) | Partially — Q5 adversarial testing identified as "most realistic threat" | **Addressed below** |
| **Temporal lag exploitation** | Largely handled — Q1's per-exchange signals catch problems quickly, Q5's bilateral newcomer tier limits early damage, network position decay prevents coasting | Minor |

### Sub-question Coverage

| Sub-question | Addressed? |
|---|---|
| Detection signals for each type? | Yes — Q1 (fulfilment signals), Q2 (behaviour signals), Q5 (network health metrics) |
| Proportionate response mechanisms? | Yes — Q1's graduated model applies to all types |
| In-flight exchanges when bad actor identified? | **Addressed below** |
| Can responses be gamed? | **Addressed below** |

## Three Genuine Gaps

The remainder of this design addresses three items not covered by Q1-Q5.

### 1. Data Harvesting / Competitive Intelligence

A legitimate business joins to learn about competitors' capacity, relationships, and availability patterns. They pass every identity check because they *are* a real business.

#### The existing architecture is the primary defence

The matching algorithm sees everything; participants see only what's relevant to their own exchanges. This is already how SEP works — AI-mediated matching is the core mechanism. Participants describe their surplus and needs; the algorithm finds chains. There is no catalogue to browse.

This means a would-be data harvester would have to:

1. Fabricate needs matching their competitor's surplus
2. Get proposed into chains with them (the algorithm decides, not them)
3. See only what the competitor has *surplus* of — not their core business, pricing, or client relationships
4. Then decline those chains, creating a suspicious pattern

That's significant effort for very low-value intelligence. Surplus capacity reveals almost nothing about a competitor's core offering, pricing, or client base.

#### Information visibility by relationship

| Relationship to chain | What's visible |
|---|---|
| Proposed into the same chain | Full offering details, identity, availability — needed to evaluate the exchange |
| Completed exchange partner | Historical record of exchanges with them — not their other activity |
| General discovery | Anonymised capability categories, no identity, no timing details |
| No relationship | Nothing beyond aggregate network statistics |

#### Anomalous access detection

Even within appropriate visibility, some patterns suggest intelligence gathering:

- Repeatedly declining proposed chains (seeing details, then opting out)
- Disproportionate ratio of chains viewed to chains completed
- Decline patterns concentrated on participants in the same sector

These are soft signals — declining chains is normal. Persistent patterns, especially sector-concentrated, warrant attention via Q1's graduated approach: pattern, conversation, review.

#### What this does NOT do

- Prevent a participant learning about their exchange partners. Inherent to any exchange.
- Prevent legitimate competitive awareness from participating in the same network. That's a feature, not a bug.
- Add identity-based restrictions ("competitors can't be in the same network"). Contradicts Q5's openness principle.

The goal is preventing *systematic harvesting* — joining primarily to gather intelligence rather than to exchange.

### 2. In-Flight Exchange Handling

When governance identifies a bad actor, that participant may have active exchanges in progress. Other participants have made commitments and may have already started delivering.

#### Design principle

**Protect the innocent parties; don't make the response worse than the problem.** This follows from Q5's failure attribution fix — participants shouldn't be penalised for things outside their control.

#### Three stages, matching Q1's graduated response

**Stage 1: Investigation (participant flagged, not yet actioned)**

No disruption. The participant remains active while governance has the conversation. Q1 established that patterns trigger conversation, not automatic penalties. Most investigations won't lead to removal.

**Stage 2: Confirmed — graceful wind-down**

If governance confirms bad faith and decides on removal:

| Chain state | Action |
|---|---|
| Active with committed deliverables | Participant completes current commitments (or a short deadline is set). Removal takes effect after current chains resolve. |
| Proposed but not yet started | Cancelled. Partners notified and re-entered into matching for the next cycle. |
| Bad actor already received but not yet delivered | See below. |

**Stage 3: Emergency removal (rare)**

For cases where continued participation creates active harm (e.g., discovered fraud):

- All chains involving the participant frozen immediately
- Partners notified: "A participant in this chain is no longer active. This does not affect your standing."
- Frozen chains assessed individually — can remaining participants complete a shortened chain, or should it be cancelled?
- Q5's failure attribution protection applies — no innocent party's record is affected

#### The hardest case: bad actor received but hasn't delivered

The surplus context softens this significantly. What was given was surplus — capacity that would otherwise have gone unused. The innocent party isn't out of pocket; they're back where they started. Disappointing, not damaging.

The response is proactive support, not compensation:

- The operator reaches out, acknowledges what happened
- Actively prioritises finding a replacement match for the participant's unmet need
- No pretence of "making it whole" — this is the network doing what it does (matching needs to surplus), with extra attentiveness

This isn't a refund mechanism. It's the network demonstrating it has the participant's back — turning a negative experience into one where they feel supported.

#### What participants see

- If their chain is disrupted: notification that a participant is no longer active, their chain is cancelled or restructured, and their standing is unaffected
- They don't see the reason for removal (privacy, avoiding gossip dynamics)
- They do see that their record is unaffected

### 3. Response Gaming

Any accountability system can be weaponised. Three scenarios examined:

#### 3a. Weaponised complaints

A participant files false "stuck" flags or dishonest fulfilment signals to damage someone.

**Why this is limited by existing design:**

- Q1's fulfilment signals are bilateral — both parties answer. A single dishonest signal contradicted by the other party is a dispute, not a pattern.
- Q1's graduated response requires multiple signals from different partners before triggering even a conversation. One bad report does very little.
- The complainant's own pattern is visible to governance.

**Addition:** Governance explicitly monitors complainant patterns alongside respondent patterns. A participant who is disproportionately the *source* of complaints gets the same graduated attention as one who *receives* them.

#### 3b. Coordinated reporting

Multiple participants collude to file false complaints, manufacturing the "multiple signals from different partners" pattern.

**Why this is harder than it sounds:**

- Each complainant needs an actual exchange with the target (can't complain about someone you've never exchanged with)
- The matching algorithm controls pairings — colluders can't guarantee they'll be matched with the target
- Coordinated complaints about the same participant in a short window is itself a detectable pattern, distinct from organic complaints which tend to be sporadic

**Addition:** When multiple complaints arrive about the same participant in a compressed timeframe, governance investigates the complaints themselves — not just the target, but the sources. Same "sense and learn" principle from Q1, applied symmetrically.

#### 3c. Strategic escalation as harassment

A sophisticated actor repeatedly creates exchanges with a target, then flags them as stuck.

**Why this is limited by existing design:**

- Q2's relationship diversity preferences mean the algorithm won't repeatedly match the same pair
- Q5's matching concentration limits prevent disproportionate chain participation
- After 1-2 unfounded escalations, governance recognises the pattern

**Addition:** Unfounded escalations — where governance investigates and finds no issue — are noted against the escalator, not the target. Repeated unfounded escalations are themselves a behaviour pattern subject to Q1's graduated response.

## Summary of Additions

The new mechanisms are light because the existing framework is robust:

| Gap | Primary Defence (Q1-Q5) | Addition |
|---|---|---|
| Data harvesting | Algorithm-mediated discovery limits visibility to own exchanges | Anomalous access detection (decline patterns, view/complete ratios) |
| In-flight exchanges | Q5's failure attribution protects innocent parties | Graceful wind-down protocol; proactive replacement matching; surplus-framing in communication |
| Response gaming | Q1's multi-signal threshold; Q2's diversity preferences | Symmetric complainant monitoring; compressed-timeline detection; unfounded escalation tracking |

## What This Preserves

- **Q1's graduated, human-judged response** — extended, not replaced
- **Q5's structural limits** — the primary bad actor defence
- **Subjective value principle** — no balance tracking introduced
- **Openness principle** — no identity-based restrictions added
- **Surplus framing** — the baseline-is-zero philosophy directly softens the hardest case

## Relationship to Prior Questions

| Question | Connection |
|---|---|
| **Q1** (Accountability) | Q6 extends Q1's graduated response to cover complainant patterns and in-flight handling. No changes to Q1's design. |
| **Q2** (Enterprise Capture) | Q2's concentration limits and diversity preferences are primary defences against collusion and strategic escalation. No changes to Q2's design. |
| **Q3/Q4** (Deployment/Federation) | In-flight handling and response gaming are operator responsibilities under Q3's governance commitments. |
| **Q5** (Trust & Openness) | Q5's newcomer tier, failure attribution, and network health metrics are primary defences against most bad actor types. No changes to Q5's design. |

## Effects on Downstream Questions

| Question | How This Design Affects It |
|---|---|
| **Q7: Algorithm Transparency** | Information visibility tiers (Section 1) define what participants can and cannot see about matching. Anomalous access detection adds a new monitoring dimension. |
| **Q8: Network Bootstrapping** | In-flight handling protocol (Section 2) is especially important during bootstrapping when losing even one participant from a small network has outsized impact. |

## What This Design Does NOT Resolve

1. **Legal framework for removal** — What contractual basis allows the operator to remove a participant? Terms of service design is an implementation question.
2. **Exact detection thresholds** — How many declined chains trigger anomalous access investigation? What constitutes a "compressed timeframe" for coordinated complaints? These need calibration with real data.
3. **Cross-operator intelligence sharing** — If federation eventually happens, should operators share information about removed bad actors? Privacy and competitive dynamics make this complex.

## Philosophy Check

**Checked against**: All 8 principles, all 7 tensions, the insight, the scope, and the horizon.

**Result**: Supports philosophy. Aligned with all 8 principles.

**Key assessments**:
- **The Scope (surplus focus)**: The surplus framing directly softens the hardest bad actor scenario — what's lost was surplus, so the baseline is zero
- **Principle 1 (subjective value)**: No balance tracking introduced. All detection is about behaviour patterns, not exchange value
- **Principle 6 (trust through relationships)**: Information visibility tiers respect that trust is earned through exchange relationships, not browsing access
- **Principle 7 (human accountability)**: All response decisions remain human-judged. No automatic penalties for any bad actor type, including response gaming

## Related Documents

- [Commitment-Based Accountability Design](2026-02-26-commitment-based-accountability-design.md) — Q1 design (graduated response framework)
- [Peer Exchange Protection Design](2026-02-26-peer-exchange-protection-design.md) — Q2 design (structural prevention, behaviour monitoring)
- [Deployment & Federation Design](2026-02-26-deployment-and-federation-design.md) — Q3/Q4 design (governance commitments)
- [Trust and Openness Design](2026-02-26-trust-and-openness-design.md) — Q5 design (newcomer tier, failure attribution)
- [Trust Gatekeeping Research](../design/analysis/2026-02-26-trust-gatekeeping-research.md) — Adversarial testing findings
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) — Source analysis
- [PHILOSOPHY.md](../../PHILOSOPHY.md) — Project philosophy
