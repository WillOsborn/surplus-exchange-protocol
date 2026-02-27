# SEP Trust Model Specification

**Status**: Draft
**Version**: 0.1.0
**Last Updated**: 2026-02-05

## Abstract

This document specifies the trust model for the Surplus Exchange Protocol (SEP). The model defines how participants establish, build, and maintain trust within the network through a tiered system based on track record, vouching relationships, and satisfaction signals. Drawing from lessons of WIR Bank, Sardex, and commercial barter systems, this specification addresses the accountability mechanisms that enable multi-party exchange without monetary collateral.

---

## 1. Overview and Terminology

### 1.1 Design Philosophy

The SEP trust model is founded on three principles derived from historical system analysis:

1. **Track record over collateral**: Unlike WIR Bank's real estate-backed credit, SEP uses demonstrated performance history to establish trustworthiness. This aligns with Sardex's approach whilst avoiding the barriers to entry that collateral requirements create.

2. **Progressive exposure**: New participants face strict limits that relax as they prove reliability. This prevents the unlimited negative balance problem that collapsed most LETS implementations.

3. **Accountability chains**: The vouching mechanism creates social responsibility - when you vouch for someone, their behaviour reflects on you. This adapts the "professional management" success factor from commercial barter systems for a decentralised context.

### 1.2 Normative Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Participant** | An entity (individual or organisation) registered in the SEP network |
| **Trust Profile** | The complete trust record for a participant, including tier, track record, vouching relationships, and exposure limits |
| **Trust Tier** | One of three levels (probationary, established, anchor) determining a participant's capabilities and limits |
| **Track Record** | Historical performance metrics derived from completed exchanges |
| **Vouch** | A formal endorsement of a new participant by an existing member, creating accountability linkage |
| **Satisfaction Signal** | Feedback from an exchange partner indicating fulfilment quality |
| **Exposure Limit** | Constraints on chain size, execution window, and concurrent participation |
| **Chain** | A multi-party exchange cycle where value flows through participants |
| **Edge** | A single exchange commitment between two participants within a chain |

---

## 2. Trust Tiers

SEP defines three trust tiers representing progressive levels of demonstrated reliability. Each tier confers different capabilities and constraints.

### 2.1 Probationary Tier

**Purpose**: Initial tier for new participants during their evaluation period.

**Characteristics**:
- Limited exposure to protect the network from unknown actors
- Requires active vouch from an established or anchor participant
- Demonstrates commitment through completing initial exchanges
- Typically lasts 90 days minimum, with track record requirements

**Capabilities**:
- MAY participate in exchange chains
- MAY provide and receive satisfaction signals
- MUST NOT vouch for other participants
- MUST have an active vouch to participate

### 2.2 Established Tier

**Purpose**: Standard tier for participants with proven track records.

**Characteristics**:
- Demonstrated reliable performance over time
- Expanded exposure limits reflecting lower risk
- Can contribute to network growth through vouching
- Forms the bulk of active network participants

**Capabilities**:
- MAY participate in larger and longer chains
- MAY vouch for new participants (subject to capacity limits)
- MUST NOT exceed allocated vouching capacity
- SHOULD maintain satisfaction rates to retain tier

### 2.3 Anchor Tier

**Purpose**: High-trust tier for participants who contribute significantly to network health.

**Characteristics**:
- Exceptional track record over extended period
- No exposure limits (self-regulating through reputation)
- Higher vouching capacity and influence
- Often early adopters or high-volume participants

**Capabilities**:
- MAY participate without exposure limits
- MAY vouch for multiple new participants
- SHOULD actively contribute to network health
- MAY receive priority in matching algorithms

### 2.4 Tier Comparison Matrix

| Attribute | Probationary | Established | Anchor |
|-----------|--------------|-------------|--------|
| Max chain size | 3 participants | 6 participants | Unlimited |
| Max execution window | 30 days | 90 days | Unlimited |
| Max concurrent chains | 2 | 5 | Unlimited |
| Can vouch | No | Yes | Yes |
| Vouching capacity | 0 | 3 | 8 |
| Requires active vouch | Yes | No | No |

---

## 3. Tier Promotion Criteria

Tier transitions occur automatically when criteria are met, subject to system evaluation. Manual review MAY override automatic transitions in exceptional circumstances.

### 3.1 Probationary to Established

A probationary participant SHALL be promoted to established when ALL of the following criteria are met:

| Criterion | Threshold | Rationale |
|-----------|-----------|-----------|
| Time in network | >= 90 days | Demonstrates sustained engagement |
| Chains completed | >= 5 | Proves ability to fulfil commitments |
| Chains failed | 0 | No failures attributable to participant |
| Satisfaction rate | >= 0.80 | Majority of partners satisfied |
| On-time rate | >= 0.75 | Reasonable punctuality |

**Algorithm**:
```
FUNCTION check_probationary_promotion(profile):
    IF profile.current_tier != "probationary":
        RETURN false

    days_in_network = NOW - profile.timestamps.joined_at
    IF days_in_network < 90 days:
        RETURN false

    IF profile.track_record.chains_completed < 5:
        RETURN false

    IF profile.track_record.chains_failed > 0:
        RETURN false

    IF profile.track_record.satisfaction_received.satisfaction_rate < 0.80:
        RETURN false

    IF profile.track_record.on_time_rate < 0.75:
        RETURN false

    RETURN true
```

### 3.2 Established to Anchor

An established participant SHALL be promoted to anchor when ALL of the following criteria are met:

| Criterion | Threshold | Rationale |
|-----------|-----------|-----------|
| Time in network | >= 12 months | Extended demonstration of reliability |
| Chains completed | >= 50 | Substantial exchange history |
| Chains failed | <= 1 | Near-perfect reliability |
| Satisfaction rate | >= 0.90 | Exceptional partner satisfaction |
| On-time rate | >= 0.90 | Consistent punctuality |
| Vouching reputation | >= 0.70 | Demonstrates good judgement in vouching |
| Network contribution score | >= threshold | Active positive contributor |

**Network Contribution Score** is calculated as:

```
contribution_score = (
    (chains_completed * 1.0) +
    (successful_vouches * 5.0) +
    (satisfaction_signals_given * 0.5) +
    (cyclic_chain_participation * 2.0)
) - (
    (chains_failed * 10.0) +
    (failed_vouches * 15.0) +
    (disputes_caused * 5.0)
)
```

The threshold for anchor promotion SHOULD be set at the 90th percentile of established participant scores, recalculated monthly.

### 3.3 Demotion Criteria

Participants MAY be demoted to a lower tier under the following conditions:

**Anchor to Established**:
- Satisfaction rate falls below 0.80 for 90 consecutive days
- Two or more chain failures within 180 days
- Vouching reputation falls below 0.50
- Extended inactivity (>180 days with no exchange activity)

**Established to Probationary**:
- Satisfaction rate falls below 0.60 for 60 consecutive days
- Chain failure rate exceeds 10% of completed chains
- Active dispute unresolved for >30 days
- Vouched-for participant causes significant network harm

**Probationary to Suspended**:
- Any chain failure during probationary period
- Satisfaction rate falls below 0.50
- Voucher withdraws vouch
- Fraud or policy violation detected

### 3.4 Demotion Grace Periods

Before demotion occurs, participants SHALL receive:
- Warning notification at 30 days before threshold breach
- Opportunity to address issues during 14-day grace period
- Explanation of specific metrics requiring improvement
- Option to request manual review

---

## 4. Exposure Limits by Tier

Exposure limits constrain the risk a participant can introduce to the network. These limits are based on analysis of failure cascades in historical systems.

### 4.1 Chain Size Limits

**Definition**: Maximum number of participants in a chain this member can join.

| Tier | Limit | Rationale |
|------|-------|-----------|
| Probationary | 3 | Limits cascade exposure; simpler chains easier to complete |
| Established | 6 | Balances opportunity with manageable complexity |
| Anchor | Unlimited | Trust earned through track record |

**Implementation Notes**:
- Chain size is counted as total participants, including the joining participant
- A 3-party chain is the minimum viable cycle (A->B->C->A)
- Chains larger than 8 participants SHOULD receive enhanced monitoring

### 4.2 Execution Window Limits

**Definition**: Maximum days allowed for chain execution from commitment to completion.

| Tier | Limit | Rationale |
|------|-------|-----------|
| Probationary | 30 days | Forces prompt execution; limits hanging commitments |
| Established | 90 days | Accommodates more complex deliverables |
| Anchor | Unlimited | Trust to manage own timelines |

**Implementation Notes**:
- Execution window begins when chain enters COMMITTED state
- Window applies to the entire chain, not individual edges
- Participants SHOULD complete their edge within proportional time allocation
- Approaching deadlines (7 days remaining) trigger escalation notifications

### 4.3 Concurrent Chain Limits

**Definition**: Maximum number of chains this participant can be active in simultaneously.

| Tier | Limit | Rationale |
|------|-------|-----------|
| Probationary | 2 | Prevents overcommitment; ensures focus |
| Established | 5 | Allows portfolio of exchanges |
| Anchor | Unlimited | Self-managed capacity |

**Implementation Notes**:
- A chain counts as "active" from CONFIRMING through EXECUTING states
- COMPLETED, FAILED, and DECLINED chains do not count
- Participants approaching limit SHOULD receive capacity warnings
- Matching algorithm SHOULD deprioritise participants at limit

### 4.4 Limit Overrides

In exceptional circumstances, limits MAY be manually adjusted:

```json
{
  "limits_overridden": true,
  "override_reason": "Seasonal capacity increase approved - Q4 consulting surge"
}
```

**Override Requirements**:
- MUST be documented with reason
- MUST be time-limited (maximum 90 days)
- SHOULD be reviewed by anchor participant or administrator
- MUST NOT exceed next tier's limits by more than 50%

---

## 5. Vouching Mechanism

The vouching system creates accountability chains that extend trust from known participants to new entrants. This adapts the professional management insight from Sardex and ITEX for a decentralised context.

### 5.1 Voucher Qualifications

A participant MAY vouch for new members if ALL of the following are true:

| Requirement | Threshold |
|-------------|-----------|
| Current tier | Established or Anchor |
| Available vouching capacity | > 0 |
| Account standing | Active, not suspended |
| Time since last vouch | >= 7 days |

**Rationale**: The 7-day cooldown prevents rapid vouching that could enable coordinated attacks.

### 5.2 Vouching Capacity

Vouching capacity limits how many new participants a member can actively vouch for.

| Tier | Base Capacity | Maximum Capacity |
|------|---------------|------------------|
| Established | 3 | 5 |
| Anchor | 8 | 12 |

**Capacity Regeneration**:
- When a vouchee is promoted to established, vouching capacity is restored
- Capacity regenerates at 1 slot per 90 days if all vouchees maintain good standing
- Failed vouchees (demoted or suspended) block regeneration until resolved

**Capacity Bonus**:
- Vouching reputation >= 0.90: +2 capacity
- Vouching reputation >= 0.80: +1 capacity

### 5.3 Vouch Lifecycle

```
ACTIVE → EXPIRED (after 12 months)
      → WITHDRAWN (voucher revokes)
      → SUPERSEDED (vouchee reaches established)
```

**Active Vouch**: Currently in effect, linking voucher reputation to vouchee behaviour.

**Expired Vouch**: Probationary participant did not reach established within 12 months. Counts as neutral for vouching reputation unless vouchee caused harm.

**Withdrawn Vouch**: Voucher explicitly revokes endorsement. The vouchee has 30 days to obtain a replacement vouch or faces suspension.

**Superseded Vouch**: Vouchee reached established tier; vouch is no longer required. Counts as positive for vouching reputation.

### 5.4 Vouching Reputation

Vouching reputation measures a participant's judgement quality in endorsing new members.

**Calculation**:
```
vouching_reputation = weighted_average(vouch_outcomes)

WHERE:
  positive_outcome = vouchee reached established tier, weight 1.0
  neutral_outcome = vouchee expired/pending, weight 0.5
  negative_outcome = vouchee suspended/withdrawn for cause, weight 0.0

  vouching_reputation = (
    (positive_count * 1.0) + (neutral_count * 0.5) + (negative_count * 0.0)
  ) / total_vouches
```

**Reputation Impact**:

| Vouchee Outcome | Reputation Impact |
|-----------------|-------------------|
| Promoted to established within 9 months | +0.05 |
| Promoted to established within 12 months | +0.02 |
| Still probationary after 12 months | -0.02 |
| Suspended for rule violation | -0.10 |
| Suspended for fraud | -0.20 |
| Withdrew voluntarily | 0.00 |

**Example**:

An established participant has vouched for 5 people:
- 3 reached established tier (positive)
- 1 still probationary after 6 months (neutral)
- 1 suspended for low satisfaction (negative)

```
vouching_reputation = (3 * 1.0 + 1 * 0.5 + 1 * 0.0) / 5 = 0.70
```

### 5.5 Vouching Requirements

**Information Required to Vouch**:

The voucher MUST provide:
1. Relationship description (minimum 50 characters)
2. Duration of relationship (minimum 6 months)
3. Basis for trust assessment

The voucher SHOULD provide:
1. Specific examples of reliability
2. Context of professional interaction
3. Any concerns or limitations

**Vouch Attestation Format**:
```json
{
  "voucher_id": "part_3d4e5f6g7h8i",
  "vouchee_id": "part_7f8g9h0i1j2k",
  "vouched_at": "2026-01-15",
  "relationship": "Former client - worked together on brand identity project in 2024",
  "relationship_duration_months": 18,
  "trust_basis": "Consistently delivered high-quality work on time; responsive to feedback; maintained professional communication throughout engagement",
  "known_limitations": null
}
```

---

## 6. Satisfaction Aggregation

Satisfaction signals from exchange partners form the foundation of reputation tracking. This section specifies how individual signals combine into reputation metrics.

### 6.1 Satisfaction Signal Types

After each edge completion, the receiving participant SHOULD provide a satisfaction signal:

| Signal | Value | Meaning |
|--------|-------|---------|
| satisfied | 1.0 | Delivery met or exceeded expectations |
| partially_satisfied | 0.5 | Delivery had notable gaps but was acceptable |
| not_satisfied | 0.0 | Delivery failed to meet acceptable standards |

**Signal Timing**:
- Signals SHOULD be provided within 7 days of delivery
- Signals MAY be updated within 14 days if circumstances change
- After 14 days, signals are considered final

### 6.2 Satisfaction Rate Calculation

The satisfaction rate aggregates signals with time-decay weighting to emphasise recent performance.

**Base Calculation**:
```
satisfaction_rate = sum(signal_value * weight) / sum(weight)
```

**Time-Decay Weighting**:
```
weight = 1.0 * decay_factor^(days_since_signal / 180)

WHERE:
  decay_factor = 0.5 (half-life of 180 days)
```

**Example**:
A participant received these signals:
- 2 days ago: satisfied (1.0)
- 30 days ago: satisfied (1.0)
- 100 days ago: partially_satisfied (0.5)
- 200 days ago: not_satisfied (0.0)

```
weights:
  - 2 days: 1.0 * 0.5^(2/180) = 0.992
  - 30 days: 1.0 * 0.5^(30/180) = 0.891
  - 100 days: 1.0 * 0.5^(100/180) = 0.681
  - 200 days: 1.0 * 0.5^(200/180) = 0.464

weighted_sum = (1.0 * 0.992) + (1.0 * 0.891) + (0.5 * 0.681) + (0.0 * 0.464)
             = 0.992 + 0.891 + 0.341 + 0.000
             = 2.224

weight_sum = 0.992 + 0.891 + 0.681 + 0.464 = 3.028

satisfaction_rate = 2.224 / 3.028 = 0.734
```

### 6.3 Minimum Signal Threshold

Satisfaction rate calculations require minimum signal counts for reliability:

| Context | Minimum Signals | Handling Below Threshold |
|---------|-----------------|--------------------------|
| Tier promotion | 5 | Cannot promote until threshold met |
| Public display | 3 | Display "insufficient data" |
| Matching weight | 1 | Use tier default assumption |

**Tier Default Assumptions** (for matching when insufficient signals):
- Probationary: 0.70 assumed satisfaction rate
- Established: 0.85 assumed satisfaction rate
- Anchor: 0.95 assumed satisfaction rate

### 6.4 Signal Fraud Prevention

To prevent signal manipulation:

1. **Reciprocal signal detection**: If A and B consistently exchange mutual "satisfied" signals without network participation, their cross-signals receive reduced weight (0.5x multiplier).

2. **Velocity limits**: A participant cannot receive more than 5 signals from the same partner within 30 days.

3. **Network graph analysis**: Signals from participants with whom the recipient has completed fewer than 3 prior exchanges receive standard weight. Signals from frequent partners receive reduced weight (0.8x multiplier) to prevent clique inflation.

---

## 7. Gaming Resistance

This section addresses attack vectors and countermeasures. The design draws from WIR's 90-year operational experience, Sardex's credit controls, and analysis of LETS failure modes.

### 7.1 Sybil Attack Prevention

**Threat**: An attacker creates multiple identities to accumulate influence, manipulate reputation, or extract value.

**Countermeasures**:

| Measure | Implementation | Effectiveness |
|---------|----------------|---------------|
| Vouch requirement | New participants MUST have vouch from existing member | High - transfers cost to attacker or accomplice |
| Vouching capacity limits | Each member can only vouch for limited number | High - limits scale of attack |
| Voucher accountability | Voucher reputation suffers if vouchees fail | High - creates cost for accomplices |
| Verification gates | OPTIONAL identity verification for higher tiers | Medium - friction vs security trade-off |
| Network analysis | Detect suspicious clustering patterns | Medium - catches naive attacks |

**Detection Signals**:
- Multiple new participants with same voucher in short period
- Participants who only transact with each other
- Unusual satisfaction signal patterns (always satisfied, always from same partners)
- Registration metadata anomalies (similar timing, locations, devices)

**Response Protocol**:
1. Flag suspicious cluster for review
2. Suspend new participants pending investigation
3. Freeze voucher's capacity
4. If confirmed: suspend all identified Sybils; demote voucher
5. Document patterns to improve detection

### 7.2 Collusion Detection

**Threat**: Groups of participants coordinate to extract value, inflate reputations, or manipulate matching.

**Collusion Types**:

| Type | Description | Detection |
|------|-------------|-----------|
| Reputation laundering | Exchange signals without real value transfer | Analyse edge delivery evidence; track physical/digital artefacts |
| Credit extraction | Accumulate then abandon negative balances | Exposure limits; track balance trends |
| Matching manipulation | Coordinate to form preferred chains | Analyse chain composition patterns |
| Vouching rings | Cross-vouch to bootstrap fraudulent accounts | Graph analysis for vouch cycles |

**Countermeasures**:

**Vouching Ring Detection**:
```
FUNCTION detect_vouching_ring(participant_id):
    // Build vouch graph
    vouch_graph = construct_vouch_graph()

    // Find cycles containing this participant
    cycles = find_cycles(vouch_graph, participant_id, max_length=6)

    // Cycles of length <= 4 are suspicious
    FOR cycle IN cycles:
        IF length(cycle) <= 4:
            flag_for_review(cycle, "potential_vouching_ring")

    // Dense clusters of recent vouches are suspicious
    recent_vouches = get_vouches_since(NOW - 90 days)
    clusters = find_dense_clusters(recent_vouches)

    FOR cluster IN clusters:
        IF cluster.density > threshold:
            flag_for_review(cluster, "potential_coordinated_vouching")
```

**Transaction Pattern Analysis**:
```
FUNCTION detect_suspicious_patterns(participant_id):
    // Get recent transactions
    transactions = get_transactions(participant_id, days=180)

    // Calculate partner concentration
    partner_counts = count_by_partner(transactions)
    concentration = gini_coefficient(partner_counts)

    IF concentration > 0.8:  // 80% with few partners
        flag_for_review(participant_id, "high_partner_concentration")

    // Check for reciprocal-only patterns
    reciprocal_rate = calculate_reciprocal_rate(transactions)

    IF reciprocal_rate > 0.9:  // 90% reciprocal
        flag_for_review(participant_id, "excessive_reciprocity")
```

### 7.3 Balance Manipulation

**Threat**: Participants attempt to extract value by building positive balances through minimal-effort contributions or accumulating debt without intention to repay.

**Note**: SEP uses subjective value ledgers, so "balance" refers to each participant's internal sense of value exchanged rather than shared currency. However, systemic imbalances remain detectable and problematic.

**Countermeasures**:

| Measure | Implementation |
|---------|----------------|
| Contribution ratio monitoring | Track ratio of value provided vs received; flag sustained imbalances |
| Exchange diversity requirements | Participants SHOULD have varied exchange partners |
| Inactivity decay | Long-inactive participants face exposure limit reduction |
| Exit protocol | Participants wishing to leave SHOULD restore approximate balance |

**Contribution Ratio Calculation**:
```
contribution_ratio = total_value_exchanged.as_provider /
                     (total_value_exchanged.as_provider + total_value_exchanged.as_recipient)

// Healthy range: 0.35 to 0.65 (roughly balanced over time)
// Warning flags:
//   < 0.25: Primarily receiving, may be extracting value
//   > 0.75: Primarily providing, may indicate difficulty receiving value
```

### 7.4 Reputation Farming

**Threat**: Participants optimise for reputation metrics rather than genuine value exchange.

**Attack Patterns**:
- Complete many trivial exchanges to inflate chain count
- Coordinate satisfied signals without real delivery
- Avoid any exchange with risk of negative signal

**Countermeasures**:

1. **Minimum exchange complexity**: Exchanges below complexity threshold contribute reduced weight to track record.

2. **Signal source diversity**: Satisfaction rate calculation applies diversity bonus:
   ```
   diversity_factor = unique_signal_sources / total_signals
   adjusted_rate = base_rate * (0.7 + 0.3 * diversity_factor)
   ```

3. **Selective exchange detection**: Participants who decline significantly more chains than average receive scrutiny.

4. **Quality over quantity weighting**: Tier promotion considers complexity-adjusted metrics, not raw counts.

### 7.5 Emergency Response Protocol

When severe gaming or fraud is detected:

**Severity Levels**:

| Level | Criteria | Response |
|-------|----------|----------|
| Low | Anomalous pattern, no confirmed harm | Flag for monitoring; no immediate action |
| Medium | Pattern confirmed, limited harm | Suspend participant; review affected chains |
| High | Significant harm or network risk | Suspend cluster; freeze related chains; notify affected participants |
| Critical | Systemic threat to network integrity | Circuit breaker activation; escalate to administrators |

**Circuit Breaker Protocol**:
When critical threat detected:
1. Halt new chain creation network-wide
2. Pause all chains involving flagged participants
3. Notify all participants of security event
4. Conduct emergency review
5. Resume with remediation measures in place

---

## 8. Example Tier Progressions

### 8.1 Standard Progression: New Participant to Anchor

**Day 0 - Join**:
Sarah, a graphic designer, joins SEP with a vouch from her former client Marcus (established tier).

```json
{
  "current_tier": "probationary",
  "track_record": {
    "chains_completed": 0,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 0,
      "satisfaction_rate": null
    }
  },
  "limits": {
    "max_chain_size": 3,
    "max_execution_window_days": 30,
    "max_concurrent_chains": 2
  }
}
```

**Day 30 - First Exchanges**:
Sarah completes her first two 3-party chains, providing logo design in both.

```json
{
  "track_record": {
    "chains_completed": 2,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 2,
      "satisfied_count": 2,
      "satisfaction_rate": 1.0
    },
    "on_time_rate": 1.0
  }
}
```

**Day 90 - Approaching Threshold**:
Sarah has completed 4 chains. She needs one more to meet promotion criteria.

```json
{
  "track_record": {
    "chains_completed": 4,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 5,
      "satisfied_count": 4,
      "partially_satisfied_count": 1,
      "satisfaction_rate": 0.90
    },
    "on_time_rate": 0.80
  }
}
```

**Day 105 - Promotion to Established**:
Fifth chain completed. Automatic promotion triggered.

```json
{
  "current_tier": "established",
  "tier_history": [
    {
      "from_tier": "probationary",
      "to_tier": "established",
      "changed_at": "2026-04-15T11:30:00Z",
      "reason": "track_record_threshold",
      "details": "Completed 5 chains with 90% satisfaction rate over 105 days"
    }
  ],
  "limits": {
    "max_chain_size": 6,
    "max_execution_window_days": 90,
    "max_concurrent_chains": 5,
    "can_vouch": true
  },
  "vouching": {
    "vouching_capacity": 3
  }
}
```

**Month 8 - Active Contributor**:
Sarah has been steadily active, completing 25 chains and vouching for 2 colleagues.

```json
{
  "track_record": {
    "chains_completed": 25,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 32,
      "satisfied_count": 30,
      "partially_satisfied_count": 2,
      "satisfaction_rate": 0.94
    },
    "on_time_rate": 0.92
  },
  "vouching": {
    "vouched_for": [
      { "vouchee_current_tier": "established", "outcome_assessment": "positive" },
      { "vouchee_current_tier": "probationary", "outcome_assessment": "neutral" }
    ],
    "vouching_capacity": 2,
    "vouching_reputation": 0.75
  }
}
```

**Month 14 - Anchor Promotion**:
Sarah exceeds all anchor thresholds and is automatically promoted.

```json
{
  "current_tier": "anchor",
  "track_record": {
    "chains_completed": 52,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 68,
      "satisfaction_rate": 0.93
    },
    "on_time_rate": 0.91
  },
  "tier_history": [
    { "to_tier": "probationary", "reason": "initial_join" },
    { "to_tier": "established", "reason": "track_record_threshold" },
    {
      "from_tier": "established",
      "to_tier": "anchor",
      "changed_at": "2027-05-10T10:00:00Z",
      "reason": "network_contribution",
      "details": "52 completed chains, 93% satisfaction, positive vouching record"
    }
  ],
  "limits": {
    "max_chain_size": null,
    "max_execution_window_days": null,
    "max_concurrent_chains": null,
    "can_vouch": true
  },
  "vouching": {
    "vouching_capacity": 8
  }
}
```

### 8.2 Recovery Path: Demotion and Restoration

**Initial State - Established**:
James has been established for 8 months with a solid track record.

```json
{
  "current_tier": "established",
  "track_record": {
    "chains_completed": 18,
    "chains_failed": 0,
    "satisfaction_received": {
      "satisfaction_rate": 0.85
    }
  }
}
```

**Difficulty Period**:
James experiences business difficulties and delivers poorly on several exchanges.

```json
{
  "track_record": {
    "chains_completed": 20,
    "chains_failed": 1,
    "satisfaction_received": {
      "total_signals": 28,
      "satisfied_count": 20,
      "partially_satisfied_count": 4,
      "not_satisfied_count": 4,
      "satisfaction_rate": 0.57
    }
  }
}
```

**Warning Issued**:
System issues warning at satisfaction rate below 0.60 for 30 days.

```json
{
  "warnings": [
    {
      "issued_at": "2026-11-15T09:00:00Z",
      "type": "low_satisfaction",
      "message": "Satisfaction rate (0.57) below threshold (0.60) for 30 days. Demotion in 14 days if not addressed."
    }
  ]
}
```

**Demotion to Probationary**:
No improvement; demotion occurs.

```json
{
  "current_tier": "probationary",
  "tier_history": [
    { "to_tier": "probationary", "reason": "initial_join" },
    { "to_tier": "established", "reason": "track_record_threshold" },
    {
      "from_tier": "established",
      "to_tier": "probationary",
      "changed_at": "2026-12-01T09:00:00Z",
      "reason": "low_satisfaction",
      "details": "Satisfaction rate 0.57 for 45+ days; failed chain on 2026-10-20"
    }
  ],
  "limits": {
    "max_chain_size": 3,
    "max_execution_window_days": 30,
    "max_concurrent_chains": 2,
    "can_vouch": false
  }
}
```

**Recovery Period**:
James focuses on smaller, simpler exchanges and consistently delivers well.

```json
{
  "track_record": {
    "chains_completed": 26,
    "chains_failed": 1,
    "satisfaction_received": {
      "total_signals": 38,
      "satisfied_count": 32,
      "satisfaction_rate": 0.78
    }
  }
}
```

**Note**: The failed chain and low-satisfaction signals remain in history but receive reduced weight due to time decay. After 180+ days of consistent good performance, James becomes eligible for re-promotion to established.

### 8.3 Edge Case: Rapid Success

**Scenario**: A high-profile agency with strong reputation joins and quickly demonstrates value.

**Day 0 - Join with Anchor Vouch**:
```json
{
  "current_tier": "probationary",
  "vouching": {
    "vouched_by": [
      {
        "voucher_tier_at_time": "anchor",
        "relationship": "Industry partner for 5+ years; jointly delivered projects worth significant value"
      }
    ]
  }
}
```

**Day 45 - Exceptional Performance**:
Agency completes 8 chains in 45 days, all with satisfied signals.

```json
{
  "track_record": {
    "chains_completed": 8,
    "chains_failed": 0,
    "satisfaction_received": {
      "total_signals": 12,
      "satisfied_count": 12,
      "satisfaction_rate": 1.0
    },
    "on_time_rate": 1.0
  }
}
```

**Day 90 - Early Promotion**:
Although only 90 days, agency has far exceeded chain completion threshold. Promotion to established approved (minimum time threshold met).

**Note**: Despite exceptional performance, time-in-network requirements prevent immediate anchor promotion. This prevents gaming through rapid activity bursts.

---

## 9. Implementation Notes

### 9.1 Trust Profile Storage

Trust profiles MUST be stored durably with:
- Complete history of tier changes
- Full vouching relationship records
- All satisfaction signals received
- Timestamps for audit trail

Trust profiles SHOULD be:
- Encrypted at rest
- Access-controlled to authorised systems
- Backed up with point-in-time recovery capability

### 9.2 Calculation Frequency

| Metric | Recalculation Frequency |
|--------|-------------------------|
| Satisfaction rate | Real-time (on new signal) |
| On-time rate | Real-time (on delivery) |
| Vouching reputation | Daily batch |
| Network contribution score | Weekly batch |
| Tier promotion eligibility | Daily batch |
| Demotion warning checks | Daily batch |

### 9.3 Privacy Considerations

**Visible to All Participants**:
- Current tier
- Aggregated satisfaction rate (if above threshold)
- Time in network (approximate)

**Visible to Chain Partners**:
- Track record summary
- Vouching status (vouched by vs specific voucher identity)

**Visible Only to Participant**:
- Full vouching details
- Individual satisfaction signals
- Tier history with reasons
- Warning and demotion notices

**Visible to Administrators**:
- Complete trust profile
- Gaming detection flags
- Dispute history

### 9.4 Integration Points

The trust model integrates with:

1. **Matching Algorithm**: Uses tier and track record to weight candidate selection
2. **Chain Lifecycle**: Enforces exposure limits at CONFIRMING state
3. **Satisfaction Collection**: Feeds signals into aggregation
4. **Dispute Resolution**: May trigger tier review
5. **Monitoring Dashboard**: Exposes network health metrics

---

## Appendix A: Schema Reference

See `/schemas/trust-profile.schema.json` for the complete JSON Schema definition.

## Appendix B: Historical System Lessons Applied

| Lesson | Source System | SEP Implementation |
|--------|---------------|-------------------|
| Collateral prevents free-riding | WIR Bank | Track record replaces collateral; exposure limits scale with history |
| Professional management essential | All successful systems | Automated tier management; clear algorithms vs volunteer discretion |
| Active brokerage beats directories | Sardex, ITEX | AI matching incorporates trust signals |
| Vouching creates accountability | Sardex | Vouching reputation tracks outcomes |
| Cyclic closure prevents accumulation | Sardex | Trust signals from chain partners, not just pairwise |
| Unlimited negative balances destroy networks | LETS | Exposure limits prevent over-commitment |

## Appendix C: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-05 | Initial draft |
