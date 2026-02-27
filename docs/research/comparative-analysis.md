# Comparative Analysis: Research Synthesis for SEP

**Status**: Complete
**Last Updated**: 2026-02-05
**Synthesised from**: needs-research-findings.md, execution-research-findings.md, historical-systems-deep-dive.md, agentic-protocols-analysis.md

## Executive Summary

This document synthesises findings from three parallel research streams to inform SEP's design:
1. **Need Representation** - How systems capture what participants want
2. **Execution Protocols** - How multi-party transactions coordinate and handle failures
3. **Historical Systems** - What we can learn from 90 years of complementary currency experiments

**Core synthesis**: SEP's success depends on solving the matching problem (AI advantage) while avoiding the execution and trust failures that killed most alternative exchange systems.

---

## Cross-Cutting Themes

### Theme 1: Active Matching vs Passive Directories

| Research Area | Finding | Implication for SEP |
|---------------|---------|---------------------|
| **Needs Research** | Marketplaces (Upwork, Alibaba) succeed with skill taxonomies and structured search; recommendation systems infer needs from behaviour | SEP needs structured capability descriptions AND AI inference |
| **Execution Research** | ITEX trade directors construct multi-party trades; Letter of Credit uses documentary coordination | Matching isn't enough; execution coordination is a distinct function |
| **Historical Systems** | Sardex thrives with 50+ trade brokers; LETS fails with passive directories | Active brokerage is essential; AI must replace human brokers |

**SEP Design Decision**: AI agents must actively propose matches, not just provide search tools. The broker function (identifying needs, finding providers, constructing chains) is the core value proposition.

### Theme 2: Progressive Commitment and Trust

| Research Area | Finding | Implication for SEP |
|---------------|---------|---------------------|
| **Needs Research** | Dating apps use "deal-breakers" vs "preferences"; UNOS uses objective urgency scoring | Distinguish hard constraints from soft preferences |
| **Execution Research** | 3PC introduces tentative interest before firm commitment; sagas allow compensation | Three-phase: interest → commitment → execution |
| **Historical Systems** | WIR uses collateral; Sardex uses algorithmic limits; LETS allows unlimited debt (fails) | Must have accountability mechanism for commitments |

**SEP Design Decision**: Implement three-phase confirmation (tentative → firm → execute) with limits based on track record. New participants get small limits; proven participants get larger ones.

### Theme 3: Handling Failure Gracefully

| Research Area | Finding | Implication for SEP |
|---------------|---------|---------------------|
| **Needs Research** | Partial fulfilment common; systems track "partially satisfied" states | Need schema must support partial matches |
| **Execution Research** | Saga pattern with compensation is best fit; circuit breakers prevent cascade | Compensation mechanisms essential; monitor for early warning |
| **Historical Systems** | ITEX reverses credits on non-delivery; Sardex brokers mediate disputes | Dispute resolution with clear escalation path |

**SEP Design Decision**: Implement saga pattern with compensation. Define compensation actions for each edge type. Use circuit breaker pattern to detect failures before cascade.

### Theme 4: Value Representation Without Money

| Research Area | Finding | Implication for SEP |
|---------------|---------|---------------------|
| **Needs Research** | Budget anchoring is pervasive; AngelList shows equity (non-monetary) representation possible | Non-monetary value representation is hard but achievable |
| **Execution Research** | ITEX trade dollar = 1 USD; escrow requires fungible assets | Monetary equivalence simplifies but contradicts SEP philosophy |
| **Historical Systems** | TimeBanks "all time equal" fails for quality differentiation; WIR/Sardex use monetary equivalents | Pure subjective value is untested at scale |

**SEP Design Decision**: Subjective value ledgers (each participant tracks their own sense of balance) avoid the "all time equal" trap while not requiring shared valuation. This is novel and must be tested.

---

## Pattern Comparison Matrix

### Need Representation Patterns

| Pattern | Marketplaces | Barter Systems | Recommendation | SEP Fit |
|---------|--------------|----------------|----------------|---------|
| Structured categories | High use | Medium use | Low (inferred) | Adopt |
| Freeform description | High use | High use | N/A | Adopt |
| Skill/capability taxonomy | High use | Low use | N/A | Adopt (core) |
| Budget/price anchoring | Essential | Trade credits | N/A | Replace with capacity |
| Urgency signals | Medium | Low | N/A | Adopt (temporal + contextual) |
| Behavioural inference | Low | Low | Essential | Adopt (long-term) |
| Progressive disclosure | High (wizards) | Low | N/A | Adopt |

### Execution Patterns

| Pattern | Distributed Systems | Blockchain | Traditional Trade | Barter Systems | SEP Fit |
|---------|---------------------|------------|-------------------|----------------|---------|
| Atomic commit (2PC/3PC) | Core | N/A | N/A | N/A | Partial (confirmation only) |
| Saga compensation | Microservices | N/A | N/A | N/A | Adopt (core) |
| Hash time-lock | N/A | Atomic swaps | N/A | N/A | Timing patterns only |
| Multi-sig approval | N/A | Wallets | N/A | N/A | Adopt (N-of-N confirmation) |
| Documentary evidence | N/A | N/A | Letter of Credit | N/A | Adopt |
| Trade broker coordination | N/A | N/A | N/A | ITEX, Sardex | AI replaces |
| Tiered dispute resolution | N/A | N/A | ODR | eBay | Adopt |

### Trust Patterns

| Pattern | WIR | Sardex | ITEX | TimeBanks | LETS | SEP Fit |
|---------|-----|--------|------|-----------|------|---------|
| Collateral/security | Real estate | None | Limited | None | None | Reputation-based alternative |
| Credit limits | Business turnover | Algorithm | Business type | N/A | Often absent | Track record based |
| Professional staff | 200+ employees | 50+ employees | Paid staff | Usually no | No | Automate via AI |
| Active brokerage | Partial | Core function | Core function | Sometimes | No | AI broker (core) |
| Cyclic closure tracking | No | Yes | Informal | No | No | Adopt |
| Institutional anchor | Self (bank) | VC funding | For-profit | Often needed | Absent | Sustainable fee model |

---

## Agentic Protocol Integration Analysis

### Where SEP Fits in the Agentic Ecosystem

| Protocol | Focus | Monetary? | Multi-party? | SEP Relationship |
|----------|-------|-----------|--------------|------------------|
| **A2A** | Task delegation | External | Yes (DAG) | Adopt patterns, bridge for integration |
| **MCP** | Tool access | N/A | No | Adopt capability descriptions |
| **UCP** | Consumer commerce | Yes | Two-party | Differentiate; possible hybrid chains |
| **Agent Payment** | Transactions | Yes | Two-party | Bridge for monetary edge in hybrid |
| **SEP** | Surplus exchange | No (subjective) | Yes (cycles) | Unique niche |

### Capability Description Alignment

SEP capability offerings should be expressible in multiple formats for interoperability:

```
SEP Native → A2A Agent Card → MCP Tool Definition
     ↑              ↓                 ↓
  Core schema   Discovery        AI Assistants
```

**Recommended approach**: Define SEP capability schema as source of truth; generate A2A and MCP representations for external discovery.

---

## Risk Analysis

### High-Risk Design Decisions

| Decision | Risk | Mitigation | Evidence |
|----------|------|------------|----------|
| Subjective value ledgers | Untested at scale; may not create sufficient accountability | Start with trusted network; track "balance of satisfaction" | No direct precedent; theoretical justification from economics |
| AI replacing human brokers | Trust deficit vs human brokers; explanation challenges | Transparency in matching rationale; human approval checkpoints | A2A, MCP show AI tool coordination; no precedent for AI trust-building |
| Multi-party cyclic chains | Execution complexity; cascade failure risk | Saga compensation; circuit breakers; start with 3-party chains | ITEX/Sardex do this manually; complexity increases with chain length |
| Long-running execution | State management; participant availability | Persistent state; reminder systems; timeout handling | Traditional trade (LC) manages months-long transactions |

### Medium-Risk Design Decisions

| Decision | Risk | Mitigation | Evidence |
|----------|------|------------|----------|
| B2B professional services focus | Limits market size initially | Clearer value prop; expand after proving model | WIR, Sardex, ITEX all B2B; consumer systems struggle |
| No monetary equivalence | Difficult to communicate value; tax/accounting complexity | Work with accountants on guidance; frame as "services received" | Novel approach; requires regulatory dialogue |
| Decentralised protocol | Coordination overhead; no central enforcement | Clear protocol specification; reference implementation | A2A shows decentralised agent coordination |

---

## Recommended Architecture

Based on research synthesis, SEP should implement:

### 1. Need Schema (from Needs Research)

```
Need {
  type: service | physical_good | access | space
  description: freeform text
  capability_links: [references to capability taxonomy]
  constraints: {
    hard: [must-haves]
    soft: [nice-to-haves with weights]
  }
  urgency: {
    temporal: deadline
    contextual: [inferred signals]
  }
  status: active | fulfilled | expired | withdrawn
}
```

**Key decisions**:
- Capability linking enables AI matching
- Constraint separation supports progressive filtering
- Urgency combines explicit + inferred signals
- Status tracks need lifecycle

### 2. Execution Protocol (from Execution Research)

```
Chain Lifecycle:
  DRAFT → PROPOSED → CONFIRMING → COMMITTED → EXECUTING → COMPLETED
                         ↓             ↓            ↓
                     DECLINED      CANCELLED      FAILED

Edge Lifecycle (within chain):
  PROPOSED → CONFIRMED → IN_PROGRESS → DELIVERED → SATISFIED
                              ↓             ↓
                          ABANDONED     DISPUTED → RESOLVED
```

**Key decisions**:
- Saga pattern for long-running coordination
- Three-phase confirmation (interest → commitment → execution)
- Circuit breaker for failure detection
- Compensation mechanisms for each edge type

### 3. Trust Model (from Historical Research)

```
Trust Tiers:
  PROBATIONARY: New participant, limited exposure
    - Max chain size: 3 participants
    - Max execution window: 30 days
    - Requires vouching from established member

  ESTABLISHED: Proven track record
    - Max chain size: 6 participants
    - Max execution window: 90 days
    - Based on: completed chains, satisfaction signals, time in network

  ANCHOR: High-trust, high-volume participant
    - No limits
    - Can vouch for new members
    - Based on: long track record, network contribution
```

**Key decisions**:
- Graduated exposure limits risk
- Track record replaces collateral
- Vouching creates accountability chain
- No "all time equal" - quality differentiation through satisfaction signals

### 4. AI Agent Role (synthesised)

The AI agent performs three functions that historical systems required humans for:

| Function | Historical Equivalent | AI Implementation |
|----------|----------------------|-------------------|
| **Matching** | Sardex trade broker, ITEX trade director | Chain discovery algorithm; need-capability matching |
| **Coordination** | BPMN orchestrator, Letter of Credit banks | Protocol message routing; state management; timeout handling |
| **Trust Assessment** | WIR credit analysis, personal relationships | Track record analysis; network graph analysis; satisfaction aggregation |

---

## Implementation Priority

Based on research findings, recommended implementation order:

### Phase 1: Core Protocol
1. **Capability schema** (need + offering) - enables matching
2. **Chain state machine** - enables execution
3. **Protocol messages** - enables communication
4. **Basic matching algorithm** - enables value demonstration

### Phase 2: Trust and Safety
5. **Trust tier system** - limits exposure
6. **Satisfaction signalling** - enables reputation
7. **Dispute resolution** - handles failures
8. **Circuit breaker** - prevents cascades

### Phase 3: Integration
9. **A2A compatibility** - enables discovery
10. **MCP tool wrappers** - enables AI assistant access
11. **Hybrid chain support** - enables monetary edge integration

### Phase 4: Scale
12. **Collaborative filtering** - improves matching with history
13. **Network health monitoring** - maintains balance
14. **Cyclic closure optimisation** - prevents linear accumulation

---

## Open Questions Requiring Further Research

1. **Compensation quantification**: How do we express compensation without monetary equivalence? Reputation adjustment? Future priority? External settlement option?

2. **Subjective value reconciliation**: When participant A thinks they gave more than they received and participant B thinks the same, how does the network reconcile?

3. **Physical goods logistics**: Services can be delivered remotely; physical goods require shipping. How does SEP integrate with logistics without monetary payment for shipping?

4. **Tax treatment**: How do tax authorities treat non-monetary exchange? Need jurisdiction-specific legal research.

5. **Privacy vs transparency**: How much of participant track record should be visible? Balance between informed decisions and competitive sensitivity.

6. **Network bootstrap**: How do we achieve critical mass (50+ diverse members) before network effects kick in? Anchor participant strategy?

---

## References

See individual research documents for full reference lists:
- [needs-research-findings.md](needs-research-findings.md)
- [execution-research-findings.md](execution-research-findings.md)
- [historical-systems-deep-dive.md](historical-systems-deep-dive.md)
- [agentic-protocols-analysis.md](agentic-protocols-analysis.md)

### Key Academic Sources (Cross-Cutting)

- Stodder, J. (2009). "Complementary Credit Networks and Macroeconomic Stability" - WIR countercyclical evidence
- Sartori & Dini (2016). "From complementary currency to institution" - Sardex success factors
- Williams, C.C. (1996-2007). LETS failure pattern research
- Garcia-Molina & Salem (1987). Sagas - long-running transaction pattern
- Google A2A Protocol Specification (2025) - agent coordination patterns
