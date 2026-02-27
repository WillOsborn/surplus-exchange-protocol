# WP2: Delegated Agent Analysis

**Status**: Complete
**Created**: 2026-02-10
**Related**: [agent-integration-plan.md](./agent-integration-plan.md), [sep-boundary-definition.md](./sep-boundary-definition.md)

## Definition

A **Delegated Agent** is an AI agent with delegated responsibilities from a human principal, acting within predefined rules and requiring explicit approval before taking binding actions. Works at human decision-making timescales.

### Key Characteristics

- Human principal always identifiable
- Has access to instructions, preferences, constraints set by human
- Can plan, execute, manage tasks across systems
- Asks for approval before committing
- Uses human contact channels (email, messaging)
- Human decision-making pace (minutes to hours, not milliseconds)

### Examples

- Personal assistant AI managing a freelancer's business development
- Office manager bot handling procurement within budget limits
- Legal tech AI reviewing contracts and flagging issues for lawyer approval
- Marketing automation platform suggesting and executing campaigns with approval

---

## A. Interaction Scenarios

### A1. Registration

**Scenario**: A marketing agency wants their AI assistant to help manage SEP participation.

**Current Flow (Phase 1)**:
```
1. Human registers agency as participant (identity verification)
2. Human creates account credentials
3. Human may share credentials with agent OR
4. Human uses agent to draft submissions (agent invisible to SEP)
```

**Phase 2 Enhancement**:
```
1. Human registers agency (identity verification)
2. Human creates primary account
3. Human creates "delegated agent" sub-account with defined bounds
4. Agent authenticates with sub-account credentials
5. SEP knows this is delegated agent, applies appropriate rules
```

**Assessment**: Phase 1 works (agent invisible). Phase 2 adds transparency.

---

### A2. Offering Creation

**Scenario**: Agent monitors agency capacity and drafts offerings.

**Current Flow (Phase 1)**:
```
1. Agent monitors team calendars, project pipeline
2. Agent identifies surplus capacity (e.g., "Designer available next month")
3. Agent drafts offering description using SEP schema
4. Agent presents draft to human for review
5. Human approves/modifies and submits via SEP
```

**Phase 2 Enhancement**:
```
1-3. Same as Phase 1
4. Agent submits offering directly (within bounds)
5. Offering marked as "agent-created, pending human review"
6. Human receives notification, can modify or withdraw
7. After N hours without withdrawal, offering becomes active
```

**Assessment**: Phase 1 works well. Phase 2 could add efficiency with safety net.

---

### A3. Need Creation

**Scenario**: Agent identifies business needs and creates SEP needs.

**Current Flow (Phase 1)**:
```
1. Human tells agent "We need bookkeeping help Q2"
2. Agent drafts need description
3. Human reviews and submits
```

**Phase 2 Enhancement**:
```
1. Agent monitors business context (recurring patterns, upcoming deadlines)
2. Agent identifies needs proactively
3. Agent submits needs within predefined categories
4. Human notified of auto-created needs
```

**Assessment**: Phase 1 adequate. Phase 2 adds proactive capability within bounds.

---

### A4. Match Evaluation

**Scenario**: SEP proposes a 4-party chain including the agency.

**Current Flow (Phase 1)**:
```
1. SEP sends match proposal notification to agency
2. Agent receives notification (via email/API integration)
3. Agent evaluates match against criteria:
   - Does the partner meet our requirements?
   - Is timing compatible?
   - Is the exchange balanced for our needs?
4. Agent drafts recommendation memo for human
5. Agent presents: "Recommend accepting" or "Recommend declining" with rationale
6. Human makes final decision
7. Human confirms via SEP (with human verification)
```

**Phase 2 Enhancement**:
```
1-5. Same as Phase 1
6. If within bounds (e.g., established partners only, ≤3-party chains):
   Agent can auto-confirm with bounds marker
7. If outside bounds: Human confirmation required
8. Human can override any auto-confirmation within window
```

**Assessment**: Phase 1 works well. Phase 2 enables bounded automation.

---

### A5. Confirmation

**Scenario**: Agency decides to participate in proposed chain.

**Current Flow (Phase 1)**:
```
1. Human reviews match proposal (possibly with agent analysis)
2. Human clicks "Confirm" in SEP interface
3. Human completes verification (CAPTCHA, 2FA, etc.)
4. SEP records human-verified confirmation
```

**Phase 2 Enhancement**:
```
1. Agent evaluates match against bounds
2. If within bounds:
   - Agent calls confirm API with delegation token
   - SEP records "agent-confirmed within bounds"
   - Human notified, can revoke within 4 hours
3. If outside bounds:
   - Agent prepares recommendation
   - Human must confirm manually
```

**Assessment**: Phase 1 is secure but requires human attention. Phase 2 adds efficiency.

---

### A6. Execution

**Scenario**: Exchange execution phase (delivering the promised service).

**Current Flow**:
```
Execution happens OUTSIDE SEP:
- Agency provides marketing services to partner
- Partner provides whatever they committed
- Actual work is human-to-human (or human-directed)
```

**Agent Role**:
```
- Agent may coordinate scheduling
- Agent may track deliverables
- Agent may draft handover documents
- Agent may monitor completion status
- SEP only sees execution started/completed signals
```

**Assessment**: Agent involvement transparent to SEP. No Phase 2 changes needed for execution tracking.

---

### A7. Satisfaction

**Scenario**: After exchange completes, providing satisfaction signal.

**Current Flow (Phase 1)**:
```
1. SEP prompts for satisfaction signal
2. Human evaluates exchange quality
3. Human selects: satisfied / partially satisfied / not satisfied
4. Human optionally provides feedback text
5. SEP records signal
```

**Phase 2 Enhancement**:
```
1. SEP prompts for satisfaction signal
2. Agent drafts assessment based on:
   - Delivery timeline (on time?)
   - Quality indicators (issues reported?)
   - Human feedback received
3. Agent presents recommendation to human
4. Human confirms or modifies signal
5. (Optional) For low-stakes exchanges within bounds,
   agent could submit signal subject to human override
```

**Assessment**: Satisfaction should likely remain human-confirmed. Subjective assessment is core to trust model.

---

## B. Trust Implications

### B1. Identity

**Question**: How is a delegated agent identified and verified?

**Phase 1 Approach**:
- Agent identity is invisible to SEP
- Only principal (human/org) identity is verified
- Agent operates using principal's credentials

**Phase 2 Approach**:
- Agent has sub-identity under principal
- Agent credentials are distinct from principal credentials
- Agent identity linked to principal identity
- Agent actions auditable separately

**Recommendation**: Phase 2 agent sub-identity improves transparency without complexity.

---

### B2. Accountability

**Question**: Who is responsible if things go wrong?

**Clear Answer**: **The principal is always accountable.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ACCOUNTABILITY CHAIN                                  │
│                                                                          │
│   Agent Action ──► Agent Bound By ──► Principal Sets ──► Principal      │
│                    Rules                Bounds            Accountable    │
│                                                                          │
│   If agent exceeds bounds:                                              │
│   - Principal still accountable to SEP network                          │
│   - Principal has recourse against agent provider (separate matter)     │
│                                                                          │
│   If agent acts within bounds:                                          │
│   - Principal accountable (set the bounds)                              │
│   - No "agent made me do it" defence                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recommendation**: Make accountability chain explicit in registration.

---

### B3. Vouching

**Question**: Can delegated agents vouch for others? Be vouched for?

**Analysis**:
- Vouching is reputation-at-stake commitment
- Agent's reputation flows from principal
- Agent cannot independently stake reputation

**Recommendation**:
- Agents cannot vouch (principals vouch)
- Agents cannot be vouched for (principals are vouched for)
- If principal uses agent, vouching still reflects on principal

---

### B4. Trust Accumulation

**Question**: How do agents build trust over time?

**Analysis**:
- Trust accrues to the principal, not the agent
- Agent is tool, not independent entity
- Multiple agents used by same principal → same trust score

**Phase 2 Nuance**:
- Track agent-assisted vs human-direct actions
- If agent-assisted exchanges have lower satisfaction, surface this
- Allow participants to prefer human-direct partners if desired

**Recommendation**: Trust remains with principal. Agent is implementation detail.

---

### B5. Trust Signals

**Question**: Are agent-to-agent satisfaction signals meaningful?

**Analysis for Delegated Agents**:
- Delegated agent works at human timescales
- Human reviews agent recommendations
- Human provides or approves satisfaction signal
- Therefore: signals reflect human judgement, mediated by agent

**Recommendation**: Satisfaction signals remain meaningful when human confirms.

---

## C. Protocol Requirements

### C1. Speed

**Question**: What confirmation timelines are appropriate?

**Current**: 48-72 hours for human confirmation.

**With Delegated Agents**:
- Agent can prepare response quickly
- Human review still takes hours
- 24-48 hours reasonable for agent-assisted participants
- No need for millisecond responses (that's autonomous agents)

**Recommendation**: Current timelines work. Optional "fast track" for agent-assisted (24h) if all parties consent.

---

### C2. Automation

**Question**: What can be auto-approved vs requires human?

| Action | Phase 1 | Phase 2 (Delegated) |
|--------|-----|----------------|
| Create offering | Human | Agent within categories |
| Create need | Human | Agent within categories |
| Confirm match | Human | Agent within bounds |
| Provide satisfaction | Human | Human (core trust) |
| Vouch for others | Human | Human only |
| Modify bounds | Human | Human only |

---

### C3. Bounds

**Question**: How are delegation limits expressed and enforced?

**Proposed Bounds Schema**:
```json
{
  "delegation_bounds": {
    "offering_creation": {
      "permitted_categories": ["marketing", "content", "design"],
      "require_human_review_before_active": true,
      "max_offerings_per_day": 3
    },
    "need_creation": {
      "permitted_categories": ["accounting", "legal", "it_support"],
      "require_human_review_before_active": true
    },
    "match_confirmation": {
      "auto_confirm_enabled": true,
      "conditions": {
        "max_chain_length": 3,
        "require_established_partners": true,
        "min_partner_trust_score": 0.7,
        "excluded_categories": ["high_value_consulting"]
      }
    },
    "satisfaction_signals": {
      "agent_can_submit": false,
      "agent_can_draft": true
    }
  }
}
```

**Enforcement**: SEP validates agent actions against declared bounds. Actions outside bounds require human re-authentication.

---

### C4. Audit

**Question**: What logging/transparency is required?

**Requirements**:
1. All agent actions logged with agent identifier
2. Bounds at time of action recorded
3. Human override/approval timestamps
4. Distinction between agent-initiated and agent-assisted

**Visibility**:
- Principal sees full agent action log
- Other participants see: "uses delegated agents" + satisfaction history
- SEP operator sees anonymised patterns for abuse detection

---

### C5. Override

**Question**: How can humans intervene?

**Override Mechanisms**:
1. **Revoke**: Human can revoke any agent action within window (4 hours)
2. **Suspend**: Human can suspend agent access immediately
3. **Modify**: Human can tighten bounds at any time
4. **Emergency**: SEP can disable agent access if abuse detected

**Notification**: All agent actions trigger notification to principal with override option.

---

## D. Risk Assessment

### D1. Gaming

**Question**: How might delegated agents exploit the system?

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Agent creates fake surplus | Medium | Human review requirement |
| Agent auto-accepts bad matches | Low | Bounds prevent, human override |
| Agent inflates satisfaction | Medium | Keep satisfaction human-confirmed |
| Agent ignores principal preferences | Low | Bounds enforcement, audit trail |

---

### D2. Collusion

**Question**: How might agents coordinate inappropriately?

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Agents from same provider collude | Low | Different principals = different incentives |
| Ring of agent-assisted participants trade favours | Medium | Same detection as human rings |
| Agent provider manipulates all clients | Low | Principal accountability, provider competition |

**Key Insight**: Collusion risk similar to human participants. Principal accountability is key protection.

---

### D3. Quality

**Question**: How do we ensure genuine value exchange?

**Concerns**:
- Agent might optimise for metrics, not value
- Agent might approve exchanges principal wouldn't want
- Agent might provide satisfaction signals that don't reflect reality

**Mitigations**:
- Bounds limit agent discretion
- Human review of key decisions
- Satisfaction signals remain human-confirmed
- Repeat relationship patterns detect issues

---

### D4. Accountability Gaps

**Question**: Where might responsibility become unclear?

| Gap | Risk | Mitigation |
|-----|------|------------|
| "Agent exceeded bounds" | Medium | Bounds are principal's choice |
| "Agent provider is liable" | Low | Separate from SEP relationship |
| "Agent was hacked" | Medium | Principal's security responsibility |
| "I didn't understand what agent did" | Medium | Clear notification requirements |

---

## E. Use Case Viability

### E1. What Exchanges Become Possible

1. **Smaller firms can participate actively**
   - Solo practitioners can have "always-on" presence
   - Agent monitors for matches while human focuses on delivery

2. **Faster response times**
   - Matches don't wait for human availability
   - Particularly valuable across time zones

3. **More sophisticated matching preferences**
   - Agent can evaluate complex criteria quickly
   - Better matches through more thorough evaluation

4. **Reduced cognitive load**
   - Human focuses on high-value decisions
   - Routine participation handled efficiently

### E2. What Exchanges Become Problematic

1. **Nuanced relationship building**
   - Some exchanges benefit from human-to-human rapport
   - Agent intermediation might reduce relationship quality

2. **Novel or unusual opportunities**
   - Agent might miss creative matches outside training
   - Bounds might exclude serendipitous exchanges

3. **Complex negotiations**
   - Agent drafts may not capture nuance
   - Human editing might be more efficient than agent drafting

### E3. Value Proposition

**For SEP**:
- Increased network activity (agents never sleep)
- More consistent participation patterns
- Reduced friction for busy professionals

**For Participants**:
- Participate without constant attention
- Better match evaluation through systematic analysis
- Scale participation beyond personal capacity

---

## Recommendation Summary

### Phase 1 Status: Implicit Support

Delegated agents work with Phase 1 architecture:
- Agent assists human, remains invisible to SEP
- Human confirms all commitments
- No protocol changes required

### Phase 2 Target: Explicit Delegation

Add explicit delegation support:
1. Delegation declaration in participant profile
2. Bounds schema for permitted actions
3. Agent sub-identity under principal
4. Conditional auto-confirmation within bounds
5. Enhanced audit logging
6. Human override mechanisms

### Implementation Priority: High

Delegated agents are:
- Closest to current human workflow
- Lowest risk (human always accountable)
- Highest near-term demand
- Foundation for more autonomous types

---

## Schema Updates Required

### Participant Schema Addition

```json
{
  "participant": {
    "delegation": {
      "uses_delegated_agents": true,
      "agent_identifiers": ["agent-marketing-assistant-001"],
      "bounds": { /* delegation_bounds schema */ },
      "enabled_since": "2026-03-01T00:00:00Z"
    }
  }
}
```

### Action Logging Schema

```json
{
  "action_log_entry": {
    "action_id": "action-12345",
    "action_type": "match_confirmation",
    "timestamp": "2026-03-15T14:30:00Z",
    "actor": {
      "type": "delegated_agent",
      "agent_id": "agent-marketing-assistant-001",
      "principal_id": "participant-agency-xyz"
    },
    "within_bounds": true,
    "bounds_at_time": { /* snapshot of bounds */ },
    "human_review": {
      "required": false,
      "occurred": true,
      "approved_at": "2026-03-15T15:45:00Z"
    }
  }
}
```

---

## Next Steps

1. Proceed to WP3: Autonomous Buyer Analysis
2. Design bounds schema in detail (WP5)
3. Prototype agent sub-identity system
4. Define notification requirements for agent actions

