/**
 * Chain scoring for SEP matching algorithm.
 *
 * Ranks discovered cycles by viability, considering:
 * - Match quality (how well offerings match needs)
 * - Trust risk (weakest participant in chain)
 * - Complexity (length penalty)
 * - Timing feasibility
 * - Geographic factors (physical goods)
 */

import type { NetworkGraph } from './graph.js';
import type { FoundCycle } from './cycles.js';

/**
 * Detailed score breakdown for a chain.
 */
export interface ChainScore {
  /** Overall viability score (0-1) */
  overall: number;
  /** Component scores */
  breakdown: {
    /** Average edge match quality */
    matchQuality: number;
    /** Trust-based risk (1 = safest, 0 = highest risk) */
    trustRisk: number;
    /** Complexity penalty (1 = simplest, lower for longer chains) */
    complexity: number;
    /** Timing feasibility (1 = no conflicts, 0 = impossible) */
    timing: number;
    /** Geographic factor (1 = services only, lower for physical goods) */
    geographic: number;
  };
  /** Human-readable risk factors */
  riskFactors: string[];
  /** Human-readable positive factors */
  strengths: string[];
}

/**
 * Options for chain scoring.
 */
export interface ChainScoringOptions {
  /** Weight for match quality in overall score (default: 0.35) */
  matchQualityWeight: number;
  /** Weight for trust risk in overall score (default: 0.30) */
  trustRiskWeight: number;
  /** Weight for complexity in overall score (default: 0.15) */
  complexityWeight: number;
  /** Weight for timing in overall score (default: 0.10) */
  timingWeight: number;
  /** Weight for geographic in overall score (default: 0.10) */
  geographicWeight: number;
  /** Penalty per participant beyond 2 (default: 0.08) */
  lengthPenaltyPerParticipant: number;
  /** Threshold below which trust is flagged as risk (default: 0.3) */
  lowTrustThreshold: number;
}

/**
 * Default scoring options.
 */
export const DEFAULT_SCORING_OPTIONS: ChainScoringOptions = {
  matchQualityWeight: 0.35,
  trustRiskWeight: 0.30,
  complexityWeight: 0.15,
  timingWeight: 0.10,
  geographicWeight: 0.10,
  lengthPenaltyPerParticipant: 0.08,
  lowTrustThreshold: 0.3,
};

/**
 * Score a single chain for viability.
 *
 * @param cycle - The discovered cycle to score
 * @param graph - The network graph containing node/edge details
 * @param options - Scoring options
 * @returns Detailed chain score
 */
export function scoreChain(
  cycle: FoundCycle,
  graph: NetworkGraph,
  options: Partial<ChainScoringOptions> = {}
): ChainScore {
  const opts: ChainScoringOptions = { ...DEFAULT_SCORING_OPTIONS, ...options };

  const riskFactors: string[] = [];
  const strengths: string[] = [];

  // 1. Match Quality - average of edge match scores
  const matchQuality = computeMatchQuality(cycle, graph, strengths);

  // 2. Trust Risk - based on weakest participant
  const trustRisk = computeTrustRisk(cycle, graph, opts, riskFactors, strengths);

  // 3. Complexity - penalise longer chains
  const complexity = computeComplexity(cycle, opts, riskFactors, strengths);

  // 4. Timing - simplified for Phase 1
  const timing = computeTiming(riskFactors, strengths);

  // 5. Geographic - check for physical goods
  const geographic = computeGeographic(cycle, graph, riskFactors);

  // Calculate overall score
  const overall =
    matchQuality * opts.matchQualityWeight +
    trustRisk * opts.trustRiskWeight +
    complexity * opts.complexityWeight +
    timing * opts.timingWeight +
    geographic * opts.geographicWeight;

  return {
    overall,
    breakdown: {
      matchQuality,
      trustRisk,
      complexity,
      timing,
      geographic,
    },
    riskFactors,
    strengths,
  };
}

/**
 * Compute match quality score from edge weights.
 */
function computeMatchQuality(
  cycle: FoundCycle,
  graph: NetworkGraph,
  strengths: string[]
): number {
  if (cycle.edgeIds.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let minScore = 1;

  for (const edgeId of cycle.edgeIds) {
    const edge = graph.getEdge(edgeId);
    if (edge) {
      totalScore += edge.matchScore;
      minScore = Math.min(minScore, edge.matchScore);
    }
  }

  const avgScore = totalScore / cycle.edgeIds.length;

  if (avgScore >= 0.8) {
    strengths.push('Excellent match quality across all exchanges');
  } else if (avgScore >= 0.6) {
    strengths.push('Good match quality');
  }

  return avgScore;
}

/**
 * Compute trust risk score based on weakest participant.
 */
function computeTrustRisk(
  cycle: FoundCycle,
  graph: NetworkGraph,
  options: ChainScoringOptions,
  riskFactors: string[],
  strengths: string[]
): number {
  let minTrust = 1;
  let lowTrustParticipants: string[] = [];

  for (const nodeId of cycle.nodeIds) {
    const node = graph.getNode(nodeId);
    if (node) {
      if (node.trustScore < minTrust) {
        minTrust = node.trustScore;
      }
      if (node.trustScore < options.lowTrustThreshold) {
        lowTrustParticipants.push(nodeId);
      }
    }
  }

  if (lowTrustParticipants.length > 0) {
    riskFactors.push(
      `${lowTrustParticipants.length} participant(s) with low trust scores`
    );
  }

  if (minTrust >= 0.7) {
    strengths.push('All participants have strong trust scores');
  }

  // Return trust score directly (higher = lower risk)
  return minTrust;
}

/**
 * Compute complexity score based on chain length.
 */
function computeComplexity(
  cycle: FoundCycle,
  options: ChainScoringOptions,
  riskFactors: string[],
  strengths: string[]
): number {
  const length = cycle.nodeIds.length;

  // Base score of 1, reduce for each participant beyond 2
  const penalty = Math.max(0, length - 2) * options.lengthPenaltyPerParticipant;
  const score = Math.max(0, 1 - penalty);

  if (length === 2) {
    strengths.push('Direct two-party exchange (simplest)');
  } else if (length === 3) {
    strengths.push('Three-party chain (manageable complexity)');
  } else if (length >= 5) {
    riskFactors.push(`${length}-party chain increases coordination complexity`);
  }

  return score;
}

/**
 * Compute timing feasibility score.
 *
 * For Phase 1, this is simplified - we assume timing works if edges exist.
 * Future versions will check actual date overlaps.
 */
function computeTiming(
  _riskFactors: string[],
  _strengths: string[]
): number {
  // Phase 1: Assume timing is feasible if graph construction allowed the edges
  return 1.0;
}

/**
 * Compute geographic score based on physical goods presence.
 */
function computeGeographic(
  cycle: FoundCycle,
  graph: NetworkGraph,
  riskFactors: string[]
): number {
  let hasPhysicalGoods = false;
  let physicalEdgeCount = 0;

  for (const edgeId of cycle.edgeIds) {
    const edge = graph.getEdge(edgeId);
    if (edge) {
      // Check if this edge's offering is physical goods
      // We'd need to look this up from the node's offerings
      const fromNode = graph.getNode(edge.fromId);
      if (fromNode) {
        const offering = fromNode.offerings.find((o) => o.id === edge.offeringId);
        if (offering && offering.type === 'physical_good') {
          hasPhysicalGoods = true;
          physicalEdgeCount++;
        }
      }
    }
  }

  if (hasPhysicalGoods) {
    riskFactors.push(
      `Includes ${physicalEdgeCount} physical goods exchange(s) requiring logistics`
    );
    // Reduce score slightly for physical goods (logistics complexity)
    return 0.8;
  }

  return 1.0;
}

/**
 * A scored cycle with its viability assessment.
 */
export interface ScoredCycle {
  cycle: FoundCycle;
  score: ChainScore;
}

/**
 * Rank multiple chains by viability.
 *
 * @param cycles - Array of discovered cycles
 * @param graph - The network graph
 * @param options - Scoring options
 * @returns Cycles sorted by overall score (best first)
 */
export function rankChains(
  cycles: FoundCycle[],
  graph: NetworkGraph,
  options: Partial<ChainScoringOptions> = {}
): ScoredCycle[] {
  const scored: ScoredCycle[] = cycles.map((cycle) => ({
    cycle,
    score: scoreChain(cycle, graph, options),
  }));

  // Sort by overall score descending
  scored.sort((a, b) => b.score.overall - a.score.overall);

  return scored;
}

/**
 * Filter chains to only those meeting minimum criteria.
 *
 * @param scoredCycles - Array of scored cycles
 * @param minOverallScore - Minimum overall score (default: 0.3)
 * @param maxRiskFactors - Maximum allowed risk factors (default: 3)
 * @returns Filtered array of viable chains
 */
export function filterViableChains(
  scoredCycles: ScoredCycle[],
  minOverallScore: number = 0.3,
  maxRiskFactors: number = 3
): ScoredCycle[] {
  return scoredCycles.filter(
    (sc) =>
      sc.score.overall >= minOverallScore &&
      sc.score.riskFactors.length <= maxRiskFactors
  );
}

/**
 * Get a human-readable summary of a chain score.
 */
export function summariseChainScore(score: ChainScore): string {
  const overallPercent = Math.round(score.overall * 100);
  const rating =
    overallPercent >= 80
      ? 'Excellent'
      : overallPercent >= 60
        ? 'Good'
        : overallPercent >= 40
          ? 'Fair'
          : 'Poor';

  const lines = [`${rating} (${overallPercent}% viability)`];

  if (score.strengths.length > 0) {
    lines.push('Strengths:');
    for (const s of score.strengths) {
      lines.push(`  + ${s}`);
    }
  }

  if (score.riskFactors.length > 0) {
    lines.push('Risks:');
    for (const r of score.riskFactors) {
      lines.push(`  - ${r}`);
    }
  }

  return lines.join('\n');
}
