# WP4: Multi-Agent Network Analysis

**Status**: Complete
**Created**: 2026-02-10
**Related**: [agent-integration-plan.md](./agent-integration-plan.md), [agent-analysis-autonomous.md](./agent-analysis-autonomous.md)

## Definition

A **Multi-Agent Network** is a collective of autonomous agents collaborating to solve complex challenges, acting as a collective organism rather than serving a single user.

### Key Characteristics

- Multiple specialist agents with different roles
- Collective decision-making (no single decision point)
- May not have single human principal
- Could hold multiple positions in network simultaneously
- Signal to external systems for needs
- Emergent behaviour from agent interactions
- Not serving a specific user but a collective purpose

### Examples

- Supply chain management system with procurement, logistics, inventory agents
- Research consortium with data collection, analysis, publication agents
- Smart city infrastructure with traffic, energy, waste management agents
- Decentralised autonomous organisation (DAO) with multiple functional agents

---

## A. Interaction Scenarios

### A1. Registration

**Scenario**: A multi-agent supply chain network wants to register with SEP.

**Fundamental Question**: Is this one participant or many?

**Option 1: Single Collective Participant**
```
Multi-Agent Network registers as single entity:
- Collective identity
- Single trust score
- Internal agent structure opaque to SEP
- Collective accountability

Issues:
- Who signs up? Who confirms?
- How is accountability enforced?
- What happens when collective disagrees internally?
```

**Option 2: Multiple Related Participants**
```
Each agent registers separately:
- Individual identities
- Individual trust scores
- Relationship declared ("part of network X")
- Individual accountability per agent

Issues:
- Same network might be on multiple sides of exchange
- Trust gaming via internal transactions
- Coordination advantage over individual participants
```

**Option 3: Federated Identity**
```
Hybrid approach:
- Network registers as umbrella entity
- Individual agents register as sub-entities
- Trust aggregates at both levels
- Collective AND individual accountability

Most complex but may be most accurate.
```

**Recommendation**: Research further. Likely Phase 3+ with Option 3 approach.

---

### A2. Offering Creation

**Scenario**: Supply chain network has excess inventory across multiple warehouses.

**Multi-Agent Flow**:
```
1. Inventory agent detects: "Warehouse A has 500 units excess"
2. Inventory agent detects: "Warehouse B has 300 units excess"
3. Coordination agent decides: "Combine as single 800-unit offering"
4. Procurement agent: "Check if we need these units elsewhere first"
5. Logistics agent: "Can ship from either location"
6. Collective decision: "Offer 500 units from A, keep B for internal buffer"
7. Offering created by... which agent?
```

**Complexity**: Multiple agents contribute to single decision. Who is the "author"?

**Proposed Approach**:
- Collective creates offering
- Decision trail logs which agents contributed
- Collective accountable for accuracy

---

### A3. Need Creation

**Scenario**: Network anticipates component shortage across production facilities.

**Multi-Agent Flow**:
```
1. Demand forecasting agent: "Predicts 20% increase next quarter"
2. Inventory agent: "Current stock insufficient"
3. Production agent: "Need 1000 units by date X"
4. Procurement agent: "Check SEP before traditional suppliers"
5. Need created collectively
```

**Assessment**: Similar to offering creation — collective decision, collective registration.

---

### A4. Match Evaluation

**Scenario**: SEP proposes match for the network's need.

**Multi-Agent Flow**:
```
1. SEP sends match proposal
2. Procurement agent: receives, initial assessment
3. Quality agent: "Does offering meet specifications?"
4. Logistics agent: "Can we receive at proposed location/time?"
5. Finance agent: "Is exchange value acceptable?"
6. Risk agent: "Is counterparty trustworthy?"
7. Coordination agent: aggregates assessments
8. Collective decision: accept or reject
9. Response submitted by... designated agent? Collective?
```

**Key Issue**: Internal disagreement resolution
- What if Quality says yes, Risk says no?
- How does collective resolve conflicts?
- SEP cannot see internal deliberation

---

### A5. Confirmation

**Scenario**: Network confirms participation in chain.

**Critical Question**: Who can commit the collective?

**Options**:
1. **Designated spokesperson agent**: Single agent authorised to commit
2. **Quorum requirement**: Multiple agents must agree
3. **Consensus**: All agents must agree
4. **Governance rules**: Predefined decision rules for different scenarios

**Proposed Approach**:
- Network declares governance model at registration
- Confirmation requires evidence of governance satisfaction
- SEP validates confirmation against declared model

---

### A6. Execution

**Scenario**: Physical goods exchange involving network.

**Multi-Agent Flow**:
```
If network is PROVIDER:
1. Logistics agent arranges shipping
2. Inventory agent updates records
3. Quality agent certifies goods
4. Communications agent notifies recipient

If network is RECIPIENT:
1. Receiving agent accepts delivery
2. Quality agent verifies goods
3. Inventory agent records receipt
4. Finance agent records value
```

**Assessment**: Execution is internally distributed but externally appears as single entity action.

---

### A7. Satisfaction

**Scenario**: Network provides satisfaction signal after exchange.

**Multi-Agent Flow**:
```
1. Quality agent: "Goods met specification"
2. Logistics agent: "Delivery was on time"
3. Inventory agent: "Quantity correct"
4. Coordination agent: aggregates to "satisfied"
5. Signal submitted
```

**Question**: Is collective satisfaction meaningful?

**Analysis**:
- If based on objective criteria: yes, meaningful
- If agents have conflicting assessments: need resolution mechanism
- Collective signal may be MORE reliable than single human (multiple checks)

---

## B. Trust Implications

### B1. Identity

**Question**: How is a multi-agent network identified?

**Proposed Model**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT NETWORK IDENTITY                          │
│                                                                          │
│  Network Level:                                                          │
│  - Network identifier (UUID)                                             │
│  - Governance model declaration                                          │
│  - Legal entity linkage (if applicable)                                 │
│  - Spokesperson/contact designation                                      │
│                                                                          │
│  Agent Level:                                                            │
│  - Individual agent identifiers                                          │
│  - Role declarations                                                     │
│  - Authority scopes                                                      │
│                                                                          │
│  Relationship:                                                           │
│  - Agent → Network membership                                            │
│  - Agent → Agent relationships within network                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### B2. Accountability

**Question**: Who is responsible when things go wrong?

**Complexity**: No single decision-maker means diffuse accountability.

**Proposed Accountability Chain**:
```
Specific Agent Action ──► Agent's Defined Role ──► Network Governance
                                                          │
                                                          ▼
                                                   Legal Entity
                                                   (if exists)
                                                          │
                                                          ▼
                                                   Human Contacts
                                                   (mandatory)
```

**Requirements**:
1. Network MUST have human escalation contacts
2. Network MUST have legal entity linkage OR individual human guarantors
3. Governance model MUST define dispute resolution
4. Internal agent responsibility doesn't affect external accountability

---

### B3. Vouching

**Question**: Can networks vouch? Be vouched for?

**Analysis**:
- Vouching is reputation stake
- Networks have collective reputation
- Networks could vouch... but for what?

**Proposal**:
- Networks can receive vouches (from humans/orgs who trust the collective)
- Networks cannot give vouches (no individual reputation to stake)
- Alternative: "Collective endorsement" distinct from vouching

---

### B4. Trust Accumulation

**Question**: How do networks build trust?

**Proposed Multi-Level Trust**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT NETWORK TRUST                             │
│                                                                          │
│  Network Trust Score:                                                   │
│  - Aggregate of network's exchange history                              │
│  - Weighted by exchange size and complexity                             │
│  - Affected by all agents' actions                                      │
│                                                                          │
│  Agent Role Trust:                                                      │
│  - Quality agent: specification compliance rate                         │
│  - Logistics agent: on-time delivery rate                               │
│  - Procurement agent: match acceptance accuracy                         │
│                                                                          │
│  Governance Trust:                                                      │
│  - Does network follow declared governance?                             │
│  - Dispute resolution effectiveness                                     │
│  - Stability of network composition                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### B5. Trust Signals

**Question**: Are network satisfaction signals meaningful?

**Analysis**:
- Collective assessment may be MORE reliable (multiple perspectives)
- But: internal collusion easier
- Need: transparency into how collective reached conclusion

**Proposal**: Satisfaction signals include summary of which agents contributed and whether there was internal disagreement.

---

## C. Protocol Requirements

### C1. Speed

**Question**: What confirmation timelines are appropriate?

**Analysis**:
- Networks may require internal coordination time
- Even if all agents are autonomous, governance may slow response
- Network might be faster than humans but slower than single autonomous agent

**Proposal**:
- Fast lane (minutes): only if governance allows instant decision
- Standard lane (hours): for networks with quorum requirements
- Governance-specific timing declared at registration

---

### C2. Automation

**Question**: What operations are fully automated?

| Operation | Network Automation | Governance Requirement |
|-----------|-------------------|----------------------|
| Offering creation | Fully automated | None |
| Need creation | Fully automated | None |
| Match evaluation | Fully automated | None |
| Confirmation | Depends on governance | Quorum may be required |
| Execution | Fully automated | Internal coordination |
| Satisfaction | Fully automated | Aggregation rules |
| Disputes | Flag only | Human escalation |

---

### C3. Bounds

**Question**: What limits apply to networks?

**Unique Network Constraints**:
```json
{
  "network_constraints": {
    "composition": {
      "min_agents": 2,
      "max_agents": 100,
      "require_role_diversity": true,
      "forbidden_roles": ["voting_manipulation"]
    },
    "self_dealing": {
      "max_intra_network_transactions": 0,
      "agents_cannot_transact_with_same_network": true
    },
    "position_limits": {
      "max_simultaneous_chain_positions": 1,
      "cannot_be_provider_and_recipient_same_chain": true
    },
    "governance_requirements": {
      "must_declare_decision_model": true,
      "must_have_human_escalation": true,
      "must_log_internal_decisions": true
    }
  }
}
```

---

### C4. Audit

**Question**: What logging/transparency is required?

**Enhanced Requirements for Networks**:
1. All internal agent deliberations logged
2. Governance decision points recorded
3. Which agents contributed to each decision
4. Internal disagreements flagged
5. Decision rationale captured
6. Human escalation contacts verified regularly

---

### C5. Override

**Question**: How can humans intervene?

**Override Mechanisms**:
1. **Designated human**: Named individual(s) who can halt network
2. **Emergency shutdown**: Any network agent can trigger pause
3. **SEP admin override**: For network-wide issues
4. **Governance freeze**: Suspend network while investigating

---

## D. Risk Assessment

### D1. Gaming

**Question**: How might networks exploit the system?

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| Self-dealing (internal transactions that appear external) | High | High | Prohibit intra-network transactions |
| Position stacking (multiple sides of same chain) | High | High | One position per chain rule |
| Trust laundering (agents move between networks) | Medium | Medium | Agent history follows agent |
| Governance manipulation | Medium | Medium | Governance verification |
| Sybil attack (fake networks) | Medium | High | Legal entity requirement |

---

### D2. Collusion

**Question**: How might networks collude inappropriately?

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| Networks form trading rings | High | High | Pattern detection |
| Networks share agents secretly | Medium | High | Agent uniqueness verification |
| Aligned networks coordinate | Medium | Medium | Relationship disclosure |

**Unique Risk**: Networks are already "collusion" by design — agents coordinating. Line between legitimate coordination and gaming is blurry.

---

### D3. Quality

**Question**: How do we ensure genuine value exchange?

**Concerns**:
- Networks might optimise for metrics over value
- Internal agents might game each other
- Collective satisfaction might mask issues

**Mitigations**:
- Require human touchpoints for high-value exchanges
- Random audit of internal decision logs
- Counterparty feedback weighted heavily

---

### D4. Accountability Gaps

| Gap | Risk | Mitigation |
|-----|------|------------|
| "The network decided" (no individual responsible) | High | Legal entity required |
| Agent leaves network after misbehaviour | Medium | Agent history portable |
| Governance model not followed | Medium | Governance verification |
| No human available for dispute | High | Mandatory human contacts |

---

## E. Use Case Viability

### E1. What Exchanges Become Possible

1. **Complex supply chain coordination**
   - Multiple suppliers and consumers coordinated
   - Just-in-time surplus matching

2. **Consortium resource sharing**
   - Research networks sharing equipment/data
   - Industry groups sharing capacity

3. **Infrastructure optimisation**
   - Smart city resource allocation
   - Energy grid balancing

### E2. What Exchanges Become Problematic

1. **Service exchanges**
   - Who delivers? Who is satisfied?
   - Accountability too diffuse

2. **Relationship-dependent exchanges**
   - No consistent counterparty
   - Trust building impossible

3. **Novel opportunities**
   - Networks optimise for patterns
   - Miss creative matches

### E3. Value Proposition

**For SEP**:
- Access to large-scale industrial surplus
- Complex matching opportunities
- High transaction volumes

**For Networks**:
- Automated surplus optimisation
- Cross-network resource discovery
- Reduced coordination overhead

**Risks**:
- May dominate over individual participants
- Gaming risks significantly higher
- May challenge fundamental SEP assumptions

---

## Recommendation Summary

### Phase 1-2 Status: Not Supported

Multi-agent networks require:
- Novel identity model
- Governance verification system
- Enhanced anti-gaming measures
- New accountability frameworks

### Phase 3+ Target: Research Phase

Before implementation:
1. Resolve fundamental questions about identity and accountability
2. Develop governance verification mechanisms
3. Create robust anti-gaming detection
4. Consider whether networks should be separate network or integrated

### Key Questions Requiring Research

1. **Is a network one participant or many?**
   - Legal implications differ
   - Trust model implications differ
   - Gaming risk implications differ

2. **Can networks be on multiple sides of an exchange?**
   - "Network A provides to Network A's other agent" — allowed?
   - Probably not, but how do we detect?

3. **What governance models are acceptable?**
   - Pure democracy?
   - Designated dictator?
   - Consensus only?

4. **How do we verify governance is followed?**
   - Agents could claim consensus but not have it
   - Trust but verify?

5. **Should networks be a separate "tier" of SEP?**
   - Enterprise tier for networks
   - Standard tier for individuals/orgs
   - Different rules, different matching pools?

---

## Schema Considerations (Phase 3+ Research)

### Network Identity Schema

```json
{
  "participant": {
    "type": {
      "category": "agent",
      "sub_type": "multi_agent_network"
    },
    "network_identity": {
      "network_id": "network-supply-chain-xyz",
      "governance_model": "weighted_quorum",
      "decision_threshold": 0.6,
      "agent_count": 7,
      "legal_entity_id": "company-xyz-ltd"
    },
    "member_agents": [
      {
        "agent_id": "agent-procurement-001",
        "role": "procurement",
        "authority": ["need_creation", "match_evaluation"],
        "weight": 0.2
      },
      {
        "agent_id": "agent-logistics-001",
        "role": "logistics",
        "authority": ["execution_coordination"],
        "weight": 0.15
      }
    ],
    "human_contacts": {
      "primary": {"name": "...", "email": "...", "phone": "..."},
      "escalation": {"name": "...", "email": "...", "phone": "..."}
    }
  }
}
```

### Collective Decision Log Schema

```json
{
  "collective_decision": {
    "decision_id": "decision-12345",
    "decision_type": "match_confirmation",
    "timestamp": "2026-03-15T14:30:00Z",
    "network_id": "network-supply-chain-xyz",
    "participating_agents": [
      {"agent_id": "agent-procurement-001", "vote": "accept"},
      {"agent_id": "agent-quality-001", "vote": "accept"},
      {"agent_id": "agent-risk-001", "vote": "reject"}
    ],
    "aggregation": {
      "method": "weighted_quorum",
      "accept_weight": 0.75,
      "reject_weight": 0.10,
      "abstain_weight": 0.15,
      "threshold_met": true
    },
    "outcome": "accepted",
    "dissent_logged": true
  }
}
```

---

## Next Steps

1. Complete WP5: Design interaction models synthesising all agent types
2. Mark multi-agent networks as "research required" for Phase 3+
3. Consider commissioning separate research on network governance
4. Evaluate whether industrial networks justify separate SEP tier

