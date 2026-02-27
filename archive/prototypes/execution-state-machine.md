# Execution State Machine Prototype

**Status**: Draft
**Created**: 2026-02-05
**Informed by**: execution-research-findings.md, agentic-protocols-analysis.md

## Overview

This document defines the state machine for SEP exchange chain execution. It draws on:
- **Saga pattern** for long-running transaction management
- **Three-phase commit** concepts for progressive commitment
- **Multi-signature** patterns for N-of-N confirmation
- **Circuit breaker** patterns for failure detection

## Design Principles

1. **Explicit state transitions**: Every state change has a defined trigger and action set
2. **No ambiguous states**: Clear entry/exit conditions for each state
3. **Recovery paths**: Every failure state has a recovery or compensation path
4. **Audit trail**: All transitions recorded for dispute resolution
5. **Human checkpoints**: Key decisions require human approval, not just agent action

## Chain State Machine

### State Diagram

```
                                    ┌─────────────────────────────────────┐
                                    │                                     │
                                    ▼                                     │
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  DRAFT    │────►│ PROPOSED  │────►│CONFIRMING │────►│ COMMITTED │────►│ EXECUTING │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
     │                 │                  │                 │                 │
     │                 │                  │                 │                 │
     ▼                 ▼                  ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ DISCARDED │     │ ABANDONED │     │ DECLINED  │     │ CANCELLED │     │  FAILED   │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
                                                           ▲                 │
                                                           │                 │
                                                           └─────────────────┘
                                                            (post-compensation)

                                                                  │
                                                                  ▼
                                                            ┌───────────┐
                                                            │ COMPLETED │
                                                            └───────────┘
```

### State Definitions

| State | Description | Entry Trigger | Valid Next States |
|-------|-------------|---------------|-------------------|
| **DRAFT** | Chain being constructed by algorithm or broker | Chain discovery identifies potential match | PROPOSED, DISCARDED |
| **PROPOSED** | Chain formally proposed to participants | Proposer submits chain for confirmation | CONFIRMING, ABANDONED |
| **CONFIRMING** | Collecting confirmations from all participants | First participant confirms | COMMITTED, DECLINED |
| **COMMITTED** | All participants confirmed; chain is binding | N-of-N confirmations received | EXECUTING, CANCELLED |
| **EXECUTING** | Exchanges in progress | Execution window start time reached | COMPLETED, FAILED |
| **COMPLETED** | All edges satisfied; chain successful | All edges reach SATISFIED status | Terminal |
| **DISCARDED** | Draft chain abandoned before proposal | Proposer discards before sending | Terminal |
| **ABANDONED** | Proposed chain withdrawn by proposer | Proposer cancels before confirmations | Terminal |
| **DECLINED** | One or more participants declined | Any decline or confirmation timeout | Terminal |
| **CANCELLED** | Committed chain cancelled before execution | Unanimous cancellation request | Terminal |
| **FAILED** | Execution failed; compensation complete | Failure detected during execution | Terminal |

### Transition Rules

#### DRAFT Transitions

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| DRAFT -> PROPOSED | Proposer submits | Chain valid, all offerings available | Send proposal to all participants, start confirmation timer |
| DRAFT -> DISCARDED | Proposer discards | None | Log discard reason |

#### PROPOSED Transitions

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| PROPOSED -> CONFIRMING | First confirmation received | Confirmation from valid participant | Record confirmation, update waiting list |
| PROPOSED -> ABANDONED | Proposer withdraws | No confirmations yet received | Notify any observers, log reason |

#### CONFIRMING Transitions

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| CONFIRMING -> COMMITTED | All confirm | N-of-N confirmations, within deadline | Reserve all offerings, schedule execution, notify all |
| CONFIRMING -> DECLINED | Any decline | Valid decline from participant | Release any reservations, notify all, log reason |
| CONFIRMING -> DECLINED | Timeout | Confirmation deadline passed | Release any reservations, notify all |

#### COMMITTED Transitions

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| COMMITTED -> EXECUTING | Execution window opens | Current time >= execution_window.start | Send execution reminders, start monitoring |
| COMMITTED -> CANCELLED | Unanimous cancel request | All participants request cancellation | Release all reservations, notify all |

#### EXECUTING Transitions

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| EXECUTING -> COMPLETED | All edges satisfied | All edges in SATISFIED state | Update trust metrics, record completion, notify all |
| EXECUTING -> FAILED | Failure detected | Circuit breaker triggered OR unrecoverable edge failure | Initiate compensation saga, notify all |

### Timing Constraints

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Chain Timeline                                  │
├────────────┬────────────┬──────────────────────────┬───────────────────────┤
│  Proposal  │Confirmation│     Commitment Period    │   Execution Window    │
│   Phase    │   Phase    │   (waiting for start)    │                       │
├────────────┼────────────┼──────────────────────────┼───────────────────────┤
│    T0      │    T1      │          T2              │     T3          T4    │
│  Proposed  │  Confirmed │       Committed          │   Start         End   │
└────────────┴────────────┴──────────────────────────┴───────────────────────┘

Deadlines:
- T1 - T0: Confirmation deadline (default: 48 hours)
- T3 - T2: Commitment period (depends on chain, typically 0-14 days)
- T4 - T3: Execution window (depends on edge types, typically 7-60 days)
```

## Edge State Machine

Each edge within a chain has its own state machine, subordinate to the chain state.

### Edge State Diagram

```
                                ┌───────────────────────────────────────────────────┐
                                │                                                   │
                                ▼                                                   │
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ PROPOSED  │────►│ CONFIRMED │────►│IN_PROGRESS│────►│ DELIVERED │────►│ SATISFIED │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
     │                                    │                 │
     │                                    │                 │
     ▼                                    ▼                 ▼
┌───────────┐                       ┌───────────┐     ┌───────────┐
│  SKIPPED  │                       │ ABANDONED │     │ DISPUTED  │
└───────────┘                       └───────────┘     └───────────┘
                                          │                 │
                                          │                 ▼
                                          │           ┌───────────┐
                                          └──────────►│ RESOLVED  │
                                                      └───────────┘
```

### Edge State Definitions

| State | Description | Entry Trigger |
|-------|-------------|---------------|
| **PROPOSED** | Edge proposed as part of chain | Chain created |
| **CONFIRMED** | Both provider and recipient confirmed | Chain reaches COMMITTED |
| **IN_PROGRESS** | Provider has started execution | Provider signals execution start |
| **DELIVERED** | Provider completed delivery | Provider signals completion with evidence |
| **SATISFIED** | Recipient confirmed satisfaction | Recipient signals satisfied/partially_satisfied |
| **SKIPPED** | Edge removed from chain before execution | Chain restructured, edge removed |
| **ABANDONED** | Provider failed to execute | Timeout or explicit abandonment |
| **DISPUTED** | Satisfaction dispute raised | Recipient signals not_satisfied or raises dispute |
| **RESOLVED** | Dispute resolved | Arbitration complete |

### Edge Transition Rules

| Transition | Trigger | Guards | Actions |
|------------|---------|--------|---------|
| PROPOSED -> CONFIRMED | Chain committed | Chain state = COMMITTED | Lock offering capacity |
| PROPOSED -> SKIPPED | Edge removed | Chain restructured | Release capacity, update chain |
| CONFIRMED -> IN_PROGRESS | Execution start signal | Chain state = EXECUTING | Record start time, notify recipient |
| IN_PROGRESS -> DELIVERED | Completion signal | Valid delivery evidence | Record completion, notify recipient |
| IN_PROGRESS -> ABANDONED | Timeout/abandonment | Execution deadline passed OR provider signals abandon | Trigger failure handling |
| DELIVERED -> SATISFIED | Satisfaction signal | satisfied or partially_satisfied | Update trust metrics, check chain completion |
| DELIVERED -> DISPUTED | Dispute signal | not_satisfied OR explicit dispute | Pause dependent edges, initiate ODR |
| DISPUTED -> RESOLVED | Arbitration complete | Resolution decision made | Apply resolution, update chain state |
| ABANDONED -> RESOLVED | Compensation complete | Compensation applied | Update chain state |

## Confirmation Sub-Protocol

The confirmation phase implements a three-phase model adapted from 3PC:

### Phase 1: Tentative Interest (Optional)

Some chains may include a "soft check" before formal proposal:

```
Agent -> Participant: "Would you be interested in this type of exchange?"
Participant -> Agent: "Yes, tentatively interested" / "No, not interested"
```

This reduces proposal spam and improves hit rate.

### Phase 2: Formal Proposal

```
Proposer -> All Participants: ChainProposal {
  chain_id,
  edges: [...],
  proposed_timing: {...},
  confirmation_deadline
}

Each Participant -> Proposer: ParticipantConfirmation {
  chain_id,
  participant_id,
  decision: "confirm" | "decline" | "counter",
  conditions: [...],  // optional
  counter_proposal: {...}  // if decision = "counter"
}
```

### Phase 3: Commitment

Once all confirmations received:

```
Proposer -> All Participants: ChainCommitment {
  chain_id,
  confirmed_edges: [...],
  final_timing: {...},
  commitment_hash: "..."  // cryptographic commitment
}

All Participants -> Proposer: CommitmentAcknowledgment {
  chain_id,
  participant_id,
  acknowledged_at,
  signature: "..."  // participant's signature on commitment
}
```

## Execution Monitoring

### Circuit Breaker Logic

The circuit breaker monitors execution progress and triggers failure handling before cascade failures:

```
Circuit Breaker Configuration:
- warning_threshold: 0.7  // 70% of scheduled time elapsed without progress
- failure_threshold: 1.2  // 120% of scheduled time (20% grace period)
- check_interval: daily

Circuit Breaker States:
- CLOSED: Normal operation, monitoring active
- OPEN: Failure detected, chain paused, compensation initiated
- HALF_OPEN: Testing recovery, limited execution

Monitoring Logic:
for each edge in chain.edges:
  if edge.status == IN_PROGRESS:
    elapsed = now - edge.started_at
    expected = edge.scheduled_completion - edge.started_at

    progress_ratio = elapsed / expected

    if progress_ratio > failure_threshold:
      trigger_circuit_breaker(edge, "timeout")

    elif progress_ratio > warning_threshold:
      send_warning(edge.provider, "execution_delay")
      notify_dependent_edges(edge, "potential_delay")
```

### Health Checks

Periodic health checks verify chain viability:

```
Health Check Protocol:
1. For each EXECUTING chain:
   a. Check all edge statuses
   b. Verify participants still active
   c. Check for unacknowledged messages
   d. Verify offerings still valid

2. Health Score Calculation:
   - Edge completion rate
   - Message acknowledgment rate
   - Participant responsiveness
   - Time remaining vs work remaining

3. Actions:
   - Score > 0.8: Healthy, continue
   - Score 0.5-0.8: Warning, increase monitoring
   - Score < 0.5: At risk, consider intervention
```

## Compensation Saga

When execution fails, the compensation saga attempts to restore acceptable state:

### Compensation Strategy Selection

```
Compensation Strategies (in preference order):

1. RESTRUCTURE: Remove failed edge, find replacement
   - Conditions: Replacement available, time permits
   - Actions: Find alternate provider, restructure chain

2. PARTIAL_COMPLETE: Complete viable edges, compensate remainder
   - Conditions: Some edges can complete independently
   - Actions: Complete independent edges, reputation adjustment for failures

3. FULL_UNWIND: Reverse all completed edges where possible
   - Conditions: Completed edges are reversible
   - Actions: Initiate reversals, handle irreversible edges specially

4. SETTLE_EXTERNALLY: Use external settlement for irrecoverable situations
   - Conditions: Willing parties, clear liability
   - Actions: External payment or credit arrangement
```

### Compensation Execution

```
Compensation Saga Flow:

1. ASSESS
   - Identify failed edges
   - Identify completed edges (irreversible?)
   - Identify pending edges (can be cancelled?)
   - Calculate affected parties

2. PLAN
   - Select compensation strategy
   - Calculate compensation amounts (reputation, priority, or external)
   - Identify required approvals

3. PROPOSE
   - Present compensation plan to affected parties
   - Collect acceptances
   - Handle counter-proposals

4. EXECUTE
   - Apply reputation adjustments
   - Record priority credits
   - Process external settlements
   - Update chain status

5. CLOSE
   - Mark chain as FAILED
   - Record lessons learned
   - Update network statistics
```

## Recovery Procedures

### Participant Unresponsive

```
Scenario: Participant stops responding during CONFIRMING

Detection:
- No response to proposal within confirmation_deadline
- No acknowledgment of reminder messages

Recovery:
1. Wait for confirmation_deadline
2. Mark chain as DECLINED
3. Notify other participants
4. Log unresponsive participant for trust metrics
5. Optionally: Attempt chain without unresponsive participant
```

### Single Edge Failure

```
Scenario: One edge fails during EXECUTING, others proceeding

Detection:
- Edge timeout or abandonment signal
- Circuit breaker triggered

Recovery:
1. Pause dependent edges (if any)
2. Assess chain viability:
   a. Can chain complete without this edge?
   b. Is replacement provider available?
   c. What's the time remaining?
3. If viable: Restructure chain, continue
4. If not viable: Initiate compensation saga
```

### Multiple Edge Failures

```
Scenario: Two or more edges fail in same chain

Detection:
- Multiple circuit breaker triggers
- Cascade failure pattern detected

Recovery:
1. Immediately pause all pending edges
2. Assess which completed edges are reversible
3. Calculate optimal compensation strategy
4. Propose partial completion or full unwind
5. Execute chosen strategy
```

### Infrastructure Failure

```
Scenario: Platform unavailable during execution

Detection:
- System monitoring alerts
- Heartbeat failures

Recovery:
1. Preserve all state to durable storage
2. Extend all deadlines by outage duration
3. Send notifications when restored
4. Resume execution monitoring
5. Special handling for edges that crossed outage window
```

## Message Idempotency

All state transitions must be idempotent to handle message replay:

```
Idempotency Implementation:

1. Every message has unique message_id
2. Before processing, check if message_id already processed
3. If already processed, return previous response (don't re-execute)
4. If new, process and record message_id with response

State Transition Idempotency:
- Transitions are guarded by current state
- Invalid transitions (e.g., COMPLETED -> EXECUTING) are rejected
- Same-state transitions (e.g., EXECUTING -> EXECUTING) are acknowledged but no-op
```

## Open Questions

1. **Timeout granularity**: Should timeouts be fixed or negotiable per-chain?
2. **Partial confirmation**: Can a chain proceed with N-1 confirmations if one participant is optional?
3. **Edge dependencies**: How complex can edge dependency graphs be within a chain?
4. **State persistence**: What's the durability requirement for state transitions?
5. **Concurrent chains**: How do we handle a participant involved in multiple concurrent chains?

## Relationship to Formal Schema

This prototype should inform updates to `schemas/exchange-chain.schema.json`:

- Add DRAFT state if pre-proposal phase is valuable
- Consider adding SKIPPED to edge status enum
- Add DISPUTED and RESOLVED edge states
- Consider adding compensation-related fields
- Add circuit breaker configuration to chain timing

## References

- Saga Pattern: Garcia-Molina & Salem (1987)
- Three-Phase Commit: Skeen (1981)
- Circuit Breaker: Nygard, Release It! (2007)
- docs/research/execution-research-findings.md
