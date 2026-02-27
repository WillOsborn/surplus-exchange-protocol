# Algorithm Transparency and Systemic Risk Design

*Design document for Open Question #7*
*Date: 2026-02-26*

---

## Context

AI-mediated matching is SEP's core innovation. The algorithm's decisions determine which participants get opportunities — with significant consequences for those included or excluded. The [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) surfaced three interconnected concerns:

1. **Opacity**: Participants don't know why they're matched or excluded
2. **Systemic risk**: Optimising for cycle closure can route many chains through key nodes, creating single points of failure (the pre-mortem "Meridian scenario" — one participant appearing in 34% of cycles)
3. **No recourse**: Participants excluded from good chains have no appeal mechanism

### The Core Tension

Transparency enables gaming; opacity enables abuse. Optimisation for efficiency may conflict with network resilience.

### Resolution

**Full transparency, accept gaming.** If gaming the algorithm means being more trustworthy, fulfilling commitments reliably, and building genuine relationships — those are the behaviours we want to incentivise. Aligned incentives aren't a problem.

This is also the principled position: withholding scores that determine participant opportunities is hard to defend ethically or regulatorily (cf. GDPR Article 22 on automated decision-making). Even less ethically-motivated platforms (ride-sharing, gig economy) show participants their ratings.

### Dependencies

This design builds on decisions from:

- **Q1** (Commitment-Based Accountability): Fulfilment signals feed into matching; graduated escalation pattern
- **Q2** (Peer Exchange Protection): Concentration limits and behaviour monitoring already in matching
- **Q3/Q4** (Deployment & Federation): Transparent operation commitment, participant advisory body, algorithm change approval
- **Q5** (Trust & Openness): Network position decay, cross-cluster incentives, tier-based matching
- **Q6** (Bad Actor Scenarios): "Algorithm sees everything; participants see only what's relevant to their own exchanges"

---

## Design

### 1. Participant Transparency — What You See About Yourself

Every participant gets a **matching profile view** showing exactly how the algorithm sees them.

#### Your Scores

- Trust score (the number, not just the tier)
- Fulfilment rate (commitments kept vs total)
- Satisfaction signals received
- Network position metrics (partner count, cluster connections, centrality)

#### Your Match Factors

- Current offerings and how they score on semantic richness, timing availability, capacity
- Current needs and how many potential providers exist in the network
- Geographic reach
- Your concentration level (what % of active chains you're in)

#### Your Recent Matching History

- Chains you were proposed for (accepted or declined)
- Chains you were *considered for but not selected* — with the reason:
  - "A chain with higher overall trust was selected"
  - "You were at your concentration limit"
  - "Timing conflict with an existing commitment"
  - "Another chain better matched your offering's capacity"

#### What You Don't See

- Other participants' individual scores or profiles (Q6 anti-harvesting)
- The full set of chains the algorithm considered (only the ones involving you)
- Other participants' needs or offerings beyond what's in your proposed chains

The Q6 principle holds: you see everything about *yourself* and the *decisions that affected you*, but nothing about the broader network that would enable competitive intelligence gathering.

### 2. Concentration Defence — Preventing the Meridian Scenario

Two algorithmic layers plus monitoring:

#### Layer 1: Diminishing Returns (Soft)

When scoring chains, the algorithm applies a **participation discount** to participants who already appear in many active chains. The more chains you're in, the less your inclusion improves a chain's score relative to alternatives.

- First few chains: no discount (normal scoring)
- As participation rises: each additional chain scores progressively lower
- Effect: the algorithm naturally prefers routing through less-utilised participants when alternatives of comparable quality exist

This doesn't *block* concentrated participants. A participant with unique offerings that genuinely no one else can provide still gets matched. But the algorithm actively looks harder for alternatives first.

#### Layer 2: Hard Cap (Safety Net)

No single participant can appear in more than **X% of active chains** in any rolling period. When the cap is hit, the participant is excluded from new chain proposals until existing chains complete or the ratio drops.

- The exact threshold is governance-set (advisory body), not hardcoded
- Starting suggestion: **15%** for small networks (under 50 participants), scaling down as the network grows (e.g. 10% at 100 participants, 5% at 500+)
- Participants approaching the cap see a warning in their matching profile: "You're in 12% of active chains (cap: 15%)"

#### Layer 3: Cascade Risk Monitoring

The operator monitors for **cascade fragility** — not just "is one participant in too many chains?" but "if this participant failed, how many other chains would be disrupted?"

- **Cascade impact score**: for each participant, how many chains break if they default
- **Network fragility index**: aggregate measure of how concentrated chain dependencies are
- Both visible to the advisory body in the network health dashboard
- Thresholds that trigger governance review (not automatic action — consistent with Q1's human-judged pattern)

**The Meridian scenario under this design**: Meridian hits the 15% cap well before reaching 34%. Their matching profile shows their concentration climbing. The cascade risk monitor flags them as a single point of failure. Governance reviews. Even if Meridian later defaults, the blast radius is structurally limited.

### 3. Participant Recourse — What To Do When Matching Feels Unfair

Graduated, consistent with Q1's escalation pattern:

#### Step 1: Self-Diagnosis (Always Available)

The matching profile (Section 1) is the first line of recourse. A participant who isn't getting matched can look at their own data and see why:

- "Your offerings match 3 needs in the network, but all 3 are currently fulfilled by existing chains"
- "Your trust score is 0.55 — most participants set their minimum threshold at 0.6"
- "Your timing availability (Tuesdays only) overlaps with only 12% of the network"

Most "why am I not being matched?" questions should be answerable from the profile without involving anyone else. The participant can then act — broaden offerings, adjust timing, fulfil existing commitments to improve their trust score.

#### Step 2: Match Audit Request (Structured Escalation)

If self-diagnosis doesn't explain the problem, a participant can request a formal match audit:

- Participant submits: "I believe I should be getting matched but I'm not. Here's what I've checked in my profile."
- Operator reviews the algorithm's recent decisions involving that participant
- Operator responds with a structured explanation — either confirming the profile data ("your timing really is the constraint") or identifying something the participant couldn't see ("there was a bug in geographic matching that excluded your region")
- Response within a defined SLA (e.g. 5 working days)

#### Step 3: Advisory Body Escalation

If the participant is unsatisfied with the operator's audit response, they can escalate to the participant advisory body. The advisory body can:

- Review the operator's audit
- Request the operator re-run matching with specific parameters
- Flag a systemic issue for algorithm review
- Recommend algorithm changes (which then follow the governance process in Section 4)

#### What Recourse Doesn't Include

- No "override" mechanism — participants can't force the algorithm to match them
- No anonymous complaints — recourse is tied to identity (consistent with Q1's accountability)
- No automatic remediation — all responses are human-judged

### 4. Algorithm Governance — How the Algorithm Evolves

#### Change Classification

**Minor changes** — publish-and-comment:
- Bug fixes
- Performance optimisations that don't change outcomes
- Tuning thresholds within ranges already approved by the advisory body
- Adding new data to transparency views

**Major changes** — advisory body approval required:
- Changes to scoring weights (e.g. shifting trust from 30% to 40%)
- Adding or removing scoring factors
- Changes to concentration limits or hard caps
- Changes to what data feeds into matching decisions
- Changes to tier-based matching behaviour (newcomer, probationary, established, anchor)
- Any change to what participants can or cannot see

#### Process for Major Changes

1. **Proposal**: Operator publishes the proposed change with rationale, expected impact analysis, and backtesting against recent matching data ("if this had been in effect last month, here's what would have changed")
2. **Review period**: Advisory body has a defined window (e.g. 21 days) to review, ask questions, request modifications
3. **Decision**: Advisory body approves, requests changes, or rejects. Majority vote
4. **Implementation**: If approved, operator implements with a monitoring period where old and new behaviour are compared
5. **Publication**: Change is documented in the algorithm changelog

#### Algorithm Changelog

A public, append-only record of every algorithm change — minor and major. For each entry:

- Date
- Classification (minor/major)
- What changed
- Rationale
- For major: advisory body decision reference
- For minor: comment period reference

This is the audit trail that makes Q3/Q4's "transparent operation" commitment concrete for the matching algorithm.

#### Emergency Changes

If the operator identifies an active exploit or systemic risk requiring immediate action:

- Operator can apply a temporary change without prior approval
- Must notify the advisory body within 24 hours
- Advisory body reviews retrospectively within 7 days
- Temporary change expires after 30 days unless formally approved through the normal process

### 5. Network Health Dashboard — Systemic Risk Visibility

The advisory body and operator need aggregate network health visibility, not individual matching decisions.

#### Concentration Metrics

- **Participation distribution**: histogram of how many chains each participant is in (should be roughly even, not power-law)
- **Top-N concentration**: what % of chains involve the 5/10/20 most active participants
- **Cascade impact scores**: for each participant above a threshold, how many chains break if they default
- **Network fragility index**: single number summarising how concentrated chain dependencies are

#### Matching Health

- **Match rate**: what % of active participants were proposed at least one chain this period
- **Time-to-first-match**: how long new participants wait before their first proposal (Q5's newcomer health metric)
- **Unmatched analysis**: aggregate breakdown of why unmatched participants aren't matching (trust, timing, geography, offering gaps)
- **Chain length distribution**: are chains getting longer or shorter over time
- **Diversity index**: how well the algorithm connects different clusters vs reinforces existing relationships

#### Algorithm Performance

- **Scoring distribution**: are chains proposed across a wide quality range or clustered at the top
- **Concentration limit utilisation**: how often the hard cap is binding
- **Diminishing returns impact**: how often the soft constraint changes which chain is proposed
- **Alternative availability**: on average, how many viable alternative chains exist for each proposed chain (resilience indicator)

#### Trend Monitoring

All metrics tracked over time, with automatic flagging when:

- Any single participant's concentration rises above 50% of the hard cap
- Network fragility index trends upward for 3 consecutive periods
- Match rate drops below a governance-set threshold
- Newcomer time-to-first-match exceeds a governance-set threshold

Flags trigger governance review — not automatic action.

#### Visibility by Audience

| Audience | What They See |
|----------|--------------|
| Individual participant | Their own matching profile (Section 1) |
| Participant advisory body | All aggregate metrics, anonymised distributions, trend reports |
| Operator | Everything — aggregate metrics plus individual data for audits and recourse |
| External auditor (if engaged) | Everything the operator sees, for verification |

The advisory body sees patterns, not individuals. They can see "3 participants are above 10% concentration" but not *which* 3 — unless a specific recourse escalation names them. This preserves Q6's anti-harvesting principle at the governance level.

---

## How This Connects to Prior Designs

| Prior Design | How Q7 Builds On It |
|-------------|---------------------|
| Q1 (Accountability) | Recourse follows the same graduated escalation pattern (self-service → operator → governance). Fulfilment signals feed matching transparency. |
| Q2 (Peer Exchange) | Concentration limits from Q2 are formalised as the hard cap. Behaviour monitoring data appears in the network health dashboard. |
| Q3/Q4 (Deployment) | "Transparent operation" commitment is made concrete through matching profiles, algorithm changelog, and network health dashboard. Advisory body's algorithm approval power is operationalised with the minor/major process. |
| Q5 (Trust & Openness) | Trust scores made visible to participants (not just tiers). Network position decay and cross-cluster incentives appear in matching profiles. Newcomer health metrics in the dashboard. |
| Q6 (Bad Actors) | Q6's "participants see only what's relevant to their own exchanges" principle preserved — transparency is about yourself, not others. Data harvesting defence intact. |

---

## What This Design Doesn't Address

- **Exact threshold values** for concentration limits, diminishing returns curves, or dashboard alert triggers — these require real network data and are governance-set
- **UI/UX design** of the matching profile or dashboards — separate concern
- **Technical implementation** of the transparency layer — deferred to implementation planning
- **Advisory body composition and voting procedures** — deferred, noted in Q3/Q4
- **Revenue model implications** of transparency commitments — out of scope

---

## Philosophy Check

**Supports philosophy.** Aligned with all 8 principles.

- Full transparency resolves the "Algorithm transparency vs gaming" tension: aligned incentives aren't a problem
- Dual concentration defence resolves the "Efficiency vs resilience" tension: resilience over pure efficiency, with governance controlling the trade-off
- PHILOSOPHY.md updated to reference this design for both tensions

---

## Implementation Notes

This is a design-level document. Implementation involves:

1. Extending the matching algorithm with diminishing returns and hard cap logic
2. Building the participant matching profile view
3. Building the network health dashboard
4. Defining the algorithm changelog format and governance process documentation
5. Defining the match audit request workflow

Implementation priority and sequencing to be determined in work package planning.
