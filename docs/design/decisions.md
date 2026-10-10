# Design Decisions

This document records significant design decisions for the Surplus Exchange Protocol, following an Architecture Decision Record (ADR) format.

---

## Decision: Subjective Value Over Shared Currency

**Date**: 2026-01-12
**Status**: Accepted

### Context

Traditional complementary currency systems (WIR, LETS, Sardex) use some form of shared unit of account, even if not convertible to national currency. This requires valuation agreement at point of exchange, which creates friction and disputes.

### Decision

Each participant maintains their own subjective sense of balance. There is no shared ledger, no network-wide currency, no requirement for parties to agree on exchange value.

### Alternatives Considered

1. **Shared credit units** (like Sardex)
   - Pro: Familiar, enables network-wide balance tracking
   - Con: Requires valuation agreement, creates disputes

2. **Time-based currency** (like Time Banks)
   - Pro: Simple, egalitarian
   - Con: "All time equal" is practically problematic

3. **Fiat-pegged units** (like WIR originally)
   - Pro: Easy valuation
   - Con: Just becomes another currency

### Rationale

The surplus frame means baseline is "better than nothing." If I have unused designer capacity and you have unused accountant capacity, we can both benefit from exchange regardless of whether "1 hour of design = 1 hour of accounting." Each party assesses whether they're better off, on their own terms.

This eliminates valuation disputes while respecting that value is contextual (urgent need = higher subjective value).

### Consequences

- Positive: Eliminates price negotiation friction
- Positive: Respects contextual value differences
- Negative: Harder to track network health metrics
- Negative: Corporate accounting may need workarounds for compliance

### Conditions for Reconsideration

- If free-riding becomes endemic and undetectable without shared metrics
- If tax authorities require shared valuation for compliance

---

## Decision: B2B Focus Over Consumer

**Date**: 2026-01-12
**Status**: Accepted

### Context

Historical analysis shows consumer-focused systems (LETS, Time Banks) have much higher failure rates than business-focused systems (WIR, Sardex, ITEX).

### Decision

Design primarily for business-to-business exchanges, particularly professional services firms with predictable surplus capacity.

### Alternatives Considered

1. **Consumer marketplace** (like Craigslist)
   - Pro: Larger potential user base
   - Con: Lower transaction values, higher fraud, less predictable surplus

2. **Hybrid approach**
   - Pro: Maximum flexibility
   - Con: Muddled value proposition, harder to bootstrap

### Rationale

Businesses have:
- Predictable, describable surplus (capacity, inventory)
- Incentive to manage tax/accounting properly
- Higher stakes per exchange (more motivation for quality)
- Professional communication norms
- Existing trust relationships to leverage

### Consequences

- Positive: Higher average transaction value
- Positive: More predictable surplus patterns
- Positive: Professional accountability
- Negative: Smaller initial addressable market
- Negative: May exclude beneficial consumer use cases

### Conditions for Reconsideration

- Once B2B network is stable, could expand to consumer
- If specific consumer use case shows clear viability

---

## Decision: Sector-Specific Seeding

**Date**: 2026-01-12
**Status**: Proposed

### Context

Network effects are critical. A network with participants in unrelated fields can't find matches. Historical systems that survived had geographic or sector concentration.

### Decision

Seed initial network within a specific sector where participants have overlapping needs and surplus, likely professional services (law, accounting, marketing, design, consulting).

### Alternatives Considered

1. **Geographic seeding** (like Sardex)
   - Pro: Cultural fit, local trust
   - Con: Limits to one region, may not have sector diversity

2. **Open registration**
   - Pro: Maximum growth
   - Con: Likely mismatch of offerings, early failures

### Rationale

Professional services firms:
- Have regular need for each other's services
- Have predictable surplus (underutilised staff time)
- Operate in similar business contexts
- Can describe capabilities in similar structured ways

### Consequences

- Positive: Higher match probability early on
- Positive: Similar capability description patterns
- Negative: Limits initial growth
- Negative: May create sector bubble

### Conditions for Reconsideration

- If initial sector shows insufficient match density
- Once viable, expand to adjacent sectors

---

## Decision: Protocol Over Platform

**Date**: 2026-01-12
**Status**: Accepted

### Context

Could build as centralised platform (easier to control, faster to iterate) or as open protocol (decentralised, no single control point).

### Decision

Design as an open protocol that multiple implementations could use, similar to email (SMTP) or web (HTTP).

### Alternatives Considered

1. **Centralised platform** (like Sardex)
   - Pro: Easier to build, control, monetise
   - Con: Single point of failure, trust dependency

2. **Blockchain-based**
   - Pro: Decentralised, transparent
   - Con: Complexity, energy, doesn't solve core matching problem

### Rationale

A protocol enables:
- No single control point
- Competition between implementations
- Portable reputation/trust
- Interoperability
- Resilience to any single operator failing

### Consequences

- Positive: Long-term resilience
- Positive: Enables ecosystem development
- Negative: Slower initial development
- Negative: Harder to iterate on protocol than product
- Negative: Coordination challenges

### Conditions for Reconsideration

- If protocol development proves too slow
- Could start as platform, extract protocol later

---

## Decision: Layered Trust Without Shared Accounting

**Date**: 2026-02-05
**Status**: Accepted

### Context

Participants need to assess trustworthiness of potential exchange partners without shared currency providing "proof" of past transactions. The system must avoid reintroducing currency-like accounting while providing practical trust signals.

Historical systems show:
- Ratings alone are easily gamed (reputation manipulation)
- Balance tracking reintroduces the currency problem we're avoiding
- New participants need a path to establish trust
- Professional B2B context provides baseline accountability

### Decision

Implement a layered trust model with three components:

**Layer 1: Verifiable Identity (baseline)**
- Participants must verify business identity (company registration, professional credentials)
- Creates accountability and legal recourse
- Existing professional reputation carries forward

**Layer 2: Network Position (emergent)**
- Track relationship graph, not transaction values
- Metrics: diversity of exchange partners, repeat relationships, network centrality
- "Well-connected in the network" signals trustworthiness
- Harder to fake than ratings (requires actual exchanges with real participants)

**Layer 3: Mutual Satisfaction (post-exchange)**
- Simple satisfaction signal after each exchange (satisfied / partially satisfied / not satisfied)
- Qualitative feedback optional, not numeric ratings
- Avoid precise scores that invite gaming and comparison

**Newcomer pathway:**
- Graduated exposure: first exchanges limited to lower-stakes offerings
- Vouching: existing members can sponsor newcomers (reputation at stake)
- Probationary period with visible "new participant" status

### Alternatives Considered

1. **Numeric reputation scores** (like eBay/Uber)
   - Pro: Familiar, quantitative
   - Con: Gaming, manipulation, creates implicit valuation

2. **Balance thresholds** (must give before receiving more)
   - Pro: Structural prevention of free-riding
   - Con: Reintroduces currency-like accounting, contradicts subjective value decision

3. **Transparency only** (publish all activity, let others judge)
   - Pro: No central authority
   - Con: Privacy concerns, doesn't help newcomers, sophisticated actors still game it

4. **Collateral/deposit requirements** (like WIR)
   - Pro: Strong accountability
   - Con: Excludes participants without capital, contradicts surplus philosophy

### Rationale

This layered approach:

1. **Respects subjective value**: No transaction values tracked, only relationships and satisfaction
2. **Leverages B2B context**: Business identity verification provides baseline accountability that consumer systems lack
3. **Makes gaming expensive**: Faking network position requires actual exchanges with real participants over time
4. **Supports newcomers**: Clear pathway through vouching and graduated exposure
5. **Degrades gracefully**: Each layer provides value independently

The key insight is that **relationship patterns are harder to fake than ratings**. A participant with diverse, repeated exchange relationships across the network is demonstrably engaged, regardless of how any individual rates them.

### Consequences

- Positive: Avoids reintroducing currency through the back door
- Positive: Network position metrics provide rich signal
- Positive: Vouching creates skin-in-the-game for sponsors
- Positive: Simple satisfaction signals reduce gaming incentive
- Negative: More complex to implement than simple ratings
- Negative: Network position metrics take time to accumulate
- Negative: Vouching could create cliques if not managed

### Implementation Notes

**Identity verification** should be lightweight but real:
- UK: Companies House registration check
- Professional services: Professional body membership
- Could partner with existing KYB (Know Your Business) providers

**Network position metrics** to track:
- `exchange_partners_count`: Number of distinct partners
- `repeat_partner_rate`: Proportion of partners exchanged with more than once
- `partner_diversity`: Distribution across sectors/offerings
- `network_reach`: Degrees of connection to broader network
- `vouches_given` / `vouches_received`: Sponsorship activity

**Satisfaction signals** should be:
- Required within 14 days of exchange completion
- Three options only: satisfied, partially satisfied, not satisfied
- Optional free-text for "partially" or "not" responses
- Visible to potential future partners

### Conditions for Reconsideration

- If network position metrics prove too slow to accumulate for viable matching
- If satisfaction gaming becomes endemic despite simplified signals
- If vouching creates problematic clique dynamics
- If newcomer pathway proves too slow for network growth

---

## Decision: Agent Participation Model (Phase 1: Agent-Aware, Human-Required)

**Date**: 2026-02-10
**Status**: Accepted

### Context

There is conceptual overlap between:
1. SEP's internal "capability matching" (algorithmic cycle detection)
2. External AI agents that participants might use to interact with SEP
3. The future possibility of fully autonomous AI participants

Before launch, we needed to clarify the boundary between SEP infrastructure and external agents, and decide how much agent-awareness to build into Phase 1.

### Decision

Implement **Option B: Agent-Aware, Human-Required** for Phase 1:

- SEP acknowledges that participants may use AI agents
- Participants can optionally declare delegation status
- Human confirmation is required for all commitments
- Accountability always rests with the human/organisation principal
- Full agent participant types (autonomous buyers, multi-agent networks) deferred to Phase 2/Phase 3

### Alternatives Considered

1. **Option A: Agent-Agnostic**
   - Pro: Simplest implementation, no special handling
   - Con: No visibility into delegation, potential confusion, no path to agent support

2. **Option C: Full Agent Support from Phase 1**
   - Pro: Future-proof, enables machine-speed matching
   - Con: Significant complexity, trust model changes, accountability gaps

### Rationale

Option B provides a pragmatic middle ground:

1. **Maintains human accountability**: Clear legal and reputational responsibility
2. **Acknowledges reality**: Participants will use AI tools regardless
3. **Enables transparency**: Other participants can see delegation status
4. **Creates foundation**: Architecture supports Phase 2/Phase 3 evolution
5. **Reduces risk**: Human confirmation prevents agent runaway

### Consequences

- Positive: Clear accountability in all exchanges
- Positive: Transparency about delegation status
- Positive: Reduces early complexity
- Positive: Creates upgrade path for agent participation
- Negative: May limit adoption by fully automated systems
- Negative: Human confirmation creates latency in exchange cycles

### Implementation Notes

**Terminology changes:**
- Rename `agent_matching` → `capability_matching` to avoid confusion
- Use "Matching Engine" not "AI matching" for SEP's internal matching

**Schema additions:**
- Participant type taxonomy (human/org/agent categories)
- Optional delegation declaration
- Human verification requirement for confirmations

**Phase 2 preparation:**
- Design delegation bounds schema
- Plan conditional auto-confirmation for bounded actions

### Related Documents

- [sep-boundary-definition.md](./sep-boundary-definition.md) — Detailed boundary specification
- [participant-taxonomy.md](./participant-taxonomy.md) — Full participant type taxonomy
- [agent-integration-plan.md](./agent-integration-plan.md) — Overall integration plan

### Conditions for Reconsideration

- If human confirmation latency proves problematic for network velocity
- If significant demand emerges for autonomous agent participation
- After Phase 1 proves stable, proceed to Phase 2 with delegation bounds

---

## Decision: Deployment Architecture (Managed Service → Federation)

**Date**: 2026-02-09
**Status**: Accepted (2026-10-10), as resolved by the [Deployment & Federation Design](../plans/2026-02-26-deployment-and-federation-design.md): a governed managed service with a federation escape hatch. The options analysis below is kept for history.

### Context

The matching algorithm requires global visibility of the network graph to find exchange cycles. Johnson's algorithm for cycle detection needs to see the complete graph—you cannot find a cycle A→B→C→A if node C is on a different system that A's system cannot see.

Similarly, trust scores aggregate satisfaction signals from across the network. A participant's network position metrics (partner diversity, repeat relationships) only make sense in context of the whole network.

This creates an architectural tension: the protocol design emphasises decentralisation and no single control point, but the core matching algorithm appears to require centralised computation.

### Options Under Consideration

**Option 1: Fully Centralised Managed Service**

A single operator runs the matching engine, trust calculations, and participant registry.

Pros:
- Simplest to build and operate
- Optimal matching (full graph visibility)
- Single source of truth for trust scores
- Clear accountability

Cons:
- Single point of failure
- Trust concentration in one operator
- Vendor lock-in
- Contradicts "Protocol Over Platform" decision
- What happens if operator fails, exits, or becomes hostile?

**Option 2: Federated Network (like Email/Mastodon)**

Multiple operators run nodes that federate using a common protocol. Participants choose which node to join, nodes synchronise state and collaborate on matching.

Pros:
- No single control point
- Participant choice of operator
- Resilience to any single node failing
- Competition between operators on service quality
- Aligns with "Protocol Over Platform" decision

Cons:
- More complex to build
- Cross-node matching requires federation protocol
- Trust attestation across nodes is challenging
- Potential for network fragmentation
- Consensus requirements for some operations

**Option 3: Hybrid (Start Managed, Design for Federation)**

Launch with a single managed service to validate the model, but design the architecture from day one to support federation later.

Pros:
- Faster time to initial launch
- Learn what's needed before committing to federation design
- Clear migration path
- Reduces early complexity
- Can expand to federation when scale justifies it

Cons:
- Technical debt if federation not planned properly
- Early participants may be locked to initial operator
- Could become permanently centralised if federation never prioritised

### Current Recommendation

**Option 3 (Hybrid)** appears most pragmatic:

1. **Phase 1**: Single managed service, but with clear operator/protocol separation
2. **Phase 2**: Federation protocol allowing additional nodes
3. **Phase 3+**: Full federation with seamless cross-node matching

Key architectural decisions to make federation viable later:
- Participant identity separate from node identity
- Trust attestations portable between nodes
- Matching algorithm designed for partitioned graphs
- Clear API boundaries between components

### Open Questions Requiring Resolution

1. **Who operates Phase 1?**
   - Commercial company (revenue-motivated)
   - Consortium of initial participants
   - Non-profit/social enterprise
   - Academic/research institution
   - Government agency (export/trade promotion)

2. **What governance prevents lock-in?**
   - Open source requirement?
   - Data portability mandates?
   - Multi-stakeholder board?
   - Protocol ownership structure?

3. **When does federation become necessary?**
   - At what scale does single operator become problematic?
   - What triggers the transition?
   - How do we prevent "too big to federate" dynamics?

4. **How does cross-node matching work?**
   - Real-time graph synchronisation vs query federation?
   - Trust score computation across nodes?
   - Dispute resolution when exchange spans nodes?

### Related Documents

- See [Federation Architecture Exploration](./federation-exploration.md) for detailed technical analysis
- See "Protocol Over Platform" decision above for context
- See open-questions.md "Parking Lot: Governance model without central authority"

### Conditions for Decision

This decision should be finalised before:
- Significant implementation investment
- Recruiting pilot participants
- Any public launch

### Consequences (Once Decided)

To be documented when decision is made.

---

## Decision: Phase 1b — Enforce the Design

**Date**: 2026-10-10
**Status**: Accepted

### Context

Phase 1 (design work plus a reference implementation) was declared 100% complete in March 2026. A whole-repository review in October 2026 ([code-review-2026-10.md](analysis/code-review-2026-10.md)) found that the reference implementation does not enforce most of the properties the approved designs depend on:
- matching returns the first cycles found rather than the best, ignores per-participant tier limits, and doesn't select non-overlapping chains
- the protocol cannot commit a chain through messages and has no authentication
- trust can be gamed by a ring of colluding accounts
- several approved February designs are unimplemented or contradicted by the code

At the same time, research published in 2026 ([landscape-scan-2026-10.md](../research/landscape-scan-2026-10.md)) showed that LLM agents bartering on their own fail at scale. That makes SEP's designed clearing mechanism (the matcher) the central claim to prove.

### Decision

Begin Phase 1b with the goal of **making the reference implementation enforce the design and produce evidence**, in four stages:

1. **A: Make it honest.** Quick correctness fixes, and correct the documentation and status records.
2. **B: Matcher as thesis.** Rework the matcher (top-k search, per-participant limits, non-overlapping chain selection), and build a simulation harness that measures clearing rate, concentration, newcomer inclusion and collusion robustness against bilateral-barter and money baselines.
3. **C: Enforce the designs.** Align trust with Q5 and add an anti-collusion diversity rule; enforce tiers in matching; implement the Q1 fulfilment signal and Q9.
4. **D: Protocol on standards.** Write the A2A alignment design note, then rebuild the protocol layer with validation, sender binding, confirmation tallies and edge-derived state.

Capability translation is redesigned for current models alongside Stage B. Each stage ends with a visible, dated progress update on the website.

### Alternatives Considered

1. **Proceed with the post-Phase-1 roadmap** (Q8 analysis, agent participation guide, website). Rejected: it builds on guarantees the code does not provide.
2. **Patch the review's findings one by one, without restructuring.** Rejected for matching and protocol: the problems are structural (search strategy, missing selection stage, a state machine with no participant model).

### Rationale

SEP's claim is that designed clearing succeeds where agents bartering on their own fail. That claim is only as credible as the matcher and the evidence behind it. Fixing honesty first protects credibility. Simulation turns the argument into evidence and calibrates thresholds that are currently guesses.

### Consequences

- "Phase 1: 100% complete" stays true for its original scope; Phase 1b progress is tracked in [work-packages.md](work-packages.md)
- Q8 analysis and WP9 are deferred until after Stage B, since both depend on knowing what the matcher can achieve
- Public claims (website, developer guide) are corrected in Stage A and then updated with evidence after Stage B

### Conditions for Reconsideration

- If simulation shows designed clearing does not materially outperform the bilateral baseline: revisit the core insight before investing in Stages C and D

---

## Decision: February 2026 Design Set (Q1–Q7, Q10)

**Date**: 2026-10-10 (designs written and approved 2026-02-26; formally recorded here)
**Status**: Accepted

### Context

Eight open questions were analysed in February 2026 and each design document was marked "Approved". Their decisions were never recorded in this file, so under the question lifecycle in [open-questions.md](open-questions.md) they still appeared as pending. This entry records them as accepted.

### Decision

| Question | Decision in brief | Design |
|---|---|---|
| Q1: Subjective value vs accountability | Track commitment fulfilment, not balance; graduated, human-judged response | [commitment-based-accountability](../plans/2026-02-26-commitment-based-accountability-design.md) |
| Q2: Enterprise capture vs peer vision | Behaviour not identity; structural prevention (concentration limits, relationship diversity) plus behaviour monitoring | [peer-exchange-protection](../plans/2026-02-26-peer-exchange-protection-design.md) |
| Q3/Q4: Deployment and federation | Governed managed service with binding governance commitments and a federation escape hatch | [deployment-and-federation](../plans/2026-02-26-deployment-and-federation-design.md) |
| Q5: Trust mechanisms and gatekeeping | Four tiers with defined thresholds, vouching, decay and failure attribution | [trust-and-openness](../plans/2026-02-26-trust-and-openness-design.md) |
| Q6: Bad actor scenarios | Staged response, chain freezing, partner notification; anti-harvesting | [bad-actor-scenarios](../plans/2026-02-26-bad-actor-scenarios-design.md) |
| Q7: Algorithm transparency and systemic risk | Full transparency; concentration hard cap; algorithm changelog; advisory-body governance | [algorithm-transparency](../plans/2026-02-26-algorithm-transparency-design.md) |
| Q10: Labour market effects | Governance concern informed by design: transparency norm, sector monitoring | [labour-market-effects](../plans/2026-02-26-labour-market-effects-design.md) |

### Consequences

- These questions move to RESOLVED in open-questions.md
- **Accepted is not implemented.** Much of what these designs require is not yet in the code (see [code review](analysis/code-review-2026-10.md), "Designed but not implemented"). Implementation is tracked in Phase 1b, mainly WP11 and WP13.
- Where the code contradicts an accepted design (for example the Q5 tier thresholds), the design is authoritative until it is formally revised.

---

## Decision: Taxation and Compliance — Declared Values at the Tax Boundary

**Date**: 2026-10-10
**Status**: Accepted

### Context

Q1 left tax as a participant responsibility, with the network providing no valuations. Since then, Italy has made barter VAT depend on a value the parties set in their contract, and VAT-registered UK participants need a value on each VAT invoice regardless. Without support from SEP, those values move outside the protocol, where nothing keeps them consistent between counterparties or away from matching.

### Decision

1. **Declared values at the tax boundary.** Each supplier declares a money value for each supply. It is shared only with that supply's recipient and is never read by matching, trust or governance, a rule enforced structurally and by test.
2. **VAT handling built in.** Participants record their VAT status. Before approving a chain, each participant sees their VAT position, including any VAT they cannot reclaim. SEP generates VAT invoice data and a settlement statement. SEP never holds or moves money.
3. **UK pilot first.** More complex jurisdictions (for example Italy's agreed-value rule) come later, along with the bilateral agreement step they need. No US participants until operator reporting duties are assessed.

Full design: [Taxation and Compliance Design](../plans/2026-10-10-taxation-and-compliance-design.md). Questions for an adviser: [tax-adviser-questions.md](tax-adviser-questions.md).

### Alternatives Considered

1. **Status quo** (participants value privately): purest to Principle 1, but values move outside SEP unmanaged, and it fails agreed-value regimes
2. **Network-assigned market value**: rejected; reintroduces a shared currency in all but name

### Consequences

- Refines Q1's "Tax Compliance (Out of Scope)"
- Adds a tension to PHILOSOPHY.md: subjective value vs the monetary state
- "No money" needs a footnote: VAT amounts are normally settled in cash between participants
- The operator holds commercially sensitive figures, which needs access control and retention rules
- Implementation: backlog B1 (WP13). Open legal questions: B2

### Conditions for Reconsideration

- If adviser review finds that multi-party cycles cannot be treated as supplies for consideration on the per-supply model
- If declaring values measurably erodes the surplus-sharing culture in the pilot

---
