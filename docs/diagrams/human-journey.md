# Human User Journey

The complete exchange flow from a human participant's perspective, shown at three levels of detail.

---

## Level 1: Overview

A high-level view of the human experience using SEP.

```mermaid
journey
    title Human Exchange Journey
    section Register
      Create account: 5: Human
      Describe business: 4: Human
      Verify identity: 4: Human
    section Define Capabilities
      Describe what you can offer: 4: Human
      AI suggests outputs: 5: Human, AI
      Review and confirm: 5: Human
    section Declare
      Post surplus with outputs: 5: Human
      Post current needs: 5: Human
    section Match
      Review proposed matches: 4: Human, SEP
      Evaluate exchange chains: 3: Human
      Accept or decline: 5: Human
    section Exchange
      Coordinate delivery: 4: Human, Partner
      Confirm receipt: 5: Human
      Signal fulfilment: 5: Human
    section Review
      View matching profile: 4: Human, SEP
```

```mermaid
flowchart LR
    subgraph Define["1. Define"]
        A1[Describe Capacity] --> A2[AI Suggests Outputs]
    end

    subgraph Declare["2. Declare"]
        B[Post Surplus] --> C[Post Needs]
    end

    subgraph Match["3. Match"]
        D[Review Proposals] --> E[Accept Match]
    end

    subgraph Exchange["4. Exchange"]
        F[Deliver/Receive] --> G[Confirm & Signal Fulfilment]
    end

    Define --> Declare --> Match --> Exchange

    style Define fill:#f3e5f5
    style Declare fill:#e1f5fe
    style Match fill:#fff3e0
    style Exchange fill:#e8f5e9
```

---

## Level 2: Step-by-Step Actions

Detailed walkthrough of each stage with decision points.

```mermaid
flowchart TB
    subgraph Onboarding["Onboarding (One-time)"]
        O1[Create Account] --> O2{Verify Identity}
        O2 -->|Business Registration| O2a[Submit Registration]
        O2 -->|Professional Credentials| O2b[Submit Credentials]
        O2 -->|Online Presence| O2c[Link Established Presence]
        O2a --> O3[Complete Cultural Onboarding]
        O2b --> O3
        O2c --> O3
        O3 --> O4[Set Preferences & Constraints]
        O4 --> O5[Assigned to Newcomer Tier]
    end

    subgraph Capability["Capability Definition (AI-Assisted)"]
        C1[Describe What You Do] --> C2[AI Asks Clarifying Questions]
        C2 --> C3[Provide Context/Portfolio]
        C3 --> C4[AI Suggests Capability Outputs]
        C4 --> C5{Review Suggestions}
        C5 -->|Add/Remove| C6[Adjust Output List]
        C6 --> C5
        C5 -->|Confirm| C7[Capability Profile Saved]
    end

    subgraph Surplus["Posting Surplus"]
        S1[Identify Unused Capacity] --> S2[Select Surplus Type]
        S2 --> S3{Service, Physical, or Access?}
        S3 -->|Service| S4[Select From Capability Profile]
        S3 -->|Physical| S5[Describe Items & Quantities]
        S3 -->|Access| S6[Specify Resource & Terms]
        S4 --> S4a[Choose Which Outputs Available Now]
        S4a --> S7[Set Availability Window]
        S5 --> S7
        S6 --> S7
        S7 --> S8[Add Constraints & Preferences]
        S8 --> S9[Publish Offering]
    end

    subgraph Needs["Posting Needs"]
        N1[Identify Current Need] --> N2[Select Need Type]
        N2 --> N3{Service, Physical, or Access?}
        N3 -->|Service| N4[Describe Required Outcome]
        N3 -->|Physical| N5[Specify Items & Quantities]
        N3 -->|Access| N6[Define Resource Requirements]
        N4 --> N7[Set Urgency & Timeframe]
        N5 --> N7
        N6 --> N7
        N7 --> N8[Add Constraints & Preferences]
        N8 --> N9[Publish Need]
    end

    subgraph Matching["Receiving & Evaluating Matches"]
        M1[Receive Match Notification] --> M2[Review Proposed Chain]
        M2 --> M3[Examine All Parties]
        M3 --> M4[Check Trust Scores]
        M4 --> M4a[View Matching Profile]
        M4a --> M5{Acceptable?}
        M5 -->|No| M6[Decline with Reason]
        M5 -->|Yes| M7[Accept Match]
        M6 --> M1
        M7 --> M8[Wait for All Confirmations]
        M8 --> M9{All Confirmed?}
        M9 -->|No| M10[Chain Cancelled]
        M9 -->|Yes| M11[Chain Activated]
    end

    subgraph Execution["Completing Exchange"]
        E1[Chain Activated] --> E2[Coordinate with Partner]
        E2 --> E3{Your Role?}
        E3 -->|Provider| E4[Deliver Surplus]
        E3 -->|Recipient| E5[Receive & Verify]
        E4 --> E6[Mark as Delivered]
        E5 --> E7[Confirm Receipt]
        E6 --> E8[Await Confirmation]
        E7 --> E8
        E8 --> E8a{Stuck?}
        E8a -->|Yes| E8b[Flag as Stuck]
        E8b --> E8c[Escalation Process]
        E8a -->|No| E9[Signal Fulfilment]
        E9 --> E10[Exchange Complete]
    end

    Onboarding --> Capability
    Capability --> Surplus
    Surplus --> Needs
    Needs --> Matching
    Matching --> Execution

    style Onboarding fill:#f3e5f5
    style Capability fill:#e8eaf6
    style Surplus fill:#e1f5fe
    style Needs fill:#fff3e0
    style Matching fill:#fce4ec
    style Execution fill:#e8f5e9
```

---

## Level 3: Technical Flow

API interactions and data flows during the human journey.

```mermaid
sequenceDiagram
    participant H as Human User
    participant UI as User Interface
    participant API as SEP API
    participant CS as Capability Service
    participant DS as Discovery Service
    participant ME as Matching Engine
    participant TE as Trust Engine
    participant CO as Chain Orchestrator
    participant P as Partner(s)

    Note over H,P: === CAPABILITY DEFINITION ===

    H->>UI: "I'm a designer with spare time"
    UI->>CS: POST /capabilities/expand
    Note right of CS: Context: role, experience,<br/>portfolio links
    CS->>CS: Analyse profile
    CS->>CS: Match to taxonomy
    CS->>CS: Generate output suggestions
    CS-->>UI: Suggested outputs with estimates
    Note right of UI: • Logo design (4-6 hrs)<br/>• Pitch deck (6-10 hrs)<br/>• Brand guidelines (8-12 hrs)
    UI-->>H: "Here's what your time could become"
    H->>UI: Review, adjust, confirm
    UI->>API: POST /profiles/{id}/capabilities
    API-->>UI: Capability profile saved
    UI-->>H: "Ready to post surplus"

    Note over H,P: === POSTING SURPLUS ===

    H->>UI: Select outputs available now
    UI->>API: POST /offerings
    Note right of API: Includes capability_mapping<br/>from profile
    API->>API: Validate against schema
    API->>DS: Index offering with outputs
    DS->>TE: Fetch trust score
    TE-->>DS: Trust tier & limits
    DS-->>API: Indexed (searchable by output)
    API-->>UI: Offering ID + status
    UI-->>H: Confirmation shown

    Note over H,P: === POSTING NEED ===

    H->>UI: "I need a logo"
    UI->>CS: POST /capabilities/resolve
    CS->>CS: Match to taxonomy
    CS-->>UI: Resolved: logo_design
    UI->>API: POST /needs
    Note right of API: capability_sought: [logo_design]
    API->>API: Validate against schema
    API->>DS: Index need
    DS->>ME: Trigger match search
    ME->>DS: Query offerings with logo_design output
    DS-->>ME: Candidate offerings
    ME->>ME: Build exchange graph
    ME->>ME: Find viable chains
    ME->>TE: Score chains by trust
    TE-->>ME: Trust-weighted scores
    ME-->>API: Potential matches
    API-->>UI: Matches available
    UI-->>H: Notification

    Note over H,P: === REVIEWING MATCH ===

    H->>UI: Open match details
    UI->>API: GET /matches/{id}
    API->>TE: Get trust details for parties
    TE-->>API: Trust scores & history
    API-->>UI: Full match details
    UI-->>H: Display chain visualization

    H->>UI: Accept match
    UI->>API: POST /matches/{id}/accept
    API->>CO: Record acceptance
    CO->>CO: Check all parties

    alt All parties accepted
        CO->>API: Chain activated
        API-->>UI: Chain status: ACTIVE
        CO->>P: Notify all parties
    else Waiting for others
        CO-->>API: Awaiting confirmations
        API-->>UI: Chain status: PENDING
    end

    Note over H,P: === EXECUTING EXCHANGE ===

    H->>UI: Mark as delivered
    UI->>API: POST /exchanges/{id}/delivered
    API->>CO: Update delivery status
    CO->>P: Notify recipient

    P->>API: POST /exchanges/{id}/confirmed
    API->>CO: Update confirmation
    CO->>TE: Exchange completed signal

    H->>UI: Signal fulfilment (Yes/Partially/No)
    UI->>API: POST /exchanges/{id}/fulfilment
    API->>TE: Update trust scores
    TE->>TE: Recalculate trust tiers
    TE-->>API: Updated trust state
    API-->>UI: Exchange complete
    UI-->>H: Summary & updated trust

    alt Exchange stalled
        H->>UI: Flag as stuck
        UI->>API: POST /exchanges/{id}/stuck
        API->>CO: Initiate stuck workflow
        CO->>P: Notify partner
        Note right of CO: Escalation path:<br/>Partner conversation →<br/>Accept outcome →<br/>Governance escalation
    end

    Note over H,P: === MATCHING PROFILE ===

    H->>UI: View matching profile
    UI->>API: GET /profiles/{id}/matching
    API->>TE: Get trust details
    TE-->>API: Scores, tier, history
    API->>ME: Get match factors
    ME-->>API: Recent match decisions & reasons
    API-->>UI: Full matching profile
    UI-->>H: Display scores, factors, decisions
```

```mermaid
erDiagram
    HUMAN ||--o{ OFFERING : posts
    HUMAN ||--o{ NEED : posts
    HUMAN ||--o{ MATCH_RESPONSE : provides

    OFFERING {
        string id
        string type
        json details
        json constraints
        datetime availability_start
        datetime availability_end
    }

    NEED {
        string id
        string type
        json details
        json constraints
        string urgency
    }

    MATCH_RESPONSE {
        string match_id
        string decision
        datetime responded_at
    }

    MATCH ||--|{ CHAIN_LINK : contains
    MATCH ||--o{ MATCH_RESPONSE : receives

    CHAIN_LINK {
        string provider_id
        string recipient_id
        string offering_id
        string need_id
    }

    EXCHANGE ||--|| MATCH : executes
    EXCHANGE ||--o{ FULFILMENT_SIGNAL : records

    EXCHANGE {
        string id
        string status
        datetime activated_at
        datetime completed_at
    }

    FULFILMENT_SIGNAL {
        string party_id
        string signal
        string notes
    }
```

---

## Key Human Touchpoints

| Stage | Human Action | System Support |
|-------|--------------|----------------|
| **Declare Surplus** | Describe what's available | Structured forms, type guidance |
| **Declare Need** | Describe what's needed | Templates, constraint helpers |
| **Review Match** | Evaluate proposed chain | Trust scores, party profiles |
| **Decide** | Accept or decline | Clear chain visualisation |
| **Coordinate** | Arrange delivery details | Contact facilitation |
| **Confirm** | Verify exchange completed | Simple confirmation flow |
| **Rate** | Signal fulfilment | Yes/Partially/No with optional notes |
| **Review** | View matching profile | Scores, factors, match reasons |

---

## Human Decision Points

```mermaid
flowchart LR
    subgraph Decisions["Key Decisions"]
        D1{What to share?}
        D2{Accept this chain?}
        D3{Delivered as agreed?}
    end

    D1 -->|Surplus type & quantity| Post
    D2 -->|Trust level acceptable| Accept
    D3 -->|Fulfilment signal| Rate

    Post[Offering Published]
    Accept[Chain Activated]
    Rate[Trust Updated]
```
