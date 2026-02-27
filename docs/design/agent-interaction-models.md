# WP5: Agent Interaction Models

**Status**: Complete
**Created**: 2026-02-10
**Related**: [agent-analysis-delegated.md](./agent-analysis-delegated.md), [agent-analysis-autonomous.md](./agent-analysis-autonomous.md), [agent-analysis-multi-agent.md](./agent-analysis-multi-agent.md)

## Purpose

This document synthesises the findings from WP2-4 into concrete interaction models for each agent type, defining how they interact with SEP across the participant lifecycle.

---

## Summary Matrix

### Agent Type Comparison

| Aspect | Human/Org | Delegated Agent | Autonomous Buyer | Multi-Agent Network |
|--------|-----------|-----------------|------------------|---------------------|
| **Target Version** | Phase 1 | Phase 2 | Phase 3+ | Phase 3+ (Research) |
| **Decision Speed** | Hours-days | Hours (human review) | Seconds | Minutes-hours |
| **Human in Loop** | Always | Confirmation only | Audit only | Escalation only |
| **Accountability** | Direct | Via principal | Via operator | Via legal entity |
| **Trust Model** | Standard | Principal's trust | Separate metrics | Collective trust |
| **Suitable For** | All exchanges | All exchanges | Goods only | Goods, maybe services |
| **Gaming Risk** | Low | Low | Medium-High | High |

---

## Phase 1 Interaction Model: Human/Organisation Participants

### Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE 1: HUMAN/ORGANISATION PARTICIPANT                  │
│                                                                          │
│  REGISTRATION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. Human/org submits registration                                │   │
│  │  2. Identity verification (Companies House, professional body)   │   │
│  │  3. Account created, status: probationary                        │   │
│  │  4. Representative(s) assigned                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  OFFERING/NEED CREATION                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  5. Human creates offering/need (may use AI tools to draft)     │   │
│  │  6. Human reviews and submits                                     │   │
│  │  7. SEP validates against schema                                  │   │
│  │  8. Offering/need goes live                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  MATCHING                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  9. SEP matching engine finds cycles                              │   │
│  │  10. Match proposals sent to participants                         │   │
│  │  11. Human evaluates proposal (may use AI tools to analyse)      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  CONFIRMATION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  12. Human decides to accept/reject                               │   │
│  │  13. Human confirms via SEP (with verification)                   │   │
│  │  14. Confirmation window: 48-72 hours                             │   │
│  │  15. All parties confirmed → chain active                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  EXECUTION                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  16. Exchange executed outside SEP                                │   │
│  │  17. Human signals completion                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  SATISFACTION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  18. SEP prompts for satisfaction signal                          │   │
│  │  19. Human provides signal (satisfied/partial/not)                │   │
│  │  20. Trust scores updated                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Surface

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/participants` | POST | Register new participant |
| `/participants/{id}` | GET | Get participant details |
| `/offerings` | POST | Create offering |
| `/needs` | POST | Create need |
| `/matches` | GET | Get proposed matches |
| `/chains/{id}/confirm` | POST | Confirm chain participation |
| `/edges/{id}/complete` | POST | Signal edge completion |
| `/edges/{id}/satisfaction` | POST | Provide satisfaction signal |

---

## Phase 2 Interaction Model: Delegated Agent

### Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE 2: DELEGATED AGENT                                 │
│                                                                          │
│  REGISTRATION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. Principal (human/org) registers as Phase 1                    │   │
│  │  2. Principal creates agent sub-identity                          │   │
│  │  3. Principal defines delegation bounds                           │   │
│  │  4. Agent receives credentials (separate from principal)          │   │
│  │  5. Agent marked as "delegated" in participant profile            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  OFFERING/NEED CREATION (Bounded)                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  6. Agent monitors principal's context                            │   │
│  │  7. Agent drafts offering/need                                    │   │
│  │  8. IF within bounds:                                             │   │
│  │     - Agent submits, marked "pending human review"                │   │
│  │     - Principal notified, can modify/withdraw                     │   │
│  │     - After 4 hours without action → goes live                    │   │
│  │  9. IF outside bounds:                                            │   │
│  │     - Agent presents to principal for review                      │   │
│  │     - Principal must submit manually                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  MATCH EVALUATION (Agent-Assisted)                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  10. SEP sends match proposal                                     │   │
│  │  11. Agent receives and evaluates against criteria                │   │
│  │  12. Agent prepares recommendation for principal                  │   │
│  │  13. Agent presents: "Recommend accept/reject" with rationale     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  CONFIRMATION (Bounded Auto-Confirm)                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  14. IF match within bounds (established partners, ≤3 parties):  │   │
│  │      - Agent confirms via API with delegation token               │   │
│  │      - Confirmation marked "agent-confirmed within bounds"        │   │
│  │      - Principal notified, 4-hour override window                 │   │
│  │  15. IF match outside bounds:                                     │   │
│  │      - Agent recommends to principal                              │   │
│  │      - Principal must confirm manually (with verification)        │   │
│  │  16. Confirmation window: 24-48 hours (faster than Phase 1)       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  EXECUTION (Agent-Coordinated)                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  17. Agent may coordinate scheduling, handover                    │   │
│  │  18. Actual exchange still human-to-human (or human-directed)    │   │
│  │  19. Agent signals completion when delivery confirmed             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  SATISFACTION (Human-Confirmed)                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  20. Agent drafts satisfaction assessment                         │   │
│  │  21. Agent presents to principal with recommendation              │   │
│  │  22. Principal reviews and confirms signal                        │   │
│  │  23. (Satisfaction remains human-confirmed for trust integrity)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Surface (Phase 2 Additions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/participants/{id}/agents` | POST | Create agent sub-identity |
| `/participants/{id}/agents/{aid}/bounds` | PUT | Update delegation bounds |
| `/chains/{id}/confirm` | POST | Confirm (with delegation token if agent) |
| `/actions/{id}/override` | POST | Principal overrides agent action |
| `/agents/{id}/suspend` | POST | Principal suspends agent |

### Delegation Bounds Schema

```json
{
  "delegation_bounds": {
    "offering_creation": {
      "enabled": true,
      "permitted_categories": ["marketing", "design"],
      "require_human_review": true,
      "review_window_hours": 4
    },
    "need_creation": {
      "enabled": true,
      "permitted_categories": ["accounting", "legal"],
      "require_human_review": true
    },
    "match_confirmation": {
      "auto_confirm_enabled": true,
      "conditions": {
        "max_chain_length": 3,
        "require_established_partners": true,
        "min_partner_trust_score": 0.7
      },
      "override_window_hours": 4
    },
    "satisfaction_signals": {
      "agent_can_draft": true,
      "agent_can_submit": false
    }
  }
}
```

---

## Phase 3+ Interaction Model: Autonomous Buyer

### Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE 3+: AUTONOMOUS BUYER                               │
│                                                                          │
│  REGISTRATION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. Operator (legal entity) registers                             │   │
│  │  2. Machine identity established (certificate)                    │   │
│  │  3. Accountability chain documented                               │   │
│  │  4. Autonomous agent constraints applied                          │   │
│  │  5. Status: probationary (90 days, enhanced monitoring)           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  OFFERING/NEED CREATION (Automated)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  6. Agent monitors systems (inventory, production, etc.)         │   │
│  │  7. Agent detects surplus/need                                    │   │
│  │  8. Agent creates offering/need via API                           │   │
│  │  9. No human review (audit log only)                              │   │
│  │  10. Rate limits enforced (10/hour max)                           │   │
│  │  11. Content limits: physical goods only (no services)            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  MATCHING (Two-Speed System)                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  12. SEP matching engine runs                                     │   │
│  │  13. IF all participants autonomous → Fast Lane                   │   │
│  │      - Confirmation window: 5 minutes                             │   │
│  │      - API-only interaction                                       │   │
│  │  14. IF mixed participants → Standard Lane                        │   │
│  │      - Confirmation window: 24-48 hours                           │   │
│  │      - Agent must tolerate human delays                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  CONFIRMATION (Automated)                                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  15. Agent evaluates match algorithmically                        │   │
│  │  16. Decision in <100ms                                           │   │
│  │  17. Agent confirms or rejects via API                            │   │
│  │  18. No human involvement                                         │   │
│  │  19. All decisions logged for audit                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  EXECUTION (Automated)                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  20. Agent triggers fulfillment                                   │   │
│  │  21. Logistics coordinated programmatically                       │   │
│  │  22. Delivery tracked via integrations                            │   │
│  │  23. Receipt confirmed automatically                              │   │
│  │  24. Quality verification (if applicable)                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  SATISFACTION (Automated for Goods)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  25. Agent runs verification:                                     │   │
│  │      - Quantity: received X/Y                                     │   │
│  │      - Quality: meets specification?                              │   │
│  │      - Timing: on time?                                           │   │
│  │  26. Agent submits satisfaction signal                            │   │
│  │  27. Signal includes structured verification data                 │   │
│  │  28. Trust metrics updated (separate M2M metrics)                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Surface (Phase 3+ Additions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/participants` | POST | Register (with machine identity) |
| `/participants/{id}/certificate` | PUT | Update machine certificate |
| `/matches/fast-lane` | GET | Get fast-lane matches |
| `/chains/{id}/confirm-automated` | POST | Confirm (M2M, no human) |
| `/edges/{id}/verification` | POST | Submit verification data |

### Autonomous Agent Constraints Schema

```json
{
  "autonomous_constraints": {
    "rate_limits": {
      "offerings_per_hour": 10,
      "needs_per_hour": 10,
      "confirmations_per_hour": 5,
      "api_calls_per_minute": 100
    },
    "content_limits": {
      "permitted_types": ["physical_good", "digital_good"],
      "forbidden_types": ["service", "consultation"]
    },
    "matching_preferences": {
      "prefer_fast_lane": true,
      "tolerate_standard_lane": true,
      "max_wait_hours": 72
    },
    "probationary": {
      "duration_days": 90,
      "max_chain_length": 2,
      "require_established_partner": true,
      "enhanced_monitoring": true
    }
  }
}
```

---

## Phase 3+ Interaction Model: Multi-Agent Network (Research Phase)

### Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE 3+: MULTI-AGENT NETWORK (Research)                 │
│                                                                          │
│  REGISTRATION                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. Network registers as collective entity                        │   │
│  │  2. Governance model declared                                     │   │
│  │  3. Member agents registered as sub-entities                      │   │
│  │  4. Legal entity linkage required                                 │   │
│  │  5. Human escalation contacts mandatory                           │   │
│  │  6. Network constraints applied                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  COLLECTIVE DECISION-MAKING                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  For each action (offering, need, confirmation):                  │   │
│  │  7. Relevant agents contribute to decision                        │   │
│  │  8. Internal deliberation logged                                  │   │
│  │  9. Governance model followed (quorum, consensus, etc.)           │   │
│  │  10. Decision recorded with voting data                           │   │
│  │  11. Designated agent submits to SEP                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  POSITION RESTRICTIONS                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  12. Network can only hold ONE position per chain                 │   │
│  │  13. Cannot be provider AND recipient in same exchange            │   │
│  │  14. Intra-network transactions forbidden                         │   │
│  │  15. Cross-network relationships must be disclosed                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  COLLECTIVE TRUST                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  16. Network has collective trust score                           │   │
│  │  17. Individual agents have role-specific metrics                 │   │
│  │  18. Governance compliance tracked                                │   │
│  │  19. Internal dissent visible in decision logs                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Research Questions (Before Implementation)

1. How to verify governance model is followed?
2. How to prevent position stacking across related networks?
3. How to handle networks that span multiple legal entities?
4. Should networks be in separate matching pool?

---

## Comparative Confirmation Flows

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONFIRMATION FLOW COMPARISON                          │
│                                                                          │
│  PHASE 1 HUMAN/ORG:                                                          │
│  Match Proposed ─(48-72hr)─► Human Reviews ─► Human Confirms ─► Active  │
│                                     │                                    │
│                              [May use AI to analyse]                    │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  PHASE 2 DELEGATED AGENT:                                                    │
│                                                                          │
│  Within Bounds:                                                         │
│  Match Proposed ─(minutes)─► Agent Confirms ─(4hr override)─► Active    │
│                                     │                                    │
│                              [Human can override]                       │
│                                                                          │
│  Outside Bounds:                                                        │
│  Match Proposed ─(24-48hr)─► Agent Recommends ─► Human Confirms ─► Active│
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  PHASE 3+ AUTONOMOUS BUYER:                                                  │
│                                                                          │
│  Fast Lane (all M2M):                                                   │
│  Match Proposed ─(seconds)─► Agent Evaluates ─► Agent Confirms ─► Active │
│                                                                          │
│  Standard Lane (mixed):                                                 │
│  Match Proposed ─(24-48hr)─► Agent Waits ─► All Confirm ─► Active        │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  PHASE 3+ MULTI-AGENT NETWORK:                                               │
│                                                                          │
│  Match Proposed ─► Internal Deliberation ─► Governance Vote ─►          │
│                    (logged)               (quorum/consensus)            │
│                                                                          │
│  ─► Designated Agent Confirms ─► Active                                 │
│     (with governance proof)                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Design Principle: Participant Type Drives Experience

A core insight from this analysis: **participant type must be identified upfront because it determines the entire interaction experience**. This isn't just about capability restrictions—it fundamentally shapes how SEP behaves toward each participant.

### The Principle

```
PARTICIPANT TYPE (identified at registration)
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPERIENCE DETERMINATION                              │
│                                                                          │
│  The participant type determines:                                       │
│                                                                          │
│  1. CONFIRMATION REQUIREMENTS                                           │
│     └─► Human verification? Override window? Auto-confirm eligible?    │
│                                                                          │
│  2. SPEED EXPECTATIONS                                                  │
│     └─► 48-72 hours? 24 hours? 5 minutes? Seconds?                     │
│                                                                          │
│  3. TRUST CALCULATION METHOD                                            │
│     └─► Subjective signals? Objective metrics? Collective scoring?     │
│                                                                          │
│  4. SATISFACTION SIGNAL VALIDITY                                        │
│     └─► Human judgement required? Verification data accepted?          │
│                                                                          │
│  5. MATCHING POOL ELIGIBILITY                                           │
│     └─► Standard lane? Fast lane? Excluded from certain chains?        │
│                                                                          │
│  6. ACCOUNTABILITY CHAIN                                                │
│     └─► Self? Principal? Operator? Legal entity?                       │
│                                                                          │
│  7. CONTENT RESTRICTIONS                                                │
│     └─► All types? Goods only? Within declared bounds?                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why This Matters

**For subjective value**: SEP's core model assumes participants assess value subjectively—"is this worth it to me?" This works when humans make that assessment. For autonomous agents, we need objective proxies (specification compliance, on-time delivery) because machines cannot meaningfully assess subjective value.

**For satisfaction signals**: A human saying "satisfied" carries different weight than a machine reporting "specification met." Both are valid, but they measure different things. The trust model must know which type of signal it's receiving.

**For speed**: Mixing human and machine participants in the same chain requires the chain to operate at human speed. If we want machine-speed matching, all participants must be autonomous. This drives the two-lane system.

**For accountability**: When something goes wrong, SEP must know who to hold responsible. The accountability chain differs by type:
- Human/Org: Direct accountability
- Delegated Agent: Principal accountable
- Autonomous Buyer: Operator accountable
- Multi-Agent Network: Legal entity accountable

### Experience Matrix

| Aspect | Human/Org | Delegated Agent | Autonomous Buyer | Multi-Agent Network |
|--------|-----------|-----------------|------------------|---------------------|
| **Identified As** | `type.category: human/organisation` | `delegation.uses_delegated_agents: true` | `type.sub_type: autonomous_buyer` | `type.sub_type: multi_agent_network` |
| **Confirmation** | Human verification required | Within bounds: auto. Outside: human | Automated | Governance-verified |
| **Speed Lane** | Standard (48-72hr) | Standard or bounded-fast | Fast (seconds) or Standard | Governance-dependent |
| **Trust Source** | Identity + history | Principal's trust | Operator + M2M metrics | Collective + governance |
| **Satisfaction** | Human subjective | Human confirms | Objective verification | Collective assessment |
| **Value Assessment** | Subjective | Subjective (via principal) | Objective (spec compliance) | Objective or collective |
| **Accountability** | Self | Principal | Operator | Legal entity |
| **Content Allowed** | All types | Within bounds | Physical goods only | TBD (research) |

### Implementation Implications

1. **Registration must capture type accurately**: The participant type declared at registration becomes the foundation for all subsequent behaviour. Getting this wrong means wrong experience.

2. **Type changes require re-verification**: If a human participant wants to enable delegation, this is a type change that requires new verification and bound-setting.

3. **Mixed chains inherit strictest requirements**: A chain with both humans and autonomous buyers operates at human speed with human confirmation requirements.

4. **Trust metrics are type-appropriate**: Human satisfaction signals feed the standard trust model. M2M verification data feeds separate metrics. They shouldn't be mixed.

5. **API responses reflect type**: The same endpoint may return different fields or options based on participant type (e.g., autonomous buyers see fast-lane matches).

### Addressing the Core Questions

| Question | Answer | How Type Helps |
|----------|--------|----------------|
| Is algorithmic evaluation compatible with subjective value? | For goods: yes (objective specs). For services: no (requires human judgement) | Autonomous buyers restricted to goods; humans/delegated handle services |
| Is machine-generated satisfaction meaningful? | For objective criteria: yes. For subjective quality: no | M2M satisfaction feeds separate metrics; human satisfaction feeds standard trust |
| Are agent-to-agent signals meaningful? | When based on verifiable data: yes | Trust model interprets signals based on participant type |
| How do we handle speed differences? | Two-lane system | Participant type determines lane eligibility |

---

## Trust Model Comparison

| Participant Type | Trust Source | Trust Accumulation | Trust Ceiling |
|-----------------|--------------|-------------------|---------------|
| Human/Org | Identity + history | Exchange partners, satisfaction | Unlimited |
| Delegated Agent | Principal's trust | Principal's exchanges | Principal's score |
| Autonomous Buyer | Operator + M2M metrics | Completion rate, spec compliance | Operator caps |
| Multi-Agent Network | Legal entity + collective | Collective history | Governance quality |

---

## Implementation Roadmap

### Phase 1 (Launch)
- Human/Org participants only
- Standard confirmation (48-72 hours)
- Human verification for all commitments
- Standard trust model

### Phase 2 (Post-Launch)
- Add delegated agent support
- Delegation bounds schema
- Agent sub-identity system
- Conditional auto-confirmation
- Override mechanisms

### Phase 3+ (Future)
- Autonomous buyer support (physical goods only)
- Two-speed matching system
- M2M identity infrastructure
- Separate M2M trust metrics
- Enhanced abuse detection

### Phase 3+ Research
- Multi-agent network evaluation
- Governance verification system
- Position restriction enforcement
- Potential separate network tier

---

## Completion Status

**Work Packages Completed** (2026-02-10):

- [x] WP1: Boundary Definition → [sep-boundary-definition.md](./sep-boundary-definition.md)
- [x] WP2: Delegated Agent Analysis → [agent-analysis-delegated.md](./agent-analysis-delegated.md)
- [x] WP3: Autonomous Buyer Analysis → [agent-analysis-autonomous.md](./agent-analysis-autonomous.md)
- [x] WP4: Multi-Agent Network Analysis → [agent-analysis-multi-agent.md](./agent-analysis-multi-agent.md)
- [x] WP5: Interaction Model Design → This document
- [x] WP6: Protocol/Schema Updates → Schemas updated, terminology renamed
- [ ] WP7: Documentation → Developer guide pending

**Schema Changes Implemented**:

- `agent_matching` renamed to `capability_matching` across all schemas
- Participant type taxonomy added (category/sub_type structure)
- Delegation and accountability fields added to participant schema

**Remaining for Phase 1**:

1. Developer guide for agent integration
2. Deployment architecture decision

**Phase 2 Implementation Required**:

1. API endpoints for delegation management
2. Confirmation flow variants
3. Trust model adjustments for bounded agents

