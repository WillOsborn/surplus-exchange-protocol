# Deployment Architecture & Federation Strategy Design

*Date: 2026-02-26*
*Status: Approved*
*Addresses: Q3 (Deployment Architecture), Q4 (Federation Commitment Mechanisms)*

---

## Problem Statement

Two related open questions:

**Q3**: Should we deploy as a managed service or federated network?
**Q4**: How do we ensure federation actually happens rather than being perpetually deferred?

The Unintended Consequences Analysis found with high confidence (confirmed across all three analytical approaches) that "start managed, federate later" creates path dependencies making federation increasingly unlikely. The operator accumulates power, migration costs grow, and "later" never comes.

These questions are tightly coupled — Q4 is essentially Q3's accountability mechanism.

## Prior Constraints

**Q1 (Commitment-Based Accountability)** established:
- Accountability is about commitment fulfilment, not balance tracking
- Governance sees patterns of non-fulfilment, not balance patterns
- Graduated, human-judged response (not automatic penalties)

**Q2 (Peer Exchange Protection)** established:
- Behaviour not identity — the issue is how you act, not who you are
- Structural prevention (concentration limits, relationship diversity, no procurement features)
- Behaviour monitoring (directional asymmetry, surplus scheduling, dependency patterns)

Both designs produce data (fulfilment signals, concentration metrics) that must work in whatever deployment architecture is chosen.

## Approaches Considered

### Approach A: Benevolent Managed Service

Commercial operator, no structural governance constraints beyond data portability. Federation happens if/when the operator chooses.

**Rejected because**: Validates every concern from the unintended consequences analysis. Hopes the operator stays benevolent — the analysis shows this is structurally unlikely.

### Approach B: Governed Managed Service with Federation Escape Hatch (Selected)

Managed service with binding governance commitments protecting participants. Federation is not required but is architecturally possible at any time. The operator earns continued centralisation by behaving well.

**Selected because**: Consistent with Q1 and Q2 design patterns (behaviour not identity). Fast to market. Credible participant protection without federation complexity. Keeps federation as a real option.

### Approach C: Minimum Viable Federation from Day One

Two operators from launch, inter-node protocol required in Phase 1.

**Rejected because**: Significantly slower to launch. Adds complexity before proving the core exchange value. Solves a governance problem with architecture, which may not work. Federation was assessed as aspirational, not non-negotiable.

---

## Design

### 1. Core Decision

**Q3 Resolution: Governed Managed Service**

Phase 1 deploys as a single managed service operated by one entity. This is not a compromise — it's the right architecture for proving the exchange model works before adding federation complexity.

The key reframing (consistent with Q1 and Q2): the risk isn't centralisation itself, it's unconstrained centralisation. A managed service with binding governance commitments, transparent operation, and credible exit options protects participants without the overhead of federation.

**Q4 Resolution: Federation as Escape Hatch, Not Roadmap Item**

We don't commit to a federation timeline. Instead, we commit to architectural and governance properties that make federation possible at any time — meaning participants are never trapped. The operator earns continued centralisation by behaving well, not by making alternatives technically impossible.

The analogy: Q1 said accountability is about commitment fulfilment, not balance tracking. Here, operator accountability is about **participant freedom, not organisational structure**. A commercial operator that maintains data portability, transparent operation, and participant choice is fine. A non-profit that locks in participants through technical barriers is not.

### 2. Operator Entity Type

The design is **entity-agnostic**. We define governance commitments any operator must meet, regardless of legal structure. This matters because:

- The right entity type depends on funding, jurisdiction, and founding team — decisions that aren't ours to make at the protocol design level
- Different regions may prefer different structures (CIC in the UK, B-Corp in the US, cooperative in parts of Europe)
- Locking in entity type now would be premature; locking in governance requirements is not

How commitments bind depends on entity type:

| Entity Type | How commitments bind |
|---|---|
| Commercial company | Contractual terms with participants + articles of association |
| Non-profit / foundation | Charter / constitution |
| Cooperative | Member agreement + bylaws |
| Any | Open-source protocol spec that enables competition |

**Key principle**: The operator entity is separate from the protocol specification. The protocol is an open standard. The operator is one implementation. This separation is what makes the escape hatch real — anyone can implement the protocol.

### 3. Operator Governance Commitments

Following Q1 and Q2's pattern — behaviour not identity, graduated response, human-judged — these are the commitments any operator must make.

#### Commitment 1: Data Portability

- Participants can export their complete data at any time (identity, exchange history, trust attestations, commitment fulfilment signals)
- Export in a documented, open format (defined by the protocol spec)
- Maximum 30-day fulfilment window for export requests
- No degraded service during or after export

#### Commitment 2: Transparent Operation

- Published matching algorithm (open source or auditable)
- Regular transparency reports: matching statistics, concentration patterns, governance actions taken
- Participants can see what data is held about them
- No use of participant data for purposes beyond operating the exchange network

#### Commitment 3: Protocol Conformance

- Operator implements the open protocol specification
- No proprietary extensions that create lock-in (extensions must be proposed to the protocol spec)
- API boundaries documented publicly so competing implementations are feasible

#### Commitment 4: Participant Representation

- A participant advisory body with defined powers (not just consultative)
- Minimum powers: approve changes to matching algorithm weighting, approve changes to concentration limits (from Q2), review transparency reports
- Operator cannot unilaterally change core protocol parameters

#### Commitment 5: Non-Interference with Exit

- Operator cannot penalise participants for exporting data or leaving
- If a competing operator launches, the incumbent must interoperate at the protocol level (this is where federation becomes real — not as a planned feature but as a competitive response)
- No exclusivity agreements with participants

**What the advisory body is NOT**: It's not a board that runs the service. It doesn't hire/fire the operator's staff or approve budgets. It's a constraint on operator behaviour — a defined set of things the operator cannot do without participant consent. Think of it like a constitution, not a management committee.

**Enforcement**: If the operator violates these commitments, the combination of open protocol + data portability + published APIs means participants and a competing operator can stand up an alternative. The governance commitments make the escape hatch credible; the escape hatch makes the governance commitments enforceable. They reinforce each other.

### 4. Federation-Ready Architecture

We're not designing the federation protocol, but we define what Phase 1 must get right so federation remains possible. These are architectural constraints on the managed service.

#### Principle 1: Portable Identity

Participant identity must not be coupled to the operator. A participant is identified by something they own (like a keypair or a domain-based identifier), not by an operator-issued account ID. If they move to a different operator, their identity travels with them.

*Key interface*: Participant identity format defined at the protocol level. Operator assigns no proprietary identifiers that other systems can't resolve.

#### Principle 2: Separable Components

The system is built as distinct components with clean boundaries between them, not as a monolith. This means a future federation effort doesn't require rewriting — it requires reconnecting.

*Key interfaces (4 boundaries)*:
- **Participant Registry** — who's in the network, their identity, their offerings/needs
- **Matching Engine** — finds exchange chains from the registry data
- **Trust Service** — calculates trust profiles, stores commitment fulfilment signals
- **Protocol Engine** — manages exchange state machine (proposal → consent → execution → completion)

These four communicate via documented APIs. In Phase 1 they're all operated by one entity. In a federated future, different operators could run different registries while sharing a matching protocol.

#### Principle 3: Exportable Trust

Trust attestations (commitment fulfilment signals from Q1, relationship patterns from Q2) must be structured so they're meaningful outside the originating operator. This means:

- Attestations are signed by the issuing operator but interpretable by anyone
- Trust data uses the protocol's format, not a proprietary one
- A participant's trust history can accompany them if they move

*Key interface*: Trust attestation format defined in the protocol spec, including commitment fulfilment signals, relationship diversity metrics, and issuer signature.

#### Principle 4: Protocol-Defined Parameters

The values that Q1 and Q2 established as important — concentration limits, relationship diversity weightings, commitment fulfilment signal format — are defined in the protocol specification, not left to operator discretion. This prevents a future where competing operators race to the bottom on governance standards.

*Key interface*: A protocol-level configuration schema that defines mandatory parameters and their allowed ranges. Operators can tune within ranges but cannot disable.

### 5. Integration with Q1 and Q2

**Q1's commitment fulfilment signals** live in the Trust Service component. They're stored in the protocol-defined attestation format, meaning they're already portable. Governance sees patterns of non-fulfilment but not balance patterns — this holds regardless of whether one operator or many.

**Q2's peer exchange protections** split across two components:
- Structural prevention (concentration limits, relationship diversity) lives in the Matching Engine as protocol-defined parameters
- Behaviour monitoring (directional asymmetry, surplus scheduling, dependency patterns) lives in the Trust Service as detection signals

Both use the protocol's parameter schema, so they'd be consistent across operators in a federated scenario — no operator-shopping for looser rules.

### 6. Effects on Downstream Questions

| Question | Effect of this decision |
|---|---|
| Q5: Trust & Gatekeeping | Trust attestations are portable and protocol-defined. Gatekeeping concerns are operator-level, addressed by governance commitments (participant advisory body reviews trust policies) |
| Q6: Bad Actor Scenarios | Detection signals live in Trust Service. Single operator simplifies detection (full visibility). Governance commitment #2 (transparency) means participants can understand why action was taken |
| Q7: Algorithm Transparency | Governance commitment #2 requires published/auditable matching algorithm. Participant advisory body approves weighting changes. This substantially addresses the opacity concern |
| Q8: Network Bootstrapping | Single managed service is simpler to bootstrap than federation. Q2 already decided: recruit genuine peers, not enterprise anchors |
| Q9: Taxation & Compliance | Unaffected by deployment architecture — remains participant responsibility per Q1 |
| Q10: Labour Market Effects | Unaffected by deployment architecture — remains a governance/adoption concern |

---

## What This Design Explicitly Leaves Unresolved

1. **Exact entity type for the founding operator** — deferred deliberately; design is entity-agnostic
2. **Legal form of governance commitments** — depends on entity type and jurisdiction
3. **Revenue model** — connected to Q2's "no enterprise adoption" stance; how does the operator sustain itself?
4. **Participant advisory body composition and selection process** — needs real participants to design
5. **Detailed federation protocol** — not needed unless/until a second operator emerges; architecture principles and key interfaces are defined

## Philosophy Check

| Principle | Alignment |
|---|---|
| 1. Subjective value over shared currency | Unaffected — deployment architecture is orthogonal to valuation |
| 2. Protocol over platform | **Directly addressed** — open protocol spec separate from operator; any entity can implement |
| 3. Business-to-business focus | Unaffected |
| 4. Pragmatic framing, radical intent | **Aligned** — pragmatic (managed service, fast to market) with radical architecture (open protocol, portable identity, no lock-in) |
| 5. Professional management over volunteer enthusiasm | **Supported** — managed service enables professional operation; governance commitments ensure accountability |
| 6. Trust through relationships, not ratings | **Supported** — trust attestations portable and protocol-defined; trust model unchanged |
| 7. Human accountability in the loop | **Supported** — participant advisory body provides human oversight of operator; governance is human-judged |
| 8. Sustainable and efficient operation | **Supported** — single managed service is more efficient than premature federation |

## Consistency with Q1 and Q2

The design follows the same pattern established in Q1 and Q2:

- **Behaviour not identity**: Operator type doesn't matter; operator behaviour does
- **Structural prevention**: Architecture makes lock-in difficult (portable identity, separable components, open protocol)
- **Behaviour monitoring**: Governance commitments define what "good behaviour" looks like for operators
- **Graduated, human-judged response**: Advisory body reviews, not automatic enforcement
- **Escape hatch, not punishment**: Federation emerges as a competitive response to misbehaviour, not as a mandated timeline

## Related Documents

- [Commitment-Based Accountability Design](2026-02-26-commitment-based-accountability-design.md) (Q1)
- [Peer Exchange Protection Design](2026-02-26-peer-exchange-protection-design.md) (Q2)
- [Deployment Architecture Decision](../design/decisions.md#decision-deployment-architecture-managed-service--federation)
- [Federation Exploration](../design/federation-exploration.md)
- [Unintended Consequences Analysis](../design/unintended-consequences-analysis.md)
- [PHILOSOPHY.md](../../PHILOSOPHY.md)
