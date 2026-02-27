# Participant Type Taxonomy

**Status**: Complete
**Last Updated**: 2026-02-12
**Related**: [agent-integration-plan.md](./agent-integration-plan.md)
**Implementation**: `schemas/participant.schema.json`

## Overview

This document defines the taxonomy of participant types that can interact with the Surplus Exchange Protocol. Understanding these categories is essential for designing appropriate trust rules, confirmation requirements, and accountability mechanisms.

---

## Taxonomy Structure

```
Participant
├── Human Participants
│   ├── Individual Consumer
│   └── Individual Professional
│
├── Organisation Participants
│   ├── Sole Trader
│   ├── Small Business (2-10 employees)
│   ├── Medium Business (11-250 employees)
│   ├── Large Enterprise (250+ employees)
│   ├── Non-Profit Organisation
│   ├── Cooperative / Mutual
│   └── Public Sector Entity
│
└── Agent Participants (Phase 2+)
    ├── Delegated Agent
    ├── Autonomous Buyer
    └── Multi-Agent Network
```

---

## Human Participants

### Individual Consumer

**Definition**: A natural person participating in their personal capacity, not representing a business.

**Characteristics**:
- Acts on own behalf
- Personal surplus (skills, time, belongings)
- Personal needs (services, goods)
- Full decision-making authority
- Accountable for own actions

**Phase 1 Status**: Supported (low priority for initial professional services focus)

**Trust Considerations**:
- Identity verification through standard KYC
- Reputation tied to individual
- Personal liability

**Example Surplus/Needs**:
- Surplus: Weekend photography skills, spare room for storage
- Needs: Garden maintenance, language tutoring

---

### Individual Professional

**Definition**: A natural person participating in a professional capacity, offering professional services.

**Characteristics**:
- Professional credentials verifiable
- Operates independently (not through company)
- May have professional liability insurance
- Bound by professional standards/ethics
- Personal accountability with professional overlay

**Phase 1 Status**: Fully supported (core use case)

**Trust Considerations**:
- Professional body membership verifiable
- Professional reputation matters
- Higher accountability expectations

**Example Surplus/Needs**:
- Surplus: Freelance consulting hours, specialist expertise
- Needs: Bookkeeping, marketing support

---

## Organisation Participants

### Sole Trader

**Definition**: An individual running a business in their own name, without separate legal entity.

**Characteristics**:
- One decision-maker
- Personal liability for business
- Simpler structure than limited company
- Often overlaps with Individual Professional
- May have employees (but uncommon)

**Phase 1 Status**: Fully supported (core use case)

**Trust Considerations**:
- Business registration verifiable
- Trading history may exist
- Personal accountability

**Example Surplus/Needs**:
- Surplus: Capacity gaps between client projects
- Needs: Services to support business growth

---

### Small Business (2-10 employees)

**Definition**: A limited company or partnership with a small team.

**Characteristics**:
- Multiple people, but usually one decision-maker for exchanges
- Separate legal entity (typically)
- Defined surplus capacity (billable hours, production capacity)
- More predictable surplus patterns
- May have delegated authority structures

**Phase 1 Status**: Fully supported (primary target segment)

**Trust Considerations**:
- Company registration verifiable
- Financial records may be available (Companies House)
- Authorised representatives must be identified
- Company accountable, not just individuals

**Example Surplus/Needs**:
- Surplus: Team member availability, excess inventory
- Needs: Professional services, supplies

---

### Medium Business (11-250 employees)

**Definition**: A company with significant structure but not enterprise-scale.

**Characteristics**:
- Multiple departments, multiple decision-makers
- Formal procurement processes likely
- May need internal approval workflows
- Larger surplus capacity available
- More complex needs (multi-service requirements)

**Phase 1 Status**: Supported with caveats

**Trust Considerations**:
- Clear authorisation chains required
- May need multiple representatives
- Procurement compliance requirements
- Higher stakes = higher scrutiny

**Example Surplus/Needs**:
- Surplus: Underutilised facilities, excess production capacity
- Needs: Specialised professional services, training

---

### Large Enterprise (250+ employees)

**Definition**: A major corporation with complex organisational structure.

**Characteristics**:
- Formal procurement departments
- Legal review requirements
- Compliance frameworks
- Budget allocation processes
- May operate across multiple jurisdictions

**Phase 1 Status**: Supported but unlikely early adopters

**Trust Considerations**:
- Extensive due diligence expected
- Contract requirements may exceed SEP standard terms
- Reputation risk sensitivity
- May require bespoke integration

**Example Surplus/Needs**:
- Surplus: Unused office space, excess production capacity, underutilised equipment
- Needs: Innovation services, niche expertise

---

### Non-Profit Organisation

**Definition**: An organisation operating for charitable, educational, or social purposes.

**Characteristics**:
- Mission-driven rather than profit-driven
- Often resource-constrained
- May have volunteer involvement
- Governance by trustees/board
- Tax status may affect exchange treatment

**Phase 1 Status**: Supported (good fit for surplus philosophy)

**Trust Considerations**:
- Charity registration verifiable
- Governance structure public
- Reputation important to mission
- May need trustee approval for exchanges

**Example Surplus/Needs**:
- Surplus: Venue space, volunteer coordination skills, community reach
- Needs: Professional services at accessible rates

---

### Cooperative / Mutual

**Definition**: An organisation owned and governed by its members.

**Characteristics**:
- Democratic governance
- Members share surplus
- May have complex decision-making
- Values-aligned with mutual exchange
- Natural affinity with SEP philosophy

**Phase 1 Status**: Supported (aligned values)

**Trust Considerations**:
- Governance structure verifiable
- Member accountability
- Collective decision-making may slow confirmation

**Example Surplus/Needs**:
- Surplus: Member skills, shared resources
- Needs: Services benefiting member base

---

### Public Sector Entity

**Definition**: Government departments, local authorities, NHS trusts, etc.

**Characteristics**:
- Procurement regulations apply
- Transparency requirements
- Budget cycles constrain timing
- Political accountability
- May have specific legal frameworks

**Phase 1 Status**: Out of scope for Phase 1 (regulatory complexity)

**Trust Considerations**:
- Institutional trust high but process trust low
- Procurement rules may not accommodate exchange
- Legal basis for participation may need clarification

**Example Surplus/Needs**:
- Surplus: Facilities, expertise, data
- Needs: Innovation, specialist services

---

## Agent Participants (Phase 2+)

These participant types involve AI agents and are planned for Phase 2 onwards based on learnings from Phase 1.

### Delegated Agent

**Definition**: An AI agent with delegated responsibilities from a human principal, acting within predefined rules and requiring explicit approval for actions.

**Characteristics**:
- Human principal always identifiable
- Operates within set constraints (budget, scope, timing)
- Requests approval before committing
- Works at human decision-making timescales
- Uses human communication channels
- Transparent about agent status

**Phase 1 Status**: Not supported (Phase 2 target)

**Phase 2 Requirements**:
- Principal identification required
- Delegation bounds must be declared
- Approval workflow integration
- Agent actions logged and auditable
- Human override always available

**Trust Considerations**:
- Trust flows from principal, not agent
- Principal reputation affected by agent actions
- Delegation bounds must be verifiable
- Must be clearly marked as agent in interactions

**Example Use**:
- Agent monitors offerings, flags relevant matches to human
- Agent drafts responses, human approves before sending
- Agent auto-accepts matches within pre-approved parameters

---

### Autonomous Buyer

**Definition**: An AI agent that can decide and transact independently, operating at machine speed without human in the loop.

**Characteristics**:
- Makes binding decisions independently
- Operates at machine speed (milliseconds to seconds)
- May use APIs directly rather than human interfaces
- Maintains audit logs but doesn't seek approval
- May operate 24/7
- Programmatic satisfaction signals

**Phase 1 Status**: Not supported (Phase 3+ target)

**Phase 3+ Requirements**:
- Machine identity verification
- Rate limiting and abuse prevention
- Programmatic confirmation protocols
- Machine-readable satisfaction signals
- Accountability chain to ultimate human/org
- Potential "fast lane" for M2M exchanges

**Trust Considerations**:
- Trust model needs fundamental adaptation
- Subjective value concept may not apply
- Gaming and manipulation risks higher
- Collusion detection required
- Who is accountable when agent misbehaves?

**Example Use**:
- Printer detecting low ink, registering need, accepting match, confirming delivery
- Inventory system detecting excess stock, offering as surplus automatically

---

### Multi-Agent Network

**Definition**: A collective of autonomous agents collaborating to solve complex challenges, acting as a collective organism rather than serving a single user.

**Characteristics**:
- Multiple specialist agents with different roles
- Collective decision-making
- May not have single human principal
- Could hold multiple positions in network simultaneously
- Emergent behaviour from agent interactions
- Complex accountability chains

**Phase 1 Status**: Not supported (Phase 3+ research topic)

**Phase 3+ Considerations**:
- Fundamental questions about identity (one participant or many?)
- Can same network be provider AND recipient?
- Trust aggregation across agent collective
- Collective accountability mechanisms
- May need entirely different participation model

**Trust Considerations**:
- Novel trust challenges
- Collective reputation concept needed
- Governance of the collective matters
- Risk of sophisticated gaming

**Example Use**:
- Agent network managing supply chain, sensing needs, negotiating exchanges, coordinating delivery across multiple domains

---

## Cross-Cutting Attributes

All participant types share certain attributes that affect their participation:

### Verification Level

| Level | Description | Required For |
|-------|-------------|--------------|
| Unverified | Email only | Initial registration |
| Basic | Identity confirmed | Viewing matches |
| Verified | Business/professional registration confirmed | Participating in exchanges |
| Enhanced | Financial/compliance checks passed | High-value exchanges |

### Status

| Status | Description | Constraints |
|--------|-------------|-------------|
| Probationary | New participant, limited history | Max 3-party chains, established partner required |
| Established | Sufficient exchange history | Full participation |
| Trusted | High satisfaction, vouched | Priority matching, can vouch others |
| Restricted | Issues identified | Reduced participation rights |
| Suspended | Serious issues | Cannot participate |

### Representation

For organisation participants, individuals represent the organisation:

```
Organisation
├── Primary Representative (full authority)
├── Authorised Representatives (defined authority)
└── Observers (view only)
```

---

## Phase 1 Scope Summary

### Fully Supported in Phase 1

| Type | Priority | Notes |
|------|----------|-------|
| Individual Professional | High | Core use case |
| Sole Trader | High | Core use case |
| Small Business | High | Primary target |
| Medium Business | Medium | May need workflow support |
| Non-Profit | Medium | Good values fit |
| Cooperative | Medium | Natural alignment |

### Limited Support in Phase 1

| Type | Notes |
|------|-------|
| Individual Consumer | Supported but not focus |
| Large Enterprise | Supported but unlikely early adopter |

### Out of Scope for Phase 1

| Type | Reason | Target Version |
|------|--------|----------------|
| Public Sector Entity | Regulatory complexity | Phase 2+ |
| Delegated Agent | Requires agent framework | Phase 2 |
| Autonomous Buyer | Fundamental trust changes | Phase 3+ |
| Multi-Agent Network | Research required | Phase 3+ |

---

## Schema Implications

The participant schema should include:

```json
{
  "participant_type": {
    "category": "organisation",
    "sub_type": "small_business",
    "employee_count_band": "2-10"
  },
  "representation": {
    "primary_representative_id": "user-123",
    "authorised_representatives": ["user-456"]
  },
  "agent_delegation": null  // Phase 2: delegation bounds if agent
}
```

---

## Related Documents

- [agent-integration-plan.md](./agent-integration-plan.md) — Detailed agent analysis plan
- [scenarios.md](./scenarios.md) — AI Agent Participation scenario
- [trust-model.md](./trust-model.md) — Trust mechanisms

---

## Next Steps

1. Review taxonomy with stakeholders
2. Proceed with WP1: Boundary Definition
3. Update participant schema to reflect taxonomy
4. Create registration flows for each supported type

