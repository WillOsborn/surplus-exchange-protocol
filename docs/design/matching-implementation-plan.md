# Matching Algorithm Implementation Plan

**Status**: Complete
**Last Updated**: 2026-02-12
**Based on**: [chain-discovery.md](./chain-discovery.md)
**Implementation**: `src/matching/`

## Overview

This plan breaks the matching algorithm into implementable components with clear interfaces.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Matching Engine                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐     │
│  │   Network   │───►│   Cycle     │───►│   Chain             │     │
│  │   Graph     │    │   Finder    │    │   Scorer/Ranker     │     │
│  └─────────────┘    └─────────────┘    └─────────────────────┘     │
│         ▲                                         │                  │
│         │                                         ▼                  │
│  ┌─────────────┐                         ┌─────────────────────┐   │
│  │   Match     │                         │   Chain             │   │
│  │   Scorer    │                         │   Proposals         │   │
│  └─────────────┘                         └─────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Network Graph (`src/matching/graph.ts`)

Data structure representing the exchange network.

```typescript
interface NetworkNode {
  participantId: string;
  offerings: OfferingReference[];
  needs: NeedReference[];
  trustScore: number;
  constraints: ParticipantConstraints;
}

interface NetworkEdge {
  id: string;
  fromId: string;        // Provider
  toId: string;          // Recipient
  offeringId: string;
  needId?: string;       // If matching explicit need
  matchScore: number;    // 0-1: how well offering matches need
  feasibility: number;   // 0-1: constraint satisfaction
  weight: number;        // Combined score for pathfinding
}

class NetworkGraph {
  addNode(participant: Participant, offerings: Offering[], needs: Need[]): void;
  removeNode(participantId: string): void;
  addEdge(edge: NetworkEdge): void;
  removeEdge(edgeId: string): void;

  getOutgoingEdges(nodeId: string): NetworkEdge[];
  getIncomingEdges(nodeId: string): NetworkEdge[];
  getNode(nodeId: string): NetworkNode | undefined;

  // For cycle finding
  getNeighbours(nodeId: string): string[];
}
```

### 2. Match Scorer (`src/matching/scorer.ts`)

Computes how well an offering matches a need.

```typescript
interface MatchScore {
  overall: number;        // 0-1
  breakdown: {
    semantic: number;     // Description/capability match
    capacity: number;     // Capacity covers need
    timing: number;       // Timing alignment
    geographic: number;   // Location compatibility
    trust: number;        // Trust threshold met
  };
  reasons: string[];      // Human-readable match explanation
}

function scoreMatch(
  offering: CapabilityOffering,
  need: Need,
  providerTrust: number,
  recipientConstraints: Constraints
): MatchScore;

// For AI-assisted matching (future)
function semanticSimilarity(
  offeringDescription: string,
  needDescription: string,
  offeringCapabilities: string[],
  needCapabilityLinks: string[]
): number;
```

### 3. Cycle Finder (`src/matching/cycles.ts`)

Finds all simple cycles in the graph.

```typescript
interface CycleFinderOptions {
  minLength: number;      // Minimum 2 (direct swap)
  maxLength: number;      // Default 6 for established, 3 for probationary
  minEdgeWeight: number;  // Skip weak edges
  maxResults: number;     // Limit results
}

interface FoundCycle {
  nodeIds: string[];      // Participants in order
  edgeIds: string[];      // Edges in order
  totalWeight: number;    // Sum of edge weights
}

function findCycles(
  graph: NetworkGraph,
  options: CycleFinderOptions
): FoundCycle[];

// Internal: DFS-based cycle detection
function findCyclesFrom(
  graph: NetworkGraph,
  startNode: string,
  currentPath: string[],
  visitedInPath: Set<string>,
  options: CycleFinderOptions,
  results: FoundCycle[]
): void;
```

### 4. Chain Scorer (`src/matching/chain-scorer.ts`)

Ranks found cycles by viability.

```typescript
interface ChainScore {
  overall: number;
  breakdown: {
    matchQuality: number;    // Average edge match score
    trustRisk: number;       // Weakest participant
    complexity: number;      // Length penalty
    timing: number;          // Timing feasibility
    geographic: number;      // Physical goods penalty
  };
  riskFactors: string[];     // Warnings
}

function scoreChain(
  cycle: FoundCycle,
  graph: NetworkGraph
): ChainScore;

function rankChains(
  cycles: FoundCycle[],
  graph: NetworkGraph
): Array<{ cycle: FoundCycle; score: ChainScore }>;
```

### 5. Chain Builder (`src/matching/chain-builder.ts`)

Converts scored cycles into chain proposals.

```typescript
function buildChainProposal(
  cycle: FoundCycle,
  score: ChainScore,
  graph: NetworkGraph
): ExchangeChain;

function computeTiming(
  cycle: FoundCycle,
  graph: NetworkGraph
): ChainTiming;
```

### 6. Matching Engine (`src/matching/engine.ts`)

Orchestrates the full matching process.

```typescript
interface MatchingOptions {
  participantId?: string;  // Find chains for specific participant
  maxResults: number;
  includeRiskAssessment: boolean;
}

interface MatchingResult {
  chains: Array<{
    chain: ExchangeChain;
    score: ChainScore;
  }>;
  searchMetrics: {
    nodesSearched: number;
    cyclesFound: number;
    cyclesScored: number;
    searchTimeMs: number;
  };
}

class MatchingEngine {
  constructor(graph: NetworkGraph);

  // Main entry point
  findChains(options: MatchingOptions): MatchingResult;

  // Graph maintenance
  onOfferingAdded(offering: CapabilityOffering): void;
  onOfferingRemoved(offeringId: string): void;
  onNeedAdded(need: Need): void;
  onNeedRemoved(needId: string): void;
  onParticipantUpdated(participant: Participant): void;
}
```

## Implementation Order

### Step 1: Test Data
Create realistic example data to drive development.

**Files:**
- `examples/matching/participants.json` - 6-8 example participants
- `examples/matching/offerings.json` - 2-3 offerings per participant
- `examples/matching/needs.json` - 1-2 needs per participant

**Scenario:** Professional services cluster (law, accounting, marketing, design, catering, IT)

### Step 2: Graph Data Structure
Implement the core graph with add/remove/query operations.

**File:** `src/matching/graph.ts`

**Tests:** Node/edge CRUD, neighbour queries

### Step 3: Simple Match Scorer
Basic scoring without AI - keyword matching, constraint checking.

**File:** `src/matching/scorer.ts`

**Tests:** Obvious matches score high, incompatible offerings score low

### Step 4: Cycle Detection
DFS-based cycle finder with length limits.

**File:** `src/matching/cycles.ts`

**Tests:** Find known cycles in test graph, respect length limits

### Step 5: Chain Scoring
Rank cycles by viability.

**File:** `src/matching/chain-scorer.ts`

**Tests:** Higher trust scores better, shorter chains preferred

### Step 6: Integration
Wire components together in matching engine.

**File:** `src/matching/engine.ts`

**Tests:** End-to-end matching on test data

### Step 7: Demonstration
Create runnable demo showing matching in action.

**File:** `src/examples/match-demo.ts`

## Simplifications for Phase 1

To keep the initial implementation tractable:

1. **No AI semantic matching** - Use keyword/category overlap instead
2. **No partial capacity** - Offerings are all-or-nothing
3. **No geographic distance calculation** - Just region matching
4. **No timing overlap calculation** - Just check availability windows overlap
5. **No caching** - Rebuild graph fresh each time
6. **Single-threaded** - No parallel search

## Success Criteria

The implementation is successful when:

1. Given test data with known viable chains, the algorithm finds them
2. Chains are ranked sensibly (shorter, higher-trust chains rank higher)
3. Impossible chains (constraint violations) are not proposed
4. Demo script produces readable output showing the matching process

## File Structure

```
src/
├── matching/
│   ├── index.ts           # Re-exports
│   ├── graph.ts           # NetworkGraph class
│   ├── scorer.ts          # Match scoring
│   ├── cycles.ts          # Cycle detection
│   ├── chain-scorer.ts    # Chain ranking
│   ├── chain-builder.ts   # Build proposals
│   └── engine.ts          # Orchestration
│
examples/
├── matching/
│   ├── participants.json
│   ├── offerings.json
│   ├── needs.json
│   └── expected-chains.md # Document expected results
│
src/examples/
└── match-demo.ts          # Runnable demonstration
```

## Delegation Plan

This work can be parallelised:

| Task | Can Delegate? | Dependencies | Notes |
|------|---------------|--------------|-------|
| Test data creation | Yes | None | Creative, bounded scope |
| Graph implementation | Yes | None | Pure data structure |
| Match scorer | Yes | None | Self-contained logic |
| Cycle detection | Yes | Graph | Algorithm implementation |
| Chain scorer | Yes | Cycles | Scoring logic |
| Engine integration | No | All above | Needs full context |
| Demo script | No | All above | Needs full context |

Recommend: Create test data first (validates the concept), then implement graph + scorer in parallel, then cycles + chain-scorer, then integrate.
