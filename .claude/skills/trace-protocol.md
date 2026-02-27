# Trace Protocol Skill

Walk through SEP protocol flows for specific scenarios, showing state transitions and message sequences.

## Invocation

```
/trace-protocol [scenario]
```

Where `[scenario]` is:
- `happy-path` - Successful 3-party chain
- `single-failure` - One edge fails, chain restructures
- `dispute` - Edge disputed and resolved
- `timeout-cascade` - Confirmation timeout
- Custom scenario description

## Instructions

### Trace Format

For each scenario, produce:

1. **Scenario Overview**
   - Participants involved
   - Offerings being exchanged
   - Expected outcome

2. **Step-by-Step Trace**
   ```
   === Step 1: Chain Proposal ===
   Time: T+0
   Actor: Broker/Algorithm
   Action: Propose chain to participants

   Chain State: DRAFT → PROPOSED
   Edge States: All edges → PROPOSED

   Message: ChainProposal
   {
     "chain_id": "chain-001",
     "edges": [...],
     ...
   }

   Sent to: participant-alice, participant-bob, participant-carol
   ```

3. **State Diagram**
   Mermaid diagram showing the flow:
   ```mermaid
   sequenceDiagram
       Broker->>Alice: ChainProposal
       Broker->>Bob: ChainProposal
       Alice->>Broker: ParticipantConfirmation (confirm)
       Bob->>Broker: ParticipantConfirmation (confirm)
   ```

4. **Decision Points**
   Highlight branches:
   - "At this point, if Bob declines instead..."
   - "If timeout occurs before all confirmations..."

### Standard Scenarios

#### Happy Path (3-Party)
```
Participants: Alice (legal), Bob (catering), Carol (design)
Chain: Alice→Bob (contract review), Bob→Carol (catering), Carol→Alice (branding)
Outcome: All edges complete, chain COMPLETED
```

Trace through:
1. Chain proposal
2. All confirmations received
3. Chain committed
4. Execution window opens
5. Each edge executes and completes
6. Satisfaction signals exchanged
7. Chain completion

#### Single Edge Failure
```
Participants: Alice, Bob, Carol
Failure: Bob fails to deliver to Carol
Outcome: Compensation saga, chain FAILED
```

Trace through:
1. Happy path until Bob's edge
2. Circuit breaker detects delay
3. Warning sent to Bob
4. Timeout reached
5. Compensation saga initiated
6. Resolution options evaluated
7. Compensation applied

#### Dispute Resolution
```
Participants: Alice, Bob
Dispute: Alice claims partial delivery
Outcome: Mediation, edge marked RESOLVED
```

Trace through:
1. Edge delivered
2. Alice signals not_satisfied
3. Dispute raised with evidence
4. Bob responds
5. Mediation/resolution
6. Outcome applied

### Output Format

Produce markdown document with:
- Scenario summary
- Participant table
- Mermaid sequence diagram
- Step-by-step trace table
- Final state summary
- Lessons/notes

### References

Cross-reference:
- `docs/specs/execution-protocol.md` - State definitions
- `docs/specs/message-protocol.md` - Message formats
- `prototypes/execution-state-machine.md` - Transition rules
