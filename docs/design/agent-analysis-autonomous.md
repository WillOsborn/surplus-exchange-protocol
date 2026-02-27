# WP3: Autonomous Buyer Analysis

**Status**: Complete
**Created**: 2026-02-10
**Related**: [agent-integration-plan.md](./agent-integration-plan.md), [agent-analysis-delegated.md](./agent-analysis-delegated.md)

## Definition

An **Autonomous Buyer** is an AI agent that can decide and transact independently, operating at machine speed without human in the loop. May manage part of a supply chain, sense needs, query suppliers, evaluate options, and execute purchases.

### Key Characteristics

- Operates at machine speed (milliseconds to seconds)
- Humans not needed in the loop
- May use protocols/APIs directly (not human channels)
- Can work 24/7
- Keeps audit logs but acts independently
- Example: Printer ordering its own ink, inventory system restocking

---

## A. Interaction Scenarios

### A1. Registration

**Scenario**: An autonomous purchasing system wants to register with SEP.

**Current Flow (Phase 1)**: Not supported — requires human registration.

**Phase 3+ Approach**:
```
1. Autonomous system requests registration
2. Machine identity verification:
   - Digital certificate from recognised CA
   - Linked to legal entity (company/org)
   - Operator/owner identification required
3. "Autonomous agent" participant type created
4. Special constraints applied:
   - Initial rate limits
   - Probationary restrictions
   - Enhanced monitoring
5. Accountability chain to legal entity established
```

**Key Challenge**: Who is accountable? Machine has no legal personality.

**Resolution**: Legal entity (operator) is always accountable. Autonomous agent is sophisticated tool.

---

### A2. Offering Creation

**Scenario**: Warehouse system detects excess inventory, creates offering.

**Autonomous Flow**:
```
1. System monitors inventory levels
2. Algorithm detects: "500 units of component X above forecast need"
3. System calculates: "Surplus available for 3 months, value threshold met"
4. System creates SEP offering automatically:
   - Type: physical_good
   - Quantity: 500 units
   - Condition: new
   - Availability: immediate, 3-month window
   - Location: Warehouse A, shipping available
5. Offering goes live immediately (no human review)
6. System logs action for audit
7. Human operators receive daily digest
```

**Assessment**: Works mechanically, but raises questions about surplus definition and subjective value.

---

### A3. Need Creation

**Scenario**: Production system detects upcoming shortage, creates need.

**Autonomous Flow**:
```
1. System monitors production schedule and inventory
2. Algorithm predicts: "Component Y shortage in 6 weeks"
3. System evaluates: "SEP match preferred over purchase order"
4. System creates SEP need:
   - Type: physical_good
   - Quantity: 1000 units
   - Required by: 2026-04-15
   - Delivery location: Factory B
   - Quality requirements: specification XYZ
5. Need goes live immediately
```

**Assessment**: Need creation is more straightforward — machine knows what it needs.

---

### A4. Match Evaluation

**Scenario**: SEP proposes match for component exchange.

**Autonomous Flow**:
```
1. SEP sends match proposal via API
2. System receives within milliseconds
3. Algorithm evaluates:
   - Does offering meet specification?
   - Is timing compatible?
   - Is provider trust score sufficient?
   - Is exchange value acceptable?
4. Decision made in <100ms
5. System accepts or rejects programmatically
6. No human involvement
```

**Assessment**: This is where autonomous agents fundamentally differ. Evaluation is algorithmic, not subjective.

**Key Question**: Is algorithmic evaluation compatible with SEP's subjective value model?

---

### A5. Confirmation

**Scenario**: Autonomous system confirms participation in chain.

**Autonomous Flow**:
```
1. Match proposal evaluated (A4)
2. If acceptable: confirm immediately via API
3. No confirmation window needed
4. Chain can proceed at machine speed
5. All participants in chain may be autonomous
6. Entire chain could confirm in seconds
```

**Implication**: Machine-speed matching creates potential for:
- Much faster exchange cycles
- Higher volume of transactions
- Reduced human oversight
- Increased risk of cascading errors

---

### A6. Execution

**Scenario**: Physical goods exchange between autonomous systems.

**Autonomous Flow**:
```
1. Chain confirmed
2. Provider system triggers fulfillment:
   - Generates shipping order
   - Arranges logistics
   - Sends tracking information
3. Recipient system:
   - Receives shipping notification
   - Tracks delivery
   - Confirms receipt upon arrival
   - Runs quality verification
4. Execution tracked automatically
5. Humans notified of exceptions only
```

**Assessment**: Execution can be fully automated for standardised goods. Services are more complex.

---

### A7. Satisfaction

**Scenario**: Autonomous system provides satisfaction signal.

**Autonomous Flow**:
```
1. Delivery received
2. System runs verification:
   - Quantity check: 500/500 ✓
   - Quality check: meets spec ✓
   - Timing check: on time ✓
3. Algorithm determines: "satisfied"
4. System submits satisfaction signal
5. If issues: "partially satisfied" or "not satisfied" with structured reason
```

**Key Question**: Is machine-generated satisfaction meaningful?

**Analysis**:
- For physical goods: verifiable criteria → meaningful signal
- For services: subjective quality → problematic
- Trust model may need separate handling for M2M satisfaction

---

## B. Trust Implications

### B1. Identity

**Question**: How is an autonomous agent identified and verified?

**Proposed Approach**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS AGENT IDENTITY                             │
│                                                                          │
│  Machine Identity:                                                       │
│  - Digital certificate (X.509 or similar)                               │
│  - Unique agent identifier                                               │
│  - API credentials with rate limiting                                   │
│                                                                          │
│  Linked to Legal Entity:                                                │
│  - Operator/owner company registration                                  │
│  - Legal accountability established                                     │
│  - Contact information for issues                                       │
│                                                                          │
│  Verification:                                                          │
│  - Certificate from recognised CA                                       │
│  - Domain verification for operator                                     │
│  - Optional: third-party audit of agent behaviour                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### B2. Accountability

**Question**: Who is responsible when things go wrong?

**Clear Answer**: **Operating entity is always accountable.**

```
Autonomous Agent ──► Operated By ──► Legal Entity ──► Accountable
                                          │
                                          ▼
                                     Human contacts
                                     for disputes
```

**Edge Cases**:
- Agent malfunctions: operator liable
- Agent is hacked: operator's security responsibility
- Agent causes cascading failure: operator liable for their agent's portion

**Limitation**: No "the algorithm did it" defence.

---

### B3. Vouching

**Question**: Can autonomous agents vouch? Be vouched for?

**Analysis**:
- Vouching requires judgement and reputation stake
- Autonomous agents operate on rules, not judgement
- Reputation flows from operator, not agent

**Recommendation**:
- Autonomous agents cannot vouch
- Operators can vouch for their agents' reliability
- Other participants can choose to trust operator-vouched agents

---

### B4. Trust Accumulation

**Question**: How do autonomous agents build trust?

**Proposed Approach**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS AGENT TRUST                                │
│                                                                          │
│  Separate Trust Metrics:                                                │
│                                                                          │
│  Agent-Specific:                                                        │
│  - Transaction completion rate                                          │
│  - On-time delivery percentage                                          │
│  - Specification compliance rate                                        │
│  - Dispute rate                                                         │
│                                                                          │
│  Operator-Level:                                                        │
│  - Aggregate across all operator's agents                               │
│  - Operator reputation affects agent trust ceiling                      │
│  - Operator can have multiple agents with different scores              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### B5. Trust Signals

**Question**: Are agent-to-agent satisfaction signals meaningful?

**For Physical Goods**:
```
Measurable criteria:
- Quantity: received 500/500 ✓ → objective
- Quality: meets spec ✓ → verifiable (if specification clear)
- Timing: on time ✓ → objective

Conclusion: Satisfaction signals are meaningful for standardised goods
```

**For Services**:
```
Subjective criteria:
- Quality: "good design work" → requires human judgement
- Value: "worth the exchange" → subjective

Conclusion: Autonomous agents poorly suited for service exchanges
```

**Recommendation**: Limit autonomous agent participation to standardised, verifiable exchanges initially.

---

## C. Protocol Requirements

### C1. Speed

**Question**: What confirmation timelines are appropriate?

**Current**: 48-72 hours (for humans)

**For Autonomous Agents**:
- Confirmation: seconds to minutes
- Entire chain confirmation: minutes
- No "thinking time" needed

**Proposal: Two-Speed System**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TWO-SPEED MATCHING                                    │
│                                                                          │
│  Standard Lane (Phase 1):                                                    │
│  - 48-72 hour confirmation window                                       │
│  - Human confirmation required                                          │
│  - Mixed human/agent participation                                      │
│                                                                          │
│  Fast Lane (Phase 3+):                                                       │
│  - Minutes confirmation window                                          │
│  - All participants must be autonomous                                  │
│  - API-only interaction                                                 │
│  - Higher rate limits for established agents                            │
│                                                                          │
│  Hybrid Chains:                                                         │
│  - Chain includes both human and autonomous                             │
│  - Operates at slowest participant's speed                              │
│  - Autonomous agents must tolerate human delays                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### C2. Automation

**Question**: What operations are fully automated?

| Operation | Autonomous Agent | Human Review |
|-----------|-----------------|--------------|
| Registration | Automated with cert | Initial only |
| Offering creation | Fully automated | Audit only |
| Need creation | Fully automated | Audit only |
| Match evaluation | Fully automated | None |
| Confirmation | Fully automated | None |
| Execution triggers | Fully automated | Exceptions |
| Satisfaction signals | Fully automated (goods) | Required (services) |
| Dispute handling | Flag only | Human required |

---

### C3. Bounds

**Question**: What limits apply to autonomous agents?

**Proposed Constraints**:
```json
{
  "autonomous_agent_constraints": {
    "rate_limits": {
      "offerings_per_hour": 10,
      "confirmations_per_hour": 5,
      "api_calls_per_minute": 100
    },
    "transaction_limits": {
      "max_chain_participation_per_day": 20,
      "cooling_off_period_between_chains_ms": 60000
    },
    "content_limits": {
      "permitted_offering_types": ["physical_good", "digital_good"],
      "excluded_offering_types": ["service", "consultation"]
    },
    "partner_requirements": {
      "min_partner_trust_score": 0.8,
      "require_operator_relationship": false
    },
    "probationary_restrictions": {
      "duration_days": 90,
      "max_chain_length": 2,
      "require_established_partner": true,
      "enhanced_monitoring": true
    }
  }
}
```

---

### C4. Audit

**Question**: What logging/transparency is required?

**Enhanced Requirements**:
1. All decisions logged with reasoning
2. Algorithm version tracked
3. Input data at decision time recorded
4. Operator access to full logs
5. SEP access for abuse detection
6. Regulatory access if required (GDPR, etc.)

---

### C5. Override

**Question**: How can humans intervene?

**Override Mechanisms**:
1. **Operator dashboard**: Real-time monitoring and kill switch
2. **SEP admin**: Can suspend agent for network protection
3. **Emergency halt**: Agent must support immediate stop command
4. **Rollback window**: For reversible actions only

---

## D. Risk Assessment

### D1. Gaming

**Question**: How might autonomous agents exploit the system?

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| Fake surplus creation | High | Medium | Verification requirements |
| Rapid wash trading | High | High | Rate limiting, pattern detection |
| Trust score manipulation | Medium | High | Separate M2M trust metrics |
| Specification gaming | Medium | Medium | Clear specs, dispute tracking |
| Market manipulation | Medium | High | Volume monitoring, anomaly detection |

---

### D2. Collusion

**Question**: How might autonomous agents coordinate inappropriately?

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| Same-operator ring trading | High | High | Limit intra-operator transactions |
| API-coordinated collusion | Medium | High | Timing analysis, pattern detection |
| Oligopoly formation | Medium | Medium | Diversity requirements, new entrant support |

**Unique M2M Risks**:
- Agents can coordinate at speed humans can't detect
- Shared algorithms might converge on exploitative strategies
- Network effects could exclude human participants

---

### D3. Quality

**Question**: How do we ensure genuine value exchange?

**For Physical Goods**:
- Specification compliance verifiable
- Delivery tracking provides evidence
- Quality disputes can reference objective criteria

**For Services**:
- Autonomous agents should NOT participate in service exchanges
- Subjective value is core to SEP — machines can't assess it

---

### D4. Accountability Gaps

| Gap | Risk | Mitigation |
|-----|------|------------|
| Algorithm made poor decision | Medium | Operator accountability |
| Cascading failures across agents | High | Circuit breakers, rate limits |
| No human to resolve dispute | High | Escalation to operator required |
| Regulatory uncertainty | Medium | Clear accountability chain |

---

## E. Use Case Viability

### E1. What Exchanges Become Possible

1. **High-frequency, low-value exchanges**
   - Commodity trading between supply chains
   - Automated surplus redistribution

2. **24/7 global matching**
   - No timezone constraints
   - Immediate response to surplus/need

3. **Predictive surplus management**
   - AI predicts future surplus, pre-registers
   - Just-in-time matching

4. **Supply chain integration**
   - Multiple autonomous agents form supply networks
   - Real-time optimisation

### E2. What Exchanges Become Problematic

1. **Service exchanges**
   - Subjective value assessment fails
   - Quality judgement requires human involvement

2. **Relationship-building exchanges**
   - No rapport, no trust deepening
   - Pure transaction, no community

3. **Novel/creative exchanges**
   - Agents work from patterns
   - Miss innovative opportunities

4. **High-stakes decisions**
   - Risk of automated errors at scale
   - Need for human judgement

### E3. Value Proposition

**For SEP**:
- Higher transaction volume
- New use cases (supply chain)
- 24/7 network activity

**For Operators**:
- Automated procurement optimisation
- Reduced manual overhead
- Faster response to opportunities

**Risks**:
- May dilute human-centric community
- Gaming risks higher
- Subjective value model challenged

---

## Recommendation Summary

### Phase 1-2 Status: Not Supported

Autonomous buyers require fundamental changes:
- Trust model adaptation
- Two-speed matching system
- M2M identity infrastructure
- Enhanced abuse detection

### Phase 3+ Target: Limited Introduction

Introduce with significant constraints:
1. Physical goods only (no services)
2. Standardised specifications required
3. Separate "fast lane" for M2M exchanges
4. Enhanced monitoring and rate limits
5. Probationary period (90 days)
6. Operator accountability explicit

### Key Questions to Resolve Before Phase 3

1. **Does subjective value work for machines?**
   - May need objective "specification compliance" metric instead

2. **Are M2M satisfaction signals meaningful?**
   - For goods: probably yes
   - For services: probably no

3. **How do we prevent machine-speed gaming?**
   - Rate limits help but may not be sufficient
   - Pattern detection essential

4. **Should there be separate human and M2M networks?**
   - Or integrate with speed-appropriate lanes?

---

## Schema Updates Required (Phase 3+)

### Participant Schema Addition

```json
{
  "participant": {
    "type": {
      "category": "agent",
      "sub_type": "autonomous_buyer"
    },
    "machine_identity": {
      "certificate_fingerprint": "SHA256:abc123...",
      "certificate_issuer": "DigiCert",
      "valid_until": "2027-02-10"
    },
    "operator": {
      "legal_entity_id": "company-xyz-ltd",
      "contact_email": "operations@xyz.com",
      "escalation_contact": "+44..."
    },
    "constraints": { /* autonomous_agent_constraints */ }
  }
}
```

### Fast Lane Chain Schema

```json
{
  "exchange_chain": {
    "matching_lane": "fast",
    "all_participants_autonomous": true,
    "confirmation_window_seconds": 300,
    "execution_mode": "automated"
  }
}
```

---

## Next Steps

1. Proceed to WP4: Multi-Agent Network Analysis
2. Research M2M identity standards
3. Design pattern detection for autonomous agent abuse
4. Evaluate hybrid human/machine exchange viability

