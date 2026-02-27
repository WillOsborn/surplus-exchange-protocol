/**
 * Trust tier system for SEP.
 *
 * Defines progression tiers based on demonstrated reliability.
 * Participants advance through tiers as they build track record.
 */

import type { TrustScore } from './calculator.js';

/**
 * Trust tier levels in the SEP network.
 */
export type TrustTier = 'probationary' | 'established' | 'anchor';

/**
 * Definition of requirements for each tier.
 */
export interface TierDefinition {
  /** Tier name */
  name: TrustTier;
  /** Minimum trust score required */
  minScore: number;
  /** Minimum completed exchanges required */
  minExchanges: number;
  /** Minimum days in the network */
  minNetworkAge: number;
  /** Minimum unique exchange partners */
  minPartners: number;
  /** Whether an active vouch is required to enter this tier */
  requiresVouch: boolean;
}

/**
 * Progress towards the next tier.
 */
export interface TierProgress {
  /** Progress on trust score requirement (0-1) */
  scoreProgress: number;
  /** Progress on exchange count requirement (0-1) */
  exchangeProgress: number;
  /** Progress on network age requirement (0-1) */
  ageProgress: number;
  /** Progress on partner count requirement (0-1) */
  partnerProgress: number;
}

/**
 * Assessment of a participant's current tier status.
 */
export interface TierAssessment {
  /** Current tier based on metrics */
  currentTier: TrustTier;
  /** The trust score used for assessment */
  score: TrustScore;
  /** Next tier to progress to (null if at highest) */
  nextTier: TrustTier | null;
  /** Progress towards next tier (null if at highest) */
  progressToNext: TierProgress | null;
  /** Whether participant is at risk of demotion */
  atRiskOfDemotion: boolean;
  /** Reason for potential demotion */
  demotionReason?: string;
}

/**
 * Input for tier assessment.
 */
export interface TierAssessmentInput {
  /** The participant's trust score */
  score: TrustScore;
  /** Total completed exchanges */
  completedExchanges: number;
  /** Days since joining the network */
  networkAgeDays: number;
  /** Number of unique exchange partners */
  uniquePartners: number;
  /** Whether participant has an active vouch */
  hasActiveVouch: boolean;
}

/**
 * Default tier definitions.
 */
export const TIER_DEFINITIONS: Record<TrustTier, TierDefinition> = {
  probationary: {
    name: 'probationary',
    minScore: 0.0,
    minExchanges: 0,
    minNetworkAge: 0,
    minPartners: 0,
    requiresVouch: true, // Need vouch to join network
  },
  established: {
    name: 'established',
    minScore: 0.5,
    minExchanges: 5,
    minNetworkAge: 30,
    minPartners: 3,
    requiresVouch: false,
  },
  anchor: {
    name: 'anchor',
    minScore: 0.8,
    minExchanges: 20,
    minNetworkAge: 180,
    minPartners: 10,
    requiresVouch: false,
  },
};

/**
 * Tier ordering from lowest to highest.
 */
const TIER_ORDER: TrustTier[] = ['probationary', 'established', 'anchor'];

/**
 * Grace period for demotion (percentage below threshold before flagging).
 */
const DEMOTION_GRACE_THRESHOLD = 0.05;

/**
 * Check if a participant qualifies for a specific tier.
 *
 * @param tier - The tier to check qualification for
 * @param input - The participant's metrics
 * @returns Whether the participant qualifies
 */
export function qualifiesForTier(
  tier: TrustTier,
  input: TierAssessmentInput
): boolean {
  const def = TIER_DEFINITIONS[tier];

  // Check vouch requirement (only for probationary entry)
  if (tier === 'probationary' && def.requiresVouch && !input.hasActiveVouch) {
    return false;
  }

  // For higher tiers, check all metrics
  if (tier !== 'probationary') {
    if (input.score.overall < def.minScore) return false;
    if (input.completedExchanges < def.minExchanges) return false;
    if (input.networkAgeDays < def.minNetworkAge) return false;
    if (input.uniquePartners < def.minPartners) return false;
  }

  return true;
}

/**
 * Calculate progress towards a tier.
 *
 * @param tier - The target tier
 * @param input - Current metrics
 * @returns Progress breakdown (0-1 for each component)
 */
export function calculateProgress(
  tier: TrustTier,
  input: TierAssessmentInput
): TierProgress {
  const def = TIER_DEFINITIONS[tier];

  return {
    scoreProgress: def.minScore > 0
      ? Math.min(1, input.score.overall / def.minScore)
      : 1,
    exchangeProgress: def.minExchanges > 0
      ? Math.min(1, input.completedExchanges / def.minExchanges)
      : 1,
    ageProgress: def.minNetworkAge > 0
      ? Math.min(1, input.networkAgeDays / def.minNetworkAge)
      : 1,
    partnerProgress: def.minPartners > 0
      ? Math.min(1, input.uniquePartners / def.minPartners)
      : 1,
  };
}

/**
 * Assess a participant's current tier and progression status.
 *
 * @param input - The participant's metrics
 * @returns Full tier assessment
 */
export function assessTier(input: TierAssessmentInput): TierAssessment {
  // Determine current tier (highest qualified)
  let currentTier: TrustTier = 'probationary';

  for (const tier of TIER_ORDER) {
    if (qualifiesForTier(tier, input)) {
      currentTier = tier;
    }
  }

  // Determine next tier
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const nextTier = currentIndex < TIER_ORDER.length - 1
    ? TIER_ORDER[currentIndex + 1]
    : null;

  // Calculate progress to next tier
  const progressToNext = nextTier
    ? calculateProgress(nextTier, input)
    : null;

  // Check demotion risk
  const demotionCheck = checkDemotionRisk(currentTier, input);

  return {
    currentTier,
    score: input.score,
    nextTier,
    progressToNext,
    atRiskOfDemotion: demotionCheck.atRisk,
    demotionReason: demotionCheck.reason,
  };
}

/**
 * Check if a participant is at risk of tier demotion.
 */
function checkDemotionRisk(
  currentTier: TrustTier,
  input: TierAssessmentInput
): { atRisk: boolean; reason?: string } {
  // Probationary can't be demoted (only removed from network)
  if (currentTier === 'probationary') {
    return { atRisk: false };
  }

  const def = TIER_DEFINITIONS[currentTier];
  const reasons: string[] = [];

  // Check each metric with grace threshold
  const scoreThreshold = def.minScore * (1 - DEMOTION_GRACE_THRESHOLD);
  if (input.score.overall < scoreThreshold) {
    reasons.push(`Trust score (${input.score.overall.toFixed(2)}) below threshold (${def.minScore})`);
  }

  // Exchange count can't decrease, so no demotion risk there
  // Network age can't decrease either
  // Partners can decrease if they leave network

  if (input.uniquePartners < def.minPartners) {
    reasons.push(`Partner count (${input.uniquePartners}) below minimum (${def.minPartners})`);
  }

  return {
    atRisk: reasons.length > 0,
    reason: reasons.length > 0 ? reasons.join('; ') : undefined,
  };
}

/**
 * Get the tier immediately below the given tier.
 *
 * @param tier - Current tier
 * @returns Lower tier, or null if already at lowest
 */
export function getLowerTier(tier: TrustTier): TrustTier | null {
  const index = TIER_ORDER.indexOf(tier);
  return index > 0 ? TIER_ORDER[index - 1] : null;
}

/**
 * Get the tier immediately above the given tier.
 *
 * @param tier - Current tier
 * @returns Higher tier, or null if already at highest
 */
export function getHigherTier(tier: TrustTier): TrustTier | null {
  const index = TIER_ORDER.indexOf(tier);
  return index < TIER_ORDER.length - 1 ? TIER_ORDER[index + 1] : null;
}

/**
 * Get human-readable description of a tier.
 */
export function describeTier(tier: TrustTier): string {
  switch (tier) {
    case 'probationary':
      return 'Probationary - New participant with limited exchange capacity';
    case 'established':
      return 'Established - Proven track record, standard exchange limits';
    case 'anchor':
      return 'Anchor - Highly trusted, can vouch for new participants';
  }
}

/**
 * Get a summary of progression requirements for a tier.
 */
export function getTierRequirements(tier: TrustTier): string {
  const def = TIER_DEFINITIONS[tier];
  const parts: string[] = [];

  if (def.minScore > 0) {
    parts.push(`Trust score >= ${def.minScore}`);
  }
  if (def.minExchanges > 0) {
    parts.push(`${def.minExchanges}+ completed exchanges`);
  }
  if (def.minNetworkAge > 0) {
    parts.push(`${def.minNetworkAge}+ days in network`);
  }
  if (def.minPartners > 0) {
    parts.push(`${def.minPartners}+ unique partners`);
  }
  if (def.requiresVouch) {
    parts.push('Active vouch required');
  }

  return parts.length > 0 ? parts.join(', ') : 'No requirements';
}

/**
 * Format a tier assessment as a human-readable summary.
 */
export function summariseTierAssessment(assessment: TierAssessment): string {
  const lines: string[] = [];

  lines.push(`Current tier: ${describeTier(assessment.currentTier)}`);
  lines.push(`Trust score: ${assessment.score.overall.toFixed(2)} (${assessment.score.confidence} confidence)`);

  if (assessment.nextTier && assessment.progressToNext) {
    const progress = assessment.progressToNext;
    const overallProgress = (
      progress.scoreProgress +
      progress.exchangeProgress +
      progress.ageProgress +
      progress.partnerProgress
    ) / 4;

    lines.push('');
    lines.push(`Progress to ${assessment.nextTier}: ${(overallProgress * 100).toFixed(0)}%`);
    lines.push(`  Score: ${(progress.scoreProgress * 100).toFixed(0)}%`);
    lines.push(`  Exchanges: ${(progress.exchangeProgress * 100).toFixed(0)}%`);
    lines.push(`  Network age: ${(progress.ageProgress * 100).toFixed(0)}%`);
    lines.push(`  Partners: ${(progress.partnerProgress * 100).toFixed(0)}%`);
  } else {
    lines.push('');
    lines.push('At highest tier - thank you for anchoring the network!');
  }

  if (assessment.atRiskOfDemotion) {
    lines.push('');
    lines.push(`WARNING: At risk of demotion - ${assessment.demotionReason}`);
  }

  return lines.join('\n');
}
