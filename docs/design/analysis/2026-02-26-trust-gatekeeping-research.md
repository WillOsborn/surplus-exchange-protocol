# Trust Mechanisms and Gatekeeping: Research Findings

*Date: 2026-02-26*
*Source: Four parallel analysis agents exploring Q5*
*Status: Research complete, informing design*

---

## Overview

Four agents explored different aspects of Q5 ("How do we maintain trust accountability without creating insider/outsider dynamics?") in parallel:

1. **Newcomer Scenarios** — 5 newcomer types x 3 entry regimes
2. **Alternative Mechanisms** — 5 concrete alternative entry proposals with precedents
3. **Network Health Modelling** — Structural dynamics over time
4. **Adversarial Testing** — Exploit attempts against each regime

This document captures the key findings. Full agent outputs are available in the session archive.

---

## Part 1: Newcomer Scenario Analysis

### Three Entry Regimes Tested

| Property | Regime A (Current) | Regime B (Softened Vouching) | Regime C (No Vouching Gate) |
|---|---|---|---|
| Entry requirement | Vouch from Established/Anchor | Verified business identity | Verified business identity |
| Entry tier without vouch | Cannot enter | "Newcomer" (below Probationary) | Probationary |
| Entry tier with vouch | Probationary | Probationary (skips Newcomer) | Probationary (vouch noted as signal) |
| Newcomer limits (B only) | N/A | Bilateral only, 1 concurrent, 14-day window | N/A |

### Five Newcomer Types Tested

**1. Legitimate small design firm** (knows nobody in network)
- Regime A: Cannot enter. Spends months outside trying to find a voucher. Exactly the participant SEP is designed for, blocked by social gate.
- Regime B: Enters at Newcomer tier. Bilateral exchanges prove capability. Earns Probationary through performance.
- Regime C: Enters at Probationary. Full access from day one.

**2. Accounting firm referred by existing member**
- All regimes work well. The vouch is available, so the experience is similar across all three.

**3. Catering company (underrepresented sector)**
- Regime A: Cannot enter. Double barrier: no connections AND sector mismatch. Worst-case scenario.
- Regime B: Enters at Newcomer. Bilateral exchanges are actually a reasonable fit for catering.
- Regime C: Full access. Their unique sector position enables novel multi-party chains.

**4. Sophisticated bad actor (shell company)**
- Regime A: Hard to enter (needs accomplice or 6 months patience). Max damage: 4 participants.
- Regime B: Easy to enter, but Newcomer tier limits damage to 1 participant per attack. Bilateral-only means they must actually deliver.
- Regime C: Easy to enter with higher blast radius (4 participants via 2 concurrent 3-party chains).

**5. Previously demoted participant**
- Regime A: Needs new vouch after demotion — double penalty. Very hard to rehabilitate.
- Regime B: Drops to Newcomer tier. Self-directed recovery through demonstrated performance.
- Regime C: Remains at Probationary. Recovery depends on own performance.

### Cross-Regime Comparison

| Dimension | Regime A (Current) | Regime B (Softened) | Regime C (No Gate) |
|---|---|---|---|
| Barrier for legitimate newcomers | High | Low | Low |
| Entry cost for bad actors | High | Medium | Medium |
| Max blast radius per bad actor | 4 participants | 1 participant | 4 participants |
| Sybil resistance | Strong | Moderate (structural) | Weak |
| Newcomer fairness | Poor | Good | Excellent |
| Sector diversity | Suppressed | Enabled | Fully enabled |
| Rehabilitation path | Requires new vouch | Self-directed | Self-directed |
| Network growth potential | Slow | Medium | Fast |

### Key Patterns

1. **Vouching's real function is Sybil resistance, not quality filtering.** It doesn't distinguish good from bad participants — it makes entry expensive.
2. **Regime B achieves the best risk/fairness trade-off** through the Newcomer tier. Bilateral-only limits mean worst case = 1 affected participant.
3. **Vouching amplifies network homogeneity.** People vouch for people like them. Sector diversity is structurally suppressed.
4. **Rehabilitation is disproportionately punished under vouching.** Demotion + new vouch requirement = structural trap.
5. **The regimes map to network phases.** A could work at 10-20 participants; B at 20-200; C at 200+.

---

## Part 2: Alternative Entry Mechanisms

Five proposals were researched with real-world precedents:

### Proposal 1: Verified Identity Only
- Companies House / KYB check → Probationary tier
- Precedents: Sardex, WIR Bank, ITEX
- Openness: 9/10, Accountability: 6/10

### Proposal 2: Supervised Trial Exchanges
- Newcomers matched with volunteer "welcomers" for first 2-3 exchanges
- Welcomers provide detailed fulfilment signals (not vouches — no reputation stake)
- Precedents: Wikipedia New Pages Patrol, Sardex broker-mediated first exchanges
- Openness: 7/10, Accountability: 8/10

### Proposal 3: Community Review Board
- 3 established members review application asynchronously
- Default-to-trust: silence = approval after 14 days
- Precedents: Mastodon instance moderation, Apache lazy consensus
- Openness: 8/10, Accountability: 5/10

### Proposal 4: Graduated Self-Entry (Newcomer Tier)
- No gate at all. Verified identity → Newcomer tier (bilateral only, 1 concurrent, 14-day window)
- 3 successful bilateral exchanges with 3 different partners → Probationary
- Precedents: eBay seller limits, Stack Overflow privileges, banking starter accounts
- Openness: 10/10, Accountability: 7/10

### Proposal 5: Softened Vouching (Reform)
- Light vouches (no reputation stake) alongside full vouches
- 2 light vouches = 1 full vouch for entry
- Expanded eligibility, reduced consequences
- Openness: 6/10, Accountability: 7/10

### Recommended Combination
- **Primary path**: Identity verification + Newcomer tier (Proposal 4)
- **Enhanced accountability**: Supervised trials with welcomers (Proposal 2) for first exchanges
- **Acceleration**: Full vouch skips Newcomer tier (preserves vouching value without making it a gate)
- **Key insight**: "Structural constraints can replace social barriers"

---

## Part 3: Network Health Modelling

### 1. Clique Formation

Vouching requires 6-month prior relationship, meaning every new entrant traverses existing social networks. At 50 participants: single dense cluster, high internal connectivity, almost no structural diversity. Clusters become self-reinforcing within 2 vouching generations (~6-8 months). No structural mechanism exists to promote cross-cluster exchange.

### 2. First-Mover Advantage Compounding

Concrete calculation at month 18:
- Month-1 joiner: trust score **0.869** (anchor-eligible)
- Month-12 joiner (equally good work): trust score **0.721** (still below anchor threshold)
- Gap: 0.148 — driven primarily by network position metrics that only accumulate
- The gap narrows but never fully closes because anchor status grants unlimited concurrent chains, accelerating further accumulation

### 3. The Newcomer Catch-22 (Most Concerning Finding)

Probationary members face compounding disadvantages:
- 0.8x trust score multiplier in matching → deprioritised
- Max 3-party chains → only simplest possible structures
- Max 2 concurrent → fewer opportunities
- Zero-failure promotion requirement → one failure (possibly someone else's fault) = suspension

Estimated outcomes:
- Realistic time to 5 exchanges: 5+ months (not the theoretical 3)
- ~40% of newcomers may experience a chain failure before reaching Established, through no fault of their own
- The algorithm structurally prefers chains composed entirely of high-trust participants

### 4. Diversity vs Homogeneity

The Manchester catering company scenario traces four barriers:
1. Finding a voucher (likely impossible — wrong sector, wrong geography)
2. Geographic constraints in matching
3. Sector mismatch in need/offering scoring
4. No established relationships for trust-based matching

No structural mechanism exists to counter homogeneity. The system converges on founder characteristics.

### 5. Recommended Network Health Metrics

| Metric | Healthy | Warning |
|--------|---------|---------|
| Chain completion rate (30-day) | > 85% | < 75% |
| New member first-exchange latency | < 21 days | > 45 days |
| Newcomer retention at 90 days | > 70% | < 50% |
| Cross-cluster exchange ratio | > 15% | < 5% |
| Partner concentration (Gini) | < 0.5 | > 0.7 |
| Exchange velocity per participant/month | 1-4 | < 0.5 or > 10 |
| Satisfaction signal reciprocity rate | < 80% | > 90% |

---

## Part 4: Adversarial Testing

### Regime Comparison (Attack Perspective)

| Factor | Vouch (Current) | Identity Only | Graduated (Newcomer) | Light Endorsements |
|--------|-----------------|---------------|---------------------|-------------------|
| Entry cost (time) | 6+ months | 24 hours | 3-6 months | 1-2 weeks |
| Entry cost (money) | Negligible | ~12 GBP/entity | Negligible | Negligible |
| Sybil scalability | Low | High | Low | Medium-High |
| Value extraction ceiling | Low | Low | Very low | Low |
| Detection difficulty | High | Medium | Low | High |

### Key Finding: Realistic Threat Assessment

The most realistic attack motivation in a B2B surplus exchange network is **competitive intelligence gathering**, not value extraction. Exposure limits mean you can't steal much. The most dangerous attacker is a legitimate-seeming business that joins to learn about competitors' capacity and relationships.

### Regime-Specific Findings

**Current (vouch required)**: Most resistant to Sybil attacks due to social cost. But a patient attacker (6 months) or one with an insider accomplice can get through. Intelligence gathering is easy once inside and undetectable by current mechanisms.

**Identity only**: Highly vulnerable to Sybil attacks. Companies House registration costs 12 GBP. Five shell companies can self-deal to Established in 90 days. Detection mechanisms exist but are reactive/slow.

**Graduated (newcomer tier)**: Surprisingly resistant. Bilateral-only + 1 concurrent makes farming slow and conspicuous. 2-party chains mean you can't hide behind intermediaries. Collusion with another newcomer produces an obvious pattern (100% of exchanges with one partner).

**Light endorsements**: Worse than identity-only. No-consequence endorsements are effectively meaningless. Social engineering to collect 3 endorsements is trivial. Creates a false sense of security while providing less protection than pure identity verification.

### Adversarial Recommendations

1. Keep bilateral-only / 1-concurrent at Newcomer tier — most effective anti-gaming measure
2. Require partner diversity for qualifying exchanges (3 different partners, not 3 exchanges with the same one)
3. Invest in real-time clustering detection, not batch
4. Don't use light endorsements — they're worse than nothing

---

## Synthesis: Convergent Recommendations

All four agents independently converged on these conclusions:

### Entry Design
- **Add a Newcomer tier** (bilateral-only, 1 concurrent, identity-verified) as default entry
- **Retain vouching as an accelerator** (skip Newcomer → Probationary) not a gate
- **Require partner diversity** in qualifying exchanges (3 exchanges with 3 different partners)

### Newcomer Experience Fixes
- **Remove the 0.8x trust multiplier** for probationary members in matching
- **Increase probationary chain length** from 3 to 4
- **Change "zero failures"** to "zero failures attributable to this participant"

### Network Health
- **Add cross-cluster matching incentives** (diversity bonus in scoring)
- **Monitor newcomer-specific metrics** (first-exchange latency, retention, conversion rate)
- **Invest in detection over prevention** — better monitoring lets you lower barriers safely

### What Vouching Becomes
Vouching shifts from gate to signal:
- A vouch accelerates (skip Newcomer tier)
- A vouch is visible to potential chain partners (trust signal)
- Vouching reputation still matters (accountability chain preserved where it exists)
- But no one is blocked from entering because they lack a vouch

---

## Related Documents

- [Trust Implementation Plan](../trust-implementation-plan.md) — Current trust system design
- [Trust Model Specification](../../specs/trust-model.md) — Formal specification
- [Unintended Consequences Analysis](../unintended-consequences-analysis.md) — Source of Q5
- [Open Questions](../open-questions.md) — Q5 definition
- [Commitment-Based Accountability Design](../../plans/2026-02-26-commitment-based-accountability-design.md) — Q1 pattern
- [Peer Exchange Protection Design](../../plans/2026-02-26-peer-exchange-protection-design.md) — Q2 pattern
