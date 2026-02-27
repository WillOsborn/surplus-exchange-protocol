# Multi-Party Chain Discovery Algorithm

**Status**: Complete
**Last Updated**: 2026-02-12
**Implementation**: `src/matching/cycles.ts`

---

## Overview

The chain discovery algorithm finds closed loops of exchanges where every participant both gives and receives, enabling complex matches that humans couldn't compute manually.

**Example chain:**
```
Law Firm → (contract review) → Restaurant
Restaurant → (catering) → Marketing Agency
Marketing Agency → (campaign) → Manufacturer
Manufacturer → (equipment) → Law Firm
```

All four parties benefit. No money changes hands. No debt created.

## Problem Definition

**Input:**
- Set of active capability offerings (what participants have available)
- Set of participant needs (what participants are seeking, explicitly or implicitly)
- Constraints (timing, geography, capacity, preferences)

**Output:**
- Ranked list of viable exchange chains
- Each chain is a closed cycle where every participant:
  - Provides one offering to another participant
  - Receives one offering from another participant (possibly different)

**Objective:**
- Maximise chain completion probability
- Respect all constraints
- Prefer shorter chains (simpler coordination)
- Prefer higher-trust participants (reduce failure risk)

## Data Structures

### Exchange Graph

Model the network as a directed graph:
- **Nodes**: Participants
- **Edges**: Potential exchanges (offering matches need)
- **Edge weights**: Composite score reflecting match quality, trust, constraints

```
Node {
  participant_id: string
  offerings: Offering[]          // What they can provide
  needs: Need[]                  // What they're seeking (explicit or inferred)
  constraints: Constraint[]      // Global constraints (timing, sectors, etc.)
  trust_score: number            // Derived from network position
}

Edge {
  from: participant_id           // Provider
  to: participant_id             // Recipient
  offering_id: string            // Which offering satisfies this edge
  match_score: number            // How well offering matches need
  feasibility_score: number      // Constraint satisfaction
  combined_weight: number        // Overall edge quality
}
```

### Need Representation

Needs can be:
1. **Explicit**: Participant declares "I need contract review"
2. **Implicit**: Inferred from sector, past exchanges, common patterns

```
Need {
  participant_id: string
  description: string            // What they need
  category: string               // service | physical_good | access | space
  urgency: low | medium | high
  constraints: Constraint[]
  source: explicit | inferred
}
```

## Algorithm Phases

### Phase 1: Graph Construction

Build the exchange graph from current offerings and needs.

```
for each offering O:
  for each need N where O could satisfy N:
    if constraints_compatible(O, N):
      score = compute_match_score(O, N)
      add_edge(O.provider, N.participant, O.id, score)
```

**Match scoring considers:**
- Semantic similarity (does "pitch deck design" match "presentation help"?)
- Capacity alignment (does available capacity cover the need?)
- Constraint overlap (timing, geography)
- Trust compatibility (does provider meet recipient's trust threshold?)

### Phase 2: Cycle Detection

Find all simple cycles in the graph up to maximum length.

**Approach**: Modified Johnson's algorithm for finding all elementary cycles, with pruning:

```
function find_cycles(graph, max_length):
  cycles = []
  for each node n in graph:
    find_cycles_from(n, [n], graph, max_length, cycles)
  return cycles

function find_cycles_from(start, path, graph, max_length, cycles):
  if len(path) > max_length:
    return

  current = path[-1]
  for each edge from current to next:
    if next == start and len(path) >= 2:
      cycles.append(path)  // Found a cycle
    elif next not in path:
      find_cycles_from(start, path + [next], graph, max_length, cycles)
```

**Pruning heuristics:**
- Skip edges below minimum combined weight threshold
- Skip paths where cumulative timing constraints can't align
- Skip paths where geographic constraints conflict
- Limit search depth based on participant preferences

### Phase 3: Cycle Scoring

Score each candidate cycle for viability.

```
function score_cycle(cycle):
  // Edge quality
  edge_score = mean(edge.combined_weight for edge in cycle)

  // Trust risk
  min_trust = min(participant.trust_score for participant in cycle)
  trust_penalty = 1 - min_trust  // Weakest link

  // Complexity penalty
  length_penalty = (len(cycle) - 2) * 0.1  // Prefer shorter chains

  // Timing feasibility
  timing_score = compute_timing_alignment(cycle)

  // Final score
  return edge_score - trust_penalty - length_penalty + timing_score
```

### Phase 4: Constraint Validation

For top-scoring cycles, validate detailed constraints.

```
function validate_cycle(cycle):
  // Check timing can be sequenced
  if not can_sequence_timing(cycle):
    return false

  // Check geographic compatibility for physical goods
  for edge in cycle where edge.offering.type == 'physical_good':
    if not transport_feasible(edge):
      return false

  // Check capacity isn't double-committed
  for participant in cycle:
    if offering_already_committed(participant.offering):
      return false

  return true
```

### Phase 5: Presentation

Present validated cycles to participants for approval.

**Key UX considerations:**
- Show the full chain visually
- Explain each participant's role clearly
- Show trust indicators for each participant
- Allow participants to accept/reject/counter-propose
- Set deadline for responses

## Timing Coordination

Chains must be executable. Timing coordination is critical.

### Sequential vs Parallel Execution

**Sequential**: Each exchange completes before the next starts
- Pro: Simple, clear dependencies
- Con: Slow, one delay cascades

**Parallel**: All exchanges execute simultaneously
- Pro: Fast
- Con: Risk if one fails mid-chain

**Hybrid** (recommended):
- Commitment phase: All parties confirm participation
- Execution phase: Exchanges proceed with defined dependencies
- Completion phase: All parties confirm satisfaction

### Timing Representation

```
ChainTiming {
  commitment_deadline: date      // All must confirm by
  execution_window: {
    start: date
    end: date
  }
  edge_timings: [
    {
      edge_id: string
      earliest_start: date
      latest_completion: date
      dependencies: edge_id[]     // Must complete first
    }
  ]
}
```

## Handling Physical Goods

Physical goods add complexity: location, transport, storage.

### Transport as Chain Participant

Transport providers can be included in chains:

```
Manufacturer (Leeds) → [needs transport] → Office (London)
Transport Provider (Yorkshire) → [delivery service] → Manufacturer
```

The algorithm should:
1. Identify physical goods edges
2. Check if transport is included in offering
3. If not, attempt to find transport offerings that bridge the gap
4. Add transport provider to chain if needed

### Geographic Clustering

Prefer chains where physical goods stay within transport-feasible regions:

```
function geographic_penalty(cycle):
  physical_edges = [e for e in cycle if e.offering.type == 'physical_good']
  if not physical_edges:
    return 0

  total_distance = sum(distance(e.from.location, e.to.location) for e in physical_edges)
  return total_distance * DISTANCE_PENALTY_FACTOR
```

## Trust Integration

The trust layer influences chain discovery in several ways:

### Minimum Trust Thresholds

Participants can set minimum trust requirements:

```
// Participant preference
min_partner_exchanges: 3  // Only match with participants who've done 3+ exchanges

// During graph construction
if partner.network_position.exchange_partners_count < my_preferences.min_partner_exchanges:
  skip_edge()
```

### Chain Risk Assessment

Longer chains have more failure points:

```
function chain_risk(cycle):
  // Probability all participants complete
  completion_prob = product(
    participant_reliability(p) for p in cycle
  )
  return 1 - completion_prob
```

Where `participant_reliability` is derived from:
- Satisfaction history (especially "not satisfied" signals)
- On-time delivery rate from offerings
- Network position stability

### Newcomer Handling

Probationary participants have restrictions:

```
if participant.status == 'probationary':
  // Limit to shorter chains
  max_chain_length = 3
  // Require at least one established participant
  must_include_established = true
  // Lower priority in matching
  trust_score *= 0.8
```

## Performance Considerations

### Scalability

For a network of N participants:
- Graph construction: O(O × N) where O = offerings
- Cycle detection: Potentially exponential, but pruned heavily
- Practical limit: Process incrementally, cache intermediate results

### Incremental Updates

Don't rebuild entire graph for each change:

```
on_new_offering(offering):
  // Add edges from this offering to existing needs
  for need in matching_needs(offering):
    add_edge(offering.provider, need.participant, offering.id, score)

on_offering_removed(offering):
  // Remove edges involving this offering
  remove_edges_with_offering(offering.id)
  // Invalidate cached cycles containing this offering
  invalidate_cycles_with_offering(offering.id)
```

### Caching Strategy

```
Cache {
  // Short-lived: changes frequently
  edge_scores: Map<edge_id, score>           // TTL: 1 hour

  // Medium-lived: changes with exchanges
  participant_trust: Map<participant_id, score>  // TTL: 1 day

  // Long-lived: computed periodically
  network_clusters: ClusterData              // TTL: 1 week
}
```

## Open Questions

1. **How do we handle partial capacity?** If an offering has "20 hours" but a chain only needs "5 hours", how do we track remaining capacity across multiple chains?

2. **Simultaneous chain participation?** Can one participant be in multiple active chains at once? What are the commitment mechanics?

3. **Chain amendment?** If one participant drops out, can the algorithm propose a replacement, or does the whole chain fail?

4. **Proactive matching?** Should the algorithm notify participants of potential matches, or wait for explicit need declarations?

5. **Learning from outcomes?** How do we improve match scoring based on which proposed chains actually complete successfully?

## Future Enhancements

- **ML-based match scoring**: Learn from successful exchanges what makes a good match
- **Predictive needs**: Infer needs from participant patterns before explicit declaration
- **Dynamic pricing of chain slots**: If chains are scarce, how do we prioritise?
- **Cross-network federation**: How do chains work across multiple SEP implementations?
