# Surplus Exchange Protocol - C4 Model

## Level 1: System Context Diagram

This shows the SEP system and its relationships with users and external systems.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM CONTEXT                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
    │   Business   │          │   Business   │          │   Business   │
    │  Participant │          │  Participant │          │  Participant │
    │      A       │          │      B       │          │      C       │
    │  (Provider)  │          │  (Recipient) │          │  (Both)      │
    └──────┬───────┘          └──────┬───────┘          └──────┬───────┘
           │                         │                         │
           │  Declares surplus       │  Declares needs         │  Declares both
           │  capacity               │                         │
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │                 SURPLUS EXCHANGE PROTOCOL (SEP)                     │
    │                                                                     │
    │   ┌─────────────────────────────────────────────────────────────┐   │
    │   │  AI-mediated matching of surplus capacity to needs          │   │
    │   │  without monetary exchange                                  │   │
    │   └─────────────────────────────────────────────────────────────┘   │
    │                                                                     │
    │   • Discovers multi-party exchange chains (A→B→C→A)                 │
    │   • Manages trust and reputation                                    │
    │   • Coordinates execution and fulfilment signals                    │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘
           │                         │                         │
           │  Proposed matches       │  Chain invitations      │  Execution
           │  & confirmations        │  & commitments          │  coordination
           ▼                         ▼                         ▼
    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
    │   Business   │◄────────►│   Business   │◄────────►│   Business   │
    │  Participant │  Direct  │  Participant │  Direct  │  Participant │
    │      A       │  exchange│      B       │  exchange│      C       │
    └──────────────┘          └──────────────┘          └──────────────┘
```

---

## Level 2: Container Diagram

This shows the major technical building blocks within the SEP system.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CONTAINER DIAGRAM                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────┐
                                    │    Participants     │
                                    │   (Businesses &     │
                                    │    their Agents)    │
                                    └──────────┬──────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                          ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              SURPLUS EXCHANGE PROTOCOL                                             │
│                                                                                                   │
│  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐                       │
│  │                   │     │                   │     │                   │                       │
│  │  PARTICIPANT      │     │   DISCOVERY       │     │    MATCHING       │                       │
│  │    AGENTS         │────►│    SERVICE        │────►│    ENGINE         │                       │
│  │                   │     │                   │     │                   │                       │
│  │  • Register       │     │  • Index          │     │  • Build graph    │                       │
│  │    offerings      │     │    offerings      │     │  • Find cycles    │                       │
│  │  • Declare        │     │  • Index needs    │     │  • Score chains   │                       │
│  │    needs          │     │  • Search API     │     │  • Rank matches   │                       │
│  │  • Confirm        │     │                   │     │  • Concentration  │                       │
│  │    matches        │     │                   │     │    limit enforce- │                       │
│  │                   │     │                   │     │    ment           │                       │
│  └────────┬──────────┘     └───────────────────┘     └────────┬─────────┘                       │
│           │                                                   │                                  │
│           │              ┌────────────────────────────────────┘                                  │
│           │              │                                                                       │
│           ▼              ▼                                                                       │
│  ┌────────────────────────────────────┐     ┌────────────────────────────────────┐               │
│  │                                    │     │                                    │               │
│  │     CHAIN ORCHESTRATOR             │     │      TRUST ENGINE                  │               │
│  │                                    │     │                                    │               │
│  │  • Propose chains to parties       │     │  • Calculate trust scores          │               │
│  │  • Collect confirmations           │     │  • Manage tier progression         │               │
│  │  • Coordinate execution            │◄───►│  • Track vouching                  │               │
│  │  • Handle failures                 │     │  • Enforce exposure limits          │               │
│  │  • Record fulfilment signals       │     │  • Process fulfilment signals       │               │
│  │  • Stuck flag & escalation routing │     │  • Newcomer tier handling           │               │
│  │                                    │     │                                    │               │
│  └───────────────┬────────────────────┘     └───────────────┬────────────────────┘               │
│                  │                                          │                                    │
│                  └──────────────────┬───────────────────────┘                                    │
│                                    │                                                             │
│                                    ▼                                                             │
│                  ┌────────────────────────────────────┐                                          │
│                  │                                    │                                          │
│                  │       DATA STORE                   │                                          │
│                  │                                    │                                          │
│                  │  • Participants & profiles          │                                          │
│                  │  • Offerings (surplus)              │                                          │
│                  │  • Needs                            │                                          │
│                  │  • Exchange chains                  │                                          │
│                  │  • Trust profiles                   │                                          │
│                  │  • Fulfilment history               │                                          │
│                  │  • Decision logs                    │                                          │
│                  │  • Governance audit trail            │                                          │
│                  │                                    │                                          │
│                  └────────────────────────────────────┘                                          │
│                                                                                                   │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                  NEW SERVICES                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                                              │ │
│  │                     GOVERNANCE & MONITORING SERVICE                                          │ │
│  │                                                                                              │ │
│  │  • Pattern detection & behaviour monitoring                                                  │ │
│  │  • Network health metrics (7 KPIs)                                                          │ │
│  │  • Anomalous access detection                                                               │ │
│  │  • Complaint pattern analysis                                                               │ │
│  │  • Cascade risk monitoring                                                                  │ │
│  │  • Concentration tracking                                                                   │ │
│  │  • Matching health                                                                          │ │
│  │                                                                                              │ │
│  │  Monitors: Matching Engine, Trust Engine, Chain Orchestrator                                 │ │
│  │                                                                                              │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│       │                    │                         │                         │                   │
│       │                    │                         │                         │                   │
│       ▼                    ▼                         ▼                         ▼                   │
│  ┌───────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐ │
│  │                   │  │                        │  │                     │  │                  │ │
│  │ PARTICIPANT       │  │ ESCALATION &           │  │  IDENTITY           │  │  ONBOARDING      │ │
│  │ TRANSPARENCY      │  │ RECOURSE SERVICE       │  │  VERIFICATION       │  │  SERVICE         │ │
│  │ SERVICE           │  │                        │  │  SERVICE             │  │                  │ │
│  │                   │  │ • Stuck flag workflow   │  │                     │  │ • Peer exchange  │ │
│  │ • Matching        │  │ • Governance           │  │ • Business           │  │   education      │ │
│  │   profile views   │  │   escalation           │  │   registration       │  │ • Labour market  │ │
│  │ • Algorithm       │  │ • In-flight exchange   │  │   verification       │  │   norms          │ │
│  │   changelog       │  │   management           │  │ • Professional       │  │ • Identity       │ │
│  │   (public,        │  │ • Match audit          │  │   credentials        │  │   verification   │ │
│  │   append-only)    │  │   requests             │  │ • Established        │  │   routing        │ │
│  │ • Transparency    │  │   (5-day SLA)          │  │   online presence    │  │ • Tier           │ │
│  │   reports         │  │                        │  │   verification       │  │   assignment     │ │
│  │                   │  │                        │  │                     │  │                  │ │
│  └───────────────────┘  └────────────────────────┘  └─────────────────────┘  └──────────────────┘ │
│       ▲                         ▲                         │                         ▲             │
│       │                         │                         │                         │             │
│  Receives data from         Connects to Chain             │                    Receives identity  │
│  Governance &               Orchestrator &           Feeds into               results from       │
│  Monitoring; serves         Governance &             Onboarding               Identity            │
│  participants directly      Monitoring               Service                  Verification        │
│                                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Level 3: Component Diagram - Matching Engine

This zooms into the Matching Engine container to show its internal components.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT DIAGRAM: MATCHING ENGINE                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                         Offerings & Needs
                              from Discovery
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           MATCHING ENGINE                                      │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │                       NETWORK GRAPH                                   │   │
│   │                                                                       │   │
│   │   Participants as nodes, potential exchanges as directed edges        │   │
│   │                                                                       │   │
│   │      ┌─────┐         ┌─────┐         ┌─────┐         ┌─────┐         │   │
│   │      │  A  │────────►│  B  │────────►│  C  │────────►│  D  │         │   │
│   │      └──┬──┘         └──┬──┘         └──┬──┘         └──┬──┘         │   │
│   │         │               │               │               │            │   │
│   │         │               │               │               │            │   │
│   │         └───────────────┴───────────────┴───────────────┘            │   │
│   │                         (cycle detection)                            │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                   │                                           │
│              ┌────────────────────┼────────────────────┐                      │
│              │                    │                    │                      │
│              ▼                    ▼                    ▼                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│   │                 │  │                 │  │                 │              │
│   │  MATCH SCORER   │  │ CYCLE DETECTOR  │  │  CHAIN RANKER   │              │
│   │                 │  │                 │  │                 │              │
│   │ • Type match    │  │ • Johnson's     │  │ • Aggregate     │              │
│   │ • Capability    │  │   algorithm     │  │   match scores  │              │
│   │   alignment     │  │ • DFS-based     │  │ • Trust factor  │              │
│   │ • Sector        │  │   cycle finding │  │ • Chain length  │              │
│   │   overlap       │  │ • Configurable  │  │   penalty       │              │
│   │ • Geographic    │  │   min/max       │  │ • Feasibility   │              │
│   │ • Timing        │  │   length        │  │   score         │              │
│   │ • Trust check   │  │ • Hard cap      │  │ • Concentration │              │
│   │ • Relationship  │  │   enforcement   │  │   limit check   │              │
│   │   diversity     │  │   (exclude when │  │                 │              │
│   │   (prefer novel │  │   at governance-│  │                 │              │
│   │   partner       │  │   set % of      │  │                 │              │
│   │   combinations) │  │   active chains)│  │                 │              │
│   │ • Cross-cluster │  │                 │  │                 │              │
│   │   incentive     │  │                 │  │                 │              │
│   │   (bridge       │  │                 │  │                 │              │
│   │   disconnected  │  │                 │  │                 │              │
│   │   participants) │  │                 │  │                 │              │
│   │ • Participation │  │                 │  │                 │              │
│   │   discount      │  │                 │  │                 │              │
│   │   (diminishing  │  │                 │  │                 │              │
│   │   returns when  │  │                 │  │                 │              │
│   │   in many       │  │                 │  │                 │              │
│   │   chains)       │  │                 │  │                 │              │
│   │                 │  │                 │  │                 │              │
│   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│            │                    │                    │                        │
│            └────────────────────┴────────────────────┘                        │
│                                 │                                             │
│                    ┌────────────┴────────────┐                                │
│                    │                         │                                │
│                    ▼                         ▼                                │
│      ┌─────────────────────────┐  ┌───────────────────────────┐              │
│      │                         │  │                           │              │
│      │    RANKED CHAINS        │  │    DECISION LOG           │              │
│      │                         │  │                           │              │
│      │  Viable exchange chains │  │  Rejection reasons for    │              │
│      │  sorted by viability    │  │  every unconsidered chain │              │
│      │  score                  │  │  (feeds Transparency      │              │
│      │                         │  │  Service)                 │              │
│      │                         │  │                           │              │
│      └─────────────────────────┘  └───────────────────────────┘              │
│                    │                         │                                │
└────────────────────┼─────────────────────────┼────────────────────────────────┘
                     │                         │
                     ▼                         ▼
            To Chain Orchestrator     To Participant Transparency Service
```

---

## Level 3: Component Diagram - Trust Engine

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT DIAGRAM: TRUST ENGINE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                    Fulfilment Signals
                    from Chain Orchestrator
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            TRUST ENGINE                                        │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐     │
│   │                                                                     │     │
│   │                    TRUST CALCULATOR                                 │     │
│   │                                                                     │     │
│   │   Computes trust score from multiple signals:                       │     │
│   │                                                                     │     │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │     │
│   │   │ Commitment  │  │ On-time     │  │ Vouch       │  │ Network   │ │     │
│   │   │ Fulfilment  │  │ Delivery    │  │ Quality     │  │ Position  │ │     │
│   │   │ Rate        │  │ Rate        │  │             │  │           │ │     │
│   │   │ (Yes/       │  │             │  │             │  │ 180-day   │ │     │
│   │   │ Partially/  │  │             │  │             │  │ half-life │ │     │
│   │   │ No)         │  │             │  │             │  │ decay     │ │     │
│   │   │    40%      │  │    30%      │  │    20%      │  │    10%    │ │     │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │     │
│   │                                                                     │     │
│   │   Note: Failures tracked per-participant (who caused it),           │     │
│   │   not per-chain                                                     │     │
│   │                                                                     │     │
│   └─────────────────────────────────────┬───────────────────────────────┘     │
│                                         │                                     │
│              ┌──────────────────────────┼──────────────────────────┐          │
│              │                          │                          │          │
│              ▼                          ▼                          ▼          │
│   ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐   │
│   │                 │        │                 │        │                 │   │
│   │  TIER MANAGER   │        │ VOUCHING SYSTEM │        │ EXPOSURE LIMITER│   │
│   │                 │        │                 │        │                 │   │
│   │ ┌─────────────┐ │        │ • Established & │        │ Based on tier:  │   │
│   │ │  NEWCOMER   │ │        │   Anchor tiers  │        │                 │   │
│   │ │ (identity-  │ │        │   can vouch     │        │ NEWCOMER:       │   │
│   │ │  verified)  │ │        │ • Vouching is   │        │ • 2 max chain   │   │
│   │ └──────┬──────┘ │        │   an ACCELERATOR│        │   size          │   │
│   │        │        │        │   (skips        │        │   (bilateral)   │   │
│   │        ▼        │        │   Newcomer →    │        │ • 1 concurrent  │   │
│   │ ┌─────────────┐ │        │   Probationary) │        │ • 14 day window │   │
│   │ │PROBATIONARY │ │        │ • NOT a gate    │        │                 │   │
│   │ │ (limited)   │ │        │   for entry     │        │ PROBATIONARY:   │   │
│   │ └──────┬──────┘ │        │ • Sponsors      │        │ • 4 max chain   │   │
│   │        │        │        │   accountable   │        │   size          │   │
│   │        ▼        │        │   for sponsored │        │ • 2 concurrent  │   │
│   │ ┌─────────────┐ │        │ • Vouch         │        │ • 30 day window │   │
│   │ │ ESTABLISHED │ │        │   reputation    │        │                 │   │
│   │ │  (proven)   │ │        │   tracked       │        │ ESTABLISHED:    │   │
│   │ └──────┬──────┘ │        │                 │        │ • 6 max chain   │   │
│   │        │        │        │                 │        │   size          │   │
│   │        ▼        │        │                 │        │ • 5 concurrent  │   │
│   │ ┌─────────────┐ │        │                 │        │ • 90 day window │   │
│   │ │   ANCHOR    │ │        │                 │        │                 │   │
│   │ │ (high trust)│ │        │                 │        │ ANCHOR:         │   │
│   │ └─────────────┘ │        │                 │        │ • 12 max chain  │   │
│   │                 │        │                 │        │   size (bounded)│   │
│   │                 │        │                 │        │ • 15 concurrent │   │
│   │                 │        │                 │        │   (bounded)     │   │
│   │                 │        │                 │        │ • Unlimited     │   │
│   │                 │        │                 │        │   window        │   │
│   │                 │        │                 │        │                 │   │
│   └─────────────────┘        └─────────────────┘        └─────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Complete Exchange Chain Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    EXCHANGE CHAIN LIFECYCLE                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

  PARTICIPANT A          PARTICIPANT B          PARTICIPANT C          SYSTEM
       │                      │                      │                    │
       │                      │                      │                    │
   ┌───┴───┐              ┌───┴───┐              ┌───┴───┐               │
   │Declare│              │Declare│              │Declare│               │
   │Surplus│              │ Need  │              │ Both  │               │
   └───┬───┘              └───┬───┘              └───┬───┘               │
       │                      │                      │                    │
       └──────────────────────┴──────────────────────┘                    │
                              │                                           │
                              ▼                                           │
                    ┌─────────────────┐                                   │
                    │   DISCOVERY     │◄──────────────────────────────────┤
                    │   Index & store │                                   │
                    └────────┬────────┘                                   │
                             │                                            │
                             ▼                                            │
                    ┌─────────────────┐                                   │
                    │    MATCHING     │◄──────────────────────────────────┤
                    │  Find viable    │                                   │
                    │  chains         │                                   │
                    └────────┬────────┘                                   │
                             │                                            │
                             │  Chain: A → B → C → A                      │
                             │  (A provides to B, B provides to C,        │
                             │   C provides to A)                         │
                             │                                            │
                             ▼                                            │
       ┌─────────────────────────────────────────────────────────────────┐│
       │                         PROPOSAL                                ││
       │                                                                 ││
       │   ┌─────────┐         ┌─────────┐         ┌─────────┐          ││
       │   │    A    │◄───────►│    B    │◄───────►│    C    │          ││
       │   │         │ Propose │         │ Propose │         │          ││
       │   │ Confirm │         │ Confirm │         │ Confirm │          ││
       │   │   ✓     │         │   ✓     │         │   ✓     │          ││
       │   └─────────┘         └─────────┘         └─────────┘          ││
       │                                                                 ││
       └─────────────────────────────────────────────────────────────────┘│
                             │                                            │
                             │  All confirmed → State: COMMITTED          │
                             │                                            │
                             ▼                                            │
       ┌─────────────────────────────────────────────────────────────────┐│
       │                        EXECUTION                                ││
       │                                                                 ││
       │   A delivers to B                                               ││
       │        │                                                        ││
       │        ▼                                                        ││
       │   B confirms receipt, signals fulfilment (Yes/Partially/No)    ││
       │        │                                                        ││
       │        ▼                                                        ││
       │   B delivers to C                                               ││
       │        │                                                        ││
       │        ▼                                                        ││
       │   C confirms receipt, signals fulfilment (Yes/Partially/No)    ││
       │        │                                                        ││
       │        ▼                                                        ││
       │   C delivers to A                                               ││
       │        │                                                        ││
       │        ▼                                                        ││
       │   A confirms receipt, signals fulfilment (Yes/Partially/No)    ││
       │                                                                 ││
       │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ││
       │                                                                 ││
       │   At any point: participant may flag exchange as STUCK          ││
       │     → Triggers stuck flag workflow                              ││
       │     → Routed to Escalation & Recourse Service                  ││
       │     → Governance escalation if unresolved                      ││
       │                                                                 ││
       └─────────────────────────────────────────────────────────────────┘│
                             │                                            │
                             │  All fulfilled → State: COMPLETED          │
                             │  Flagged stuck → State: STUCK              │
                             │                                            │
                             ▼                                            │
                    ┌─────────────────┐                                   │
                    │  TRUST UPDATE   │◄──────────────────────────────────┤
                    │                 │                                   │
                    │  • Update       │                                   │
                    │    fulfilment   │                                   │
                    │    rates        │                                   │
                    │  • Check tier   │                                   │
                    │    promotion    │                                   │
                    │  • Adjust       │                                   │
                    │    exposure     │                                   │
                    │    limits       │                                   │
                    │  • Check for    │                                   │
                    │    fulfilment   │                                   │
                    │    patterns     │                                   │
                    │                 │                                   │
                    └─────────────────┘                                   │
```

---

## Key Concepts Visualised

### Multi-Party Chain Discovery

```
Traditional Exchange (requires money):

    A ──[$]──► B        B ──[$]──► C        C ──[$]──► A

    Each transaction independent, requires liquid capital


SEP Multi-Party Chain (no money):

              ┌───────────────────────────────┐
              │                               │
              ▼                               │
         ┌─────────┐                     ┌────┴────┐
         │    A    │────[service]───────►│    B    │
         │ (Legal) │                     │(Catering│
         └────┬────┘                     └────┬────┘
              │                               │
              │                               │
              │                          [catering]
              │                               │
              │                               ▼
         [branding]                      ┌─────────┐
              │                          │    C    │
              │                          │ (Tech)  │
              │                          └────┬────┘
              │                               │
              ▼                               │
         ┌─────────┐                          │
         │    D    │◄─────[IT support]────────┘
         │ (Design)│
         └─────────┘

    All exchanges happen as single coordinated chain
    No money changes hands
    Each party gives and receives
```

### Trust Tier Progression

```
                                    ┌─────────────────────────────────┐
                                    │            ANCHOR               │
                                    │  • Can vouch for others         │
                                    │  • Bounded: max 12-party chains │
                                    │  • Max 15 concurrent (bounded)  │
                                    │  • Ongoing activity required:   │
                                    │    2 exchanges/quarter          │
                                    └─────────────────────────────────┘
                                                 ▲
                                                 │
                                    ┌────────────┴────────────────┐
                                    │ Promotion criteria:         │
                                    │ • 50+ completed chains      │
                                    │ • 95%+ fulfilment rate      │
                                    │ • 2+ years active           │
                                    │ • Vouching track record     │
                                    │ • Ongoing: 2 exchanges/qtr  │
                                    └────────────┬────────────────┘
                                                 │
                                    ┌─────────────────────────────────┐
                                    │         ESTABLISHED             │
                                    │  • Can vouch for others         │
                                    │  • Medium chain size (6)        │
                                    │  • 5 concurrent chains          │
                                    │  • 90-day execution window      │
                                    └─────────────────────────────────┘
                                                 ▲
                                                 │
                                    ┌────────────┴────────────────┐
                                    │ Promotion criteria:         │
                                    │ • 5+ completed chains       │
                                    │ • 80%+ fulfilment rate      │
                                    │ • 6+ months active          │
                                    └────────────┬────────────────┘
                                                 │
                                    ┌─────────────────────────────────┐
                                    │        PROBATIONARY             │
                                    │  • Limited exposure             │
                                    │  • Max 4-party chains           │
                                    │  • 2 concurrent chains          │
                                    │  • 30-day execution window      │
                                    └─────────────────────────────────┘
                                                 ▲
                                                 │
                                    ┌────────────┴────────────────┐
                                    │ Promotion criteria:         │
                                    │ • 3 bilateral exchanges     │
                                    │   with 3 different partners │
                                    │ • 80%+ fulfilment rate      │
                                    │ • 30+ days active           │
                                    │                             │
                                    │ OR immediately if vouched   │
                                    │ by Established or Anchor    │
                                    └────────────┬────────────────┘
                                                 │
                                    ┌─────────────────────────────────┐
                                    │          NEWCOMER               │
                                    │  • Bilateral exchanges only (2) │
                                    │  • 1 concurrent chain           │
                                    │  • 14-day execution window      │
                                    │  • Identity-verified            │
                                    └─────────────────────────────────┘
                                                 ▲
                                                 │
                                    ┌────────────┴────────────────┐
                                    │    NEW PARTICIPANT          │
                                    │  (identity-verified via     │
                                    │  Identity Verification      │
                                    │  Service — no vouch         │
                                    │  required for entry)        │
                                    │                             │
                                    │  Vouching by Established/   │
                                    │  Anchor is an optional      │
                                    │  ACCELERATOR (skips         │
                                    │  Newcomer → Probationary)   │
                                    └─────────────────────────────┘
```

---

## Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SCHEMA RELATIONSHIPS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘


  ┌───────────────────┐
  │   PARTICIPANT     │
  │                   │
  │ • id              │
  │ • identity        │
  │ • profile         │
  │ • preferences     │
  └─────────┬─────────┘
            │
            │ has
            │
    ┌───────┴───────┬───────────────────┐
    │               │                   │
    ▼               ▼                   ▼
┌─────────┐   ┌─────────┐        ┌─────────────┐
│OFFERING │   │  NEED   │        │TRUST PROFILE│
│(Surplus)│   │         │        │             │
│         │   │         │        │ • tier      │
│• type   │   │• type   │        │ • track     │
│• capab- │   │• capab- │        │   record    │
│  ility_ │   │  ility_ │        │ • vouching  │
│  match- │   │  match- │        │ • limits    │
│  ing    │   │  ing    │        │             │
│• surplus│   │• urgency│        │             │
│  context│   │         │        │             │
└────┬────┘   └────┬────┘        └─────────────┘
     │             │
     │   matched   │
     │   to        │
     │             │
     └──────┬──────┘
            │
            ▼
    ┌───────────────┐
    │ EXCHANGE EDGE │
    │               │
    │ • offering_id │
    │ • need_id     │
    │ • match_score │
    └───────┬───────┘
            │
            │ forms
            │
            ▼
    ┌───────────────┐
    │EXCHANGE CHAIN │
    │               │
    │ • edges[]     │
    │ • state       │
    │ • timing      │
    │ • metadata    │
    └───────────────┘
            │
            │ generates
            │
            ▼
    ┌───────────────┐
    │  FULFILMENT   │
    │   SIGNALS     │
    │               │
    │ • fulfilled:  │
    │   yes         │
    │ • fulfilled:  │
    │   partially   │
    │ • fulfilled:  │
    │   no          │
    └───────────────┘
            │
            │ updates
            │
            ▼
    ┌───────────────┐
    │TRUST PROFILE  │
    │   (updated)   │
    └───────────────┘
```

---

## Technology Stack (Reference Implementation)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROTOCOL LAYER                                      │
│                                                                                 │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │
│   │  JSON Schema     │  │  TypeScript      │  │  Protocol        │             │
│   │  (2020-12)       │  │  Types           │  │  Messages        │             │
│   │                  │  │  (generated)     │  │  (JSON)          │             │
│   │  • Offerings     │  │                  │  │                  │             │
│   │  • Needs         │  │  • Type safety   │  │  • Proposals     │             │
│   │  • Chains        │  │  • Validation    │  │  • Confirmations │             │
│   │  • Trust         │  │                  │  │  • Fulfilment    │             │
│   │  • Messages      │  │                  │  │                  │             │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REFERENCE IMPLEMENTATION                               │
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                          TypeScript / Node.js                            │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │
│   │  NetworkGraph    │  │  Cycle Detection │  │  Trust           │             │
│   │                  │  │                  │  │  Calculator      │             │
│   │  Adjacency list  │  │  Johnson's       │  │                  │             │
│   │  graph for       │  │  algorithm for   │  │  Weighted        │             │
│   │  participant     │  │  finding all     │  │  scoring from    │             │
│   │  network         │  │  simple cycles   │  │  multiple        │             │
│   │                  │  │                  │  │  signals         │             │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘             │
│                                                                                 │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │
│   │  Match Scorer    │  │  Chain Ranker    │  │  State Machine   │             │
│   │                  │  │                  │  │                  │             │
│   │  Multi-dimension │  │  Aggregate       │  │  Chain lifecycle │             │
│   │  scoring via     │  │  scoring with    │  │  management      │             │
│   │  capability_     │  │  trust &         │  │  (draft →        │             │
│   │  matching fields │  │  feasibility     │  │   completed)     │             │
│   │                  │  │                  │  │                  │             │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

*Last updated: 2026-02-27*
*Based on consolidated design impact analysis (2026-02-26)*
*Based on Surplus Exchange Protocol reference implementation*
