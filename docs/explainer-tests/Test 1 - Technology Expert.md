# The Surplus Exchange Protocol
## Technical Architecture Overview

### Abstract

SEP is a protocol specification and reference implementation for decentralised multi-party exchange matching. It models business surplus capacity as a directed graph and uses cycle detection algorithms to discover viable exchange chains. Trust is managed through a tiered reputation system with graduated exposure limits and sponsor-backed network entry.

---

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SEP Architecture                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Schemas    │    │   Matching   │    │    Trust     │          │
│  │              │    │              │    │              │          │
│  │ • Need       │    │ • Graph      │    │ • Calculator │          │
│  │ • Offering   │───▶│ • Scorer     │◀───│ • Tiers      │          │
│  │ • Chain      │    │ • Cycles     │    │ • Exposure   │          │
│  │ • Trust      │    │ • Ranker     │    │ • Vouching   │          │
│  │ • Messages   │    │              │    │              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                    Protocol Layer                     │          │
│  │                                                       │          │
│  │  • State Machines (chain/edge lifecycle)             │          │
│  │  • Message Types (announce, propose, confirm, etc.)  │          │
│  │  • Validation Rules                                  │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Data Model

#### Core Schemas (JSON Schema Draft 2020-12)

**Need** (`schemas/need.schema.json`)
```typescript
interface Need {
  id: string;                    // UUID
  type: 'service' | 'physical_good' | 'access' | 'space';
  participant: string;           // Participant ID
  title: string;
  description: string;
  timing?: {
    needed_from?: string;        // ISO 8601
    needed_until?: string;
    flexibility: 'exact' | 'flexible' | 'ongoing';
  };
  capability_links?: {
    explicit_matches?: Array<{
      capability_output: string;
      minimum_proficiency?: string;
    }>;
  };
}
```

**Exchange Chain** (`schemas/exchange-chain.schema.json`)
```typescript
interface ExchangeChain {
  id: string;
  status: 'draft' | 'proposed' | 'confirming' | 'active' |
          'executing' | 'completed' | 'failed' | 'cancelled';
  participants: string[];
  edges: ChainEdge[];
  created_at: string;
  timing: ChainTiming;
}

interface ChainEdge {
  id: string;
  provider: string;
  recipient: string;
  offering_id: string;
  need_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' |
          'delivered' | 'verified' | 'disputed';
  match_score: number;           // 0-1
}
```

---

### Matching Algorithm

#### Graph Construction

The exchange network is modelled as a directed graph:
- **Nodes**: Participants (with offerings, needs, trust scores, constraints)
- **Edges**: Potential matches (offering → need, weighted by match quality)

```typescript
interface NetworkNode {
  participantId: string;
  offerings: OfferingReference[];
  needs: NeedReference[];
  trustScore: number;            // 0-1
  constraints: ParticipantConstraints;
}

interface NetworkEdge {
  id: string;
  fromId: string;                // Provider
  toId: string;                  // Recipient
  offeringId: string;
  needId: string;
  matchScore: number;            // Semantic + feasibility
  weight: number;                // Combined score for pathfinding
}
```

#### Match Scoring

Multi-dimensional scoring with configurable weights:

| Component | Weight | Factors |
|-----------|--------|---------|
| Semantic | 0.35 | Type match, keyword overlap, capability alignment |
| Capacity | 0.20 | Availability, quantity sufficiency |
| Timing | 0.15 | Schedule overlap, flexibility match |
| Geographic | 0.15 | Physical goods logistics, service area |
| Trust | 0.15 | Provider reliability, minimum thresholds |

Deal-breakers (score = 0):
- Trust below participant's minimum threshold
- Geographic constraint violation for physical goods
- No timing overlap

#### Cycle Detection

Exchange chains are cycles in the graph. The algorithm uses DFS-based enumeration:

```typescript
function findCycles(graph: NetworkGraph, options: CycleFinderOptions): FoundCycle[]
```

**Algorithm characteristics:**
- Finds all simple cycles (each node visited at most once)
- Configurable min/max length (default: 2-6 participants)
- Minimum edge weight threshold (default: 0.1)
- Deduplication via canonical cycle keys (rotation-invariant)
- Early termination at result limit

**Complexity:** O(V × (V-1)! / (V-L)!) worst case for cycles of length L, but pruning makes practical performance manageable for typical network sizes.

#### Chain Ranking

Discovered cycles are scored for viability:

```typescript
interface ChainScore {
  overall: number;               // 0-1 weighted composite
  breakdown: {
    matchQuality: number;        // Average edge scores
    trustRisk: number;           // Weakest participant
    complexity: number;          // Length penalty
    timing: number;              // Schedule feasibility
    geographic: number;          // Physical goods factor
  };
  riskFactors: string[];
  strengths: string[];
}
```

**Scoring formula:**
```
overall = matchQuality × 0.35 + trustRisk × 0.30 +
          complexity × 0.15 + timing × 0.10 + geographic × 0.10
```

---

### Trust System

#### Score Computation

```typescript
interface TrustInput {
  satisfactionHistory: {
    asProvider: { total, satisfied, disputed };
    asRecipient: { total, satisfied, disputed };
  };
  networkPosition: {
    partnerCount, repeatPartners, networkAge,
    vouchesReceived, vouchesGiven
  };
  recentActivity: {
    last30Days, last90Days, daysSinceLastExchange
  };
}

function computeTrustScore(input: TrustInput): TrustScore
```

**Component weights:**
- Reliability: 40% (volume-weighted satisfaction rate)
- Experience: 25% (log-scaled exchanges + linear tenure)
- Network strength: 20% (partner diversity + repeat ratio + vouches)
- Recency: 15% (decay function + activity boost)

**Confidence levels:** Low (<5 exchanges), Medium (5-20), High (>20)

#### Tier System

| Tier | Min Score | Min Exchanges | Min Age | Min Partners | Vouch Required |
|------|-----------|---------------|---------|--------------|----------------|
| Probationary | 0.0 | 0 | 0 | 0 | Yes (entry) |
| Established | 0.5 | 5 | 30 days | 3 | No |
| Anchor | 0.8 | 20 | 180 days | 10 | No |

#### Exposure Limits

```typescript
interface ExposureLimits {
  maxSingleExchangeValue: number;
  maxOutstandingValue: number;
  maxChainLength: number;
  maxConcurrentChains: number;
  requiresEscrow: boolean;
  cooldownAfterDispute: number;  // Days
}
```

| Tier | Single | Outstanding | Chain Len | Concurrent | Escrow | Cooldown |
|------|--------|-------------|-----------|------------|--------|----------|
| Probationary | 10 | 20 | 3 | 2 | Yes | 30 days |
| Established | 50 | 150 | 5 | 5 | No | 14 days |
| Anchor | 200 | 500 | 8 | 10 | No | 7 days |

#### Vouching

```typescript
function createVouch(sponsorId, sponsoredId, sponsorTier, existingVouches):
  { vouch: Vouch } | { error: string }
```

- Only Established (max 2) and Anchor (max 5) can vouch
- Vouches expire after 90 days
- Sponsor reputation affected by sponsored behaviour:
  - Excellent: +0.02
  - Good: +0.01
  - Poor: -0.03
  - Problematic: -0.08

---

### Protocol Layer

#### State Machines

**Chain States:**
```
draft → proposed → confirming → active → executing → completed
                      ↓                      ↓
                  cancelled              failed
```

**Edge States:**
```
pending → confirmed → in_progress → delivered → verified
              ↓            ↓            ↓
          cancelled    disputed     disputed
```

#### Message Types

```typescript
type ProtocolMessage =
  | { type: 'announce_offerings'; offerings: Offering[] }
  | { type: 'announce_needs'; needs: Need[] }
  | { type: 'propose_chain'; chain: ExchangeChain }
  | { type: 'confirm_participation'; chainId: string; participantId: string }
  | { type: 'reject_participation'; chainId: string; reason: string }
  | { type: 'mark_delivered'; edgeId: string }
  | { type: 'confirm_receipt'; edgeId: string; satisfaction: 'satisfied' | 'disputed' }
  // ... etc
```

---

### Implementation Stack

**Runtime:** Node.js 18+ (ESM)
**Language:** TypeScript 5.7 (strict mode)
**Schema validation:** AJV (Draft 2020-12)
**Build:** tsc with declaration files

**Project structure:**
```
src/
├── schemas/           # Generated types from JSON Schema
├── matching/
│   ├── graph.ts       # NetworkGraph class
│   ├── scorer.ts      # Match scoring
│   ├── cycles.ts      # Cycle detection
│   └── chain-scorer.ts # Chain ranking
├── trust/
│   ├── calculator.ts  # Trust score computation
│   ├── tiers.ts       # Tier assessment
│   ├── exposure.ts    # Limit enforcement
│   └── vouching.ts    # Sponsor management
├── protocol/
│   ├── state-machine.ts
│   └── message-handler.ts
└── examples/
    ├── match-demo.ts  # Matching demonstration
    └── trust-demo.ts  # Trust system demonstration
```

---

### Performance Characteristics

**Matching demo results (7 participants, 10 offerings, 8 needs):**
- Edges created: 50+ potential matches
- Cycles found: 50 viable chains
- Participant coverage: 100%
- Execution time: <100ms

**Scalability considerations:**
- Cycle detection is exponential in worst case but practical for <1000 participants with appropriate limits
- Graph can be partitioned by geography/sector for larger networks
- Incremental matching possible (delta updates on offerings/needs changes)

---

### Integration Points

**A2A Protocol compatibility:**
```json
{
  "name": "SEP Exchange Agent",
  "description": "Agent for surplus capacity matching",
  "url": "https://agent.example.com",
  "capabilities": {
    "offering_management": true,
    "chain_negotiation": true,
    "satisfaction_reporting": true
  }
}
```

**MCP Tool exposure:**
```typescript
tools: [
  { name: "list_offerings", description: "..." },
  { name: "express_need", description: "..." },
  { name: "find_matches", description: "..." },
  { name: "confirm_chain", description: "..." }
]
```

---

### Current Gaps / Future Work

1. **Networking layer** - No P2P or federated communication yet
2. **Persistence** - In-memory only, needs database integration
3. **Real-time matching** - Currently batch-oriented
4. **Escrow/settlement** - Specified but not implemented
5. **Dispute resolution** - Workflow defined, not coded
6. **Cryptographic identity** - Ed25519 keys specified, not integrated
7. **Rate limiting / DoS protection** - Not implemented
8. **Observability** - No metrics/tracing

---

### Running the Implementation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run matching demo
npm run match

# Run trust demo
npm run trust

# Validate schemas
npm run validate

# Type check
npm run lint
```

---

### Design Decisions

1. **No shared currency** - Avoids regulatory complexity, allows subjective valuation
2. **Cycle-based matching** - Mathematically elegant, removes coincidence-of-wants constraint
3. **Trust as first-class concept** - Enables self-regulation without central authority
4. **Sponsor accountability** - Creates skin-in-the-game for network quality
5. **Graduated exposure** - Limits damage from bad actors while allowing growth
6. **Protocol-first** - Reference implementation, not monolithic application

---

### Summary

SEP is a technically sound implementation of multi-party exchange matching with robust trust mechanisms. The core algorithms (graph construction, cycle detection, chain scoring, trust computation) are complete and demonstrated.

The implementation provides a solid foundation for building user-facing applications, though significant work remains on networking, persistence, and operational infrastructure.

The architecture prioritises composability - the matching and trust systems are independent modules that could be used separately or replaced with alternative implementations while maintaining protocol compatibility.
