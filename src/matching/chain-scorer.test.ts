/**
 * Tests for chain scoring in the SEP matching algorithm.
 *
 * Covers scoreChain, rankChains, filterViableChains, and summariseChainScore.
 */

import { describe, it, expect } from 'vitest';
import {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
} from './graph.js';
import { findCycles, type FoundCycle } from './cycles.js';
import {
  scoreChain,
  rankChains,
  filterViableChains,
  summariseChainScore,
  DEFAULT_SCORING_OPTIONS,
} from './chain-scorer.js';
import {
  buildTriangleGraph,
  buildComplexGraph,
} from '../__test-helpers__/graphs.js';

// =============================================================================
// Helpers
// =============================================================================

/** Minimal constraints for inline test nodes. */
const defaultConstraints = {
  maxChainLength: 6,
  minPartnerExchanges: 0,
  preferredSectors: [] as string[],
  excludedSectors: [] as string[],
  geographic: ['UK'],
};

/**
 * Build a simple service-only triangle (A->B->C->A) with configurable
 * matchScores and trustScores for comparison tests.
 */
function buildScoringTriangle(opts: {
  matchScores: [number, number, number];
  trustScores: [number, number, number];
}): { graph: NetworkGraph; cycle: FoundCycle } {
  const graph = new NetworkGraph();
  const [msAB, msBC, msCA] = opts.matchScores;
  const [tsA, tsB, tsC] = opts.trustScores;

  graph.addNode({
    participantId: 'A', trustScore: tsA,
    offerings: [{ id: 'o-A', type: 'service', title: 'Design', availableCapacity: '10h' }],
    needs: [{ id: 'n-A', type: 'service', title: 'Accounting', description: 'Monthly' }],
    constraints: { ...defaultConstraints },
  });
  graph.addNode({
    participantId: 'B', trustScore: tsB,
    offerings: [{ id: 'o-B', type: 'service', title: 'Development', availableCapacity: '20h' }],
    needs: [{ id: 'n-B', type: 'service', title: 'Design', description: 'UI' }],
    constraints: { ...defaultConstraints },
  });
  graph.addNode({
    participantId: 'C', trustScore: tsC,
    offerings: [{ id: 'o-C', type: 'service', title: 'Accounting', availableCapacity: '5h' }],
    needs: [{ id: 'n-C', type: 'service', title: 'Development', description: 'Backend' }],
    constraints: { ...defaultConstraints },
  });

  graph.addEdge({ id: 'e-AB', fromId: 'A', toId: 'B', offeringId: 'o-A', needId: 'n-B', matchScore: msAB, feasibility: 0.8, weight: 0.8 });
  graph.addEdge({ id: 'e-BC', fromId: 'B', toId: 'C', offeringId: 'o-B', needId: 'n-C', matchScore: msBC, feasibility: 0.8, weight: 0.8 });
  graph.addEdge({ id: 'e-CA', fromId: 'C', toId: 'A', offeringId: 'o-C', needId: 'n-A', matchScore: msCA, feasibility: 0.8, weight: 0.8 });

  const cycle: FoundCycle = {
    nodeIds: ['A', 'B', 'C'],
    edgeIds: ['e-AB', 'e-BC', 'e-CA'],
    totalWeight: 2.4,
    averageWeight: 0.8,
  };

  return { graph, cycle };
}

/**
 * Build a triangle where one edge involves a physical_good offering.
 */
function buildPhysicalGoodTriangle(): { graph: NetworkGraph; cycle: FoundCycle } {
  const graph = new NetworkGraph();

  graph.addNode({
    participantId: 'A', trustScore: 0.9,
    offerings: [{ id: 'o-A', type: 'physical_good', title: 'Office Equipment', availableCapacity: '10 units' }],
    needs: [{ id: 'n-A', type: 'service', title: 'Accounting', description: 'Monthly' }],
    constraints: { ...defaultConstraints },
  });
  graph.addNode({
    participantId: 'B', trustScore: 0.8,
    offerings: [{ id: 'o-B', type: 'service', title: 'Development', availableCapacity: '20h' }],
    needs: [{ id: 'n-B', type: 'physical_good', title: 'Equipment', description: 'Office kit' }],
    constraints: { ...defaultConstraints },
  });
  graph.addNode({
    participantId: 'C', trustScore: 0.7,
    offerings: [{ id: 'o-C', type: 'service', title: 'Accounting', availableCapacity: '5h' }],
    needs: [{ id: 'n-C', type: 'service', title: 'Development', description: 'Backend' }],
    constraints: { ...defaultConstraints },
  });

  graph.addEdge({ id: 'e-AB', fromId: 'A', toId: 'B', offeringId: 'o-A', needId: 'n-B', matchScore: 0.8, feasibility: 0.8, weight: 0.8 });
  graph.addEdge({ id: 'e-BC', fromId: 'B', toId: 'C', offeringId: 'o-B', needId: 'n-C', matchScore: 0.8, feasibility: 0.8, weight: 0.8 });
  graph.addEdge({ id: 'e-CA', fromId: 'C', toId: 'A', offeringId: 'o-C', needId: 'n-A', matchScore: 0.8, feasibility: 0.8, weight: 0.8 });

  const cycle: FoundCycle = {
    nodeIds: ['A', 'B', 'C'],
    edgeIds: ['e-AB', 'e-BC', 'e-CA'],
    totalWeight: 2.4,
    averageWeight: 0.8,
  };

  return { graph, cycle };
}

/**
 * Build a direct 2-node swap (A<->B) for comparison with 3-node chains.
 */
function buildTwoNodeSwap(opts: {
  matchScores: [number, number];
  trustScores: [number, number];
}): { graph: NetworkGraph; cycle: FoundCycle } {
  const graph = new NetworkGraph();
  const [msAB, msBA] = opts.matchScores;
  const [tsA, tsB] = opts.trustScores;

  graph.addNode({
    participantId: 'A', trustScore: tsA,
    offerings: [{ id: 'o-A', type: 'service', title: 'Design', availableCapacity: '10h' }],
    needs: [{ id: 'n-A', type: 'service', title: 'Development', description: 'Web dev' }],
    constraints: { ...defaultConstraints },
  });
  graph.addNode({
    participantId: 'B', trustScore: tsB,
    offerings: [{ id: 'o-B', type: 'service', title: 'Development', availableCapacity: '20h' }],
    needs: [{ id: 'n-B', type: 'service', title: 'Design', description: 'UI' }],
    constraints: { ...defaultConstraints },
  });

  graph.addEdge({ id: 'e-AB', fromId: 'A', toId: 'B', offeringId: 'o-A', needId: 'n-B', matchScore: msAB, feasibility: 0.8, weight: 0.8 });
  graph.addEdge({ id: 'e-BA', fromId: 'B', toId: 'A', offeringId: 'o-B', needId: 'n-A', matchScore: msBA, feasibility: 0.8, weight: 0.8 });

  const cycle: FoundCycle = {
    nodeIds: ['A', 'B'],
    edgeIds: ['e-AB', 'e-BA'],
    totalWeight: 1.6,
    averageWeight: 0.8,
  };

  return { graph, cycle };
}

// =============================================================================
// scoreChain — behavioural tests
// =============================================================================

describe('scoreChain', () => {
  describe('behavioural comparisons', () => {
    it('chain with higher edge matchScores scores higher on match quality', () => {
      const high = buildScoringTriangle({
        matchScores: [0.9, 0.9, 0.9],
        trustScores: [0.8, 0.8, 0.8],
      });
      const low = buildScoringTriangle({
        matchScores: [0.4, 0.4, 0.4],
        trustScores: [0.8, 0.8, 0.8],
      });

      const highScore = scoreChain(high.cycle, high.graph);
      const lowScore = scoreChain(low.cycle, low.graph);

      // Sanity: inputs actually differ
      expect(high.cycle.edgeIds).toEqual(low.cycle.edgeIds);
      expect(high.graph.getEdge('e-AB')!.matchScore).not.toBe(
        low.graph.getEdge('e-AB')!.matchScore
      );

      expect(highScore.breakdown.matchQuality).toBeGreaterThan(
        lowScore.breakdown.matchQuality
      );
      expect(highScore.overall).toBeGreaterThan(lowScore.overall);
    });

    it('chain with lower minimum trustScore scores lower on trust risk', () => {
      const highTrust = buildScoringTriangle({
        matchScores: [0.8, 0.8, 0.8],
        trustScores: [0.9, 0.9, 0.9],
      });
      const lowTrust = buildScoringTriangle({
        matchScores: [0.8, 0.8, 0.8],
        trustScores: [0.9, 0.2, 0.9],
      });

      const highTrustScore = scoreChain(highTrust.cycle, highTrust.graph);
      const lowTrustScore = scoreChain(lowTrust.cycle, lowTrust.graph);

      // Sanity: trust scores actually differ
      expect(highTrust.graph.getNode('B')!.trustScore).not.toBe(
        lowTrust.graph.getNode('B')!.trustScore
      );

      expect(highTrustScore.breakdown.trustRisk).toBeGreaterThan(
        lowTrustScore.breakdown.trustRisk
      );
    });

    it('longer chain scores lower on complexity than shorter chain', () => {
      const short = buildTwoNodeSwap({
        matchScores: [0.8, 0.8],
        trustScores: [0.8, 0.8],
      });
      const long = buildScoringTriangle({
        matchScores: [0.8, 0.8, 0.8],
        trustScores: [0.8, 0.8, 0.8],
      });

      const shortScore = scoreChain(short.cycle, short.graph);
      const longScore = scoreChain(long.cycle, long.graph);

      // Sanity: chain lengths actually differ
      expect(short.cycle.nodeIds.length).not.toBe(long.cycle.nodeIds.length);

      expect(shortScore.breakdown.complexity).toBeGreaterThan(
        longScore.breakdown.complexity
      );
    });

    it('chain with physical_good scores lower on geographic than services-only chain', () => {
      const servicesOnly = buildScoringTriangle({
        matchScores: [0.8, 0.8, 0.8],
        trustScores: [0.8, 0.8, 0.8],
      });
      const withPhysical = buildPhysicalGoodTriangle();

      const servicesScore = scoreChain(servicesOnly.cycle, servicesOnly.graph);
      const physicalScore = scoreChain(withPhysical.cycle, withPhysical.graph);

      // Sanity: offering types actually differ
      expect(servicesOnly.graph.getNode('A')!.offerings[0].type).toBe('service');
      expect(withPhysical.graph.getNode('A')!.offerings[0].type).toBe('physical_good');

      expect(servicesScore.breakdown.geographic).toBeGreaterThan(
        physicalScore.breakdown.geographic
      );
    });

    it('low-trust participant appears in riskFactors', () => {
      const { graph, cycle } = buildScoringTriangle({
        matchScores: [0.8, 0.8, 0.8],
        trustScores: [0.9, 0.1, 0.9], // B has very low trust
      });

      const score = scoreChain(cycle, graph);

      expect(score.riskFactors.length).toBeGreaterThan(0);
      const riskText = score.riskFactors.join(' ');
      expect(riskText).toContain('low trust');
    });

    it('short high-quality chain populates strengths', () => {
      const { graph, cycle } = buildTwoNodeSwap({
        matchScores: [0.95, 0.95],
        trustScores: [0.9, 0.9],
      });

      const score = scoreChain(cycle, graph);

      expect(score.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('documentation tests', () => {
    it('verifies exact overall score for a known triangle configuration', () => {
      // Documents scoring weights — update if formula changes
      //
      // Triangle: A->B->C->A, all services
      //   matchQuality = avg(0.9, 0.8, 0.7) = 0.8
      //   trustRisk    = min(0.9, 0.8, 0.7) = 0.7
      //   complexity   = 1 - (3-2)*0.08     = 0.92
      //   timing       = 1.0
      //   geographic   = 1.0
      //   overall      = 0.8*0.35 + 0.7*0.30 + 0.92*0.15 + 1.0*0.10 + 1.0*0.10
      //                = 0.28 + 0.21 + 0.138 + 0.10 + 0.10
      //                = 0.828
      const graph = buildTriangleGraph();
      const cycles = findCycles(graph);
      expect(cycles).toHaveLength(1);

      const score = scoreChain(cycles[0], graph);

      expect(score.breakdown.matchQuality).toBeCloseTo(0.8, 4);
      expect(score.breakdown.trustRisk).toBeCloseTo(0.7, 4);
      expect(score.breakdown.complexity).toBeCloseTo(0.92, 4);
      expect(score.breakdown.timing).toBe(1.0);
      expect(score.breakdown.geographic).toBe(1.0);
      expect(score.overall).toBeCloseTo(0.828, 4);
    });

    it('timing always returns 1.0 (Phase 1 placeholder)', () => {
      // Test with multiple different configurations — timing should always be 1.0
      const triangle = buildScoringTriangle({
        matchScores: [0.5, 0.5, 0.5],
        trustScores: [0.5, 0.5, 0.5],
      });
      const swap = buildTwoNodeSwap({
        matchScores: [0.9, 0.9],
        trustScores: [0.9, 0.9],
      });

      const triangleScore = scoreChain(triangle.cycle, triangle.graph);
      const swapScore = scoreChain(swap.cycle, swap.graph);

      expect(triangleScore.breakdown.timing).toBe(1.0);
      expect(swapScore.breakdown.timing).toBe(1.0);
    });
  });
});

// =============================================================================
// rankChains
// =============================================================================

describe('rankChains', () => {
  it('sorts by overall score descending', () => {
    const graph = buildComplexGraph();
    const cycles = findCycles(graph);

    // Sanity: need multiple cycles to test ordering
    expect(cycles.length).toBeGreaterThan(1);

    const ranked = rankChains(cycles, graph);

    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score.overall).toBeGreaterThanOrEqual(
        ranked[i].score.overall
      );
    }
  });

  it('returns ScoredCycle objects with both cycle and score', () => {
    const graph = buildTriangleGraph();
    const cycles = findCycles(graph);

    const ranked = rankChains(cycles, graph);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].cycle).toBeDefined();
    expect(ranked[0].cycle.nodeIds).toBeDefined();
    expect(ranked[0].cycle.edgeIds).toBeDefined();
    expect(ranked[0].score).toBeDefined();
    expect(ranked[0].score.overall).toBeGreaterThan(0);
    expect(ranked[0].score.breakdown).toBeDefined();
    expect(ranked[0].score.riskFactors).toBeDefined();
    expect(ranked[0].score.strengths).toBeDefined();
  });
});

// =============================================================================
// filterViableChains
// =============================================================================

describe('filterViableChains', () => {
  it('filters out chains below minOverallScore', () => {
    const graph = buildComplexGraph();
    const cycles = findCycles(graph);
    const ranked = rankChains(cycles, graph);

    // Use a threshold that filters some but not all
    const allScores = ranked.map((r) => r.score.overall);
    const midpoint = (Math.max(...allScores) + Math.min(...allScores)) / 2;

    const filtered = filterViableChains(ranked, midpoint);

    expect(filtered.length).toBeLessThan(ranked.length);
    for (const sc of filtered) {
      expect(sc.score.overall).toBeGreaterThanOrEqual(midpoint);
    }
  });

  it('filters out chains with too many riskFactors', () => {
    // Build two chains: one clean, one with many risk factors
    // A low-trust + long chain will accumulate risk factors
    const graph = new NetworkGraph();
    for (const id of ['P', 'Q', 'R', 'S', 'T']) {
      graph.addNode({
        participantId: id,
        trustScore: 0.1, // Low trust -> generates risk factor
        offerings: [{ id: `o-${id}`, type: 'service', title: 'Svc', availableCapacity: '10h' }],
        needs: [{ id: `n-${id}`, type: 'service', title: 'Need', description: 'Something' }],
        constraints: { maxChainLength: 6, minPartnerExchanges: 0, preferredSectors: [], excludedSectors: [], geographic: [] },
      });
    }
    // 5-node cycle (generates complexity risk factor too)
    graph.addEdge({ id: 'e-PQ', fromId: 'P', toId: 'Q', offeringId: 'o-P', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });
    graph.addEdge({ id: 'e-QR', fromId: 'Q', toId: 'R', offeringId: 'o-Q', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });
    graph.addEdge({ id: 'e-RS', fromId: 'R', toId: 'S', offeringId: 'o-R', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });
    graph.addEdge({ id: 'e-ST', fromId: 'S', toId: 'T', offeringId: 'o-S', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });
    graph.addEdge({ id: 'e-TP', fromId: 'T', toId: 'P', offeringId: 'o-T', matchScore: 0.5, feasibility: 0.5, weight: 0.5 });

    const cycles = findCycles(graph);
    expect(cycles.length).toBeGreaterThan(0);

    const ranked = rankChains(cycles, graph);

    // The 5-node low-trust chain should have risk factors
    const riskyChain = ranked.find((r) => r.score.riskFactors.length > 0);
    expect(riskyChain).toBeDefined();

    // Filter with maxRiskFactors=0 should exclude it
    const filtered = filterViableChains(ranked, 0, 0);
    for (const sc of filtered) {
      expect(sc.score.riskFactors.length).toBe(0);
    }
  });

  it('keeps chains meeting both minOverallScore and maxRiskFactors criteria', () => {
    const graph = buildTriangleGraph();
    const cycles = findCycles(graph);
    const ranked = rankChains(cycles, graph);

    // The triangle chain (high quality, services-only, all trusted) should pass
    const filtered = filterViableChains(ranked, 0.5, 5);

    expect(filtered.length).toBeGreaterThan(0);
    for (const sc of filtered) {
      expect(sc.score.overall).toBeGreaterThanOrEqual(0.5);
      expect(sc.score.riskFactors.length).toBeLessThanOrEqual(5);
    }
  });
});

// =============================================================================
// summariseChainScore
// =============================================================================

describe('summariseChainScore', () => {
  it('returns "Excellent" for >= 80% and "Poor" for < 40%', () => {
    // High-quality chain -> Excellent
    const { graph: highGraph, cycle: highCycle } = buildTwoNodeSwap({
      matchScores: [0.95, 0.95],
      trustScores: [0.95, 0.95],
    });
    const highScore = scoreChain(highCycle, highGraph);
    // Sanity: verify the overall is indeed >= 0.80
    expect(highScore.overall).toBeGreaterThanOrEqual(0.80);
    const excellentSummary = summariseChainScore(highScore);
    expect(excellentSummary).toContain('Excellent');

    // Low-quality chain -> Poor
    // Note: timing (1.0) and geographic (1.0) have a floor effect, so
    // matchScores and trustScores must be very low to bring overall below 40%.
    const { graph: lowGraph, cycle: lowCycle } = buildScoringTriangle({
      matchScores: [0.05, 0.05, 0.05],
      trustScores: [0.05, 0.05, 0.05],
    });
    const lowScore = scoreChain(lowCycle, lowGraph);
    // Sanity: verify the overall is indeed < 0.40
    expect(lowScore.overall).toBeLessThan(0.40);
    const poorSummary = summariseChainScore(lowScore);
    expect(poorSummary).toContain('Poor');
  });

  it('output includes strengths and risk factors', () => {
    // Chain with both strengths (high match quality) and risks (low trust)
    const { graph, cycle } = buildScoringTriangle({
      matchScores: [0.9, 0.9, 0.9],
      trustScores: [0.9, 0.1, 0.9],
    });
    const score = scoreChain(cycle, graph);

    // Sanity: should have both
    expect(score.strengths.length).toBeGreaterThan(0);
    expect(score.riskFactors.length).toBeGreaterThan(0);

    const summary = summariseChainScore(score);
    expect(summary).toContain('Strengths');
    expect(summary).toContain('Risks');
  });
});
