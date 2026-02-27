# Execution Protocol Research Findings

**Status**: Complete
**Last Updated**: 2026-02-05
**Researcher**: execution-researcher subagent

## Executive Summary

This document analyses distributed transaction protocols, blockchain execution patterns, traditional trade settlement systems, and dispute resolution mechanisms to inform SEP's execution protocol design.

**Key findings:**
1. **Saga pattern with compensation is the best fit** for SEP's multi-party chains, given the long-running nature of exchanges and need for graceful failure handling
2. **Circuit breakers and progressive commitment** are essential for detecting and handling chain failures before they cascade
3. **Escrow-like reservation mechanisms** can provide commitment without requiring shared currency
4. **Hybrid human-automated dispute resolution** following established ODR patterns balances efficiency with fairness

## Protocols Analysed

### Distributed Systems Protocols

#### Two-Phase Commit (2PC)

**How it works:**
Two-Phase Commit is a distributed algorithm ensuring all participants in a transaction either commit or abort atomically.

*Phase 1 - Prepare (Voting Phase):*
1. Coordinator sends `PREPARE` message to all participants
2. Each participant performs transaction up to the point of committing
3. Participants acquire necessary locks and write to durable storage
4. Each participant votes `YES` (prepared to commit) or `NO` (must abort)

*Phase 2 - Commit (Decision Phase):*
1. If all participants voted `YES`: Coordinator sends `COMMIT` to all
2. If any participant voted `NO`: Coordinator sends `ABORT` to all
3. Participants execute the decision and release locks
4. Participants acknowledge completion to coordinator

**Failure handling:**
- *Participant failure before vote*: Times out, coordinator aborts
- *Participant failure after YES vote*: Must recover and check coordinator for decision
- *Coordinator failure*: **Blocking problem** - participants holding locks indefinitely
- *Network partition*: Can lead to inconsistent state if partitions heal unpredictably

**Limitations:**
- **Blocking**: If coordinator fails after collecting votes but before broadcasting decision, participants are stuck
- **Synchronous**: All participants must be available simultaneously
- **Lock contention**: Resources locked for entire protocol duration
- **No partial success**: All-or-nothing semantics only

**SEP applicability:**
- **Poor fit** for SEP's multi-party chains
- SEP exchanges are long-running (days/weeks), not millisecond transactions
- Physical goods delivery cannot be "locked" like database rows
- Blocking on coordinator failure is unacceptable for business operations
- However, the **commitment collection pattern** (Phase 1) is useful for confirming chain participation

#### Three-Phase Commit (3PC)

**How it works:**
Three-Phase Commit adds an intermediate phase to prevent blocking after coordinator failure.

*Phase 1 - CanCommit:*
1. Coordinator sends `CAN_COMMIT?` to all participants
2. Participants check if they can commit (without locking)
3. Participants respond `YES` or `NO`

*Phase 2 - PreCommit:*
1. If all responded `YES`: Coordinator sends `PRE_COMMIT`
2. Participants acquire locks, prepare to commit
3. Participants acknowledge `ACK`
4. If any responded `NO` or timeout: Coordinator sends `ABORT`

*Phase 3 - DoCommit:*
1. Coordinator receives all `ACK`, sends `DO_COMMIT`
2. Participants commit and release locks
3. Participants send `DONE`

**Improvements over 2PC:**
- **Non-blocking under certain failures**: Participants can make progress if coordinator fails
- **Recovery protocol**: Participants can elect new coordinator and determine outcome
- **Clear state separation**: `PRE_COMMIT` state allows recovery without blocking

**Failure handling:**
- *Coordinator failure in Phase 2*: Participants know no commit has occurred, can abort safely
- *Coordinator failure in Phase 3*: Participants in `PRE_COMMIT` know commit was decided, can proceed
- *Participant failure*: Similar to 2PC but with clearer recovery paths

**Limitations:**
- **Network partition vulnerability**: If partition occurs during `PRE_COMMIT`, different sides may make different decisions
- **More message rounds**: Higher latency than 2PC
- **Still synchronous**: All participants must be reachable within timeouts

**SEP applicability:**
- **Marginal improvement** over 2PC for SEP
- The non-blocking property is valuable but doesn't address long-running transaction needs
- The three-phase model **could inform SEP's confirmation flow**: CanCommit (tentative interest) -> PreCommit (firm commitment) -> DoCommit (execution)
- Still too synchronous for real-world exchange timing

#### Saga Pattern

**How it works:**
Sagas are a pattern for managing long-running transactions that span multiple services or bounded contexts. Unlike 2PC/3PC, sagas break a transaction into a sequence of local transactions, each with a compensating action.

*Forward flow:*
```
T1 -> T2 -> T3 -> T4 (success)
```

*Compensation on failure:*
```
T1 -> T2 -> T3 (fails) -> C2 -> C1 (compensation)
```

**Two coordination patterns:**

*Choreography (event-driven):*
- Each service publishes events upon completion
- Next service reacts to events and continues the saga
- Compensation events trigger reverse flow
- No central coordinator
- **Pros**: Loosely coupled, scalable
- **Cons**: Hard to track overall progress, complex event chains

*Orchestration (command-driven):*
- Central saga orchestrator directs the flow
- Orchestrator sends commands to services
- Services report completion back to orchestrator
- Orchestrator decides next step or compensation
- **Pros**: Centralised visibility, easier debugging
- **Cons**: Single point of failure, tighter coupling

**Compensation mechanisms:**
1. **Semantic compensation**: Reverse the business effect (e.g., cancel booking)
2. **Countermeasures**: Business-level actions that restore acceptable state
3. **Pivot transactions**: Point of no return - before pivot, compensation possible; after pivot, only forward

**Failure handling:**
- Each step must be **idempotent** (can be retried safely)
- Each step must have a **compensating transaction**
- Compensation must also be idempotent
- **Dead letter queues** for failed compensations requiring manual intervention

**SEP applicability:**
- **Excellent fit** for SEP's multi-party chains
- Long-running nature matches SEP exchanges (days/weeks)
- Compensation maps to "what happens when one party fails to deliver"
- Choreography suits decentralised SEP; orchestration suits brokered chains
- **Pivot transaction concept** is crucial: once physical delivery occurs, compensation changes nature

**SEP adaptation:**
- Each edge in a chain is a "local transaction"
- Compensation for services: alternate provider, reduced scope, or graceful chain restructuring
- Compensation for physical goods: return logistics or keep-and-credit arrangements
- SEP needs **semantic compensation** because literal reversal often impossible

#### BPMN Choreography

**How it works:**
BPMN (Business Process Model and Notation) Choreography diagrams model interactions between participants without a central controller. Each participant sees only their role and interactions.

**Key concepts:**
- **Choreography Task**: Interaction between two participants (initiator sends, responder replies)
- **Choreography Sub-Process**: Compound interaction with multiple message exchanges
- **Event-based Gateway**: Participant waits for one of several possible messages
- **Parallel Gateway**: Multiple interactions happen concurrently

**Multi-party coordination patterns:**

*Sequential coordination:*
```
[Participant A] --msg1--> [Participant B] --msg2--> [Participant C]
```

*Broadcast coordination:*
```
                        /--> [Participant B]
[Participant A] --msg--+---> [Participant C]
                        \--> [Participant D]
```

*Collect-and-proceed:*
```
[Participant B] --\
[Participant C] ---+--> [Participant A] --> (continues)
[Participant D] --/
```

**Correlation:**
- Messages must be correlated to specific process instances
- Correlation keys (e.g., chain_id) link messages to the right saga/chain

**SEP applicability:**
- **Good conceptual model** for SEP chain execution
- SEP chains are inherently choreography (no single controller)
- Event-based gateways model "waiting for confirmation from all parties"
- BPMN's **compensation event handlers** align with saga compensation
- **Message correlation** is essential - SEP needs robust chain_id tracking

**SEP adaptation:**
- Model each chain as a choreography with participants as swim lanes
- Use choreography tasks for: proposal, confirmation, execution notification, satisfaction signal
- Parallel gateway for simultaneous edge execution where dependencies allow
- Event-based gateway for "wait for all confirmations or timeout"


### Blockchain/Smart Contracts

#### Atomic Swaps

**How it works:**
Atomic swaps enable trustless exchange of assets between parties on different blockchains (or same blockchain) using hash time-locked contracts (HTLCs).

*Protocol:*
1. Alice wants to trade Asset A for Bob's Asset B
2. Alice generates secret `S` and computes `H = hash(S)`
3. Alice creates HTLC on Chain A: "Pay Asset A to Bob if he provides preimage of H within 48 hours; else return to Alice"
4. Bob verifies HTLC, creates HTLC on Chain B: "Pay Asset B to Alice if she provides preimage of H within 24 hours; else return to Bob"
5. Alice claims Asset B by revealing `S` on Chain B
6. Bob sees `S` revealed, claims Asset A on Chain A using same `S`
7. Both swaps complete atomically (either both happen or neither)

**Trust model:**
- **Trustless**: Neither party needs to trust the other
- **Hash lock**: Knowledge of secret controls release
- **Time lock**: Ensures refund if counterparty abandons
- **Asymmetric timeouts**: Prevent race conditions (Alice must claim first)

**Failure handling:**
- *Alice abandons after step 4*: Both HTLCs timeout and refund
- *Bob abandons after step 4*: Alice's HTLC times out, she gets refund
- *Alice claims and Bob doesn't see*: Bob's timelock protects him (but he may miss window)

**Limitations:**
- **Requires hash-compatible chains**: Both must support same hash function
- **Timing sensitivity**: Time-lock windows must account for block confirmation times
- **Capital lockup**: Assets locked for duration of swap
- **Two-party only**: Standard atomic swaps don't extend to N-party chains easily

**SEP applicability:**
- **Limited direct applicability** - SEP doesn't operate on blockchains
- **Hash-lock concept is valuable**: Could use cryptographic commitments for staged revelation
- **Time-lock pattern applies**: Confirmation deadlines, execution windows
- For **N-party chains**: Would need chained HTLCs (A->B->C->D->A) with cascading timelocks
- **Trust model inspiration**: SEP can't be fully trustless (human judgment needed) but can minimise trust requirements

#### Multi-Signature Wallets

**How it works:**
Multi-signature (multisig) wallets require M of N keys to authorise transactions. Common patterns:
- 2-of-3: Two of three keyholders must sign
- 3-of-5: Three of five keyholders must sign

**Approval patterns:**
- **Proposal**: One keyholder proposes transaction
- **Approval collection**: Other keyholders review and sign
- **Execution**: Once threshold reached, transaction executes
- **Expiration**: Proposals may expire if not approved in time

**Governance patterns:**
- **Escrow**: 2-of-3 with buyer, seller, and arbiter
- **Corporate treasury**: 3-of-5 requiring multiple executives
- **DAO voting**: M-of-N where N is large community

**SEP applicability:**
- **Directly applicable** to SEP chain confirmation
- Chain proposal requires confirmation from all N participants (N-of-N)
- Could relax to N-1 of N with designated "can proceed without" participant
- **Approval collection pattern** matches SEP's confirmation phase
- **Expiration** is essential: chains can't wait forever for stragglers

**SEP adaptation:**
- Chain state transitions require multi-party approval
- `proposed` -> `confirming`: Requires 1 participant (proposer)
- `confirming` -> `committed`: Requires N-of-N participants
- `committed` -> `executing`: Automatic or coordinator-initiated
- Could support **conditional signatures**: "I confirm if participant X also confirms"

#### Escrow Contracts

**How it works:**
Escrow contracts hold assets until predefined conditions are met, then release to the appropriate party.

*Standard escrow flow:*
1. Buyer deposits funds into escrow
2. Seller ships goods
3. Buyer confirms receipt OR dispute period expires
4. Escrow releases funds to seller

**Release conditions:**
- **Time-based**: Release after N days if no dispute
- **Confirmation-based**: Release when recipient confirms
- **Arbiter-based**: Release when designated arbiter approves
- **Oracle-based**: Release when external data source confirms condition
- **Multi-condition**: Combination of above

**Dispute handling:**
- **Automatic resolution**: Time-based release if no dispute raised
- **Arbiter resolution**: Third party examines evidence and decides
- **Partial release**: Arbiter may split funds based on partial performance

**SEP applicability:**
- **Conceptually applicable** but must adapt for non-monetary assets
- SEP doesn't have fungible assets to hold in escrow
- **Reservation escrow**: Reserve capacity/commitment rather than funds
- **Reputation escrow**: Stake reputation rather than money
- **Conditional commitment**: "My commitment is held until conditions met or timeout"

**SEP adaptation:**
- Instead of monetary escrow, use **commitment reservation**
- Participant commits offering capacity for a chain
- Capacity is "locked" (not available for other chains) during execution window
- Release conditions: chain completes, chain fails, or timeout
- Dispute handling through satisfaction signals and arbitration


### Traditional Trade Systems

#### Letter of Credit (LC)

**How it works:**
Letters of Credit are bank-backed instruments in international trade that guarantee payment if documentary conditions are met. They solve the fundamental trust problem: buyer doesn't want to pay before receiving goods; seller doesn't want to ship before assured of payment.

*Parties involved:*
- **Applicant**: Buyer who requests the LC
- **Beneficiary**: Seller who receives payment
- **Issuing Bank**: Buyer's bank, guarantees payment
- **Advising Bank**: Seller's bank, verifies LC authenticity
- **Confirming Bank** (optional): Adds its guarantee to the LC

*Documentary LC flow:*
1. Buyer and seller agree on contract terms
2. Buyer applies to issuing bank for LC
3. Issuing bank issues LC specifying required documents
4. Advising bank notifies seller of LC
5. Seller ships goods, obtains documents (bill of lading, inspection cert, etc.)
6. Seller presents documents to advising bank
7. Advising bank forwards to issuing bank
8. Issuing bank examines documents against LC terms
9. If compliant: Payment released. If discrepant: Buyer may waive or reject

**Key principles:**
- **Strict compliance**: Documents must exactly match LC terms
- **Independence**: Bank's obligation is independent of underlying contract
- **Documentary nature**: Banks deal in documents, not goods

**Multi-party coordination:**
- Multiple banks, shipping agents, inspection services coordinated through documents
- Each party has specific role and documentary responsibilities
- Timeline constraints enforced through LC validity period

**Failure handling:**
- **Discrepant documents**: Buyer can waive discrepancies or reject
- **Non-shipment**: LC expires unused, no payment made
- **Goods don't match**: Not bank's concern (documentary only), but contract claim possible

**SEP applicability:**
- **Highly relevant** coordination model
- LC is essentially a "conditional commitment" like SEP needs
- Documentary evidence concept maps to **completion attestation**
- Multi-party bank coordination is analogous to **multi-party chain coordination**
- Could adapt "advising" role: A trusted participant or broker verifies chain validity

**SEP adaptation:**
- **Chain proposal** is like LC application: specifies terms and conditions
- **Confirmation** is like LC issuance: binding commitment
- **Execution evidence** is like documentary presentation: proof of delivery
- **Satisfaction signal** is like document examination: did it meet requirements?
- Consider **graduated commitment**: preliminary commitment (like LC application), firm commitment (like LC issuance)

#### Supply Chain EDI (Electronic Data Interchange)

**How it works:**
EDI provides standardised message formats for B2B transactions, enabling automated processing across organisational boundaries.

**Key message types (EDIFACT/X12):**
- **Purchase Order (850/ORDERS)**: Buyer requests goods/services
- **Purchase Order Acknowledgment (855/ORDRSP)**: Seller confirms order
- **Advance Ship Notice (856/DESADV)**: Seller notifies of shipment
- **Invoice (810/INVOIC)**: Seller requests payment
- **Functional Acknowledgment (997/CONTRL)**: Confirms message receipt

**Acknowledgment patterns:**
- **Immediate acknowledgment**: Message received and parsed
- **Business acknowledgment**: Message processed and accepted/rejected
- **Status acknowledgment**: Order status updates

**Message correlation:**
- Reference numbers link related messages
- Purchase Order number appears in all subsequent messages
- Allows tracking order through entire lifecycle

**Error handling:**
- **Syntax errors**: Rejected at parsing, functional acknowledgment indicates error
- **Business errors**: Accepted syntactically but rejected logically (e.g., invalid product code)
- **Partial acceptance**: Some line items accepted, others rejected

**SEP applicability:**
- **Message format patterns** directly applicable
- SEP needs standardised messages: proposal, confirmation, execution, completion
- **Acknowledgment patterns** essential for reliable communication
- **Correlation** through chain_id and edge_id
- **Partial acceptance** less applicable (chains are all-or-nothing at confirmation)

**SEP adaptation:**
- Define SEP message types analogous to EDI:
  - `ChainProposal` (like Purchase Order)
  - `ChainConfirmation` (like PO Acknowledgment)
  - `ExecutionNotification` (like Advance Ship Notice)
  - `SatisfactionSignal` (like Invoice/Receipt)
  - `MessageAcknowledgment` (like Functional Acknowledgment)
- Implement two-level acknowledgment: received + processed

#### ITEX Trade Settlement

**How it works:**
ITEX is one of the largest commercial barter exchanges. Members exchange goods/services using "ITEX dollars" (trade credits) as a medium of exchange within the network.

*How exchanges settle:*
1. Members list offerings in ITEX marketplace
2. Buyer finds offering, negotiates with seller
3. Transaction agreed at ITEX dollar price
4. ITEX debits buyer's account, credits seller's account
5. Goods/services delivered
6. Both parties rate the transaction

**Trade credit mechanics:**
- Members can have **positive balance** (credit) or **negative balance** (debit)
- ITEX charges transaction fees (typically 6% from buyer, 6% from seller)
- **Credit limits** control maximum negative balance
- Monthly **maintenance fees** apply

**Multi-party indirect exchange:**
- No direct matching required
- A sells to B, B sells to C, C sells to A (all independent transactions)
- Trade credits intermediate: each transaction is with the network, not peer-to-peer

**Failure handling:**
- **Non-delivery**: Dispute filed, credits reversed
- **Quality issues**: Dispute resolution, partial credits
- **Account suspension**: Negative balance members may be suspended

**SEP applicability:**
- **Trade credit concept is explicitly avoided** in SEP (no shared valuation)
- However, ITEX's **professional brokerage model** is relevant
- **Transaction rating** post-exchange feeds trust metrics
- **Credit limits** concept maps to **participation limits** for probationary members
- ITEX shows barter works commercially - SEP differs by eliminating credits entirely

**SEP adaptation:**
- Unlike ITEX, SEP requires direct chain closure (A->B->...->A)
- SEP can learn from ITEX's **dispute resolution process**
- Rating system design similar to ITEX satisfaction ratings
- Consider **professional broker role** like ITEX trade directors


### Dispute Resolution

#### Online Dispute Resolution (ODR)

**How it works:**
ODR uses technology to facilitate dispute resolution without in-person proceedings. Common in e-commerce, domain disputes, and consumer protection.

*Typical ODR process:*
1. **Filing**: Complainant files dispute through online platform
2. **Notification**: Respondent notified, given opportunity to respond
3. **Negotiation**: Parties attempt direct resolution through platform
4. **Mediation** (if needed): Neutral mediator facilitates agreement
5. **Arbitration** (if needed): Neutral arbitrator makes binding decision
6. **Enforcement**: Decision implemented (refund, account action, etc.)

**Escalation tiers:**
- **Tier 1**: Automated resolution (e.g., immediate refund for low-value disputes)
- **Tier 2**: Assisted negotiation (structured communication between parties)
- **Tier 3**: Human mediator (facilitates but doesn't decide)
- **Tier 4**: Human arbitrator (makes binding decision)
- **Tier 5**: External legal process (rare, for high-stakes or complex cases)

**Evidence handling:**
- Platform collects transaction records automatically
- Parties submit documentation, photos, communications
- Platform provides structured forms for claim types
- Timeline of events reconstructed from system data

**Key principles:**
- **Accessibility**: Low cost, no lawyers needed
- **Speed**: Resolve in days/weeks, not months/years
- **Proportionality**: Resolution effort matches dispute value
- **Neutrality**: Platform provides neutral ground and neutral decision-makers

**SEP applicability:**
- **Directly applicable** for SEP disputes
- SEP needs multi-tier resolution matching dispute severity
- **Automated tier** can handle clear-cut cases (e.g., no-show)
- **Human tier** for subjective quality disputes
- Evidence collection from chain history, satisfaction signals, communications

**SEP adaptation:**
- Tier 1: Automated (timeout, clear non-delivery)
- Tier 2: Peer mediation (trusted network member)
- Tier 3: Professional arbitration (for larger exchanges)
- Tier 4: External (rare, for legal complexity)
- **Pre-dispute prevention**: Clear expectations, chain discovery matching

#### eBay Resolution Center

**How it works:**
eBay's resolution system handles millions of disputes annually with a mix of automation and human intervention.

*Process flow:*
1. **Report problem**: Buyer indicates issue (not received, not as described, etc.)
2. **Contact seller**: Platform facilitates seller communication
3. **Escalate** (if needed): Buyer escalates after X days with no resolution
4. **eBay decision**: eBay reviews case, may refund from own funds, charge seller

**Automation patterns:**
- **Item not received**: Auto-refund if tracking shows non-delivery past expected date
- **Significantly not as described**: Structured checklist to determine deviation
- **Known problematic patterns**: Sellers with dispute history get faster buyer-favorable decisions
- **Value thresholds**: Below $X, auto-refund without investigation

**Human intervention triggers:**
- Seller disputes buyer's claim with evidence
- Complex "not as described" cases
- High-value transactions
- Repeat disputes between same parties
- Potential fraud patterns

**Seller protection:**
- Tracking data as delivery proof
- Signature confirmation for high-value items
- Return shipping before refund for "not as described"
- Appeals process for seller disputes

**SEP applicability:**
- **Pattern matching for automation** relevant
- SEP can identify clear-cut failures (no-show, timeout) for auto-resolution
- **Satisfaction signals** provide structured data like eBay's checkboxes
- **History-based weighting**: Participants with prior disputes face higher scrutiny
- **Value-proportional resolution**: Major exchanges get more human attention

**SEP adaptation:**
- Auto-resolution for:
  - Timeout with no execution evidence
  - Provider no-show (no execution notification)
  - Explicit abandonment signal
- Escalation triggers:
  - `partially_satisfied` or `not_satisfied` signals
  - Conflicting satisfaction signals
  - Disputed quality claims
- Human arbitration for:
  - Subjective quality disputes
  - Partial delivery disagreements
  - Chain-wide failures affecting multiple parties


## Failure Mode Taxonomy

| Failure Type | Description | Detection | Response |
|--------------|-------------|-----------|----------|
| **Participant dropout** | Participant doesn't confirm or execute | Confirmation/execution timeout | Cancel chain, notify participants, no compensation needed before commitment |
| **Execution no-show** | Committed participant doesn't begin execution | Execution window opens with no activity | Escalate, attempt contact, trigger compensation saga |
| **Partial delivery** | Provider delivers less than promised | Recipient satisfaction signal indicates partial | Negotiate adjustment, proportional chain completion, or compensation |
| **Quality dispute** | Recipient claims quality doesn't match offering | `not_satisfied` or `partially_satisfied` signal | ODR process: evidence collection, mediation, arbitration |
| **Timing failure** | Delivery outside acceptable window | Scheduled completion date passes without delivery signal | Evaluate impact on chain, may require rescheduling or compensation |
| **Cascade failure** | One edge failure impacts subsequent edges | Edge failure + downstream edge dependencies | Circuit breaker: halt chain, assess options, compensate or restructure |
| **Bad actor** | Deliberate exploitation or fraud | Pattern detection, multiple disputes, trust signals | Immediate chain halt, account suspension, dispute resolution |
| **Infrastructure failure** | Platform/communication unavailable | System monitoring | Extend deadlines, preserve state, resume when possible |


## Message Format Patterns

### Common Message Types

| Message | Purpose | Key Fields |
|---------|---------|------------|
| `ChainProposal` | Propose a new exchange chain | chain_id, edges, proposed_timing, match_rationale |
| `ParticipantConfirmation` | Confirm/decline chain participation | chain_id, participant_id, decision, conditions |
| `ChainCommitment` | All parties confirmed, chain is binding | chain_id, confirmed_edges, final_timing |
| `ExecutionStart` | Indicate beginning of edge execution | chain_id, edge_id, started_at, expected_completion |
| `ExecutionCompletion` | Indicate edge delivery complete | chain_id, edge_id, completed_at, delivery_evidence |
| `SatisfactionSignal` | Recipient's assessment of delivery | chain_id, edge_id, signal, feedback |
| `DisputeRaised` | Initiate dispute resolution | chain_id, edge_id, dispute_type, description, evidence |
| `ChainCompletion` | All edges satisfied, chain complete | chain_id, completion_time, summary |
| `ChainFailure` | Chain cannot complete | chain_id, failure_reason, failed_edge, compensation_plan |
| `MessageAck` | Acknowledge receipt of message | original_message_id, received_at, processing_status |

### Acknowledgment Patterns

Two-level acknowledgment ensures reliable message delivery:

1. **Transport acknowledgment**: Message received by recipient's system
   - Synchronous response to message submission
   - Contains: message_id, received_at, syntax_valid

2. **Processing acknowledgment**: Message processed and accepted/rejected
   - Asynchronous response after business logic evaluation
   - Contains: original_message_id, processed_at, outcome (accepted/rejected), rejection_reason

**Idempotency requirement:**
- All messages must include unique `message_id`
- Recipients must track processed message_ids
- Duplicate messages silently acknowledged without re-processing


## State Machine Recommendations

### Proposed Chain States

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
                    ▼                                                         │
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ PROPOSED │────►│CONFIRMING│────►│ COMMITTED │────►│ EXECUTING │────►│ COMPLETED │
└─────────┘     └──────────┘     └───────────┘     └───────────┘     └───────────┘
     │               │                 │                 │
     │               │                 │                 │
     ▼               ▼                 ▼                 ▼
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐
│ABANDONED│     │ DECLINED │     │ CANCELLED │     │  FAILED   │
└─────────┘     └──────────┘     └───────────┘     └───────────┘
                                       ▲                 │
                                       │                 │
                                       └─────────────────┘
                                        (compensation)
```

### State Definitions

| State | Description | Entry Conditions | Exit Conditions |
|-------|-------------|------------------|-----------------|
| **PROPOSED** | Chain identified, awaiting first confirmation | Algorithm or broker proposes chain | Any participant responds OR timeout |
| **CONFIRMING** | Collecting confirmations from participants | At least one participant confirms | All confirm (->COMMITTED) OR any decline (->DECLINED) OR timeout (->DECLINED) |
| **COMMITTED** | All parties confirmed, chain is binding | N-of-N confirmations received | Execution window opens (->EXECUTING) OR unanimous cancel (->CANCELLED) |
| **EXECUTING** | Exchanges in progress | Execution window start date reached | All edges satisfied (->COMPLETED) OR failure detected (->FAILED) |
| **COMPLETED** | All exchanges completed satisfactorily | All edges have satisfied status | Terminal state |
| **ABANDONED** | Proposer withdrew before any confirmation | Proposer cancels before confirmations | Terminal state |
| **DECLINED** | One or more participants declined | Any participant declines OR timeout in CONFIRMING | Terminal state |
| **CANCELLED** | Committed chain cancelled before execution | Unanimous cancellation request in COMMITTED state | Terminal state |
| **FAILED** | Execution failed, compensation in progress or complete | Execution failure detected | Terminal state (after compensation) |

### Edge States (within chain)

Each edge tracks its own state within the chain:

```
┌──────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ PROPOSED │────►│CONFIRMED │────►│IN_PROGRESS│────►│ DELIVERED │────►│ SATISFIED │
└──────────┘     └──────────┘     └───────────┘     └───────────┘     └───────────┘
                                        │                 │
                                        ▼                 ▼
                                 ┌───────────┐     ┌───────────┐
                                 │ ABANDONED │     │ DISPUTED  │
                                 └───────────┘     └───────────┘
```

### Transitions

| From | To | Trigger | Actions |
|------|-----|---------|---------|
| PROPOSED -> CONFIRMING | First participant confirms | Record confirmation, start confirmation timeout |
| PROPOSED -> ABANDONED | Proposer cancels | Notify any observers |
| CONFIRMING -> COMMITTED | All participants confirm | Lock offerings, schedule execution, notify all |
| CONFIRMING -> DECLINED | Any decline OR timeout | Notify all participants, release reservations |
| COMMITTED -> EXECUTING | Execution window starts | Send execution reminders, start execution monitoring |
| COMMITTED -> CANCELLED | Unanimous cancel request | Release all reservations, notify participants |
| EXECUTING -> COMPLETED | All edges satisfied | Update trust metrics, record completion |
| EXECUTING -> FAILED | Failure detected | Initiate compensation saga, notify participants |

### Recovery Paths

| Failure Scenario | Recovery Path |
|-----------------|---------------|
| Participant unresponsive during CONFIRMING | Timeout -> DECLINED, retry chain without that participant if viable |
| Single edge fails during EXECUTING | Assess: can remaining edges complete? If yes: partial completion with compensation. If no: full chain failure |
| Multiple edges fail | Circuit breaker: halt all pending edges, assess compensation options |
| Disputed edge | Pause chain, resolve dispute, then either continue or fail |
| Infrastructure failure | Preserve state, extend timeouts, resume when available |


## SEP Recommendations

### Recommended Approach: Saga with Orchestration

SEP should implement a **Saga pattern with orchestration** for chain execution, incorporating:

1. **Three-phase confirmation** (adapted from 3PC):
   - Phase 1: Tentative interest (can participate?)
   - Phase 2: Firm commitment (will participate)
   - Phase 3: Execution (doing the exchange)

2. **Compensation mechanisms** (from Saga pattern):
   - Each edge type has defined compensation actions
   - Compensation triggered by failure detection
   - Some edges are "pivot transactions" (irreversible)

3. **Circuit breaker pattern**:
   - Monitor edge completion against expected timing
   - If edge falls significantly behind, pause dependent edges
   - Assess before cascade failure occurs

4. **Multi-signature commitment** (from blockchain):
   - Chain proceeds only when all N participants confirm
   - Optional: allow N-1 proceed if one designated as optional

5. **Documentary evidence** (from Letter of Credit):
   - Execution completion requires evidence
   - Satisfaction signal based on evidence review
   - Structured evidence for automated processing

### Rationale

| Design Choice | Rationale |
|---------------|-----------|
| Saga over 2PC/3PC | SEP exchanges are long-running; 2PC blocking is unacceptable |
| Orchestration over choreography | SEP benefits from visibility and coordination, especially for new participants |
| Three-phase confirmation | Allows tentative exploration before binding commitment |
| N-of-N confirmation | All participants must agree; chains are mutual benefit |
| Circuit breaker | Prevents cascade failures in long chains |
| Documentary evidence | Provides objectivity in satisfaction assessment |

### Open Questions

1. **Compensation currency**: Without shared valuation, how do we quantify compensation? Options: reputation adjustment, future exchange priority, external settlement
2. **Orchestrator selection**: Who orchestrates? Options: proposer, broker, elected participant, decentralised consensus
3. **Partial chain completion**: Is a 3-party chain valuable if only 2 edges complete? Under what conditions?
4. **Cross-chain compensation**: If participant A fails in chain X, can compensation come from their participation in chain Y?
5. **Time horizon mismatches**: How to handle chain where some edges complete in days, others in weeks?


## References

- Gray, J. & Reuter, A. (1993). Transaction Processing: Concepts and Techniques
- Garcia-Molina, H. & Salem, K. (1987). Sagas. ACM SIGMOD Record.
- Bernstein, P. & Newcomer, E. (2009). Principles of Transaction Processing
- OASIS ebXML Business Process Specification Schema
- UCP 600 - Uniform Customs and Practice for Documentary Credits (ICC)
- UNCITRAL Technical Notes on Online Dispute Resolution
