# SEP Boundary Definition (WP1 Deliverable)

**Status**: Complete (WP1)
**Last Updated**: 2026-02-12
**Related**: [agent-integration-plan.md](./agent-integration-plan.md), [participant-taxonomy.md](./participant-taxonomy.md)

## Purpose

This document defines the clear boundary between:
1. **SEP** — the Surplus Exchange Protocol and its core capabilities
2. **External Agents** — AI agents that participants may use to interact with SEP
3. **Internal Matching** — SEP's own algorithmic matching (previously confusingly called "agent matching")

---

## The Boundary: SEP as Infrastructure

### What SEP Is

SEP is **infrastructure for surplus exchange**. It provides:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            SEP INFRASTRUCTURE                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    PARTICIPANT REGISTRY                          │    │
│  │  - Identity verification                                         │    │
│  │  - Participant type tracking (human/org/agent)                  │    │
│  │  - Status management (probationary → established → trusted)     │    │
│  │  - Representative authorisation                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    OFFERING/NEED REGISTRY                        │    │
│  │  - Structured capability descriptions                            │    │
│  │  - Availability windows                                          │    │
│  │  - Geographic/logistic constraints                               │    │
│  │  - Matching preferences                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    MATCHING ENGINE                               │    │
│  │  - Cycle detection (Johnson's algorithm)                         │    │
│  │  - Compatibility scoring                                         │    │
│  │  - Constraint satisfaction                                       │    │
│  │  - Chain proposal generation                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    EXCHANGE COORDINATION                         │    │
│  │  - Confirmation workflow                                         │    │
│  │  - Execution tracking                                            │    │
│  │  - Satisfaction signal collection                                │    │
│  │  - Dispute flagging                                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    TRUST INFRASTRUCTURE                          │    │
│  │  - Network position calculation                                  │    │
│  │  - Vouching system                                               │    │
│  │  - Satisfaction aggregation                                      │    │
│  │  - Trust score computation                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What SEP Is Not

SEP does **not** provide:

- Decision-making about whether to accept matches (that's the participant's job)
- Negotiation of exchange terms (participants agree directly)
- Execution of the actual exchange (happens outside SEP)
- Financial settlement (no money changes hands within SEP)
- AI assistance for participants (that's external agents' role)

---

## The Agent Distinction

### SEP's Matching Engine (Internal)

This is **algorithmic matching** — code that SEP runs to find cycles:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SEP MATCHING ENGINE (Internal)                        │
│                                                                          │
│  Input: Graph of offerings, needs, constraints                          │
│  Process: Johnson's algorithm + compatibility scoring                    │
│  Output: Ranked list of proposed chains                                  │
│                                                                          │
│  This is NOT an "AI agent" — it's deterministic graph computation       │
│  with heuristic scoring. No LLM, no decision-making, no autonomy.       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Terminology change**: Rename schema fields from `agent_matching` to `capability_matching` to eliminate confusion.

### External AI Agents (Participant-Side)

These are **AI systems that participants use** to interact with SEP:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AI AGENT (Participant-Side)                  │
│                                                                          │
│  Could be:                                                               │
│  - ChatGPT helping draft offering descriptions                          │
│  - Claude evaluating incoming match proposals                           │
│  - Custom agent managing portfolio of offerings/needs                   │
│  - Autonomous system acting on behalf of organisation                   │
│                                                                          │
│  Key characteristics:                                                    │
│  - Runs outside SEP infrastructure                                      │
│  - Controlled by participant, not SEP                                   │
│  - May have varying levels of autonomy                                  │
│  - May or may not be visible to SEP                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 Boundary Position (Option B)

Based on decision to pursue **Option B: Agent-Aware, Human-Required**:

### What Phase 1 Knows

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 1 PARTICIPANT VIEW                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      ACCOUNTABLE PARTY                           │    │
│  │                                                                  │    │
│  │  Human or Organisation that:                                     │    │
│  │  - Registers with verified identity                              │    │
│  │  - Creates offerings and needs                                   │    │
│  │  - Confirms participation in chains                              │    │
│  │  - Delivers on commitments                                       │    │
│  │  - Provides satisfaction signals                                 │    │
│  │  - Is legally/reputationally accountable                         │    │
│  │                                                                  │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│                    [May use AI assistance]                               │
│                             │                                            │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    OPTIONAL: DELEGATION MARKER                   │    │
│  │                                                                  │    │
│  │  "This participant uses delegated agents for some operations"   │    │
│  │                                                                  │    │
│  │  Implications:                                                   │    │
│  │  - SEP may apply different confirmation requirements             │    │
│  │  - Other participants can see delegation status                  │    │
│  │  - Accountability still rests with human/org principal           │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 Rules

| Aspect | Phase 1 Behaviour |
|--------|--------------|
| **Registration** | Human/org must verify identity |
| **Offering creation** | Any source (human or agent-assisted) |
| **Need creation** | Any source |
| **Match evaluation** | Agent may recommend, human must confirm |
| **Chain confirmation** | Human confirmation required |
| **Execution** | Happens outside SEP |
| **Satisfaction signals** | Human must provide |
| **Accountability** | Always with human/org |

### What Phase 1 Does NOT Know

- Which specific AI tools participants use
- What prompts or instructions guide participant agents
- Whether a human typed a message or an agent did
- Internal decision-making processes of participants

**Philosophy**: SEP treats participants as black boxes with verified identity. How they make decisions internally is their business.

---

## Interaction Points

### API Boundary

All interaction with SEP happens through defined APIs:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SEP API SURFACE                                 │
│                                                                          │
│  Participant APIs (who calls them is irrelevant to SEP):                │
│                                                                          │
│  POST /participants              Register new participant               │
│  GET  /participants/{id}         Get participant details                │
│  POST /offerings                 Create offering                        │
│  POST /needs                     Create need                            │
│  GET  /matches                   Get proposed matches                   │
│  POST /chains/{id}/confirm       Confirm participation                  │
│  POST /edges/{id}/satisfaction   Provide satisfaction signal            │
│                                                                          │
│  Phase 1 does not distinguish:                                               │
│  - Human typing in browser                                              │
│  - Agent calling API programmatically                                   │
│  - Human using agent-generated content                                  │
│                                                                          │
│  All calls authenticated by participant credentials                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Confirmation Requirements

Phase 1 requires human confirmation for commitments:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONFIRMATION REQUIREMENTS                             │
│                                                                          │
│  Chain Confirmation:                                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  1. Match proposed by SEP                                       │     │
│  │  2. Notification sent to participant                            │     │
│  │  3. [Agent may evaluate and recommend]                          │     │
│  │  4. HUMAN must explicitly confirm                               │     │
│  │  5. Confirmation must include human verification                │     │
│  │     - CAPTCHA, 2FA, or equivalent                               │     │
│  │     - Prevents agent-only confirmation                          │     │
│  │  6. Confirmation window: 48-72 hours typical                    │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Why human confirmation matters:                                        │
│  - Ensures informed consent to commitment                               │
│  - Creates clear accountability                                         │
│  - Prevents agent runaway                                               │
│  - Maintains trust network integrity                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2/3 Boundary Evolution

### Phase 2: Explicit Delegation Support

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2 ADDITIONS                                   │
│                                                                          │
│  Delegation Declaration:                                                │
│  - Participant can declare "I use delegated agents"                     │
│  - Delegation bounds specified (categories, values, timing)             │
│  - SEP can verify actions within declared bounds                        │
│                                                                          │
│  Conditional Auto-Confirmation:                                         │
│  - For matches within declared bounds: agent can confirm                │
│  - For matches outside bounds: human confirmation required              │
│  - Audit trail shows which confirmations were delegated                 │
│                                                                          │
│  Principal remains accountable for agent actions                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3+: Agent Participant Types

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 3+ ADDITIONS                                  │
│                                                                          │
│  Agent as First-Class Participant:                                      │
│  - Autonomous Buyer can register directly                               │
│  - Machine identity verification                                        │
│  - Programmatic confirmation (no human in loop)                         │
│  - Machine-speed matching ("fast lane")                                 │
│  - Programmatic satisfaction signals                                    │
│                                                                          │
│  Multi-Agent Networks:                                                  │
│  - Collective registration                                              │
│  - Collective accountability                                            │
│  - Complex trust model                                                  │
│                                                                          │
│  New Trust Considerations:                                              │
│  - How do machine-to-machine trust signals work?                        │
│  - Is "satisfaction" meaningful for autonomous agents?                  │
│  - How do we prevent agent collusion?                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Terminology Glossary

To eliminate confusion, standardise on these terms:

| Term | Definition | NOT Confused With |
|------|------------|-------------------|
| **Capability Matching** | SEP's algorithmic process for finding exchange cycles | External AI agents |
| **Matching Engine** | The SEP component that runs capability matching | AI/ML in general |
| **External Agent** | An AI system a participant uses to interact with SEP | SEP's matching engine |
| **Delegated Agent** | External agent with explicit authority from principal | Autonomous agent |
| **Autonomous Agent** | External agent that acts independently | Delegated agent |
| **Principal** | Human/org accountable for agent's actions | The agent itself |
| **Participant** | Registered entity in SEP (may be human, org, or agent) | User of an agent |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PARTICIPANT                                 │
│                                                                          │
│   ┌───────────────────────────────────────────────────────────────┐     │
│   │                    PARTICIPANT'S DOMAIN                        │     │
│   │                                                                │     │
│   │   Human ──────────► Decision Making ◄──────── External Agent  │     │
│   │     │                     │                        │           │     │
│   │     │              ┌──────┴──────┐                │           │     │
│   │     │              │   Actions   │                │           │     │
│   │     └──────────────┤             ├────────────────┘           │     │
│   │                    └──────┬──────┘                             │     │
│   │                           │                                    │     │
│   └───────────────────────────┼────────────────────────────────────┘     │
│                               │                                          │
│   ════════════════════════════╪══════════════════════════════════════   │
│                               │  SEP BOUNDARY                            │
│   ════════════════════════════╪══════════════════════════════════════   │
│                               │                                          │
│                               ▼                                          │
│   ┌───────────────────────────────────────────────────────────────┐     │
│   │                         SEP APIS                               │     │
│   │                                                                │     │
│   │   /register    /offerings    /needs    /confirm    /satisfy   │     │
│   │                                                                │     │
│   └───────────────────────────────────────────────────────────────┘     │
│                               │                                          │
│                               ▼                                          │
│   ┌───────────────────────────────────────────────────────────────┐     │
│   │                    SEP INFRASTRUCTURE                          │     │
│   │                                                                │     │
│   │   Registry   │   Capability   │   Coordination   │   Trust    │     │
│   │              │    Matching    │                  │            │     │
│   │              │                │                  │            │     │
│   └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
  ═══════ = SEP boundary (what SEP sees vs doesn't see)
  ──────► = Information/control flow
  │       = Containment
```

---

## Schema Changes Required

### Rename `agent_matching` Fields

In all schemas, rename:
- `agent_matching` → `capability_matching`
- `agent_matching_tags` → `capability_tags`
- `agent_matching_parameters` → `matching_parameters`

### Add Participant Type Fields

```json
{
  "participant": {
    "id": "participant-123",
    "type": {
      "category": "organisation",
      "sub_type": "small_business"
    },
    "delegation": {
      "uses_delegated_agents": false,
      "bounds": null
    },
    "accountability": {
      "primary_human_id": "user-456",
      "legal_entity": "Harrison & Co Ltd"
    }
  }
}
```

### Phase 2: Add Delegation Bounds Schema

```json
{
  "delegation_bounds": {
    "permitted_categories": ["contract_review", "document_drafting"],
    "max_chain_length": 3,
    "auto_confirm_threshold": {
      "max_edge_count": 2,
      "require_established_partners": true
    },
    "excluded_participants": [],
    "active_hours": {
      "timezone": "Europe/London",
      "weekdays": ["mon", "tue", "wed", "thu", "fri"],
      "hours": "09:00-17:00"
    }
  }
}
```

---

## Success Criteria

This boundary definition is complete when:

1. ✓ Clear distinction between SEP matching and external agents
2. ✓ Phase 1 behaviour specified (agent-aware, human-required)
3. ✓ Phase 2/3 evolution path outlined
4. ✓ Terminology standardised
5. ✓ API boundary defined
6. ✓ Schema changes identified
7. ✓ Architecture diagram created

---

## Next Steps

1. ✓ WP1 Complete — proceed to WP2 (Delegated Agent Analysis)
2. Implement terminology rename across codebase
3. Update participant schema with type and delegation fields
4. Add human verification to confirmation workflow

---

## Related Documents

- [participant-taxonomy.md](./participant-taxonomy.md) — Full participant type taxonomy
- [agent-integration-plan.md](./agent-integration-plan.md) — Overall integration plan
- [decisions.md](./decisions.md) — Architecture decisions
- [scenarios.md](./scenarios.md) — AI Agent Participation scenario

