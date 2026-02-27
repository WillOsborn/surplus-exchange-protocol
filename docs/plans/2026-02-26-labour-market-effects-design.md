# Labour Market Effects Design

*Date: 2026-02-26*
*Status: Approved*

## Problem Statement

Q10 asks: How might SEP affect employees of participant businesses, and should this influence design?

SEP is a B2B system, but the "surplus capacity" being exchanged often means employee time. Four concerns were identified in the [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md):

1. **Wage pressure** — efficiency gains from surplus exchange may flow to business owners rather than workers
2. **Reduced hiring** — overflow work routed through SEP may reduce entry-level hiring
3. **Training effects** — senior surplus time handling overflow reduces learning opportunities for juniors
4. **Designation authority** — employers unilaterally decide what counts as "surplus" without employee input

## Finding: This Is a Governance Concern, Informed by Design

SEP operates at business level. It doesn't model employees, track internal compensation, or have visibility into how participant businesses organise their workforce. It cannot and should not try to enforce how businesses treat their people.

But the design can make good governance possible — by establishing transparency norms, providing monitoring signals, and committing to learning from real-world effects.

This follows the pattern from Q1-Q6: the lightest effective intervention, with human-judged governance, and adaptation based on evidence.

## The Design

### 1. Transparency Norm

The core intervention. During onboarding — where Q2 already establishes peer exchange norms — participants are introduced to SEP's position on labour:

**The norm:** Participants are expected to be transparent with their employees about the firm's participation in SEP and the types of capacity being exchanged.

This isn't a gate or a compliance check. It's a stated expectation, consistent with how SEP treats peer exchange norms generally.

**Why transparency specifically:** It's the lightest intervention that addresses the designation authority concern. If employees know their firm participates and what capacity is being offered, the power asymmetry of unilateral surplus designation is reduced. Employees can't influence what they don't know about.

**What this looks like in practice:**

- Onboarding materials explain the expectation clearly
- No verification mechanism — this is a cultural norm, not a compliance gate
- The expectation is revisited if governance conversations arise about a participant's behaviour (consistent with Q1/Q2's graduated response — if there's a concern, "do your employees know about this?" becomes a relevant question)

**What this deliberately avoids:**

- No requirement to prove employee awareness
- No employee consent mechanism (that's inside the business, not SEP's boundary)
- No distinction between employee types (senior/junior) — the norm applies to the firm generally

### 2. Two-Scale Monitoring

Individual-level and aggregate-level concerns need different mechanisms.

#### Individual level: Labour-aware interpretation of Q2's signals

Q2 already defines three behaviour signals: directional asymmetry, surplus scheduling patterns, and dependency patterns. Q10 does not add new signals — it adds **labour-aware interpretation** of Signal 2 (surplus scheduling).

When Q2's surplus scheduling detection surfaces a pattern that looks like managed resource rather than genuine overflow, the governance conversation already happens. Q10 adds a dimension to that conversation: is this pattern consistent with employee time being routinely allocated to SEP rather than genuinely idle capacity?

This isn't a new detection mechanism. It's a governance lens applied to an existing signal. The graduated response is the same as Q2: conversation, review, remediation or removal.

#### Aggregate level: Sector monitoring as operator commitment

New governance commitment, extending the set from Q3/Q4 and Q5:

The operator commits to monitoring aggregate patterns across the network, specifically:

- **Capacity type concentration** — are particular types of professional capacity (e.g. junior design work, legal research) disproportionately flowing through SEP in a sector?
- **Volume trends** — is the proportion of capacity exchanged growing in ways that suggest substitution for hiring rather than surplus disposal?

This monitoring is observational, not enforcement. It feeds into the learning loop (Section 4). The operator publishes findings as part of Q3/Q4's transparency commitment. If real-world evidence shows harmful patterns, the response is governance-led — updated guidance, adjusted norms, or stronger expectations — decided by humans with evidence.

### 3. Positioning and Honest Communication

SEP should be honest about labour effects in its participant-facing materials rather than ignoring or downplaying them.

Onboarding guidance, extending Q2's cultural onboarding, addresses labour directly:

- Surplus means genuinely idle capacity — time or resources that would otherwise go unused. It doesn't mean reallocating your team's workload.
- We expect your employees to know you're participating and what capacity you're offering.
- If SEP is replacing hiring or training opportunities in your business, that's worth reflecting on — it may also surface in how the network monitors participation patterns.

The tone is honest and non-prescriptive. It names the concern, states the expectation, and notes that monitoring exists — without threatening or gatekeeping.

**Why positioning matters:** Setting the norm early is cheaper than correcting behaviour later. Q2 established this principle: cultural onboarding from day one shapes what participants understand as appropriate. A firm that joins understanding "surplus means idle capacity, and your team should know" will behave differently from one that joins thinking "surplus means whatever capacity I decide to route through here."

**What this is not:** Not a code of conduct or enforceable policy. Not a legal disclaimer about employment law. Not SEP taking a position on how businesses should treat their employees generally. It's SEP being clear about what "surplus" means in practice, and what the network expects of participants in relation to their people.

### 4. The Learning Loop

This design is deliberately light because there's no real-world data yet. The learning loop closes the gap:

1. **Observe** — Operator monitors aggregate capacity patterns and notes any governance conversations where labour concerns arise
2. **Research** — As the network matures, the operator may commission or encourage external research into labour market effects in participating sectors (not a Phase 1 commitment, but acknowledged as valuable)
3. **Adjust** — Governance updates onboarding guidance, monitoring focus, or norms based on evidence. Could range from "no change needed" to "we need stronger expectations in sector X"

The key principle: **evidence before intervention.** This design establishes the monitoring and transparency that will generate evidence. Future governance decisions are made with that evidence, not anticipated now.

## What This Preserves

- **Q1's graduated, human-judged response** — extended to labour concerns, not replaced with enforcement
- **Q2's structural protections** — surplus scheduling detection is the primary individual-level mechanism
- **Subjective value principle** — no tracking of internal compensation or value distribution introduced
- **B2B boundary** — SEP communicates with businesses, not their employees
- **Surplus framing** — the design reinforces what "surplus" means rather than policing what it isn't

## What's Explicitly Deferred

| Deferred item | Rationale |
|---|---|
| Structural constraints on capacity types | No evidence yet that specific types cause harm. Governance can introduce these later if needed. |
| Employee-facing communication from SEP | SEP communicates with businesses. If transparency norms aren't sufficient, this could be revisited. |
| External labour market research partnerships | Valuable but not a Phase 1 operator commitment. |
| Employee representation in governance | The Q3/Q4 participant advisory body represents businesses. Employee representation would be a significant scope expansion. |

## How the Four Concerns Are Addressed

| Concern | Mechanism | Type |
|---|---|---|
| **Wage pressure** | Aggregate sector monitoring; learning loop for future adjustment | Governance observation |
| **Reduced hiring** | Aggregate volume trend monitoring; honest positioning about surplus vs staffing | Governance observation + norm-setting |
| **Training effects** | Aggregate capacity type monitoring (junior work patterns); onboarding guidance | Governance observation + norm-setting |
| **Designation authority** | Transparency norm (employees should know); governance lens on surplus scheduling | Norm-setting + existing signal interpretation |

None of these are enforcement mechanisms. All rely on transparency, monitoring, and human-judged governance — consistent with Q1-Q6.

## Relationship to Prior Questions

| Question | Connection |
|---|---|
| **Q1** (Accountability) | Q10 follows Q1's pattern: graduated, human-judged, evidence-based. No changes to Q1's design. |
| **Q2** (Enterprise Capture) | Q10 builds directly on Q2's surplus scheduling detection and cultural onboarding. Q2's design acknowledged it "doesn't fully resolve" labour effects — Q10 completes that. No changes to Q2's design. |
| **Q3/Q4** (Deployment/Federation) | Aggregate sector monitoring is a new operator governance commitment under Q3's framework. |
| **Q5** (Trust & Openness) | No direct connection. Q10 doesn't affect trust tiers or newcomer mechanisms. |
| **Q6** (Bad Actors) | No direct connection. Labour effects are not a bad actor scenario — they're a legitimate concern about systemic effects. |

## Effects on Downstream Questions

| Question | How This Design Affects It |
|---|---|
| **Q7: Algorithm Transparency** | Aggregate monitoring data could be included in transparency reporting. Not a constraint on Q7's design. |
| **Q8: Network Bootstrapping** | Onboarding guidance is relevant from the first participant. Labour norms should be part of initial culture-setting, not added after the fact. |
| **Q9: Taxation & Compliance** | No direct connection. Tax treatment is separate from labour effects. |

## What This Design Does NOT Resolve

1. **Whether efficiency gains are actually shared with workers** — SEP can set norms and monitor patterns but cannot see inside businesses. This is an inherent limitation of operating at B2B level.
2. **Exact monitoring thresholds** — What constitutes a concerning concentration of junior capacity in a sector? Needs calibration with real data.
3. **Whether transparency norms are sufficient** — The learning loop will generate evidence. If transparency alone doesn't address the concerns, governance can strengthen expectations.

## Philosophy Check

**Checked against**: All 8 principles, all 7 tensions, the insight, the scope, and the horizon.

**Result**: Supports philosophy. Aligned with all 8 principles.

**Key assessments**:

- **The Scope (surplus focus)**: The design reinforces what surplus means — genuinely idle capacity, not managed resource allocation. This strengthens the surplus framing rather than expanding scope.
- **Principle 1 (subjective value)**: No shared valuation or internal compensation tracking introduced. Monitoring is about capacity patterns, not value flows.
- **Principle 3 (B2B focus)**: The design respects the business-level boundary. It sets expectations for how businesses communicate with their employees but doesn't try to reach past the business to the employee directly.
- **Principle 4 (pragmatic framing, radical intent)**: Labour market transparency is consistent with the radical intent — value should flow to participants broadly, not concentrate with owners. But the framing is pragmatic: norms and monitoring, not mandates.
- **Principle 7 (human accountability)**: All governance responses are human-judged. No automatic penalties or enforcement mechanisms.

**Tension assessment**:

- **Radical intent vs pragmatic survival**: This is the most relevant tension. If SEP succeeds but systematically reduces entry-level hiring in participating sectors, the radical intent (redirecting value toward participants) has partly failed — the value is redirected to business owners while potential employees lose opportunities. The design addresses this honestly: it names the concern, monitors for it, and commits to learning. It doesn't claim to solve it because a B2B protocol can't control what happens inside businesses. This is an honest acknowledgement, not an evasion.

**No PHILOSOPHY.md update needed.** Q10 doesn't introduce new tensions or change the interpretation of existing ones. The "radical intent vs pragmatic survival" tension already captures the relevant dynamic. The design operates within existing philosophical boundaries.

## Related Documents

- [Peer Exchange Protection Design](2026-02-26-peer-exchange-protection-design.md) — Q2 design (surplus scheduling detection, cultural onboarding)
- [Commitment-Based Accountability Design](2026-02-26-commitment-based-accountability-design.md) — Q1 design (graduated response framework)
- [Deployment & Federation Design](2026-02-26-deployment-and-federation-design.md) — Q3/Q4 design (governance commitments)
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md) — Source analysis
- [PHILOSOPHY.md](../../PHILOSOPHY.md) — Project philosophy
