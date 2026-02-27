/**
 * SEP Matching Algorithm
 *
 * Multi-party exchange chain discovery through graph-based cycle detection.
 * This is SEP's core differentiator - finding complex matches humans couldn't compute.
 */

// Graph data structure
export {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
  type OfferingReference,
  type NeedReference,
  type ParticipantConstraints,
} from './graph.js';

// Match scoring
export {
  scoreMatch,
  extractKeywords,
  type MatchScore,
  type MatchInput,
  type MatchScoreBreakdown,
  type Offering as ScorerOffering,
  type Need as ScorerNeed,
} from './scorer.js';

// Cycle detection
export {
  findCycles,
  findCyclesIncludingAll,
  getCycleStats,
  DEFAULT_CYCLE_OPTIONS,
  type FoundCycle,
  type CycleFinderOptions,
  type CycleStats,
} from './cycles.js';

// Chain scoring
export {
  scoreChain,
  rankChains,
  filterViableChains,
  summariseChainScore,
  DEFAULT_SCORING_OPTIONS,
  type ChainScore,
  type ChainScoringOptions,
  type ScoredCycle,
} from './chain-scorer.js';
