# Federation Architecture Exploration

**Status**: Complete (informs pending deployment decision)
**Last Updated**: 2026-02-12
**Related**: [Deployment Architecture Decision](./decisions.md#decision-deployment-architecture-managed-service--federation)

---

This document explores the technical and governance requirements for a federated SEP network, where multiple operators run nodes that collaborate on matching and trust.

---

## 1. Why Federation?

### The Centralisation Problem

The matching algorithm needs global graph visibility:

```
Cycle detection example:
  Alice (Node A) offers: Legal services
  Alice needs: Catering

  Bob (Node B) offers: Catering
  Bob needs: Design

  Carol (Node A) offers: Design
  Carol needs: Legal services

  Chain: Alice → Carol → Bob → Alice
```

If Bob is on a different node that Alice's node cannot query, this chain is invisible.

### Why Not Just Stay Centralised?

Centralisation creates dependencies that contradict SEP's philosophy:

| Risk | Impact |
|------|--------|
| Operator failure | Entire network stops |
| Operator acquisition | New owner may change terms |
| Operator capture | Could favour certain participants |
| Jurisdictional issues | Single point for regulatory pressure |
| Trust concentration | "Trust the operator" becomes required |

### The Federation Middle Path

Federation allows:
- Multiple operators → no single point of failure
- Participant choice → exit option if operator misbehaves
- Competition → operators compete on service quality
- Resilience → network survives any single node failure

---

## 2. Federation Models to Learn From

### Email (SMTP/IMAP)

**Structure**: Anyone can run a mail server. Servers relay messages using standard protocols.

**Lessons for SEP**:
- Standard protocol enables interoperability
- Participants identified by `user@domain` (portable identity)
- Spam problem required reputation systems between servers
- Large operators emerged anyway (Gmail, Outlook) due to operational complexity

**Relevance**: Shows that federation works but tends toward concentration. Need explicit mechanisms to prevent.

### Mastodon/ActivityPub

**Structure**: Federated social network. Anyone can run an instance. Users have `@user@instance` identity.

**Lessons for SEP**:
- Moderation is per-instance (local governance)
- Instance-to-instance blocking creates fragmentation risk
- Migration between instances is imperfect
- Discovery across instances is a solved problem

**Relevance**: Modern federated system with good user experience. Shows migration and discovery challenges.

### Banking/Payment Networks

**Structure**: Banks are independent but interoperate via clearing systems (SWIFT, ACH, card networks).

**Lessons for SEP**:
- Clearing houses provide inter-bank settlement
- Regulations ensure interoperability
- Each bank maintains own ledger, clearing reconciles
- Dispute resolution mechanisms exist

**Relevance**: Shows how competing nodes can collaborate on transactions that span them.

### DNS

**Structure**: Hierarchical but distributed. Root servers, TLD servers, authoritative servers.

**Lessons for SEP**:
- Works because of clear hierarchy and caching
- Updates propagate with defined timing (TTL)
- Remarkably resilient to individual server failures

**Relevance**: Shows how distributed systems can achieve consistency without central control.

---

## 3. Technical Architecture for Federated SEP

### 3.1 Identity Layer

**Requirement**: Participant identity must be portable between nodes.

**Proposed approach**:
```
Participant ID: sep://alice@node1.example.com
                ────────────────────────────
                     │          │
                     │          └─ Node identifier (can change)
                     └─ Participant handle (portable)
```

**Key principles**:
- Cryptographic identity (public key) owned by participant, not node
- Node provides hosting, not identity
- Participant can migrate to different node, keeping identity
- Trust profile follows the cryptographic identity

**Migration flow**:
```
1. Alice requests migration from Node1 to Node2
2. Node2 verifies Alice controls the private key
3. Node1 publishes "Alice has moved to Node2" redirect
4. Trust profile, exchange history transferred
5. Redirect expires after grace period
```

### 3.2 Graph Synchronisation

**Challenge**: Cycle detection requires global graph visibility, but full synchronisation is expensive.

**Option A: Full Replication**

Each node maintains complete copy of network graph.

```
┌─────────────┐         ┌─────────────┐
│   Node 1    │ ◄─────► │   Node 2    │
│             │  sync   │             │
│ Full Graph  │         │ Full Graph  │
└─────────────┘         └─────────────┘
```

Pros:
- Optimal matching (full visibility)
- Each node can run matching independently
- Resilient to partition

Cons:
- Storage/bandwidth scales with network size
- Sync latency affects match freshness
- Privacy implications (all nodes see all data)

**Option B: Query Federation**

Each node maintains only local participants. Cross-node matching uses federated queries.

```
┌─────────────┐         ┌─────────────┐
│   Node 1    │ ◄─────► │   Node 2    │
│             │  query  │             │
│ Local Graph │         │ Local Graph │
└─────────────┘         └─────────────┘
```

Pros:
- Storage scales with local participants only
- Privacy (nodes only share relevant info)
- Lower bandwidth

Cons:
- Cross-node cycle detection is complex
- Query latency affects matching speed
- Requires sophisticated query protocol

**Option C: Gossip + Local Optimisation**

Nodes gossip summary information (capabilities, needs) but not full details. Matching runs locally with cross-node hints.

```
┌─────────────┐         ┌─────────────┐
│   Node 1    │ ◄─────► │   Node 2    │
│             │ gossip  │             │
│ Local +     │         │ Local +     │
│ Summaries   │         │ Summaries   │
└─────────────┘         └─────────────┘
```

Pros:
- Balanced storage/bandwidth
- Privacy preserved (only summaries shared)
- Hints enable cross-node discovery

Cons:
- May miss some valid chains
- Summary design is critical
- False positive handling needed

**Recommendation**: Start with Option A (full replication) for simplicity. Graph size in early network is manageable. Design APIs to support Option B/C migration later.

### 3.3 Cross-Node Matching Protocol

**Scenario**: Chain spans multiple nodes.

```
Node 1 participants: Alice, Carol
Node 2 participants: Bob, Dan

Discovered chain: Alice → Bob → Carol → Dan → Alice
```

**Proposed flow**:

```
1. CHAIN DISCOVERY
   Node 1 runs cycle detection
   Identifies cross-node chain involving Node 2 participants

2. CHAIN PROPOSAL
   Node 1 → Node 2: "Proposing chain involving Bob, Dan"
   Includes: chain structure, match scores, participant consents needed

3. CROSS-NODE VALIDATION
   Node 2 validates: Bob and Dan are active, offerings still available
   Node 2 → Node 1: "Validated" or "Rejected (reason)"

4. CONSENT COLLECTION
   Each node collects consent from its participants
   Consent includes cryptographic commitment

5. CHAIN COMMITMENT
   Once all consents received, chain moves to committed state
   Both nodes record the commitment

6. EXECUTION
   Each edge executes according to normal flow
   Satisfaction signals reported to home node

7. COMPLETION
   Both nodes update trust profiles
   Chain marked complete
```

**Protocol messages**:
```typescript
interface ChainProposal {
  proposing_node: string;
  chain_id: string;
  participants: {
    participant_id: string;
    home_node: string;
    role: 'provider' | 'recipient';
    offering_id?: string;
    need_id?: string;
  }[];
  edges: {
    from_participant: string;
    to_participant: string;
    match_score: number;
  }[];
  proposed_timeline: {
    consent_deadline: string;
    execution_start: string;
    execution_end: string;
  };
  proposer_signature: string;
}

interface ChainProposalResponse {
  chain_id: string;
  responding_node: string;
  status: 'validated' | 'rejected';
  rejection_reason?: string;
  respondent_signature: string;
}
```

### 3.4 Trust Across Nodes

**Challenge**: Trust scores aggregate satisfaction from across the network. How do nodes trust each other's attestations?

**Approach: Trust Attestations**

Each node issues signed attestations about its participants:

```typescript
interface TrustAttestation {
  issuing_node: string;
  participant_id: string;
  timestamp: string;

  // Verifiable claims
  claims: {
    exchanges_completed: number;
    satisfaction_rate: number;  // 0-1
    partner_count: number;
    member_since: string;
    vouches_received: number;
    trust_tier: 'probationary' | 'established' | 'anchor';
  };

  // Cryptographic signature
  node_signature: string;
}
```

**Node reputation**: Nodes themselves build reputation based on:
- Accuracy of attestations (verified by cross-node exchanges)
- Uptime and reliability
- Adherence to protocol
- History of participants from that node

**Attestation verification**:
```
1. Node 1 receives attestation from Node 2 about Bob
2. Node 1 checks: Is Node 2 in good standing?
3. Node 1 checks: Is attestation properly signed?
4. Node 1 factors Bob's trust into matching decisions
5. After exchange, actual experience updates Node 2's credibility
```

### 3.5 Dispute Resolution

**Scenario**: Alice (Node 1) and Bob (Node 2) have a dispute about exchange quality.

**Proposed approach**:

```
LAYER 1: Direct Resolution
  Alice and Bob communicate directly
  Either can mark "resolved" or escalate

LAYER 2: Home Node Mediation
  If escalated, participants' home nodes involved
  Nodes review evidence, suggest resolution
  Non-binding recommendation

LAYER 3: Arbitration Pool
  Pool of approved arbitrators across network
  Randomly selected from uninvolved nodes
  Binding decision

LAYER 4: External
  Legal recourse in appropriate jurisdiction
  Network evidence exportable for courts
```

**Cross-node implications**:
- Satisfaction signals recorded on both nodes
- Dispute history affects both participants' trust profiles
- Nodes with high dispute rates may face network reputation impact

---

## 4. Governance Models

### 4.1 Who Operates Nodes?

**Option A: Commercial Operators**

Private companies run nodes as businesses.

Revenue models:
- Transaction fees (percentage of estimated exchange value)
- Subscription fees (monthly/annual membership)
- Premium services (faster matching, priority support)
- Data/analytics services

Concerns:
- Profit motive may conflict with participant interests
- Race to bottom on fees vs race to top on extraction
- May resist true interoperability

**Option B: Cooperative/Consortium**

Participants collectively own and govern their node.

Structure:
- One member, one vote governance
- Fees cover costs only
- Democratic decision-making

Concerns:
- Governance overhead
- May lack operational expertise
- Scaling challenges

**Option C: Non-Profit Operators**

Mission-driven organisations operate nodes.

Examples:
- Trade associations
- Business improvement districts
- Social enterprises
- Academic institutions

Concerns:
- Sustainability without profit motive
- May be slow to innovate
- Dependency on grants/donations

**Option D: Government/Quasi-Government**

Public sector entities operate nodes.

Examples:
- Export promotion agencies
- Economic development bodies
- Local government

Concerns:
- Bureaucratic constraints
- Political influence
- May be jurisdiction-limited

### 4.2 Protocol Governance

Regardless of who operates nodes, the protocol itself needs governance.

**Proposed structure**:

```
┌────────────────────────────────────────────────┐
│            Protocol Foundation                 │
│  (Non-profit, multi-stakeholder board)         │
│                                                │
│  Responsibilities:                             │
│  - Protocol specification ownership            │
│  - Interoperability certification              │
│  - Node operator standards                     │
│  - Dispute resolution framework                │
│  - Brand/trademark protection                  │
└────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────┐
│          Technical Steering Committee          │
│                                                │
│  Responsibilities:                             │
│  - Protocol evolution                          │
│  - Reference implementation                    │
│  - Interoperability testing                    │
│  - Security review                             │
└────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────┐
│              Node Operators                    │
│                                                │
│  Must:                                         │
│  - Pass certification                          │
│  - Implement full protocol                     │
│  - Maintain uptime standards                   │
│  - Participate in governance                   │
└────────────────────────────────────────────────┘
```

### 4.3 Preventing Centralisation

Even with federation, network effects may drive concentration. Mitigation strategies:

**Data portability mandate**:
- Participants can export complete history
- Standard format for migration
- Maximum 30-day migration timeline

**Interoperability requirements**:
- Nodes must federate with all certified nodes
- No selective blocking without governance process
- API compatibility certification

**Market share limits**:
- Consider caps on single operator share (e.g., 40%)
- Trigger additional governance review above threshold
- Encourage new operator entry

**Open source requirement**:
- Reference implementation must be open source
- Reduces barrier to new operators
- Prevents proprietary lock-in

---

## 5. Implementation Roadmap

### Phase 1: Managed Service

**Goal**: Prove the model works with minimal complexity.

**Architecture**:
```
Single operator, but with federation-ready design:

┌──────────────────────────────────────────────┐
│              SEP Node Phase 1                 │
│                                              │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Identity   │  │  Matching Engine    │   │
│  │  Service    │  │                     │   │
│  └─────────────┘  └─────────────────────┘   │
│                                              │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Trust     │  │   Exchange          │   │
│  │   Engine    │  │   Manager           │   │
│  └─────────────┘  └─────────────────────┘   │
│                                              │
│  ───────────────────────────────────────    │
│              Federation API                  │
│         (stubbed, not connected)             │
└──────────────────────────────────────────────┘
```

**Key decisions**:
- Clear component boundaries
- APIs designed for eventual federation
- Data models include node identity fields (populated with single value)
- Participant IDs use federated format even if single node

**Timeline**: 6-12 months to operational pilot

### Phase 2: Federation Protocol

**Goal**: Enable second node to join network.

**Development**:
- Graph synchronisation protocol
- Cross-node matching protocol
- Trust attestation protocol
- Migration protocol

**Testing**:
- Two-node test network
- Cross-node exchange testing
- Failure scenario testing (node down, network partition)
- Load testing

**Timeline**: 12-18 months after Phase 1 stable

### Phase 3: Open Federation

**Goal**: Any qualified operator can join.

**Requirements**:
- Certification process defined
- Governance structure operational
- Multiple independent operators
- Monitoring and health checking

**Timeline**: 24+ months after Phase 1

---

## 6. Open Questions

### Technical

1. **Consistency model**: Strong consistency vs eventual consistency for graph state?
2. **Partition handling**: What happens during network split? Can matching continue locally?
3. **State rollback**: How to handle if committed chain fails due to stale state?
4. **Privacy granularity**: What must be shared vs what can remain local?

### Governance

1. **Foundation structure**: Jurisdiction, board composition, funding model?
2. **Certification criteria**: What makes a node "certified"?
3. **Enforcement**: How to handle non-compliant nodes?
4. **Evolution**: How does protocol change process work?

### Economic

1. **Operator viability**: What's the minimum viable operator size?
2. **Fee structures**: How to enable fair competition without race to bottom?
3. **Foundation funding**: Grants, operator fees, other?

---

## 7. Recommendation

**Proceed with Option 3 (Hybrid approach)**:

1. **Now**: Design Phase 1 managed service with federation-ready architecture
2. **Phase 1 launch**: Single operator, prove model
3. **Post-Phase 1**: Develop federation protocol based on learnings
4. **Phase 2**: Enable second node, test federation
5. **Phase 3**: Open federation

**Critical success factors**:
- Clear component boundaries from day one
- Data portability built in, not added later
- Governance structure planned even if not fully operational
- Explicit federation roadmap communicated to early participants

This approach balances:
- Speed to market (single operator is simpler)
- Long-term resilience (federation designed in)
- Trust (clear commitment to decentralisation)
- Pragmatism (learn before committing to federation details)
