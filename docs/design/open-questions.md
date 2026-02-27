# Open Design Questions

*Last updated: 2026-02-26 (reordered by dependency)*

---

## Question Lifecycle

Questions progress through these stages:

1. **OPEN** — Question identified, analysis needed
2. **ANALYSED** — Options documented in [decisions.md](decisions.md), decision pending
3. **RESOLVED** — Decision made and accepted in [decisions.md](decisions.md)

**Note**: "Analysed" is NOT "Resolved". A question moves to RESOLVED only when decisions.md shows `Status: Accepted` (not "Proposed" or "Decision Required").

---

## ✅ RESOLVED

### Capability Description Schema

**Status**: In Progress as WP8

**Original Question**: How do we structure capability descriptions so agents can match effectively?

**Resolution**: The Capability Translation System design addresses this. See [capability-translation.md](capability-translation.md) for the full design including:
- Capability taxonomy with normalised output vocabulary
- AI-assisted capability definition for human onboarding
- Semantic matching for need→offering resolution
- Learning loop from exchange outcomes

**Remaining work**: Rich onboarding flow (prototype exists).

---

### Trust Mechanisms

**Status**: Complete

**Original Question**: How do participants trust each other without shared valuation?

**Resolution**: Implemented as a 3-layer trust model:
1. **Layer 1**: Verifiable Identity (baseline accountability)
2. **Layer 2**: Network Position (relationship patterns harder to fake than ratings)
3. **Layer 3**: Mutual Satisfaction (simple signals, not numeric scores)

See:
- Design: [trust-implementation-plan.md](trust-implementation-plan.md)
- Specification: [../specs/trust-model.md](../specs/trust-model.md)
- Implementation: `src/trust/`

---

### Multi-Party Chain Discovery

**Status**: Complete

**Original Question**: How do agents identify and propose complex exchange chains?

**Resolution**: Implemented using Johnson's algorithm for cycle detection in directed graphs.

See:
- Design: [chain-discovery.md](chain-discovery.md)
- Implementation: `src/matching/cycles.ts`

---

## 📊 ANALYSED (Decision Pending)

*Note: Deployment Architecture is now listed in OPEN section as question #3, since it has dependency relationships with other open questions.*

---

## ⏳ PARTIALLY ADDRESSED

### Physical Goods Integration

**Status**: Schema support added, full implementation pending

**Question**: How do we handle exchanges involving physical goods?

**Context**:
- Services are location-independent, physical goods aren't
- Transport has cost (which is itself a potential surplus offering)
- Storage, perishability, condition verification add complexity

**Progress**: Schema support added for physical goods including location, transport, timing constraints. See [schema-revision-plan.md](schema-revision-plan.md).

**Remaining sub-questions**:
- Can transport be matched as part of multi-party chains?
- Who verifies condition on delivery?

---

## 🔴 OPEN

Questions are ordered by dependency — earlier questions constrain later ones.

### Tier 1: Foundational

These questions must be answered first as they constrain all subsequent decisions.

---

### 1. Subjective Value vs Accountability Trade-off

**Status**: ANALYSED

**Question**: How do we maintain accountability without reintroducing currency-like shared valuation?

**Resolution**: Reframed as **commitment fulfilment, not balance tracking**. Accountability is about whether participants do what they say they'll do, not whether they give as much as they receive.

**Key decisions**:
- Receiving more than giving is not a problem — it's the system working (surplus flows to need)
- Accountability signals focus on: "Did they deliver what was agreed?" (Yes / Partially / No)
- Lightweight escalation: stuck flag → participant conversation → accept outcome → governance escalation
- Governance sees patterns of non-fulfilment, not balance patterns
- Response is graduated and human-judged, not automatic
- Tax compliance is explicitly a participant responsibility, not a network function

**Design document**: [Commitment-Based Accountability Design](../plans/2026-02-26-commitment-based-accountability-design.md)

**Philosophy check**: Passed — aligns with all 8 principles, directly addresses the first named tension in PHILOSOPHY.md.

**Related decisions**: [Subjective Value Over Shared Currency](decisions.md#decision-subjective-value-over-shared-currency)

**Constrains**: Bad Actor Scenarios, Taxation & Compliance, Algorithm Transparency, Trust & Gatekeeping

---

### 2. Enterprise Capture vs Peer Vision

**Status**: ANALYSED

**Question**: Should we actively limit enterprise/procurement use to preserve peer exchange dynamics?

**Resolution**: Reframed as **behaviour not identity** — the system doesn't define or exclude "enterprises" but ensures all participants engage as peers through structural constraints and behaviour monitoring.

**Key decisions**:
- No size-based exclusion: any participant exchanging genuine surplus as a peer is welcome
- Structural prevention: matching concentration limits, relationship diversity preferences, no procurement features built
- Behaviour monitoring: directional asymmetry, surplus scheduling patterns, dependency patterns
- Graduated governance response consistent with Q1 (conversation → review → remediation or removal)
- Cultural onboarding establishes peer exchange norms from day one
- Network should bootstrap with genuine peers, not enterprise anchors — slower growth but authentic culture

**Design document**: [Peer Exchange Protection Design](../plans/2026-02-26-peer-exchange-protection-design.md)

**Philosophy check**: Passed — aligned with all 8 principles, directly addresses the "Peer exchange vs enterprise adoption" tension in PHILOSOPHY.md.

**Unresolved implementation questions**:
- Exact concentration limit thresholds (requires real network data)
- Revenue model implications of not pursuing enterprise adoption

**Constrains**: Network Bootstrapping, Trust & Gatekeeping, Labour Market Effects

---

### Tier 2: Architecture

These depend on Tier 1 decisions and shape how the system is deployed and governed.

---

### 3. Deployment Architecture

**Status**: ANALYSED

**Question**: Should we deploy as a managed service or federated network?

**Resolution**: **Governed Managed Service with Federation Escape Hatch.** Phase 1 deploys as a single managed service. The risk isn't centralisation itself — it's unconstrained centralisation. Binding governance commitments and federation-ready architecture protect participants without requiring federation.

**Key decisions**:
- Managed service is the right architecture for proving the exchange model before adding federation complexity
- Design is entity-agnostic — governance commitments bind any operator type (commercial, non-profit, cooperative)
- The operator entity is separate from the protocol specification — the protocol is an open standard, the operator is one implementation
- Five binding operator commitments: data portability, transparent operation, protocol conformance, participant representation, non-interference with exit
- Federation-ready architecture: portable identity, separable components (4 boundaries), exportable trust, protocol-defined parameters
- Participant advisory body with defined powers (approve algorithm changes, concentration limits, review transparency reports)

**Design document**: [Deployment & Federation Design](../plans/2026-02-26-deployment-and-federation-design.md)

**Philosophy check**: Passed — directly addresses Protocol Over Platform through open spec separation; aligns with all 8 principles.

**Depends on**: Subjective Value vs Accountability (affects what the operator can see/do)

**Constrains**: Federation Commitment, Algorithm Transparency

See also: [Federation Exploration](./federation-exploration.md) for detailed technical analysis.

---

### 4. Federation Commitment Mechanisms

**Status**: ANALYSED

**Question**: How do we ensure federation actually happens rather than being perpetually deferred?

**Source**: [Unintended Consequences Analysis](unintended-consequences-analysis.md) — surfaced in all three analytical approaches.

**Resolution**: **Federation as escape hatch, not roadmap item.** We don't commit to a federation timeline. Instead, we commit to architectural and governance properties that make federation possible at any time — meaning participants are never trapped. The operator earns continued centralisation by behaving well, not by making alternatives technically impossible.

**Key decisions**:
- Federation is aspirational, not a hard requirement — well-governed managed service is acceptable
- No federation timeline or triggers — instead, the architecture and governance make federation possible at any point
- Governance commitments make the escape hatch credible; the escape hatch makes governance commitments enforceable (they reinforce each other)
- If the operator violates commitments, open protocol + data portability + published APIs mean participants and a competing operator can stand up an alternative
- Interoperability required if a competing operator launches (Commitment #5: Non-Interference with Exit)
- Consistent with Q1 and Q2 pattern: behaviour-based, not identity/structure-based

**Design document**: [Deployment & Federation Design](../plans/2026-02-26-deployment-and-federation-design.md) (addressed jointly with Q3)

**Philosophy check**: Passed — addresses the Federation vs Momentum tension honestly; aligns with Protocol Over Platform through open spec and architectural readiness.

**Depends on**: Deployment Architecture (addressed jointly)

**Related**: [Federation Exploration](federation-exploration.md)

---

### Tier 3: Mechanisms

These depend on Tier 1 & 2 decisions and define how trust, detection, and transparency work.

---

### 5. Trust Mechanisms and Gatekeeping

**Status**: ANALYSED

**Question**: How do we maintain trust accountability without creating insider/outsider dynamics?

**Resolution**: The tension is real and irreducible — accountability mechanisms inherently create barriers. We choose to **constrain outcomes rather than entry**, defaulting to trust and using structural limits as the safety net.

**Key decisions**:
- The tension doesn't dissolve (unlike Q1–Q4) — we accept it and lean toward openness
- New **Newcomer tier** (bilateral-only, 1 concurrent, identity-verified) replaces vouching as the default entry path
- Flexible identity verification: business registration, professional credentials, or established online presence (accommodates new businesses)
- **Vouching becomes an accelerator** — skips Newcomer tier to Probationary — not a gate. Vouching mechanics unchanged (reputation stake, capacity limits)
- Newcomer → Probationary promotion: 3 bilateral exchanges with 3 different partners, 80%+ satisfaction, 30+ days
- **Newcomer catch-22 fixed**: 0.8x trust multiplier removed, probationary chain length increased to 4, failure attribution changed to "failures attributable to this participant"
- **Network-level fairness**: cross-cluster matching incentive, network position decay (180-day half-life), bounded anchor limits, ongoing anchor activity requirement
- **Monitoring over prevention**: operator tracks newcomer-specific health metrics (first-exchange latency, retention, diversity trends) as governance commitment
- Adversarial testing confirmed bilateral-only newcomer tier is the most effective anti-gaming measure — max blast radius of 1 participant

**Design document**: [Trust and Openness Design](../plans/2026-02-26-trust-and-openness-design.md)

**Research**: [Trust Gatekeeping Research](analysis/2026-02-26-trust-gatekeeping-research.md) — 4 parallel analyses (newcomer scenarios, alternative mechanisms, network health modelling, adversarial testing)

**Philosophy check**: Passed — aligned with all 8 principles. Directly addresses the "Openness vs trust" tension in PHILOSOPHY.md. Principle 6 (Trust through relationships) receives a refinement: network position decay changes implementation but aligns with spirit.

**Depends on**: Subjective Value vs Accountability (Q1), Enterprise Capture vs Peer Vision (Q2)

**Constrains**: Bad Actor Scenarios (Q6), Algorithm Transparency (Q7), Network Bootstrapping (Q8)

**Related decisions**: [Layered Trust Without Shared Accounting](decisions.md#decision-layered-trust-without-shared-accounting)

---

### 6. Bad Actor Scenarios — ANALYSED

**Question**: How do we handle malicious or exploitative participants?

**Status**: Analysed in [Bad Actor Scenarios Design](../plans/2026-02-26-bad-actor-scenarios-design.md).

**Resolution**: Most bad actor types are already addressed by Q1-Q5 decisions through three reinforcing layers: structural prevention (exposure limits, bilateral-only newcomer tier, concentration limits), detection (fulfilment signals, behaviour monitoring, network health metrics), and graduated human-judged response. Three genuine gaps were identified and addressed:

1. **Data harvesting** — The existing algorithm-mediated discovery architecture is the primary defence: participants see only what's relevant to their own exchanges, not a browsable catalogue. Anomalous access detection (decline patterns, view/complete ratios) provides a complementary monitoring layer.
2. **In-flight exchange handling** — Graceful wind-down protocol aligned with Q1's graduated response. The surplus framing softens the hardest case (received but not delivered) — the baseline is zero. Proactive replacement matching supports affected participants.
3. **Response gaming** — Symmetric monitoring of complainant patterns alongside respondent patterns. Compressed-timeline detection for coordinated reporting. Unfounded escalations tracked against the escalator.

**Key decisions**:
- Q1-Q5 collectively handle free riders, quality cheats, reputation manipulators, collusion rings, Sybil attacks, and temporal lag exploitation
- No identity-based restrictions added (consistent with Q5's openness principle)
- The surplus scope directly softens the worst-case bad actor impact
- All response decisions remain human-judged with no automatic penalties

**Philosophy check**: Supports philosophy. Aligned with all 8 principles. No new tensions created.

**Depends on**: Q1 (graduated response framework), Q2 (structural prevention, behaviour monitoring), Q5 (newcomer tier, failure attribution)

**Affects**: Q7 (information visibility tiers define what participants see about matching), Q8 (in-flight handling especially important during bootstrapping)

---

### 7. Algorithm Transparency and Systemic Risk

**Status**: ANALYSED

**Question**: What transparency and oversight should constrain the matching algorithm?

**Resolution**: **Full transparency with structural resilience.** Every participant sees their own scores, match factors, and reasons for matching decisions. Gaming is accepted because aligned incentives (be trustworthy, fulfil commitments, build genuine relationships) aren't a problem. Systemic risk is addressed through a dual concentration defence: diminishing returns in scoring plus a governance-set hard cap on chain participation. Cascade risk monitoring flags fragility for governance review.

**Key decisions**:
- Full transparency of scores and factors to participants (not just logic — the actual numbers)
- Q6's anti-harvesting principle preserved: you see everything about yourself, nothing about other participants
- Dual concentration defence: diminishing returns (soft, in scoring) + hard cap (safety net, governance-set)
- Starting hard cap suggestion: 15% at <50 participants, scaling down as network grows
- Graduated recourse: self-diagnosis via matching profile → formal match audit request → advisory body escalation
- Algorithm governance: minor changes (bug fixes, tuning within approved ranges) are publish-and-comment; major changes (weights, factors, limits, visibility) require advisory body approval
- Emergency changes allowed with 24-hour notification and 30-day expiry without formal approval
- Algorithm changelog: public, append-only record of all changes
- Network health dashboard for advisory body: concentration metrics, matching health, cascade risk, trend monitoring with automatic flagging

**Design document**: [Algorithm Transparency Design](../plans/2026-02-26-algorithm-transparency-design.md)

**Philosophy check**: Supports philosophy. Aligned with all 8 principles. Resolves two named tensions in PHILOSOPHY.md: "Algorithm transparency vs gaming" (full transparency, accept gaming) and "Efficiency vs resilience" (resilience over pure efficiency, governance controls the trade-off).

**Depends on**: Q1 (graduated escalation pattern), Q2 (concentration limits formalised as hard cap), Q3/Q4 (transparent operation commitment operationalised, advisory body powers defined), Q5 (trust scores made visible, newcomer health metrics), Q6 (anti-harvesting principle preserved)

**Related**: [chain-discovery.md](chain-discovery.md), `src/matching/cycles.ts`

---

### Tier 4: Operational

These can be resolved closer to launch, once earlier decisions are made.

---

### 8. Network Bootstrapping

**Question**: How do we seed a viable initial network?

**Context**:
- Historical systems show critical mass is essential (~50+ members minimum)
- Need diversity of offerings for successful matching
- Early failures create negative reputation

**Current thinking**:
- Sector-specific seeding (professional services: law, accounting, marketing, design)
- Anchor participants who bring credibility
- Low-stakes first exchanges to prove value

**Sub-questions**:
- Which sector has best overlap of needs and surplus?
- How do we identify/recruit anchor participants?
- What's the minimum viable network composition?

**Depends on**: Enterprise Capture vs Peer Vision (who are we recruiting?), Trust Mechanisms (how do early members work?)

---

### 9. Taxation and Compliance

**Question**: How do we handle tax treatment of exchanges?

**Context**:
- Surviving systems (WIR, ITEX) are fully tax-compliant
- Exchanges are taxable as barter income in most jurisdictions
- Corporate accounting needs numbers even if network doesn't use shared valuation

**Tension**:
- Network operates without shared valuation
- Tax compliance requires assigning values
- Need to decouple internal accounting from network operation

**Sub-questions**:
- Can we frame as "surplus disposal" rather than commercial transaction?
- What jurisdictional differences matter?
- How do we provide compliance numbers without reintroducing currency?

**Depends on**: Subjective Value vs Accountability (how much shared visibility exists)

---

### 10. Labour Market Effects

**Status**: ANALYSED

**Question**: How might SEP affect employees of participant businesses, and should this influence design?

**Resolution**: Labour market effects are a **governance concern informed by design**, not a protocol concern. SEP operates at business level and cannot see inside participant organisations. The design enables good governance through four mechanisms:

1. **Transparency norm** — participants are expected to be transparent with their employees about SEP participation and what capacity is exchanged. A cultural expectation, not a compliance gate.
2. **Labour-aware signal interpretation** — Q2's surplus scheduling detection gains a governance lens: when patterns surface, "is employee time being routinely allocated rather than genuinely idle?" becomes a relevant question.
3. **Aggregate sector monitoring** — new operator governance commitment to monitor capacity type concentration and volume trends across the network, looking for patterns suggesting substitution for hiring.
4. **Honest positioning** — onboarding materials define surplus as genuinely idle capacity, set the transparency expectation, and name labour effects as something worth reflecting on.

A learning loop (observe, research, adjust) generates evidence for future governance decisions. Evidence before intervention.

**Key decisions**:
- This is governance, not protocol — SEP doesn't model employees or enforce internal business decisions
- Transparency is the lightest intervention that addresses the designation authority concern
- Individual misuse surfaces through Q2's existing behaviour monitoring; aggregate effects through new sector-level monitoring
- No structural constraints on capacity types, no employee consent mechanisms, no employee-facing communication from SEP
- The design is deliberately light because there's no real-world data yet — governance adapts based on evidence

**Design document**: [Labour Market Effects Design](../plans/2026-02-26-labour-market-effects-design.md)

**Philosophy check**: Supports philosophy. Aligned with all 8 principles. Most relevant tension: "Radical intent vs pragmatic survival" — the design is honest that a B2B protocol can't control internal business decisions, but commits to transparency and learning. No PHILOSOPHY.md update needed.

**Depends on**: Enterprise Capture vs Peer Vision (Q2 — surplus scheduling detection, cultural onboarding)

---

## 🅿️ Parking Lot (Future Questions)

- ~~Governance model without central authority~~ → See [Federation Exploration](./federation-exploration.md)
- Dispute resolution mechanisms → Partially addressed in [Federation Exploration](./federation-exploration.md#35-dispute-resolution)
- Agent protocol standards (similar to A2A)
- Integration with existing B2B barter exchanges
- Privacy considerations in activity transparency
- International/cross-border exchange handling
- **Impact on other complementary currency systems** (market crowding, standard capture) — *from [unintended-consequences-analysis.md](unintended-consequences-analysis.md)*
- **Broader economy effects at scale** (monetary policy transmission, price signals, GDP measurement) — *from [unintended-consequences-analysis.md](unintended-consequences-analysis.md)*
- **Impact on non-participants** (competitive disadvantage, exclusion from relationship networks) — *from [unintended-consequences-analysis.md](unintended-consequences-analysis.md)*

---

## Related

- [decisions.md](decisions.md) — Design decision records
- [work-packages.md](work-packages.md) — Work package status (authoritative)
- [unintended-consequences-analysis.md](unintended-consequences-analysis.md) — Comprehensive risk analysis (source for many questions above)
