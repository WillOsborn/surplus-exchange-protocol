# AI Agent Integration Analysis Plan

**Status**: Pre-launch blocker
**Created**: 2026-02-10

## Problem Statement

There is conceptual overlap between:
1. SEP's internal "AI-powered matching" capabilities
2. External AI agents that participants might use to interact with SEP
3. The `agent_matching` schema fields (named for algorithmic matching, not AI agents)

Before launch, we need to:
- Clearly define the boundary between SEP and external agents
- Understand how different agent types would interact with SEP
- Ensure the protocol can support agent participation appropriately
- Update documentation to eliminate confusion

---

## The Boundary Question

### Current Architecture (Implicit)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PARTICIPANT                              │
│                                                                  │
│  Human makes decisions about:                                    │
│  - What surplus to offer                                         │
│  - What needs to register                                        │
│  - Whether to accept proposed matches                            │
│  - Whether exchange was satisfactory                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                           SEP                                    │
│                                                                  │
│  - Stores offerings and needs                                    │
│  - Runs matching algorithm                                       │
│  - Proposes chains to participants                               │
│  - Tracks confirmations and satisfaction                         │
│  - Calculates trust scores                                       │
└─────────────────────────────────────────────────────────────────┘
```

### The Question: Where Do External Agents Fit?

**Option A: Agents as Tools (Outside SEP)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         PARTICIPANT                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              EXTERNAL AI AGENT (optional)                │    │
│  │                                                          │    │
│  │  - Helps human decide what to offer/need                 │    │
│  │  - Evaluates proposed matches                            │    │
│  │  - Recommends accept/reject                              │    │
│  │  - May auto-act within human-set bounds                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                    Human oversight                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                           SEP                                    │
│                                                                  │
│  (Unchanged - sees "participant", doesn't know/care if           │
│   assisted by AI)                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Option B: Agents as First-Class Participants (Inside SEP)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         PARTICIPANT                              │
│                                                                  │
│  Could be:                                                       │
│  - Human                                                         │
│  - Delegated Agent (human principal, bounded authority)          │
│  - Autonomous Agent (minimal human oversight)                    │
│  - Multi-Agent Network (collective of agents)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                           SEP                                    │
│                                                                  │
│  Knows participant type and applies appropriate:                 │
│  - Trust rules                                                   │
│  - Confirmation requirements                                     │
│  - Rate limits                                                   │
│  - Accountability tracking                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Option C: Hybrid (Phased Approach)**

- Phase 1: Option A (agents invisible to SEP, humans always accountable)
- Phase 2: Explicit "delegated authority" mode (SEP-aware delegation)
- Phase 3: Full agent participant types (Option B)

---

## Agent Types to Analyse

Based on colleague research, three agent types need analysis:

### 1. Delegated Agent

**Definition**: An agent with delegated responsibilities from a person, acting within set rules. Requires explicit user approval before actions. Works at human decision-making time scales.

**Key characteristics**:
- Has access to instructions, preferences, constraints set by human
- Can plan, execute, manage tasks across systems
- Asks for approval before committing
- Uses human contact channels (email, messaging)
- Human decision-making pace

**SEP relevance**:
- Could manage offering/need registration
- Could evaluate incoming match proposals
- Could recommend accept/reject to human
- Could auto-accept within defined bounds
- Human always in the loop for final decisions

### 2. Autonomous Buyer

**Definition**: An agent that can decide and transact on its own. May manage part of a supply chain, sense needs, query suppliers, evaluate options, execute purchases.

**Key characteristics**:
- Operates at machine speed
- Humans not needed in the loop
- May use protocols directly (not human channels)
- Can work 24/7
- Keeps audit logs but acts independently
- Example: Printer ordering its own ink

**SEP relevance**:
- Could register needs automatically based on sensor/system data
- Could accept matches instantly (no confirmation window needed)
- Could execute exchanges without human involvement
- Could provide satisfaction signals programmatically
- Raises questions about subjective value, trust, accountability

### 3. Multi-Agent Network

**Definition**: Multiple autonomous agents collaborating to solve complex challenges. Acts as a collective organism.

**Key characteristics**:
- Different specialist agents handle different domains
- May track patterns, identify opportunities, request solutions
- Signal to external marketplaces for needs
- Different agents contribute to different decisions
- Not serving a specific user but a collective purpose

**SEP relevance**:
- A "participant" might actually be multiple agents
- Could have multiple offerings AND multiple needs simultaneously
- Could potentially fulfil multiple positions in a single chain
- Raises questions about identity, accountability, trust aggregation
- Could operate as both provider and recipient in same exchange

---

## Analysis Framework

For each agent type, we will analyse:

### A. Interaction Scenarios

1. **Registration**: How does this agent type register with SEP?
2. **Offering creation**: How does it describe surplus?
3. **Need creation**: How does it describe requirements?
4. **Match evaluation**: How does it assess proposed matches?
5. **Confirmation**: How does it commit to exchanges?
6. **Execution**: How does it deliver/receive value?
7. **Satisfaction**: How does it signal completion quality?

### B. Trust Implications

1. **Identity**: How is the agent identified and verified?
2. **Accountability**: Who is responsible if things go wrong?
3. **Vouching**: Can agents vouch? Be vouched for?
4. **Trust accumulation**: How do agents build trust over time?
5. **Trust signals**: Are agent-to-agent satisfaction signals meaningful?

### C. Protocol Requirements

1. **Speed**: What confirmation timelines are appropriate?
2. **Automation**: What can be auto-approved vs requires human?
3. **Bounds**: How are delegation limits expressed and enforced?
4. **Audit**: What logging/transparency is required?
5. **Override**: How can humans intervene?

### D. Risk Assessment

1. **Gaming**: How might this agent type exploit the system?
2. **Collusion**: How might agents coordinate inappropriately?
3. **Quality**: How do we ensure genuine value exchange?
4. **Accountability gaps**: Where might responsibility become unclear?

### E. Use Case Viability

1. **What exchanges become possible** that weren't before?
2. **What exchanges become problematic** that worked for humans?
3. **What's the value proposition** for SEP supporting this type?

---

## Work Packages

### WP1: Boundary Definition (Pre-requisite)

**Objective**: Clearly define what SEP does vs what external agents do.

**Deliverables**:
- Architecture diagram showing SEP boundary
- Glossary clarifying terminology (rename `agent_matching` if needed)
- Decision on Phase 1 approach (Option A, B, or C above)

**Questions to resolve**:
- Does SEP need to know if a participant is using an AI agent?
- Is "agent-agnostic" a viable Phase 1 position?
- What's the minimum viable agent awareness for Phase 1?

### WP2: Delegated Agent Analysis

**Objective**: Understand how delegated agents would interact with SEP.

**Deliverables**:
- Detailed scenario walkthrough (registration → satisfaction)
- Trust model implications
- Protocol requirements (if any changes needed)
- Risk assessment
- Recommendation for Phase 1/2/3 support level

**Key questions**:
- How does a delegated agent differ from "a human using software"?
- What bounds/constraints should SEP understand?
- When must a human confirm vs when can agent auto-approve?

### WP3: Autonomous Buyer Analysis

**Objective**: Understand how fully autonomous agents would interact with SEP.

**Deliverables**:
- Detailed scenario walkthrough
- Trust model implications (major changes likely)
- Protocol requirements (speed, M2M identity, etc.)
- Risk assessment
- Recommendation for timeline (likely Phase 3+)

**Key questions**:
- Can subjective value work for machines?
- What does "satisfaction" mean for an autonomous buyer?
- How do we prevent autonomous agent gaming?
- Should there be a separate "fast lane" for M2M exchanges?

### WP4: Multi-Agent Network Analysis

**Objective**: Understand how agent collectives would interact with SEP.

**Deliverables**:
- Detailed scenario walkthrough
- Identity and accountability model
- Trust implications (collective trust?)
- Protocol requirements
- Risk assessment
- Recommendation for timeline

**Key questions**:
- Is a multi-agent network one participant or many?
- Can an agent network be on multiple sides of an exchange?
- How does trust work for a collective?
- Who is accountable when the collective misbehaves?

### WP5: Interaction Model Design

**Objective**: Design how each agent type interacts with SEP.

**Deliverables**:
- Interaction diagrams for each agent type
- API/protocol extensions required
- Schema changes (participant types, delegation, etc.)
- Confirmation flow variants
- Trust calculation adjustments

### WP6: Protocol and Schema Updates

**Objective**: Implement necessary changes to support agent participation.

**Deliverables**:
- Updated participant schema (agent type fields)
- Delegation model (bounds, constraints, thresholds)
- Accountability chain representation
- Updated exchange-chain schema (agent metadata)
- Updated trust calculation logic

### WP7: Documentation and Naming

**Objective**: Eliminate confusion in terminology.

**Deliverables**:
- Rename `agent_matching` to avoid confusion (e.g., `algorithmic_matching` or `capability_tags`)
- Update all documentation with clear terminology
- Create "AI Agent Participation Guide" for external developers
- Update scenarios.md with refined agent analysis

### WP8: Capability Translation System

**Objective**: Enable effective matching by translating between provider capacity and recipient needs.

**Deliverables**:
- Capability Translation Service design
- Capability taxonomy (normalised output vocabulary)
- AI-assisted capability definition flow (human onboarding)
- Agent-queryable capability API (Phase 2/Phase 3 support)
- Learning loop from exchange outcomes
- Updated user journey diagrams showing capability definition

**Key questions**:
- Who creates and governs the capability taxonomy?
- How detailed should output definitions be?
- How do we validate that claimed outputs are realistic?
- How do agents translate capacity to outputs automatically?

**Dependencies**:
- Required for effective matching in all modes (human, delegated, autonomous)
- Critical for Phase 1 usability — without this, matching fails

**Related documents**:
- [capability-translation.md](./capability-translation.md) — Full design document

---

## Proposed Timeline

```
WP1: Boundary Definition
├── Week 1: Analysis and options
└── Week 1: Decision documented

WP2: Delegated Agent Analysis
├── Week 2: Scenario development
├── Week 2: Trust/protocol analysis
└── Week 2: Recommendations

WP3: Autonomous Buyer Analysis
├── Week 3: Scenario development
├── Week 3: Trust/protocol analysis
└── Week 3: Recommendations

WP4: Multi-Agent Network Analysis
├── Week 4: Scenario development
├── Week 4: Trust/protocol analysis
└── Week 4: Recommendations

WP5: Interaction Model Design
├── Week 5: Design for Phase 1 scope
└── Week 5: Design for Phase 2/Phase 3 scope

WP6: Protocol and Schema Updates
├── Week 6: Schema changes
└── Week 6: Implementation

WP7: Documentation and Naming
├── Week 7: Terminology updates
└── Week 7: Developer guide
```

---

## Decision Points

### Decision 1: Phase 1 Agent Awareness

**Question**: Should SEP Phase 1 explicitly support agent participants?

**Options**:
- **A**: Agent-agnostic (participants are participants, don't care if AI-assisted)
- **B**: Agent-aware but human-required (know if delegated, but require human confirmation)
- **C**: Full agent support from Phase 1 (all agent types supported)

**Recommendation**: Option B — acknowledge delegation but maintain human accountability.

### Decision 2: Terminology

**Question**: Should we rename `agent_matching` schema fields?

**Options**:
- Keep as-is (accept some confusion)
- Rename to `algorithmic_matching` or `capability_matching`
- Rename to `structured_matching` (emphasises structure over keywords)

**Recommendation**: Rename to `capability_matching` — clearer purpose, no agent confusion.

### Decision 3: Multi-Agent Scope

**Question**: Should multi-agent networks be in scope for Phase 1/Phase 2?

**Options**:
- Phase 1 scope (complex, risky)
- Phase 2 scope (after delegated agents proven)
- Phase 3+ scope (long-term research)
- Out of scope (too complex, defer indefinitely)

**Recommendation**: Phase 3+ scope — significant complexity, need to understand simpler cases first.

---

## Success Criteria

This work is complete when:

1. ✅ Clear boundary defined between SEP and external agents
2. ✅ Each agent type has documented interaction scenarios
3. ✅ Trust implications understood for each type
4. ✅ Protocol changes identified and designed
5. ✅ Phase 1 scope decision made and documented
6. ✅ Terminology confusion eliminated
7. ⏳ Developer guidance available for agent integration

---

## Completion Status

> **Note**: For current work package status, see **[work-packages.md](./work-packages.md)** (authoritative source).

**Key Decisions Made**:
- Phase 1: Agent-Aware, Human-Required (Option B) — [decisions.md](./decisions.md)
- Terminology: `agent_matching` → `capability_matching` — Implemented
- Multi-Agent Networks: Phase 3+ scope — Research complete

**Remaining Items**: See [work-packages.md](./work-packages.md) for current status.

---

## Related Documents

- [scenarios.md](./scenarios.md) — AI Agent Participation scenario
- [decisions.md](./decisions.md) — Architecture decisions including Agent Participation Model
- [participant-taxonomy.md](./participant-taxonomy.md) — Full participant type taxonomy
- [federation-exploration.md](./federation-exploration.md) — Related to identity/accountability
- Schema files in `/schemas/`
- [CHANGELOG.md](/CHANGELOG.md) — Version history and roadmap
