# Autonomous Agent Journey (Phase 3)

The complete exchange flow from a fully autonomous agent's perspective, where agents negotiate and execute without human intervention. Shown at three levels of detail.

---

## Level 1: Overview

A high-level view of the autonomous agent experience using SEP.

```mermaid
journey
    title Autonomous Agent Exchange Journey
    section Initialise
      Agent deployed: 5: Human
      Capability model loaded: 5: Agent
      Autonomy policy set: 4: Human
      Agent joins network: 5: Agent
    section Operate
      Real-time capability translation: 5: Agent, Capability Service
      Continuous surplus broadcast: 5: Agent
      Continuous need broadcast: 5: Agent
      Real-time adaptation: 4: Agent
    section Negotiate
      Semantic capability matching: 5: Agent, Capability Service
      Agent-to-agent negotiation: 4: Agent, Partner
      Autonomous commitment: 5: Agent
    section Execute
      Coordinate with partner: 5: Agent, Partner
      Execute exchange: 4: Agent
      Update trust network: 5: Agent, SEP
```

```mermaid
flowchart LR
    subgraph Broadcast["1. Broadcast"]
        A[Surplus Stream] --> B[Need Stream]
    end

    subgraph Negotiate["2. Negotiate"]
        C[Discover] --> D[Negotiate] --> E[Commit]
    end

    subgraph Execute["3. Execute"]
        F[Coordinate] --> G[Complete] --> H[Learn]
    end

    Broadcast --> Negotiate --> Execute
    Execute -->|Continuous| Broadcast

    style Broadcast fill:#e1f5fe
    style Negotiate fill:#fff3e0
    style Execute fill:#e8f5e9
```

---

## Level 2: Step-by-Step Actions

Detailed walkthrough showing full agent autonomy and machine-speed operation.

```mermaid
flowchart TB
    subgraph Deploy["Agent Deployment (One-time)"]
        D1[Human Sets Autonomy Policy] --> D2[Define Operating Envelope]
        D2 --> D3{Policy Elements}
        D3 --> D4[Resource Commitments Allowed]
        D3 --> D5[Risk Tolerance Level]
        D3 --> D6[Strategic Objectives]
        D3 --> D7[Emergency Stop Conditions]
        D4 --> D8[Deploy Agent to Network]
        D5 --> D8
        D6 --> D8
        D7 --> D8
        D8 --> D9[Agent Establishes Identity]
        D9 --> D10[Agent Begins Trust Building]
    end

    subgraph Capability["Capability Model (Continuous)"]
        C1[Load Capability Profile] --> C2[Connect to Capability Service]
        C2 --> C3[Real-time Output Translation]
        C3 --> C4[Semantic Matching Queries]
        C4 --> C5[Learn from Exchange Outcomes]
        C5 --> C3
    end

    subgraph Broadcast["Continuous Broadcasting"]
        B1[Monitor All Resources] --> B2[Real-time Surplus Detection]
        B2 --> B2a[Translate to Capability Outputs]
        B2a --> B3[Stream to Discovery Network]
        B3 --> B4[Respond to Discovery Queries]

        B5[Monitor Strategic Needs] --> B6[Real-time Need Detection]
        B6 --> B6a[Resolve to Taxonomy Terms]
        B6a --> B7[Stream to Discovery Network]
        B7 --> B8[Respond to Offering Queries]

        B4 --> B1
        B8 --> B5
    end

    subgraph Discover["Match Discovery"]
        M1[Receive Match Signal] --> M2[Semantic Capability Match]
        M2 --> M3{Capability Fit?}
        M3 -->|No| M4[Pass]
        M3 -->|Yes| M5[Assess Trust Level]
        M5 --> M6{Trust Sufficient?}
        M6 -->|No| M7[Request More Info]
        M6 -->|Yes| M8[Enter Negotiation]
        M7 --> M5
    end

    subgraph Negotiate["Agent-to-Agent Negotiation"]
        N1[Open Negotiation Channel] --> N2[Exchange Proposals]
        N2 --> N3{Counter-offer?}
        N3 -->|Yes| N4[Evaluate Terms]
        N4 --> N5{Within Envelope?}
        N5 -->|Yes| N5a{Within Concentration Limits?}
        N5a -->|Yes| N6[Counter or Accept]
        N5a -->|No| N7a[Decline — At Participation Limit]
        N5 -->|No| N7[Decline Gracefully]
        N6 --> N2
        N3 -->|No - Agreement| N8[Mutual Commitment]
        N8 --> N9[Register with Chain Orchestrator]
    end

    subgraph Execute["Autonomous Execution"]
        E1[Chain Activated] --> E2[Coordinate Execution Plan]
        E2 --> E3{Execution Type}
        E3 -->|Digital| E4[Direct Transfer]
        E3 -->|Physical| E5[Trigger Logistics API]
        E3 -->|Service| E6[Schedule & Execute]
        E4 --> E7[Verify Completion]
        E5 --> E7
        E6 --> E7
        E7 --> E8[Exchange Fulfilment Signals]
        E8 --> E9[Update Local Trust Model]
        E9 --> E10[Report to Network]
    end

    subgraph Learn["Continuous Learning"]
        L1[Analyse Exchange Outcome] --> L2a[Check Governance Constraints]
        L2a --> L2[Update Strategy Model]
        L2 --> L3[Refine Partner Preferences]
        L3 --> L4[Adjust Resource Allocation]
        L4 --> L5[Report to Owner Dashboard]
    end

    Deploy --> Capability
    Capability --> Broadcast
    Broadcast --> Discover
    Discover --> Negotiate
    Negotiate --> Execute
    Execute --> Learn
    Learn --> Capability

    style Deploy fill:#f3e5f5
    style Capability fill:#e8eaf6
    style Broadcast fill:#e1f5fe
    style Discover fill:#fff9c4
    style Negotiate fill:#fff3e0
    style Execute fill:#e8f5e9
    style Learn fill:#e3f2fd
```

---

## Level 3: Technical Flow

API interactions and data flows for fully autonomous agent operation.

```mermaid
sequenceDiagram
    participant AA as Autonomous Agent
    participant BS as Business Systems
    participant API as SEP API
    participant CS as Capability Service
    participant DN as Discovery Network
    participant ME as Matching Engine
    participant TE as Trust Engine
    participant CO as Chain Orchestrator
    participant PA as Partner Agent
    participant HD as Human Dashboard

    Note over AA,HD: === AGENT INITIALISATION ===

    AA->>API: POST /agents/register (autonomous=true)
    API->>TE: Create autonomous agent profile
    TE->>TE: Set initial trust tier (Newcomer — bilateral only)
    TE-->>API: Agent trust established

    Note over AA,HD: === CAPABILITY MODEL SETUP ===

    AA->>CS: POST /capabilities/subscribe
    CS-->>AA: Capability taxonomy + updates stream
    AA->>API: GET /profiles/{owner}/capabilities
    API-->>AA: Owner's capability profile
    AA->>AA: Build local capability model
    API-->>AA: Agent identity + network credentials

    AA->>DN: Subscribe to discovery streams
    DN-->>AA: Connected to mesh network

    Note over AA,HD: === CONTINUOUS OPERATION ===

    par Surplus Broadcasting
        loop Every N seconds
            BS->>AA: Resource state update
            AA->>AA: Calculate surplus delta
            AA->>DN: Publish surplus stream
        end
    and Need Broadcasting
        loop Every N seconds
            BS->>AA: Requirements state
            AA->>AA: Calculate need delta
            AA->>DN: Publish need stream
        end
    and Match Listening
        loop Continuous
            DN->>AA: Match opportunity signal
            AA->>AA: Quick evaluate
            alt Interesting
                AA->>API: GET /matches/{id}/details
            end
        end
    end

    Note over AA,HD: === MATCH EVALUATION ===

    ME->>DN: High-quality match found
    DN->>AA: Match signal (score: 0.87)
    AA->>API: GET /matches/{id}
    API->>TE: Trust check on all parties
    TE-->>API: Trust scores + history
    API-->>AA: Full match details

    AA->>AA: Evaluate against autonomy policy
    Note right of AA: Check:<br/>- Value within limits<br/>- Risk acceptable<br/>- Strategic alignment<br/>- Trust threshold met

    Note over AA,HD: === AGENT-TO-AGENT NEGOTIATION ===

    AA->>PA: Open negotiation channel
    PA-->>AA: Channel accepted

    AA->>PA: Initial proposal
    Note right of AA: {<br/>  offering: {...},<br/>  terms: {...},<br/>  timeline: {...}<br/>}

    PA->>PA: Evaluate proposal
    PA->>AA: Counter-proposal
    Note left of PA: {<br/>  accepted: [...],<br/>  modified: {...},<br/>  rejected: [...]<br/>}

    AA->>AA: Evaluate counter
    AA->>PA: Accept with minor adjustment

    PA->>PA: Final evaluation
    PA->>AA: Agreement confirmed

    par Register Commitments
        AA->>API: POST /commitments
        API->>CO: Register AA commitment
    and
        PA->>API: POST /commitments
        API->>CO: Register PA commitment
    end

    CO->>CO: Validate bilateral agreement
    CO->>AA: Commitment locked
    CO->>PA: Commitment locked

    Note over AA,HD: === AUTONOMOUS EXECUTION ===

    CO->>AA: Execute signal
    CO->>PA: Execute signal

    AA->>PA: Initiate exchange protocol

    alt Digital Asset
        AA->>PA: Transfer payload
        PA->>PA: Verify integrity
        PA->>AA: Receipt confirmed
    else Physical Good
        AA->>BS: Trigger dispatch
        BS-->>AA: Tracking ID
        AA->>PA: Tracking shared
        PA->>PA: Monitor delivery
        PA->>AA: Delivery confirmed
    else Service
        AA->>PA: Service initiation
        AA->>AA: Execute service
        AA->>PA: Service completion proof
        PA->>PA: Verify outcome
        PA->>AA: Fulfilment confirmed
    end

    par Complete Exchange
        AA->>API: POST /exchanges/{id}/complete
        AA->>TE: Submit fulfilment signal for PA
    and
        PA->>API: POST /exchanges/{id}/complete
        PA->>TE: Submit fulfilment signal for AA
    end

    TE->>TE: Process fulfilment signals, update trust
    TE->>DN: Broadcast trust updates

    Note over AA,HD: === LEARNING & REPORTING ===

    AA->>AA: Analyse exchange performance
    AA->>AA: Update partner model
    AA->>AA: Refine strategy weights
    AA->>AA: Check concentration limits

    AA->>HD: Push: Exchange summary
    Note right of HD: Dashboard shows:<br/>- Exchange completed<br/>- Value exchanged<br/>- Trust delta<br/>- Strategy performance
```

```mermaid
erDiagram
    HUMAN_OWNER ||--|| AUTONOMY_POLICY : defines
    AUTONOMY_POLICY ||--|| AUTONOMOUS_AGENT : governs

    AUTONOMY_POLICY {
        json resource_limits
        float risk_tolerance
        json strategic_objectives
        json emergency_stops
    }

    AUTONOMOUS_AGENT ||--o{ SURPLUS_STREAM : broadcasts
    AUTONOMOUS_AGENT ||--o{ NEED_STREAM : broadcasts
    AUTONOMOUS_AGENT ||--o{ NEGOTIATION : participates_in

    SURPLUS_STREAM {
        string resource_type
        float quantity
        datetime valid_until
        int sequence_number
    }

    NEED_STREAM {
        string need_type
        json requirements
        string urgency
        int sequence_number
    }

    NEGOTIATION ||--o{ PROPOSAL : contains
    NEGOTIATION ||--|| AGREEMENT : produces

    PROPOSAL {
        string from_agent
        json terms
        datetime proposed_at
        string status
    }

    AGREEMENT {
        string id
        json final_terms
        datetime agreed_at
        string commitment_hash
    }

    AGREEMENT ||--|| AUTONOMOUS_EXECUTION : triggers

    AUTONOMOUS_EXECUTION {
        string id
        string execution_type
        json proof_of_completion
        datetime completed_at
    }

    AUTONOMOUS_AGENT ||--o{ FULFILMENT_SIGNAL : exchanges
    AUTONOMOUS_AGENT ||--|| STRATEGY_MODEL : maintains

    FULFILMENT_SIGNAL {
        string partner_id
        string fulfilment
        json evidence
    }

    STRATEGY_MODEL {
        json partner_preferences
        json resource_allocation
        float performance_score
    }
```

---

## Autonomy Safeguards

```mermaid
flowchart TB
    subgraph Safeguards["Built-in Safeguards"]
        S1[Operating Envelope]
        S2[Emergency Stop]
        S3[Trust Floor]
        S4[Value Ceiling]
        S5[Rate Limiting]
        S6[Concentration Limit]
    end

    subgraph Triggers["Trigger Conditions"]
        T1["Resource commitment > policy limit"]
        T2["Human sends stop signal"]
        T3["Partner trust drops below threshold"]
        T4["Single exchange value too high"]
        T5["Too many exchanges in period"]
        T6["Participation exceeds governance-set cap"]
    end

    subgraph Actions["Automatic Actions"]
        A1[Reject proposal]
        A2[Halt all activity]
        A3[Require human approval]
        A4[Escalate to human]
        A5[Pause & notify]
        A6[Auto-decline proposals]
    end

    S1 --> T1 --> A1
    S2 --> T2 --> A2
    S3 --> T3 --> A3
    S4 --> T4 --> A4
    S5 --> T5 --> A5
    S6 --> T6 --> A6

    style Safeguards fill:#ffcdd2
    style Actions fill:#c8e6c9
```

---

## Human Oversight

| Aspect | Agent Autonomy | Human Role |
|--------|----------------|------------|
| **Policy** | Operates within | Defines boundaries |
| **Strategy** | Executes & optimises | Sets objectives |
| **Partners** | Discovers & negotiates | Reviews trust reports |
| **Exchanges** | Full autonomy | Dashboard monitoring |
| **Learning** | Continuous adaptation | Reviews performance |
| **Emergency** | Respects stop signals | Can halt instantly |
| **Governance** | Respects concentration limits and advisory body decisions | Advisory body sets limits; dashboard monitoring |

---

## Phase 2 vs Phase 3 Comparison

```mermaid
flowchart LR
    subgraph P2["Phase 2: Delegated"]
        P2A[Agent Proposes] --> P2B[Human Approves] --> P2C[Agent Executes]
    end

    subgraph P3["Phase 3: Autonomous"]
        P3A[Agent Discovers] --> P3B[Agent Negotiates] --> P3C[Agent Commits] --> P3D[Agent Executes]
    end

    style P2 fill:#fff3e0
    style P3 fill:#e8f5e9
```

| Aspect | Phase 2 Delegated | Phase 3 Autonomous |
|--------|--------------|---------------|
| **Speed** | Human-limited | Machine-speed |
| **Scale** | Bounded by attention | Unbounded parallel |
| **Risk** | Human validated | Policy validated |
| **Trust** | Human reputation | Agent reputation |
| **Learning** | Human feedback | Autonomous adaptation |

---

## Network Effects

```mermaid
flowchart TB
    subgraph Network["Autonomous Agent Network"]
        A1((Agent A))
        A2((Agent B))
        A3((Agent C))
        A4((Agent D))
        A5((Agent E))
    end

    A1 <-->|negotiate| A2
    A2 <-->|negotiate| A3
    A3 <-->|negotiate| A4
    A4 <-->|negotiate| A5
    A5 <-->|negotiate| A1
    A1 <-->|negotiate| A3
    A2 <-->|negotiate| A4

    subgraph Emergence["Emergent Properties"]
        E1[Complex chain discovery]
        E2[Governance-bounded optimisation]
        E3[Trust network formation]
        E4[Resource flow optimisation]
    end

    Network --> Emergence
```
