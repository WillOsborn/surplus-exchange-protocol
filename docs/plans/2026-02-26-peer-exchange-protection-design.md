# Peer Exchange Protection Design

*Date: 2026-02-26*
*Status: Approved*

## Problem Statement

The Surplus Exchange Protocol is designed for professional services peers exchanging surplus. However, the [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) identified that the features enabling scale may attract enterprise procurement teams who use the system differently — extracting capacity from smaller suppliers rather than exchanging as equals.

Three capture dynamics were identified:

1. **Power asymmetry** — Large firms using SEP to squeeze smaller suppliers; "surplus" becomes a euphemism for on-demand free work from dependents
2. **Mission drift** — Enterprise revenue/adoption gradually reshapes SEP's features and priorities until it's procurement software
3. **Matching dominance** — Large firms with diverse needs/offerings appear in most exchange chains, becoming unavoidable hubs

These are facets of the same structural problem: features that enable scale attract users whose interests diverge from peer exchange.

## Reframing the Problem

The question as originally stated — "Should we actively limit enterprise/procurement use?" — frames this as a gating decision about *who* participates. But Q1 (Commitment-Based Accountability) established a pattern: accountability is about behaviour, not identity.

**Q1's farmer analogy**: The issue isn't "you took more corn than you gave" — it's "you said you'd help with the harvest and didn't show up."

**Q2's equivalent**: The issue isn't "you're too big to be here" — it's "you're treating peers as suppliers rather than exchanging as equals."

### Reframed question

> How do we ensure all participants — regardless of size — engage as peers exchanging surplus, rather than as buyers extracting capacity from dependents?

### What "peer exchange" actually means

Three properties distinguish peer exchange from procurement:

| Property | Peer Exchange | Procurement Behaviour |
|----------|--------------|----------------------|
| **Directionality** | Bidirectional over time — sometimes giving, sometimes receiving | Consistently one-directional with the same partners |
| **Surplus genuineness** | Capacity that would otherwise go unused | Scheduled or pre-committed capacity routed through SEP |
| **Relationship character** | Exchanging as equals with mutual benefit | Extracting from dependents who feel unable to refuse |

The design protects these three properties without defining "enterprise" or imposing size-based exclusions.

## Design Principles

1. **Behaviour not identity** — The system cares how you participate, not how large you are
2. **Prevent before detect** — Structural constraints that make procurement dynamics difficult, not just detection after they occur
3. **Graduated and human-judged** — Consistent with Q1's approach; patterns trigger conversation, not automatic penalties
4. **No procurement features** — Prevention by omission; don't build the tools that enable drift
5. **Culture from day one** — Early adopter norms shape network character; don't compromise them for speed

## Design Components

### 1. Structural Prevention (Leading Indicators)

These mechanisms prevent procurement dynamics before they need to be detected.

#### 1a. Matching Concentration Limits

No single participant appears in more than a defined percentage of active exchange chains within a rolling window.

- **Why it works**: Procurement behaviour requires being in many chains simultaneously (extracting from multiple suppliers). A concentration ceiling makes hub-and-spoke patterns structurally impossible.
- **Why it's not punitive**: A participant hitting the limit simply isn't included in *additional* chains until existing ones complete. They're not penalised — they're full.
- **The threshold**: Governance-set, adjustable as the network grows. Exact number is an implementation question, not a design one.

#### 1b. Relationship Diversity in Matching

The matching algorithm preferences chains that create *new* exchange relationships over chains that repeat existing ones.

- **Why it works**: Procurement behaviour relies on stable, one-directional supplier relationships. If the algorithm actively diversifies who exchanges with whom, dependent spoke patterns can't solidify.
- **How it works**: This is a scoring preference in the matching algorithm, not a hard rule. Repeat exchanges still happen — they're slightly less likely to be selected when alternatives exist. Participants don't see or feel this directly.
- **Existing support**: The matching scorer already uses weighted criteria. Relationship novelty would be an additional scoring factor.

#### 1c. No Procurement Features

SEP does not build features that serve procurement use cases specifically:

- No bulk/batch exchange APIs
- No supplier management dashboards
- No category-based sourcing tools
- No volume-based anything

This is a *product decision*, not a technical constraint. The protocol serves everyone the same way. If a feature would primarily benefit someone treating SEP as procurement software, it doesn't get built.

This is the strongest leading indicator: you can't drift into procurement software if you never build procurement features. Prevention by omission.

### 2. Behaviour Monitoring (Lagging Detection)

Structural prevention handles the obvious cases. This layer detects patterns that slip through, using the same graduated approach as Q1.

#### 2a. Three Behaviour Signals

These map to the three properties of peer exchange:

**Signal 1: Directional Asymmetry**

A participant consistently receives from certain partners and never gives to them (or vice versa), over a rolling window.

- **What's normal**: Some asymmetry is fine — surplus flows to need (per Q1). A design firm might receive legal advice regularly and give creative work to different partners.
- **What triggers attention**: Persistent one-directional relationships with the *same* partners, especially where the receiving partner is larger. This looks like a supplier relationship, not peer exchange.
- **Distinction from Q1**: Q1 tracks commitment fulfilment (did they deliver?). This tracks relationship *shape* (is it peer-like?).

**Signal 2: Surplus Scheduling Patterns**

A participant's offerings appear with suspicious regularity — same capacity, same schedule, same availability windows — suggesting pre-committed rather than genuinely surplus capacity.

- **What's normal**: A firm that regularly has quiet Fridays might regularly offer surplus on Fridays. Pattern alone isn't proof.
- **What triggers attention**: Offerings that match the profile of scheduled production: consistent volume, high reliability, specific capacity that looks like a service line rather than overflow.
- **Limitation acknowledged**: This is the hardest signal to read. The line between "predictable surplus" and "scheduled surplus" is genuinely blurry. This signal carries lower weight than the others and always requires human interpretation.

**Signal 3: Dependency Patterns**

Smaller participants consistently exchange with the same large partner and rarely with others, suggesting economic dependency rather than peer choice.

- **What's normal**: A small firm that likes working with a particular larger partner and exchanges with them often by mutual choice.
- **What triggers attention**: Small participants who exchange *almost exclusively* with one large partner, especially combined with directional asymmetry.
- **Important nuance**: The dependent party might not complain — they may feel the exchanges are valuable. The concern is structural, not subjective. Detection looks at the pattern, not just satisfaction signals.

#### 2b. What Detection Does NOT Do

- **No automatic penalties.** Patterns trigger governance review, not automatic action. Consistent with Q1.
- **No balance tracking.** These signals are about relationship shape and behaviour patterns, not about who's giving more or receiving more. Consistent with Principle #1 (subjective value over shared currency).
- **No participant-visible scores.** There is no "peer exchange score" or "procurement risk rating." Participants don't see these signals. Only governance does, and only when patterns cross thresholds.

#### 2c. Governance Response

Follows the same graduated model as Q1's commitment fulfilment:

| Pattern | Response |
|---------|----------|
| Single signal, mild | Nothing — within normal variation |
| Multiple signals or persistent single signal | Conversation with participant to understand context |
| Continued pattern after conversation | Formal governance review |
| Confirmed procurement behaviour | Remediation or removal (human-judged) |

"Remediation" is specific to Q2 — unlike Q1 where confirmed bad faith leads toward removal, a participant using SEP in procurement-like ways might simply need to change how they participate, not leave entirely.

### 3. Cultural Onboarding

Every participant — regardless of size — goes through onboarding that establishes what peer exchange means and why it matters.

**What it covers:**

- What surplus exchange is (and isn't) — the distinction from procurement
- How peer exchange works — bidirectional, genuine surplus, equal footing
- What the network monitors — not balance, not size, but relationship shape and behaviour
- What happens when patterns look wrong — conversation first, graduated response

**What it doesn't do:**

- It doesn't filter out bad actors (they'll agree to anything). That's what Sections 1 and 2 handle.
- It doesn't guarantee understanding. Some participants will nod through it.

**What it does do:**

- Establishes norms that the majority of good-faith participants internalise
- Creates a reference point for governance conversations ("when you joined, we discussed what peer exchange means...")
- Signals to potential procurement users that this isn't the tool they're looking for — self-selection out

## What This Preserves

**Open participation**: No size exclusion, no revenue caps, no sector restrictions. A 1000-person firm that genuinely exchanges surplus as a peer is welcome. A 10-person firm that extracts from dependents is not.

**Principle #1 (subjective value)**: No balance tracking introduced. All signals are about relationship shape and behaviour patterns.

**Principle #2 (protocol over platform)**: Structural constraints are protocol-level. Any implementation could enforce concentration limits and diversity preferences. The "no procurement features" rule is a product decision that sits above the protocol.

**Principle #4 (pragmatic framing, radical intent)**: "Everyone welcome, behaviour matters" is pragmatic. Structural constraints preserving peer dynamics is the radical intent.

**Q1 consistency**: Same pattern — graduated, human-judged response to behaviour, not identity-based exclusion.

## Relationship to Q1 (Commitment-Based Accountability)

These designs are complementary, not overlapping:

| Q1 Concern | Q2 Concern |
|------------|------------|
| Did they deliver what was agreed? | Are they exchanging as peers? |
| Commitment fulfilment signals | Relationship shape signals |
| Individual exchange accountability | Network-level dynamic accountability |
| Detects bad faith in specific exchanges | Detects structural capture over time |

The governance view combines both: a participant with poor fulfilment signals AND procurement-like behaviour patterns is a stronger concern than either alone.

## Effects on Downstream Questions

| Question | How This Design Affects It |
|----------|---------------------------|
| **Q5: Trust & Gatekeeping** | Concentration limits and diversity preferences partially address clique formation. Diversity scoring in matching works against closed clusters. |
| **Q8: Network Bootstrapping** | Confirms the network should bootstrap with genuine peers, not enterprise anchors. Slower growth but authentic culture. Onboarding establishes norms from day one. |
| **Q10: Labour Market Effects** | Surplus scheduling detection partially addresses "surplus as managed resource" concern. If employee time is being scheduled as surplus rather than genuinely available, Signal 2 may surface it. Doesn't fully resolve the question but constrains it. |

## What This Design Does NOT Resolve

1. **Exact thresholds** — Concentration limit percentages, rolling window durations, what counts as "persistent" asymmetry. These are implementation and calibration questions that require real network data.

2. **Revenue model implications** — If SEP doesn't build enterprise features and doesn't pursue enterprise adoption, where does sustainable revenue come from? This connects to the Federation vs Momentum tension and Principle #5 (professional management requires sustainable economics). The design accepts this trade-off but doesn't solve it.

## Philosophy Check

**Checked against**: All 8 principles, all 7 tensions, the insight, the scope, and the horizon.

**Result**: Supports philosophy. Aligned with all principles. Directly addresses the "Peer exchange vs enterprise adoption" tension named in PHILOSOPHY.md. Preserves all future options.

**Refinement applied**: Philosophy check identified that detection-and-response alone (lagging indicators) was insufficient. Section 1 (Structural Prevention) was strengthened with leading indicators — concentration limits, diversity preferences, and the "no procurement features" product decision — to prevent procurement dynamics before they need to be detected.

## Summary

The Enterprise Capture vs Peer Vision tension is resolved by **focusing on behaviour rather than identity**:

- The system doesn't define or exclude "enterprises"
- Structural constraints (concentration limits, diversity preferences, no procurement features) make procurement dynamics difficult
- Behaviour monitoring (directional asymmetry, surplus scheduling, dependency patterns) detects what slips through
- Response is graduated and human-judged, consistent with Q1
- Cultural onboarding establishes peer exchange norms from day one
- No size-based exclusion: any participant exchanging genuine surplus as a peer is welcome

## Related Documents

- [Commitment-Based Accountability Design](2026-02-26-commitment-based-accountability-design.md) — Q1 design that establishes the pattern this extends
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) — Source of the enterprise capture concern
- [PHILOSOPHY.md](../../PHILOSOPHY.md) — "Peer exchange vs enterprise adoption" tension
- [Open Questions](../design/open-questions.md) — Question #2 that this design addresses
