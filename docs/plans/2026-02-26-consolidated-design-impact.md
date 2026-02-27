# Consolidated Design Impact Analysis

*Synthesised from Q1, Q2, Q3/Q4, Q5, Q6, Q7, Q10 design documents*
*Date: 2026-02-26*

---

## Purpose

Seven design documents were produced from the open questions analysis (Q1–Q7, Q10). Each addresses a specific concern, but they were designed sequentially — later questions build on earlier ones. This document consolidates their combined impact against the current architectural baseline to create a single view of: what has changed, what needs building, and what remains unresolved.

---

## Part 1: Architectural Impact

### 1.1 Current Baseline (What Exists Today)

The C4 model defines 7 containers:

| Container | Role | Implementation |
|-----------|------|----------------|
| Participant Agents | Register offerings, declare needs, confirm matches | Conceptual |
| Discovery Service | Index offerings/needs, search API | Conceptual |
| Matching Engine | Build graph, find cycles, score/rank chains | `src/matching/` (working) |
| Chain Orchestrator | Propose chains, collect confirmations, coordinate execution | `src/protocol/` (state machine) |
| Trust Engine | Calculate trust, manage tiers, vouching, exposure limits | `src/trust/` (working) |
| Data Store | Participants, offerings, needs, chains, trust profiles | 6 JSON schemas (validated) |
| Protocol State Machine | Chain/edge lifecycle management | `src/protocol/state-machine.ts` |

Six core schemas exist: participant, trust-profile, capability-offering, need, exchange-chain, protocol-messages.

### 1.2 New Containers Required

The design documents collectively introduce the need for **5 new architectural containers** beyond the current 7:

#### A. Governance & Monitoring Service

**Sources**: Q1 (pattern detection), Q2 (behaviour monitoring), Q5 (network health), Q6 (anomaly detection), Q7 (network health dashboard), Q10 (sector monitoring)

This is the single largest new system. Six of seven design documents contribute monitoring requirements to it. It consolidates:

- **Pattern Detection** (Q1): Repeated non-fulfilment, stuck flag frequency, escalation counts
- **Behaviour Monitoring** (Q2): Directional asymmetry, surplus scheduling, dependency patterns
- **Network Health Metrics** (Q5): 7 KPIs (first-exchange latency, newcomer retention, cross-cluster ratio, partner concentration Gini, diversity trends, satisfaction reciprocity, chain completion rate)
- **Anomalous Access Detection** (Q6): Decline patterns, view-to-completion ratios, sector-concentrated access
- **Complaint Pattern Analysis** (Q6): Symmetric monitoring, compressed-timeline detection, unfounded escalation tracking
- **Cascade Risk Monitoring** (Q7): Per-participant cascade impact scores, network fragility index
- **Concentration Tracking** (Q7): Participation distribution, top-N concentration, limit utilisation
- **Matching Health** (Q7): Match rate, time-to-first-match, unmatched analysis, chain length distribution, diversity index
- **Sector Aggregate Monitoring** (Q10): Capacity type concentration, volume trends

**Architectural note**: While these could be separate microservices, they all consume exchange data and produce governance-facing outputs. A single container with well-defined internal components is more practical than 6+ separate services.

#### B. Participant Profile & Transparency Service

**Sources**: Q7 (matching profile), Q3/Q4 (transparency reports), Q7 (algorithm changelog)

Participant-facing service providing:
- **Matching Profile View** (Q7): Personal dashboard showing trust score, fulfilment rate, network position, offering scores, concentration level, recent matching history with rejection reasons
- **Algorithm Changelog** (Q7): Public, append-only record of all algorithm changes
- **Transparency Reports** (Q3/Q4): Published matching statistics, concentration patterns, governance actions

**Architectural note**: This is the "you see everything about yourself" (Q7) + "published transparency" (Q3/Q4) service. Distinct from the Governance & Monitoring Service because its consumers are participants and the public, not the governance body.

#### C. Identity Verification Service

**Sources**: Q5 (flexible identity verification)

New entry-path service accepting:
- Business registration (Companies House, sole trader)
- Professional credentials (ICAEW, CIM, CIPR)
- Established online presence (portfolio, website, LinkedIn history)
- Vouch from existing member (unchanged mechanics, now optional)

**Architectural note**: This replaces the current implicit assumption that vouching is the only entry path. It's a distinct boundary because it likely integrates with external KYB providers.

#### D. Escalation & Recourse Service

**Sources**: Q1 (escalation path), Q6 (in-flight exchange management), Q7 (match audit requests)

Manages:
- **Stuck flag workflow** (Q1): Flag → participant conversation prompt → outcome recording
- **Governance escalation** (Q1): Pattern-triggered investigation → conversation → review → removal
- **In-flight exchange management** (Q6): Staged removal (investigation → graceful wind-down → emergency), chain freezing, partner notification, replacement matching
- **Match audit requests** (Q7): Formal recourse with 5-day SLA, advisory body escalation

**Architectural note**: Currently, the Chain Orchestrator handles the happy path. This service handles the unhappy path — disputes, removals, recourse. It's distinct because it involves governance actors, not just participants.

#### E. Onboarding Service

**Sources**: Q2 (peer exchange norms), Q5 (tier assignment), Q10 (labour transparency norms)

Delivers:
- Peer exchange education (Q2): What surplus exchange is vs procurement, monitoring norms, governance model
- Labour market norms (Q10): Surplus means genuinely idle capacity, transparency with employees
- Identity verification flow (Q5): Routes to Identity Verification Service
- Tier assignment (Q5): Newcomer (default) or Probationary (if vouched)

**Architectural note**: This is a process orchestrator for participant entry, not just content delivery. It coordinates identity verification, education, and tier assignment.

### 1.3 Modified Containers

#### Matching Engine (significant changes)

| Change | Source | Description |
|--------|--------|-------------|
| Relationship diversity scoring | Q2 | New weighted factor preferring chains with new partner combinations |
| Cross-cluster matching incentive | Q5 | Positive weight for chains bridging previously unconnected participants |
| Participation discount | Q7 | Diminishing returns when participant already in many chains (soft) |
| Hard cap enforcement | Q7 | Exclude participant from new proposals when at X% of active chains |
| Concentration limit enforcement | Q2 | Governance-defined maximum chain participation in rolling window |
| Remove 0.8x trust penalty | Q5 | Probationary participants no longer penalised in scoring |
| Decision logging | Q7 | Log rejection reasons for every unconsidered chain (feeds matching profile) |

#### Trust Engine (significant changes)

| Change | Source | Description |
|--------|--------|-------------|
| Newcomer tier | Q5 | New tier below Probationary: bilateral-only, 1 concurrent, 14-day window |
| Failure attribution | Q5 | Track *who caused* each failure, not just chain-level failure |
| Network position decay | Q5 | 180-day half-life on network strength metrics |
| Anchor tier bounds | Q5 | Replace "unlimited" with generous bounds (max 12-party, 15 concurrent) |
| Anchor activity requirement | Q5 | Minimum 2 exchanges per quarter to retain anchor status |
| Trust score visibility | Q7 | Scores exposed as numbers to participants (previously only tiers) |
| Fulfilment signal (Q1) | Q1 | Refine Layer 3 from general satisfaction to commitment fulfilment (Yes/Partially/No) |

#### Chain Orchestrator (moderate changes)

| Change | Source | Description |
|--------|--------|-------------|
| Fulfilment signal collection | Q1 | Post-completion signal: "Did they deliver what was agreed?" |
| Stuck flag | Q1 | New exchange state allowing participants to flag stalled exchanges |
| In-flight removal handling | Q6 | Graceful wind-down and emergency freeze protocols |
| Partner notification | Q6 | Communication when chain disrupted ("participant no longer active, your standing unaffected") |

#### Data Store / Schemas (moderate changes)

| Schema | Changes Needed | Source |
|--------|----------------|--------|
| participant.schema.json | Newcomer tier support, failure attribution record, tier entry date, activity tracking | Q5 |
| trust-profile.schema.json | Newcomer tier, network position decay metadata, anchor bounds/activity requirement | Q5 |
| exchange-chain.schema.json | Fulfilment signal fields (Yes/Partially/No + context), stuck flag, escalation state | Q1 |
| protocol-messages.schema.json | Match audit request/response, stuck flag, escalation messages | Q1, Q7 |
| New: governance-event schema | Algorithm change records, governance decisions, investigation records | Q7 |

### 1.4 New Actors in System Context

| Actor | Source | Role |
|-------|--------|------|
| Participant Advisory Body | Q3/Q4, Q7 | Approves algorithm changes, concentration limits; reviews transparency reports; hears match audit escalations |
| Network Operator | Q3/Q4, Q6 | Runs the managed service; bound by 5 governance commitments; manages investigations and removals |
| Newcomer Participant | Q5 | New participant type with structural limits (bilateral-only, 1 concurrent) |

### 1.5 Updated C4 System Context Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Surplus Exchange Protocol                     │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │Discovery │ │ Matching  │ │  Chain   │ │  Trust Engine    │  │
│  │ Service  │ │  Engine   │ │Orchestr. │ │  (+ Newcomer)    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │Governance│ │Transparen│ │Identity  │ │  Escalation &    │  │
│  │&Monitorng│ │cy Service│ │Verificatn│ │  Recourse        │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │Onboarding│ │Data Store│ │ Protocol │                       │
│  │ Service  │ │          │ │State Mach│                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
        ▲              ▲              ▲              ▲
        │              │              │              │
   ┌─────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐
   │Partici- │  │  Network  │  │ Advisory  │  │External │
   │ pants   │  │ Operator  │  │   Body    │  │KYB Provs│
   └─────────┘  └───────────┘  └───────────┘  └─────────┘
```

**Container count: 7 (current) → 12 (with designs)**

---

## Part 2: Implementation Inventory

### 2.1 New Code / Systems to Build

Grouped by implementation category:

#### Protocol & Schema Changes

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Fulfilment signal schema | Q1 | High | Add Yes/Partially/No + context fields to exchange-chain schema |
| Stuck flag schema | Q1 | High | Add stuck flag state and metadata to exchange-chain schema |
| Newcomer tier definition | Q5 | High | Add tier to trust-profile schema with bilateral-only constraints |
| Failure attribution schema | Q5 | High | Track which participant caused each chain failure |
| Anchor tier bounds | Q5 | Medium | Replace "unlimited" with bounded values in trust-profile |
| Governance event schema | Q7 | Medium | New schema for algorithm changes, governance decisions |
| Match audit message types | Q7 | Medium | New protocol messages for recourse workflow |
| Trust attestation format | Q3/Q4 | Medium | Protocol-defined portable format for trust data |
| Portable identity format | Q3/Q4 | Low | Protocol-level participant identity (keypair/domain-based) |

#### Matching Algorithm Changes

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Remove 0.8x probationary penalty | Q5 | High | Delete hardcoded trust multiplier from scorer |
| Relationship diversity factor | Q2 | High | New scoring weight preferring novel partner combinations |
| Cross-cluster incentive | Q5 | High | Positive weight for chains bridging disconnected participants |
| Participation discount (soft) | Q7 | High | Diminishing returns for participants in many active chains |
| Hard cap enforcement | Q7 | High | Exclude participants above X% of active chains |
| Decision logging | Q7 | Medium | Record rejection reasons for every unconsidered chain |

#### Trust System Changes

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Newcomer tier logic | Q5 | High | New tier with bilateral-only, 1 concurrent, 14-day window |
| Tier promotion path (Newcomer→Probationary) | Q5 | High | 3 bilateral exchanges, 3 different partners, ≥0.80 satisfaction, 30+ days |
| Probationary chain length increase | Q5 | High | Increase max from 3 to 4 parties |
| Failure attribution in promotion logic | Q5 | High | Only count failures caused by this participant |
| Network position decay | Q5 | Medium | 180-day half-life on network strength metrics |
| Anchor activity requirement | Q5 | Medium | 2 exchanges per quarter minimum |
| Fulfilment signal integration | Q1 | Medium | Replace/refine satisfaction with commitment fulfilment signal |

#### Governance & Monitoring (New System)

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Pattern detection engine | Q1 | High | Aggregate fulfilment signals into per-participant patterns |
| Behaviour monitoring signals | Q2 | High | Directional asymmetry, surplus scheduling, dependency detection |
| Network health KPIs | Q5 | High | 7 metrics with thresholds and alerting |
| Anomalous access detection | Q6 | Medium | Decline patterns, view-to-completion ratios |
| Complaint pattern analyser | Q6 | Medium | Symmetric monitoring, compressed-timeline detection |
| Cascade risk monitoring | Q7 | Medium | Per-participant cascade impact, network fragility index |
| Concentration tracking | Q7 | Medium | Participation distribution, top-N concentration |
| Sector aggregate monitoring | Q10 | Low | Capacity type concentration, volume trends by sector |
| Governance dashboard UI | Q1-Q7 | Medium | Consolidated view for operator and advisory body |
| Network health dashboard | Q7 | Medium | Advisory body view with automatic flagging |

#### Participant-Facing (New System)

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Matching profile view | Q7 | High | Personal dashboard: scores, factors, history, rejection reasons |
| Algorithm changelog | Q7 | Medium | Public, append-only record of all algorithm changes |
| Transparency reports | Q3/Q4 | Medium | Published matching statistics, concentration patterns |
| Match audit request workflow | Q7 | Medium | Formal recourse with 5-day SLA |
| Concentration warning display | Q7 | Low | Real-time indicator approaching hard cap |

#### Escalation & Recourse (New System)

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Stuck flag workflow | Q1 | High | Flag → conversation prompt → outcome recording |
| Graduated response engine | Q1 | High | Pattern-to-action mapping with human gates |
| In-flight exchange management | Q6 | Medium | Staged removal, chain freezing, partner notification |
| Replacement matching trigger | Q6 | Medium | Proactive re-matching for affected participants |
| Unfounded escalation tracking | Q6 | Medium | Track complainant patterns alongside targets |

#### Identity & Onboarding (New System)

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| Identity verification flow | Q5 | High | Multi-path verification (business reg, credentials, online presence, vouch) |
| Peer exchange onboarding content | Q2 | High | Education on surplus exchange vs procurement |
| Tier assignment logic | Q5 | High | Route to Newcomer (default) or Probationary (vouched) |
| Labour transparency norms | Q10 | Medium | Onboarding content on surplus definition, employee transparency |

#### Governance Documents & Processes (Non-Code)

| Item | Source | Priority | Description |
|------|--------|----------|-------------|
| 5 operator commitments specification | Q3/Q4 | High | Binding framework: data portability, transparency, conformance, representation, exit |
| Advisory body powers definition | Q3/Q4, Q7 | High | What they approve, review, escalate |
| Algorithm change governance process | Q7 | Medium | Minor/major classification, 21-day review, voting, emergency changes |
| Graduated response playbook | Q1 | Medium | When and how governance intervenes |
| Removal legal framework | Q6 | Medium | Terms of service language for participant removal |
| Emergency change procedure | Q7 | Medium | 24-hour notification, 30-day expiry |

### 2.2 Total Count by Category

| Category | Items | New System? |
|----------|-------|-------------|
| Protocol & Schema | 9 | No — extends existing |
| Matching Algorithm | 6 | No — modifies existing |
| Trust System | 7 | No — modifies existing |
| Governance & Monitoring | 10 | Yes — new container |
| Participant Transparency | 5 | Yes — new container |
| Escalation & Recourse | 5 | Yes — new container |
| Identity & Onboarding | 4 | Yes — new container |
| Governance Documents | 6 | Non-code deliverable |
| **Total** | **52** | |

---

## Part 3: Cross-Cutting Mechanisms

These patterns appear across multiple design documents and represent shared infrastructure that should be built once, not duplicated.

### 3.1 Graduated, Human-Judged Response

**Appears in**: Q1, Q2, Q5, Q6, Q7

Every design document follows the same escalation pattern:
1. Signal detection (automated)
2. Pattern aggregation (automated)
3. Conversation with participant (human-initiated)
4. Formal governance review (human-judged)
5. Remediation or removal (conscious decision)

**Implementation implication**: This is a single workflow engine with configurable triggers, not 5 separate escalation systems. The triggers differ (non-fulfilment, behaviour patterns, bad actor detection, algorithm disputes) but the process is identical.

### 3.2 "Behaviour Not Identity" Principle

**Appears in**: Q1, Q2, Q5, Q6

No design introduces identity-based restrictions. All detection, monitoring, and response is based on what participants *do*, not who they *are*. This is a consistent architectural constraint: the system never asks "are you too big/small/new?" — only "are you behaving like a peer?"

**Implementation implication**: No participant classification fields beyond trust tier. All monitoring signals are behavioural.

### 3.3 Structural Limits as Primary Defence

**Appears in**: Q2 (concentration limits), Q5 (newcomer bilateral-only), Q6 (blast radius containment), Q7 (hard cap)

Multiple designs rely on the same mechanism: limit what participants *can* do structurally, rather than trying to detect and punish bad behaviour after the fact.

**Implementation implication**: The Matching Engine and Trust Engine enforce these limits. Monitoring is the second layer, not the first.

### 3.4 The Advisory Body

**Appears in**: Q3/Q4 (creation, powers), Q7 (algorithm governance, match audit escalation)

The participant advisory body is created in Q3/Q4 and given operational powers in Q7. It:
- Approves major algorithm changes (Q7)
- Approves concentration limit changes (Q7, Q2)
- Reviews transparency reports (Q3/Q4)
- Hears match audit escalations (Q7)
- Receives network health reports (Q5)
- Sees anonymised aggregate patterns, not individual data (Q6, Q7)

**Implementation implication**: The advisory body needs an interface — not just reports, but decision workflows (approve/reject algorithm changes, review escalations). This is a governance product, not just a dashboard.

### 3.5 The Surplus Framing as Defence

**Appears in**: Q1, Q6

The surplus framing isn't just philosophy — it's a structural defence. When the baseline is zero (this capacity would otherwise be wasted):
- Non-fulfilment is disappointing, not devastating (Q1)
- Bad actor removal doesn't put affected participants "out of pocket" (Q6)
- Replacement matching is a reasonable response, not compensation (Q6)

**Implementation implication**: Communications and UI copy should consistently reinforce the surplus framing. This is a content/UX concern, not a code concern.

### 3.6 Q6's Anti-Harvesting Principle

**Appears in**: Q6 (primary), Q7 (preserved)

"Participants see only what's relevant to their own exchanges" — the matching algorithm mediates all discovery. There is no browsable catalogue.

**Implementation implication**: This is an information architecture constraint. The Matching Profile (Q7) shows you everything about *yourself* but nothing about other participants. The Discovery Service must not expose a general search API to participants.

---

## Part 4: Gap Analysis

### 4.1 Potential Tensions Between Designs

#### Full Transparency (Q7) vs Anti-Harvesting (Q6)

Q7 gives participants full visibility into their own scores and matching factors. Q6 says participants see only what's relevant to their own exchanges. These are *compatible* — Q7's transparency is self-directed ("your trust score is 0.82") while Q6's anti-harvesting is other-directed ("you can't browse other participants' profiles"). But the boundary needs careful implementation: matching rejection reasons (Q7) must not leak information about the *alternative* chain that was preferred.

**Risk**: Low. The designs explicitly address this — Q7 says "you see everything about yourself, nothing about others."

#### Hard Cap (Q7) vs Newcomer Bilateral-Only (Q5)

Q7's hard cap (e.g., 15% of active chains) and Q5's newcomer bilateral-only limit are independent mechanisms that could interact. A newcomer completing 3 bilateral exchanges to promote might count toward the hard cap during a very small network phase.

**Risk**: Low. At small network sizes the hard cap is generous (15%), and bilateral exchanges are a small fraction of total chains.

#### Surplus Scheduling Detection (Q2) vs Legitimate Business Patterns

Q2 monitors for suspicious regularity in offerings as a sign of managed (non-surplus) capacity. But some businesses genuinely have predictable surplus (e.g., a design agency always has spare capacity on Fridays). Q10 adds a labour interpretation lens to this same signal.

**Risk**: Medium. The designs acknowledge this is the hardest signal (Q2 gives it lower weight) and rely on human judgment. But the detection logic needs to be calibrated carefully to avoid false positives.

### 4.2 Unresolved Implementation Questions (Cross-Cutting)

These questions appear across multiple documents and need resolution before implementation:

| Question | Sources | Notes |
|----------|---------|-------|
| Exact concentration limit thresholds | Q2, Q7 | Starting suggestion 15% at <50 participants; scaling formula undefined |
| Rolling window duration for monitoring | Q2, Q7 | Affects behaviour detection, concentration tracking |
| Advisory body composition & selection | Q3/Q4, Q7 | Powers defined; who sits on it is not |
| Revenue model | Q2, Q3/Q4 | "No enterprise adoption" stance creates sustainability question |
| Detection threshold calibration | Q1, Q2, Q6 | All monitoring signals need real-world calibration |
| UI/UX for governance interfaces | Q1-Q7 | Multiple designs assume dashboards; none specify design |
| Legal framework for removal | Q6 | Terms of service language needed |
| KYB provider selection | Q5 | Operational decision for identity verification |
| Diminishing returns curve shape | Q7 | Mathematical function undefined (linear, exponential, sigmoid) |

### 4.3 Missing Pieces

#### Q8 (Network Bootstrapping) — UNANALYSED

Multiple designs reference bootstrapping assumptions that haven't been validated:
- Q2 says "bootstrap with genuine peers, not enterprise anchors"
- Q5's newcomer tier assumes a network with enough participants for bilateral exchanges
- Q7's concentration limits assume enough participants for meaningful thresholds
- Q10's sector monitoring assumes sector diversity exists

Without Q8 analysis, we don't know: which sector to start in, how many participants constitute minimum viable, how to recruit the first 50 participants under these constraints.

#### Q9 (Taxation & Compliance) — UNANALYSED

Q1 explicitly defers tax compliance as "participant responsibility." But:
- Exchanges are taxable as barter income in most jurisdictions
- Participants will need compliance numbers even if the network doesn't use shared valuation
- The absence of design here may become a blocker for real-world adoption

#### Governance Product Design

The designs collectively describe a sophisticated governance system (monitoring, dashboards, decision workflows, transparency reports) but no document addresses what this looks like as a *product*. There's no wireframe, no user journey for the operator or advisory body, no information architecture for the governance interface.

#### Testing & Validation Strategy

None of the 7 design documents address how their mechanisms will be tested or validated. Given the complexity of the monitoring and detection systems, a testing strategy (simulation, staged rollout, threshold calibration methodology) is needed.

---

## Part 5: Summary

### What the designs collectively produce

The 7 analysed open questions transform SEP from a **matching protocol with trust** into a **governed exchange network with transparency, monitoring, and recourse**. The core matching and trust systems remain but gain:

1. **A governance layer** — advisory body, operator commitments, graduated response
2. **A transparency layer** — matching profiles, algorithm changelog, network health dashboards
3. **A monitoring layer** — behaviour detection, anomaly detection, concentration tracking, cascade risk
4. **An accountability layer** — fulfilment signals, failure attribution, escalation paths
5. **An openness layer** — newcomer tier, flexible identity verification, structural limits over social gates

### Scale of change

- **Containers**: 7 → 12 (+5 new)
- **Schemas**: 6 → 7+ (1 new, 4 modified)
- **Implementation items**: 52 identified
- **New actors**: 3 (Advisory Body, Operator, Newcomer)
- **Governance documents**: 6 non-code deliverables
- **Unanalysed questions**: 2 (Q8, Q9)
- **Cross-cutting unresolved questions**: 9

### Architectural character shift

The designs don't fundamentally change *what* SEP does (match surplus capacity in multi-party chains). They change *how it's governed*. The current codebase is a matching engine. The designs describe a governed network with the matching engine at its core.

This is the right evolution — but it's important to recognise that the governance, monitoring, and transparency systems are now *larger* than the matching system itself. The implementation plan needs to account for this shift in centre of gravity.
