# Trust and Openness Design

*Date: 2026-02-26*
*Status: Approved*

## Problem Statement

The Surplus Exchange Protocol's trust system — vouching, network position metrics, tiered progression — creates accountability. But the [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) identified that these same mechanisms create insider/outsider dynamics:

1. **Entry barrier** — vouching requirement means existing members control who gets in
2. **The newcomer catch-22** — probationary limits and matching penalties make newcomers less attractive partners, slowing their progression
3. **First-mover advantage compounding** — network position metrics only accumulate; early members' advantages compound indefinitely
4. **Clique formation** — vouching traverses existing social networks, propagating founder homogeneity
5. **Anchor as structural elite** — unlimited exposure and highest vouching capacity create permanent asymmetry
6. **Homogeneity inheritance** — every mechanism above amplifies the characteristics of the founding cohort
7. **Information asymmetry** — established members have richer visible histories, making newcomers less attractive even beyond formal limits

[Four parallel analyses](../design/analysis/2026-02-26-trust-gatekeeping-research.md) — newcomer scenarios, alternative mechanisms, network health modelling, and adversarial testing — explored these dynamics in depth.

## Accepting the Tension

Unlike Q1–Q4, this question does not have a single reframing that dissolves the apparent tension. **The tension is real: accountability mechanisms inherently create barriers.** More gatekeeping means less gaming but also less openness. More openness means broader participation but also more exposure to bad actors.

We choose a side: **default to trust, use structural limits and community oversight as the safety net.**

### Design Principle

> **Constrain outcomes, not entry.** Rather than screening who gets in (social gatekeeping), limit what newcomers can do until they've demonstrated through behaviour that they deliver. Structural limits — not social connections — provide the accountability.

This is consistent with:
- Q1: behaviour-based accountability (commitment fulfilment, not balance)
- Q2: behaviour-based inclusion (how you participate, not who you are)
- Q3/Q4: structural guarantees over promises (architecture makes escape possible, not promises)

## Design Components

### 1. The Newcomer Tier

Add a Newcomer tier below Probationary as the default entry path. Anyone who can verify their identity enters here.

#### Identity verification

Verification is flexible, focusing on confirming the person is real and has genuine capacity to participate — not on formal business status:

| Verification Type | Examples |
|---|---|
| Business registration | Companies House, sole trader registration |
| Professional credentials | Professional body membership (ICAEW, CIM, CIPR, etc.) |
| Established online presence | Verifiable portfolio, professional website, LinkedIn history |
| Vouch from existing member | Skips Newcomer tier entirely (acceleration, not gate) |

This accommodates new businesses and sole practitioners who have real skills but may not yet have formal registration.

#### Tier limits

| Attribute | Newcomer | Probationary | Established | Anchor |
|---|---|---|---|---|
| Max chain size | 2 (bilateral) | 4 | 6 | Bounded (high) |
| Max concurrent | 1 | 2 | 5 | Bounded (high) |
| Max execution window | 14 days | 30 days | 90 days | Unlimited |
| Can vouch | No | No | Yes | Yes |

**Why bilateral-only works**: Adversarial testing found this is the most effective anti-gaming measure of any regime tested. You can't hide behind intermediaries — your exchange partner directly experiences your delivery. Maximum blast radius is 1 affected participant. Farming is slow and conspicuous.

#### Newcomer → Probationary promotion

Automatic when **all** conditions are met:
- 3 completed bilateral exchanges
- With 3 **different** partners (prevents collusion farming)
- Satisfaction rate >= 0.80
- 30+ days in network

Or immediately if a vouch is received from an Established/Anchor member.

### 2. Vouching as Accelerator

The vouching system is preserved but its role changes from gate to accelerator and trust signal.

| Aspect | Current | New |
|---|---|---|
| Required to join? | Yes | No |
| Effect | Entry at Probationary | Skip Newcomer → Probationary |
| Visible to partners? | Yes | Yes (trust signal in profile) |
| Voucher accountability | Yes (reputation at stake) | Yes (unchanged) |
| Vouch capacity limits | Yes | Yes (unchanged) |

The vouching mechanics are unchanged — sponsors still stake reputation, still have capacity limits, still face consequences for vouchees who perform poorly. Vouching retains real value as an acceleration mechanism and trust signal. It just no longer blocks anyone from entering.

### 3. Fixing the Newcomer Catch-22

Three changes address the structural disadvantage newcomers face after entry:

#### 3a. Remove the 0.8x trust multiplier for probationary members

The chain discovery algorithm currently applies `trust_score *= 0.8` for probationary participants. This means every chain containing a newcomer scores lower, so the algorithm deprioritises them — they're matched last.

**Change**: Remove this multiplier. Probationary members are already constrained by chain length and concurrency limits. The exposure limits *are* the safety mechanism; the trust penalty on top creates compounding exclusion.

#### 3b. Increase probationary chain length from 3 to 4

A 3-party chain is the minimum viable cycle. Limiting probationary members to the absolute minimum dramatically reduces matching possibilities. Allowing 4-party chains roughly doubles the number of viable cycles a newcomer can participate in, while still limiting cascade exposure.

#### 3c. Failure attribution: "zero failures attributable to this participant"

Currently, promotion from Probationary to Established requires `chains_failed: 0`. A chain can fail because *any* participant defaults — not just the newcomer. Analysis estimated ~40% of newcomers would experience a chain failure before reaching Established, through no fault of their own.

**Change**: Track whether the newcomer fulfilled *their* commitment. If they delivered what was agreed but another participant defaulted, the chain failure doesn't count against them.

This aligns directly with Q1's principle: accountability is about commitment fulfilment — you're accountable for *your* commitments, not things outside your control.

#### Combined effect on newcomer timeline

| Stage | Duration | What happens |
|---|---|---|
| Newcomer | ~30 days | 3 bilateral exchanges with 3 different partners |
| Probationary | ~90 days | 5 exchanges in up to 4-party chains, building track record |
| Established | Ongoing | Full participation, can vouch for others |

Realistic total: **4-5 months** from entry to Established (vs current estimate of 6-8+ months with significant suspension risk).

### 4. Network-Level Fairness

#### 4a. Cross-cluster matching incentive

The matching algorithm currently has no mechanism to promote diversity. Chains composed entirely of well-connected participants always score highest.

**Change**: Add a small positive scoring weight for chains that bridge clusters — connecting participants who haven't previously exchanged, or from different sectors/geographies. This is a preference, not a hard rule. Same pattern as Q2's "relationship diversity in matching."

#### 4b. Network position decay

Currently, network position metrics (partner count, repeat partners, vouches received) only accumulate. Early members' advantages compound indefinitely.

**Change**: Apply time-decay (same 180-day half-life used for satisfaction signals) to the network strength component of trust scoring. Recent exchange relationships count more than old ones.

This doesn't erase history. An early member who stays active maintains their position. One who coasts on historical metrics gradually yields priority to active newer members.

#### 4c. Anchor tier adjustments

Two changes to prevent anchor becoming a permanent structural elite:

- **Ongoing activity requirement** — minimum 2 exchanges per quarter to retain anchor status. Inactive anchors transition gracefully to established.
- **Generous but bounded limits** — rather than "unlimited" chain length and concurrent chains, set high but finite limits (e.g., max 12-party chains, max 15 concurrent). Prevents any single participant from appearing in a disproportionate number of chains. Supports Q2's concentration limits.

#### 4d. Network health monitoring

Rather than preventing all problems at the gate, invest in monitoring that catches problems early:

| Metric | Healthy Range | Warning Threshold | What It Catches |
|---|---|---|---|
| New member first-exchange latency | < 21 days | > 45 days | Newcomer catch-22 recurring |
| Newcomer retention at 90 days | > 70% | < 50% | Onboarding pipeline broken |
| Cross-cluster exchange ratio | > 15% of chains | < 5% | Network fragmenting into cliques |
| Partner concentration (Gini) | < 0.5 | > 0.7 | Hub-and-spoke capture |
| Sector/geographic diversity trend | Growing | Stagnant or declining | Homogeneity propagating |
| Satisfaction reciprocity rate | < 80% | > 90% | Mutual inflation / gaming |
| Chain completion rate (30-day) | > 85% | < 75% | Core reliability degrading |

These are operator responsibilities under the governance commitments from Q3/Q4. The operator monitors and reports to the participant advisory body.

## What This Preserves

- **The 3-layer trust model** (identity, network position, satisfaction) — unchanged
- **Vouching system mechanics** (reputation stake, capacity limits, accountability chain) — unchanged
- **Tier promotion criteria** for Established and Anchor — unchanged except failure attribution
- **Exposure limits framework** — extended to Newcomer tier, minor adjustments elsewhere
- **Satisfaction signals and fraud prevention** — unchanged
- **Gaming resistance mechanisms** — unchanged, augmented by Newcomer tier structural limits

## Relationship to Prior Questions

| Question | Connection |
|---|---|
| **Q1** (Accountability) | Same pattern: behaviour-based, graduated, human-judged. Failure attribution fix aligns with "commitment fulfilment" principle |
| **Q2** (Enterprise Capture) | Complementary: Q2's concentration limits + this design's diversity incentives + bounded anchor limits all reinforce peer exchange dynamics |
| **Q3/Q4** (Deployment/Federation) | Network health metrics become operator responsibilities. Newcomer retention and diversity trends reportable to advisory body |

## Effects on Downstream Questions

| Question | How This Design Affects It |
|---|---|
| **Q6: Bad Actor Scenarios** | Newcomer tier's bilateral-only limit constrains blast radius. Partner diversity requirement for promotion prevents simple collusion. Improved detection metrics catch coordinated attacks earlier. |
| **Q7: Algorithm Transparency** | Cross-cluster matching incentive is a new algorithm parameter that should be transparent. Removal of the 0.8x trust penalty improves perceived fairness. |
| **Q8: Network Bootstrapping** | Open entry path enables bootstrapping from diverse sources, not just the founders' social networks. Supports Q2's decision to bootstrap with genuine peers. |

## What This Design Does NOT Resolve

1. **Exact thresholds** — Newcomer promotion criteria (3 exchanges, 30 days), anchor activity minimums, cross-cluster scoring weights. Starting points provided; real network data will calibrate.
2. **Identity verification implementation** — Which KYB providers, what counts as "established online presence," international participant handling. Operational questions.
3. **Welcomer programme** — Matching newcomers with experienced members for early exchanges. Good enhancement, not core design. Could be added as the network matures.
4. **Network position decay calibration** — 180-day half-life is the principle; exact parameters need tuning with real data.
5. **Competitive intelligence gathering** — Adversarial testing identified this as the most realistic attack motivation in a B2B network. No entry regime prevents it effectively; it requires monitoring and data access controls rather than entry barriers.

## Philosophy Check

**Checked against**: All 8 principles, all 7 tensions, the insight, the scope, and the horizon.

**Result**: Supports philosophy. Aligned with all 8 principles. Directly addresses the "Openness vs trust" tension named in PHILOSOPHY.md.

**Key assessments**:
- **The Insight**: Removing social capital as an entry barrier aligns with reducing barriers to participation — social gatekeeping is analogous to capital gatekeeping
- **Principle 3 (B2B focus)**: Flexible identity verification slightly widens who can participate (new businesses, sole practitioners) — appropriate for surplus context
- **Principle 6 (Trust through relationships)**: Refinement rather than pure support — network position decay changes implementation but aligns with spirit (current engagement matters more than historical credentials)
- **The Horizon**: A more open, diverse network is better positioned for cross-sector growth and eventual federation

**PHILOSOPHY.md updated**: "Openness vs trust" tension now references this design, matching the pattern for Q1–Q4.

## Research

This design is informed by [four parallel analyses](../design/analysis/2026-02-26-trust-gatekeeping-research.md):

1. **Newcomer Scenarios** — 5 newcomer types tested across 3 entry regimes
2. **Alternative Mechanisms** — 5 concrete proposals with real-world precedents (Sardex, WIR, eBay, Stack Overflow, Apache Foundation)
3. **Network Health Modelling** — Quantitative analysis of clique formation, first-mover compounding, newcomer catch-22, diversity dynamics
4. **Adversarial Testing** — Exploit attempts against 4 entry regimes; graduated access found most resistant

## Summary

The Trust Mechanisms and Gatekeeping tension is addressed by **constraining outcomes rather than entry**:

- **Newcomer tier** (bilateral-only, identity-verified) replaces vouching as the default entry path
- **Vouching becomes an accelerator** — valuable but not required
- **Newcomer catch-22 fixed** — no matching penalty, wider chains, fair failure attribution
- **Network-level fairness** — diversity incentives, position decay, bounded anchor privileges
- **Monitoring over prevention** — operator tracks newcomer health and diversity metrics

The system defaults to trust. Structural limits — not social connections — provide accountability.

## Related Documents

- [Trust Implementation Plan](../design/trust-implementation-plan.md) — Current trust system design
- [Trust Model Specification](../../docs/specs/trust-model.md) — Formal specification
- [Trust Gatekeeping Research](../design/analysis/2026-02-26-trust-gatekeeping-research.md) — Full research findings
- [Commitment-Based Accountability Design](2026-02-26-commitment-based-accountability-design.md) — Q1 design
- [Peer Exchange Protection Design](2026-02-26-peer-exchange-protection-design.md) — Q2 design
- [Deployment & Federation Design](2026-02-26-deployment-and-federation-design.md) — Q3/Q4 design
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) — Source analysis
- [PHILOSOPHY.md](../../PHILOSOPHY.md) — Project philosophy
