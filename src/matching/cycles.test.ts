/**
 * Tests for cycle detection in the SEP matching algorithm.
 *
 * Covers findCycles, findCyclesIncludingAll, and getCycleStats.
 */

import { describe, it, expect } from 'vitest';
import { NetworkGraph } from './graph.js';
import {
  findCycles,
  findCyclesIncludingAll,
  getCycleStats,
} from './cycles.js';
import {
  buildTriangleGraph,
  buildLinearGraph,
  buildComplexGraph,
  buildDisconnectedGraph,
  buildBidirectionalTriangle,
} from '../__test-helpers__/graphs.js';

// =============================================================================
// findCycles
// =============================================================================

describe('findCycles', () => {
  describe('basic cycle detection', () => {
    it('finds a 3-node cycle in a triangle graph', () => {
      const graph = buildTriangleGraph();

      const cycles = findCycles(graph);

      expect(cycles).toHaveLength(1);
      expect(cycles[0].nodeIds).toHaveLength(3);
      expect(cycles[0].nodeIds).toContain('A');
      expect(cycles[0].nodeIds).toContain('B');
      expect(cycles[0].nodeIds).toContain('C');
      expect(cycles[0].edgeIds).toHaveLength(3);
    });

    it('returns empty array for an acyclic (linear) graph', () => {
      const graph = buildLinearGraph();

      const cycles = findCycles(graph);

      expect(cycles).toEqual([]);
    });

    it('returns empty array for an empty graph (no nodes, no edges)', () => {
      const graph = new NetworkGraph();

      const cycles = findCycles(graph);

      expect(cycles).toEqual([]);
    });

    it('finds multiple cycles in a complex graph', () => {
      const graph = buildComplexGraph();

      const cycles = findCycles(graph);

      // The complex graph has at least 3 cycles:
      //   A->B->C->A (length 3)
      //   A->B->D->E->A (length 4)
      //   A->B->C->D->E->A (length 5)
      expect(cycles.length).toBeGreaterThanOrEqual(3);

      // Verify that different cycle lengths are represented
      const lengths = new Set(cycles.map((c) => c.nodeIds.length));
      expect(lengths.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('length constraints', () => {
    it('respects minLength (excludes cycles shorter than threshold)', () => {
      const graph = buildDisconnectedGraph();

      // Disconnected graph has 2-node cycles (A<->B, C<->D)
      // Verify they exist with default minLength=2
      const allCycles = findCycles(graph, { minLength: 2 });
      expect(allCycles.length).toBeGreaterThan(0);

      // Now require minLength=3 — should exclude the 2-node cycles
      const longCycles = findCycles(graph, { minLength: 3 });
      expect(longCycles).toEqual([]);
    });

    it('respects maxLength (excludes cycles longer than threshold)', () => {
      const graph = buildComplexGraph();

      // Find all cycles with generous maxLength
      const allCycles = findCycles(graph, { maxLength: 10 });
      const hasLongCycle = allCycles.some((c) => c.nodeIds.length > 3);
      // Sanity: the complex graph does produce cycles longer than 3
      expect(hasLongCycle).toBe(true);

      // Now restrict to maxLength=3
      const shortCycles = findCycles(graph, { maxLength: 3 });
      for (const cycle of shortCycles) {
        expect(cycle.nodeIds.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('edge weight filtering', () => {
    it('respects minEdgeWeight — edge weight exactly equal to threshold passes (>= not >)', () => {
      const graph = new NetworkGraph();

      // Build a triangle where one edge has weight exactly at threshold
      graph.addNode({
        participantId: 'X',
        offerings: [{ id: 'o-X', type: 'service', title: 'Design', availableCapacity: '10h' }],
        needs: [],
        trustScore: 0.8,
        constraints: { maxChainLength: 6, minPartnerExchanges: 0, preferredSectors: [], excludedSectors: [], geographic: [] },
      });
      graph.addNode({
        participantId: 'Y',
        offerings: [{ id: 'o-Y', type: 'service', title: 'Dev', availableCapacity: '10h' }],
        needs: [],
        trustScore: 0.8,
        constraints: { maxChainLength: 6, minPartnerExchanges: 0, preferredSectors: [], excludedSectors: [], geographic: [] },
      });
      graph.addNode({
        participantId: 'Z',
        offerings: [{ id: 'o-Z', type: 'service', title: 'Ops', availableCapacity: '10h' }],
        needs: [],
        trustScore: 0.8,
        constraints: { maxChainLength: 6, minPartnerExchanges: 0, preferredSectors: [], excludedSectors: [], geographic: [] },
      });

      // Edge X->Y has weight exactly 0.5 (the threshold we will set)
      graph.addEdge({ id: 'e-XY', fromId: 'X', toId: 'Y', offeringId: 'o-X', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });
      graph.addEdge({ id: 'e-YZ', fromId: 'Y', toId: 'Z', offeringId: 'o-Y', matchScore: 0.8, feasibility: 0.8, weight: 0.8 });
      graph.addEdge({ id: 'e-ZX', fromId: 'Z', toId: 'X', offeringId: 'o-Z', matchScore: 0.8, feasibility: 0.8, weight: 0.8 });

      // With minEdgeWeight = 0.5, the edge at exactly 0.5 should pass (>= semantics)
      const cycles = findCycles(graph, { minEdgeWeight: 0.5 });
      expect(cycles).toHaveLength(1);

      // With minEdgeWeight = 0.51, the edge at 0.5 should be excluded
      const noCycles = findCycles(graph, { minEdgeWeight: 0.51 });
      expect(noCycles).toEqual([]);
    });
  });

  describe('result limiting', () => {
    it('respects maxResults limit', () => {
      const graph = buildComplexGraph();

      // The complex graph has multiple cycles
      const allCycles = findCycles(graph, { maxResults: 1000 });
      // Sanity: there should be more than 1 cycle
      expect(allCycles.length).toBeGreaterThan(1);

      const limited = findCycles(graph, { maxResults: 1 });
      expect(limited).toHaveLength(1);
    });
  });

  describe('deduplication', () => {
    it('deduplicates rotations: [A,B,C] and [B,C,A] produce a single cycle', () => {
      const graph = buildTriangleGraph();

      // The DFS will start from A, B, and C — but should produce only 1 cycle
      const cycles = findCycles(graph);
      expect(cycles).toHaveLength(1);

      // Verify all three nodes are present (regardless of starting rotation)
      const nodeSet = new Set(cycles[0].nodeIds);
      expect(nodeSet).toEqual(new Set(['A', 'B', 'C']));
    });

    it('does NOT deduplicate opposite-direction cycles: A->B->C->A and A->C->B->A are separate', () => {
      const graph = buildBidirectionalTriangle();

      const cycles = findCycles(graph);

      // Should find at least 2 distinct 3-node cycles (forward and reverse)
      const threeNodeCycles = cycles.filter((c) => c.nodeIds.length === 3);
      expect(threeNodeCycles.length).toBeGreaterThanOrEqual(2);

      // Extract the traversal orders to verify they represent different directions
      const traversalKeys = threeNodeCycles.map((c) => c.nodeIds.join('->'));
      const uniqueKeys = new Set(traversalKeys);
      expect(uniqueKeys.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('sorting', () => {
    it('sorts results by averageWeight descending', () => {
      const graph = buildComplexGraph();

      const cycles = findCycles(graph);

      // Sanity: should have multiple cycles to compare
      expect(cycles.length).toBeGreaterThan(1);

      for (let i = 1; i < cycles.length; i++) {
        expect(cycles[i - 1].averageWeight).toBeGreaterThanOrEqual(
          cycles[i].averageWeight
        );
      }
    });
  });
});

// =============================================================================
// findCyclesIncludingAll
// =============================================================================

describe('findCyclesIncludingAll', () => {
  it('finds a cycle containing all required participants', () => {
    const graph = buildComplexGraph();

    const cycles = findCyclesIncludingAll(graph, ['A', 'B', 'C']);

    expect(cycles.length).toBeGreaterThan(0);
    for (const cycle of cycles) {
      const nodeSet = new Set(cycle.nodeIds);
      expect(nodeSet.has('A')).toBe(true);
      expect(nodeSet.has('B')).toBe(true);
      expect(nodeSet.has('C')).toBe(true);
    }
  });

  it('returns empty array when no cycle contains all required participants', () => {
    const graph = buildDisconnectedGraph();

    // A and C are in separate components — no cycle can contain both
    const cycles = findCyclesIncludingAll(graph, ['A', 'C']);

    expect(cycles).toEqual([]);
  });

  it('adjusts minLength to at least the number of required participants', () => {
    const graph = buildComplexGraph();

    // Require 4 participants: minLength should be raised to at least 4
    const cycles = findCyclesIncludingAll(graph, ['A', 'B', 'D', 'E']);

    for (const cycle of cycles) {
      expect(cycle.nodeIds.length).toBeGreaterThanOrEqual(4);
    }
  });
});

// =============================================================================
// getCycleStats
// =============================================================================

describe('getCycleStats', () => {
  it('returns correct totalCyclesFound and cyclesByLength histogram', () => {
    const graph = buildComplexGraph();

    const stats = getCycleStats(graph);

    expect(stats.totalCyclesFound).toBeGreaterThan(0);

    // The histogram keys should match actual cycle lengths
    let histogramTotal = 0;
    for (const [length, count] of Object.entries(stats.cyclesByLength)) {
      expect(Number(length)).toBeGreaterThanOrEqual(2);
      expect(count).toBeGreaterThan(0);
      histogramTotal += count;
    }
    expect(histogramTotal).toBe(stats.totalCyclesFound);
  });

  it('computes participantCoverage as fraction of nodes in at least one cycle', () => {
    const graph = buildTriangleGraph();

    const stats = getCycleStats(graph);

    // All 3 nodes are in the single cycle, so coverage = 3/3 = 1.0
    expect(stats.participantCoverage).toBeCloseTo(1.0, 4);
  });

  it('returns bestCycle as the cycle with highest averageWeight', () => {
    const graph = buildComplexGraph();

    const stats = getCycleStats(graph);

    expect(stats.bestCycle).not.toBeNull();

    // Verify bestCycle has the highest averageWeight among all found cycles
    // (findCycles sorts by averageWeight descending, and bestCycle is cycles[0])
    const allCycles = findCycles(graph, { maxResults: 1000 });
    expect(stats.bestCycle!.averageWeight).toBeCloseTo(
      allCycles[0].averageWeight,
      4
    );
  });
});
