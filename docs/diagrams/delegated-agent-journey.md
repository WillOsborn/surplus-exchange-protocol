# Delegated Agent Journey (Phase 2)

The complete exchange flow from a delegated agent's perspective, where the agent proposes and humans approve. Shown at three levels of detail.

---

## Level 1: Overview

A high-level view of the delegated agent experience using SEP.

```mermaid
journey
    title Delegated Agent Exchange Journey
    section Setup
      Agent configured: 5: Human
      Capability profile imported: 4: Human, Agent
      Delegation boundaries set: 4: Human
      Agent connected to SEP: 5: Agent
    section Monitor
      Monitor surplus capacity: 5: Agent
      Auto-translate to outputs: 5: Agent, Capability Service
      Monitor emerging needs: 5: Agent
      Auto-publish updates: 4: Agent
    section Propose
      Discover potential matches: 5: Agent, SEP
      Evaluate match quality: 4: Agent
      Propose to human: 3: Agent, Human
    section Execute
      Human approves: 5: Human
      Coordinate exchange: 4: Agent, Partner
      Report fulfilment: 5: Agent
```

```mermaid
flowchart LR
    subgraph Setup["1. Setup"]
        A1[Import Capabilities] --> A2[Set Boundaries]
    end

    subgraph Monitor["2. Monitor"]
        B1[Detect Surplus] --> B2[Translate to Outputs]
    end

    subgraph Propose["3. Propose"]
        C[Find Matches] --> D[Present to Human]
    end

    subgraph Approve["4. Approve"]
        E[Human Reviews] --> F[Human Decides]
    end

    subgraph Execute["5. Execute"]
        G[Coordinate] --> H[Report]
    end

    Setup --> Monitor --> Propose --> Approve --> Execute

    style Setup fill:#f3e5f5
    style Monitor fill:#e1f5fe
    style Propose fill:#fff3e0
    style Approve fill:#fce4ec
    style Execute fill:#e8f5e9
```

---

## Level 2: Step-by-Step Actions

Detailed walkthrough of each stage showing agent autonomy and human checkpoints.

```mermaid
flowchart TB
    subgraph Setup["Agent Setup (One-time)"]
        S1[Human Configures Agent] --> S2[Set Delegation Boundaries]
        S2 --> S3{Boundary Types}
        S3 --> S4[Value Limits]
        S3 --> S5[Category Restrictions]
        S3 --> S6[Partner Whitelist]
        S3 --> S7[Time Constraints]
        S4 --> S8[Agent Registers with SEP]
        S5 --> S8
        S6 --> S8
        S7 --> S8
        S8 --> S9[Agent Receives Credentials]
    end

    subgraph Capability["Capability Setup (One-time)"]
        C1[Import Human's Capability Profile] --> C2[Or: Infer from Business Data]
        C2 --> C3[Query Capability Service]
        C3 --> C4[Generate Output Mappings]
        C4 --> C5[Human Reviews & Approves]
        C5 --> C6[Capability Profile Stored]
    end

    subgraph Monitor["Continuous Monitoring"]
        M1[Connect to Business Systems] --> M2[Monitor Inventory/Capacity]
        M2 --> M3{Surplus Detected?}
        M3 -->|Yes| M4[Query Capability Service]
        M3 -->|No| M2
        M4 --> M4a[Translate Capacity to Outputs]
        M4a --> M4b[Auto-Publish with Outputs]
        M4b --> M5[Update SEP Registry]

        M6[Monitor Business Needs] --> M7{New Need Detected?}
        M7 -->|Yes| M7a[Resolve Need to Taxonomy]
        M7 -->|No| M6
        M7a --> M8[Auto-Publish Need]
        M8 --> M9[Update SEP Registry]
    end

    subgraph Discover["Match Discovery"]
        D1[SEP Notifies of Potential Match] --> D2[Agent Retrieves Match Details]
        D2 --> D3[Evaluate Against Boundaries]
        D3 --> D4{Within Boundaries?}
        D4 -->|No| D5[Auto-Decline]
        D4 -->|Yes| D6[Score Match Quality]
        D6 --> D7[Prepare Recommendation]
    end

    subgraph Propose["Propose to Human"]
        P1[Format Match Summary] --> P2[Calculate Benefit Analysis]
        P2 --> P3[Add Risk Assessment]
        P3 --> P4[Send to Human]
        P4 --> P5{Human Response}
        P5 -->|Approve| P6[Submit Acceptance to SEP]
        P5 -->|Reject| P7[Record Rejection Reason]
        P5 -->|Modify| P8[Adjust & Resubmit]
        P7 --> D1
        P8 --> P4
    end

    subgraph Execute["Execute Exchange"]
        E1[Chain Activated] --> E2[Coordinate with Partner Agent]
        E2 --> E3{Delivery Type}
        E3 -->|Digital| E4[Initiate Transfer]
        E3 -->|Physical| E5[Schedule Logistics]
        E3 -->|Service| E6[Book Time Slot]
        E4 --> E7[Monitor Completion]
        E5 --> E7
        E6 --> E7
        E7 --> E8[Confirm to SEP]
        E8 --> E9[Report to Human]
        E9 --> E10[Update Business Systems]
    end

    Setup --> Capability
    Capability --> Monitor
    Monitor --> Discover
    Discover --> Propose
    Propose --> Execute

    style Setup fill:#f3e5f5
    style Capability fill:#e8eaf6
    style Monitor fill:#e1f5fe
    style Discover fill:#fff3e0
    style Propose fill:#fce4ec
    style Execute fill:#e8f5e9
```

---

## Level 3: Technical Flow

API interactions and data flows for delegated agent operation.

```mermaid
sequenceDiagram
    participant BS as Business Systems
    participant DA as Delegated Agent
    participant API as SEP API
    participant CS as Capability Service
    participant DS as Discovery Service
    participant ME as Matching Engine
    participant TE as Trust Engine
    participant CO as Chain Orchestrator
    participant H as Human Owner
    participant PA as Partner Agent

    Note over BS,PA: === AGENT REGISTRATION ===

    H->>DA: Configure delegation boundaries
    DA->>API: POST /agents/register
    API->>TE: Create agent trust profile
    TE-->>API: Agent trust initialised (Newcomer tier)
    Note right of TE: Starts at Newcomer tier<br/>(bilateral-only, 1 concurrent)<br/>unless human owner has vouch
    API-->>DA: Agent credentials + capability token

    Note over BS,PA: === CAPABILITY SETUP ===

    alt Import from human profile
        DA->>API: GET /profiles/{owner}/capabilities
        API-->>DA: Existing capability mappings
    else Infer from business data
        DA->>BS: Query staff skills, services offered
        BS-->>DA: Business context data
        DA->>CS: POST /capabilities/expand
        Note right of CS: Analyses business context,<br/>generates output mappings
        CS-->>DA: Suggested capability mappings
        DA->>H: "Review these capability outputs"
        H-->>DA: Approved (with adjustments)
    end
    DA->>API: POST /agents/{id}/capabilities
    API-->>DA: Capability profile stored

    Note over BS,PA: === SURPLUS MONITORING ===

    loop Continuous Monitoring
        BS->>DA: Inventory/capacity update
        DA->>DA: Detect surplus threshold
        alt Surplus detected
            DA->>CS: POST /capabilities/translate
            Note right of CS: "20hrs design" →<br/>["logo", "pitch_deck", ...]
            CS-->>DA: Translated outputs
            DA->>API: POST /offerings (with outputs)
            API->>DS: Index offering by outputs
            DS-->>API: Indexed (searchable)
            API-->>DA: Offering active
        end
    end

    Note over BS,PA: === NEED MONITORING ===

    loop Continuous Monitoring
        BS->>DA: Requirement update
        DA->>DA: Detect unmet need
        alt Need detected
            DA->>CS: POST /capabilities/resolve
            Note right of CS: "need a logo" →<br/>["logo_design"]
            CS-->>DA: Resolved taxonomy terms
            DA->>API: POST /needs (with resolved terms)
            API->>DS: Index need
            DS->>ME: Trigger matching
            ME-->>DS: Matches queued
            DS-->>API: Indexed
            API-->>DA: Need active
        end
    end

    Note over BS,PA: === MATCH EVALUATION ===

    ME->>API: Match found
    API->>DA: WebSocket: match notification
    DA->>API: GET /matches/{id}
    API->>TE: Get chain trust scores
    TE-->>API: Trust assessment
    API-->>DA: Full match details

    DA->>DA: Check delegation boundaries

    alt Outside boundaries
        DA->>API: POST /matches/{id}/decline
        API->>CO: Record decline
    else Within boundaries
        DA->>DA: Calculate recommendation score
        DA->>DA: Prepare human summary
    end

    Note over BS,PA: === HUMAN APPROVAL ===

    DA->>H: Push notification: "Match proposal"
    Note right of H: Summary includes:<br/>- What you give<br/>- What you get<br/>- Who's involved<br/>- Trust scores<br/>- Agent recommendation

    H->>DA: Review details

    alt Approved
        H->>DA: Approve
        DA->>API: POST /matches/{id}/accept
        API->>CO: Record acceptance
        CO->>CO: Check all parties
        CO-->>API: Chain status
        API-->>DA: Confirmation
        DA->>H: "Accepted, awaiting others"
    else Rejected
        H->>DA: Reject (with reason)
        DA->>API: POST /matches/{id}/decline
        DA->>DA: Learn from rejection
    else Modified
        H->>DA: Counter-proposal
        DA->>API: POST /matches/{id}/counter
        API->>CO: Route to other parties
    end

    Note over BS,PA: === CHAIN EXECUTION ===

    CO->>API: All parties confirmed
    API->>DA: Chain activated
    DA->>PA: Coordinate delivery

    alt Digital delivery
        DA->>PA: Transfer data/access
        PA-->>DA: Received confirmation
    else Physical delivery
        DA->>PA: Propose logistics
        PA-->>DA: Logistics confirmed
        DA->>BS: Schedule pickup/delivery
    else Service delivery
        DA->>PA: Propose time slot
        PA-->>DA: Slot confirmed
        DA->>BS: Block calendar
    end

    DA->>API: POST /exchanges/{id}/completed
    API->>CO: Update status
    CO->>TE: Exchange completed signal

    DA->>H: Exchange complete notification

    alt Exchange stalled
        DA->>H: Exchange appears stuck
        H->>DA: Flag as stuck
        DA->>API: POST /exchanges/{id}/stuck
        API->>CO: Initiate stuck workflow
    end

    H->>DA: Fulfilment signal (Yes/Partially/No)
    DA->>API: POST /exchanges/{id}/fulfilment
    API->>TE: Update trust scores

    DA->>BS: Update inventory/records
```

```mermaid
erDiagram
    HUMAN_OWNER ||--|| DELEGATED_AGENT : configures
    DELEGATED_AGENT ||--o{ DELEGATION_BOUNDARY : has

    DELEGATION_BOUNDARY {
        string type
        json constraints
        boolean enabled
    }

    DELEGATED_AGENT ||--o{ AUTO_OFFERING : publishes
    DELEGATED_AGENT ||--o{ AUTO_NEED : publishes
    DELEGATED_AGENT ||--o{ MATCH_PROPOSAL : creates

    AUTO_OFFERING {
        string id
        string source_system
        json trigger_condition
        datetime auto_published
    }

    AUTO_NEED {
        string id
        string source_system
        json trigger_condition
        datetime auto_published
    }

    MATCH_PROPOSAL {
        string match_id
        float recommendation_score
        string risk_assessment
        string status
    }

    MATCH_PROPOSAL ||--|| HUMAN_DECISION : requires

    HUMAN_DECISION {
        string decision
        string reason
        datetime decided_at
    }
```

---

## Delegation Boundaries

```mermaid
flowchart TB
    subgraph Boundaries["Agent Delegation Boundaries"]
        B1[Value Limits]
        B2[Category Restrictions]
        B3[Partner Whitelist]
        B4[Time Constraints]
        B5[Frequency Limits]
    end

    subgraph Examples["Example Configurations"]
        E1["Max £500 per exchange"]
        E2["Only IT services & office supplies"]
        E3["Only pre-approved partners"]
        E4["Mon-Fri, 9am-5pm only"]
        E5["Max 3 exchanges per week"]
    end

    B1 --- E1
    B2 --- E2
    B3 --- E3
    B4 --- E4
    B5 --- E5
```

---

## Human Checkpoints

| Stage | Agent Autonomy | Human Checkpoint |
|-------|----------------|------------------|
| **Setup** | None | Configure boundaries |
| **Monitoring** | Full - auto-detect surplus/needs | Review logs (optional) |
| **Publishing** | Full - auto-publish within bounds | Notification only |
| **Discovery** | Full - evaluate all matches | None |
| **Proposal** | Prepare recommendation | **Approve/Reject required** |
| **Execution** | Full - coordinate delivery | Notification only |
| **Completion** | Report to systems | Provide fulfilment signal (Yes/Partially/No) |

---

## Agent Decision Logic

```mermaid
flowchart LR
    subgraph Autonomous["Agent Decides Alone"]
        A1[Publish surplus]
        A2[Publish need]
        A3[Decline out-of-bounds]
        A4[Coordinate logistics]
    end

    subgraph RequiresHuman["Requires Human"]
        H1[Accept match]
        H2[Approve new partner]
        H3[Exceed value limit]
        H4[Signal fulfilment]
    end

    style Autonomous fill:#e8f5e9
    style RequiresHuman fill:#fce4ec
```
