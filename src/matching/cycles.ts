/**
 * Cycle detection for SEP matching algorithm.
 *
 * Finds all simple cycles (closed loops) in the exchange graph,
 * representing viable multi-party exchange chains.
 *
 * Algorithm: DFS-based enumeration with pruning.
 */

import type { NetworkGraph } from './graph.js';

/**
 * Options for cycle finding.
 */
export interface CycleFinderOptions {
  /** Minimum cycle length (default: 2 for direct swaps) */
  minLength: number;
  /** Maximum cycle length (default: 6) */
  maxLength: number;
  /** Minimum edge weight to consider (0-1, default: 0.1) */
  minEdgeWeight: number;
  /** Maximum number of cycles to return (default: 100) */
  maxResults: number;
  /** Optional: only find cycles containing this participant */
  mustIncludeParticipant?: string;
}

/**
 * A discovered cycle in the graph.
 */
export interface FoundCycle {
  /** Participant IDs in order around the cycle */
  nodeIds: string[];
  /** Edge IDs in order around the cycle */
  edgeIds: string[];
  /** Sum of edge weights (higher = better quality matches) */
  totalWeight: number;
  /** Average edge weight */
  averageWeight: number;
}

/**
 * Default options for cycle finding.
 */
export const DEFAULT_CYCLE_OPTIONS: CycleFinderOptions = {
  minLength: 2,
  maxLength: 6,
  minEdgeWeight: 0.1,
  maxResults: 100,
};

/**
 * Find all simple cycles in the exchange graph.
 *
 * A simple cycle visits each node at most once and returns to the start.
 * This is the core algorithm for discovering viable exchange chains.
 *
 * @param graph - The exchange network graph
 * @param options - Cycle finding options
 * @returns Array of found cycles, sorted by average weight (best first)
 */
export function findCycles(
  graph: NetworkGraph,
  options: Partial<CycleFinderOptions> = {}
): FoundCycle[] {
  const opts: CycleFinderOptions = { ...DEFAULT_CYCLE_OPTIONS, ...options };
  const results: FoundCycle[] = [];
  const seenCycles = new Set<string>(); // Deduplicate rotations

  // Get all nodes to start DFS from each
  const allNodes = graph.getAllNodes();

  for (const startNode of allNodes) {
    // If we're looking for cycles with a specific participant, skip others as start
    if (opts.mustIncludeParticipant && startNode.participantId !== opts.mustIncludeParticipant) {
      continue;
    }

    // DFS from this node
    findCyclesFromNode(
      graph,
      startNode.participantId,
      [startNode.participantId],
      [],
      new Set([startNode.participantId]),
      0, // accumulated weight
      opts,
      results,
      seenCycles
    );

    // Check if we've hit the result limit
    if (results.length >= opts.maxResults) {
      break;
    }
  }

  // Sort by average weight (best first)
  results.sort((a, b) => b.averageWeight - a.averageWeight);

  return results.slice(0, opts.maxResults);
}

/**
 * Recursive DFS to find cycles starting from a specific node.
 */
function findCyclesFromNode(
  graph: NetworkGraph,
  startNodeId: string,
  currentPath: string[],
  currentEdges: string[],
  visitedInPath: Set<string>,
  accumulatedWeight: number,
  options: CycleFinderOptions,
  results: FoundCycle[],
  seenCycles: Set<string>
): void {
  // Stop if we've collected enough cycles
  if (results.length >= options.maxResults) {
    return;
  }

  // Stop if path is too long
  if (currentPath.length > options.maxLength) {
    return;
  }

  const currentNodeId = currentPath[currentPath.length - 1];

  // Get outgoing edges from current node
  const outgoingEdges = graph.getOutgoingEdges(currentNodeId);

  for (const edge of outgoingEdges) {
    // Skip weak edges
    if (edge.weight < options.minEdgeWeight) {
      continue;
    }

    const nextNodeId = edge.toId;

    // Check if we've found a cycle back to start
    if (nextNodeId === startNodeId) {
      // Ensure cycle meets minimum length
      if (currentPath.length >= options.minLength) {
        const newWeight = accumulatedWeight + edge.weight;
        const cycle: FoundCycle = {
          nodeIds: [...currentPath],
          edgeIds: [...currentEdges, edge.id],
          totalWeight: newWeight,
          averageWeight: newWeight / currentPath.length,
        };

        // Check if we've seen this cycle before (as a rotation)
        const cycleKey = getCycleKey(cycle.nodeIds);
        if (!seenCycles.has(cycleKey)) {
          seenCycles.add(cycleKey);
          results.push(cycle);
        }
      }
      continue;
    }

    // Skip if we'd revisit a node (not a simple cycle)
    if (visitedInPath.has(nextNodeId)) {
      continue;
    }

    // Recurse to next node
    visitedInPath.add(nextNodeId);
    findCyclesFromNode(
      graph,
      startNodeId,
      [...currentPath, nextNodeId],
      [...currentEdges, edge.id],
      visitedInPath,
      accumulatedWeight + edge.weight,
      options,
      results,
      seenCycles
    );
    visitedInPath.delete(nextNodeId);
  }
}

/**
 * Generate a canonical key for a cycle to detect rotations.
 *
 * Two cycles are the same if one is a rotation of the other:
 * [A, B, C] and [B, C, A] represent the same cycle.
 *
 * We normalize by starting from the lexicographically smallest element.
 */
function getCycleKey(nodeIds: string[]): string {
  if (nodeIds.length === 0) {
    return '';
  }

  // Find the lexicographically smallest starting point
  let minIndex = 0;
  for (let i = 1; i < nodeIds.length; i++) {
    if (nodeIds[i] < nodeIds[minIndex]) {
      minIndex = i;
    }
  }

  // Rotate to start from minimum
  const rotated = [
    ...nodeIds.slice(minIndex),
    ...nodeIds.slice(0, minIndex),
  ];

  return rotated.join('→');
}

/**
 * Find cycles that include all specified participants.
 *
 * Useful for checking if specific participants can form a chain together.
 *
 * @param graph - The exchange network graph
 * @param requiredParticipants - Participant IDs that must all be in the cycle
 * @param options - Additional cycle finding options
 * @returns Cycles containing all required participants
 */
export function findCyclesIncludingAll(
  graph: NetworkGraph,
  requiredParticipants: string[],
  options: Partial<CycleFinderOptions> = {}
): FoundCycle[] {
  // First find cycles starting from first required participant
  const opts: CycleFinderOptions = {
    ...DEFAULT_CYCLE_OPTIONS,
    ...options,
    mustIncludeParticipant: requiredParticipants[0],
    // Allow enough length for all participants
    minLength: Math.max(options.minLength ?? 2, requiredParticipants.length),
  };

  const allCycles = findCycles(graph, opts);

  // Filter to only those containing all required participants
  const requiredSet = new Set(requiredParticipants);
  return allCycles.filter((cycle) => {
    const cycleSet = new Set(cycle.nodeIds);
    for (const required of requiredSet) {
      if (!cycleSet.has(required)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get statistics about cycles in the graph.
 *
 * Useful for understanding the matching potential of the network.
 */
export interface CycleStats {
  totalCyclesFound: number;
  cyclesByLength: Record<number, number>;
  averageWeight: number;
  bestCycle: FoundCycle | null;
  participantCoverage: number; // Fraction of participants in at least one cycle
}

export function getCycleStats(
  graph: NetworkGraph,
  options: Partial<CycleFinderOptions> = {}
): CycleStats {
  const cycles = findCycles(graph, { ...options, maxResults: 1000 });

  const cyclesByLength: Record<number, number> = {};
  let totalWeight = 0;
  const participantsInCycles = new Set<string>();

  for (const cycle of cycles) {
    const len = cycle.nodeIds.length;
    cyclesByLength[len] = (cyclesByLength[len] ?? 0) + 1;
    totalWeight += cycle.averageWeight;
    for (const nodeId of cycle.nodeIds) {
      participantsInCycles.add(nodeId);
    }
  }

  const totalNodes = graph.nodeCount();

  return {
    totalCyclesFound: cycles.length,
    cyclesByLength,
    averageWeight: cycles.length > 0 ? totalWeight / cycles.length : 0,
    bestCycle: cycles.length > 0 ? cycles[0] : null,
    participantCoverage: totalNodes > 0 ? participantsInCycles.size / totalNodes : 0,
  };
}
